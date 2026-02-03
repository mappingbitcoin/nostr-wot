import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, validateOrigin } from "@/lib/rate-limit";

interface ContactFormData {
  type: "support" | "media";
  name: string;
  email: string;
  organization?: string;
  subject: string;
  message: string;
  recaptchaToken: string;
}

// Input length limits
const MAX_LENGTHS = {
  name: 255,
  email: 254,
  organization: 255,
  subject: 500,
  message: 5000,
} as const;

// Escape HTML to prevent XSS in email templates
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.warn("RECAPTCHA_SECRET_KEY not configured, skipping verification");
    return true;
  }

  if (!token) {
    return false;
  }

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${secretKey}&response=${token}`,
      }
    );

    const data = await response.json();

    // Check if verification was successful and score is above threshold
    // Score ranges from 0.0 to 1.0, where 1.0 is very likely a good interaction
    // Using 0.7 as threshold (Google recommends 0.5 minimum, we use stricter)
    return data.success && data.score >= 0.7;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // CSRF protection - validate origin
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: "Invalid request origin" },
        { status: 403 }
      );
    }

    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`contact:${clientId}`, RATE_LIMITS.contact);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetIn),
            "X-RateLimit-Limit": String(RATE_LIMITS.contact.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.resetIn),
          },
        }
      );
    }

    const body: ContactFormData = await request.json();

    const { type, name, email, organization, subject, message, recaptchaToken } =
      body;

    // Validate required fields
    if (!type || !name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate type is one of the allowed values
    if (type !== "support" && type !== "media") {
      return NextResponse.json(
        { error: "Invalid inquiry type" },
        { status: 400 }
      );
    }

    // Validate input lengths to prevent DoS and injection attacks
    if (name.length > MAX_LENGTHS.name) {
      return NextResponse.json(
        { error: `Name must be ${MAX_LENGTHS.name} characters or less` },
        { status: 400 }
      );
    }
    if (email.length > MAX_LENGTHS.email) {
      return NextResponse.json(
        { error: `Email must be ${MAX_LENGTHS.email} characters or less` },
        { status: 400 }
      );
    }
    if (organization && organization.length > MAX_LENGTHS.organization) {
      return NextResponse.json(
        { error: `Organization must be ${MAX_LENGTHS.organization} characters or less` },
        { status: 400 }
      );
    }
    if (subject.length > MAX_LENGTHS.subject) {
      return NextResponse.json(
        { error: `Subject must be ${MAX_LENGTHS.subject} characters or less` },
        { status: 400 }
      );
    }
    if (message.length > MAX_LENGTHS.message) {
      return NextResponse.json(
        { error: `Message must be ${MAX_LENGTHS.message} characters or less` },
        { status: 400 }
      );
    }

    // Validate email format (RFC 5321 simplified)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed. Please try again." },
        { status: 400 }
      );
    }

    // Check for Resend API key
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Email service not configured. Please try again later." },
        { status: 500 }
      );
    }

    // Prepare email content with HTML escaping to prevent XSS
    const typeLabel = type === "support" ? "Support Request" : "Media Inquiry";
    const contactEmail = process.env.CONTACT_EMAIL || "hello@example.com";

    // Escape all user inputs for HTML context
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeOrganization = organization ? escapeHtml(organization) : null;
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const emailHtml = `
      <h2>New ${typeLabel}</h2>
      <p><strong>From:</strong> ${safeName} (${safeEmail})</p>
      ${safeOrganization ? `<p><strong>Organization:</strong> ${safeOrganization}</p>` : ""}
      <p><strong>Subject:</strong> ${safeSubject}</p>
      <hr />
      <h3>Message:</h3>
      <p style="white-space: pre-wrap;">${safeMessage}</p>
      <hr />
      <p style="color: #666; font-size: 12px;">
        This message was sent from the Nostr WoT contact form.
      </p>
    `;

    const emailText = `
New ${typeLabel}

From: ${name} (${email})
${organization ? `Organization: ${organization}\n` : ""}
Subject: ${subject}

Message:
${message}

---
This message was sent from the Nostr WoT contact form.
    `;

    // Send email using Resend
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: "Nostr WoT <noreply@resend.dev>",
      to: contactEmail,
      replyTo: email,
      subject: `[${type.toUpperCase()}] ${subject}`,
      html: emailHtml,
      text: emailText,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
