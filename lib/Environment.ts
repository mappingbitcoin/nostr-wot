/**
 * Environment Configuration
 *
 * Type-safe environment variable access for server and client
 */

// Server-side environment variables (not exposed to client)
export const serverEnv = {
  resendApiKey: process.env.RESEND_API_KEY || null,
  contactEmail: process.env.CONTACT_EMAIL || null,
  recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY || null,
};

// Public environment variables (safe to expose to client)
export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://nostr-wot.com",
  recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || null,
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || null,
};
