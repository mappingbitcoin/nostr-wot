"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Input, TextArea, Button, Card, Badge } from "@/components/ui";

type InquiryType = "support" | "media" | null;

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export default function ContactContent() {
  const t = useTranslations("contact");
  const [selectedType, setSelectedType] = useState<InquiryType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) return;

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.onload = () => {
      window.grecaptcha.ready(() => {
        setRecaptchaLoaded(true);
      });
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);
      setSubmitStatus(null);

      const form = e.currentTarget;
      const formData = new FormData(form);

      try {
        let recaptchaToken = "";
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

        if (siteKey && recaptchaLoaded) {
          recaptchaToken = await window.grecaptcha.execute(siteKey, {
            action: "contact",
          });
        }

        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: selectedType,
            name: formData.get("name"),
            email: formData.get("email"),
            organization: formData.get("organization"),
            subject: formData.get("subject"),
            message: formData.get("message"),
            recaptchaToken,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setSubmitStatus({
            type: "success",
            message: t("form.successMessage"),
          });
          form.reset();
          setSelectedType(null);
        } else {
          setSubmitStatus({
            type: "error",
            message: data.error || t("form.errorMessage"),
          });
        }
      } catch {
        setSubmitStatus({
          type: "error",
          message: t("form.genericError"),
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedType, recaptchaLoaded, t]
  );

  return (
    <main>
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">{t("hero.title")}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t("hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          {!selectedType ? (
            <>
              <h2 className="text-2xl font-bold text-center mb-4">{t("typeSelection.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-10">
                {t("typeSelection.subtitle")}
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <button
                  className="text-left group"
                  onClick={() => setSelectedType("support")}
                >
                  <Card variant="interactive" className="h-full hover:shadow-lg">
                    <div className="text-4xl mb-4">🛠️</div>
                    <h3 className="text-xl font-semibold mb-2">{t("support.title")}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {t("support.description")}
                    </p>
                    <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                      <li>• {t("support.items.extension")}</li>
                      <li>• {t("support.items.api")}</li>
                      <li>• {t("support.items.bugs")}</li>
                      <li>• {t("support.items.features")}</li>
                    </ul>
                    <span className="text-primary font-medium group-hover:underline">{t("support.cta")}</span>
                  </Card>
                </button>

                <button
                  className="text-left group"
                  onClick={() => setSelectedType("media")}
                >
                  <Card variant="interactive" className="h-full hover:shadow-lg">
                    <div className="text-4xl mb-4">📰</div>
                    <h3 className="text-xl font-semibold mb-2">{t("media.title")}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {t("media.description")}
                    </p>
                    <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                      <li>• {t("media.items.press")}</li>
                      <li>• {t("media.items.partnerships")}</li>
                      <li>• {t("media.items.speaking")}</li>
                      <li>• {t("media.items.collaboration")}</li>
                    </ul>
                    <span className="text-primary font-medium group-hover:underline">{t("media.cta")}</span>
                  </Card>
                </button>
              </div>
            </>
          ) : (
            <div className="max-w-2xl mx-auto">
              <button
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 flex items-center gap-2"
                onClick={() => {
                  setSelectedType(null);
                  setSubmitStatus(null);
                }}
              >
                {t("form.backToOptions")}
              </button>

              <div className="mb-8">
                <Badge className="mb-4">
                  {selectedType === "support" ? t("support.badge") : t("media.badge")}
                </Badge>
                <h2 className="text-2xl font-bold mb-2">
                  {selectedType === "support"
                    ? t("support.subtitle")
                    : t("media.subtitle")}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedType === "support"
                    ? t("support.formDescription")
                    : t("media.formDescription")}
                </p>
              </div>

              {submitStatus && (
                <div className={`p-4 rounded-lg mb-6 ${
                  submitStatus.type === "success"
                    ? "bg-trust-green/10 text-trust-green border border-trust-green/20"
                    : "bg-trust-red/10 text-trust-red border border-trust-red/20"
                }`}>
                  {submitStatus.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label={t("form.name")}
                    name="name"
                    required
                    placeholder={t("form.namePlaceholder")}
                  />
                  <Input
                    type="email"
                    label={t("form.email")}
                    name="email"
                    required
                    placeholder={t("form.emailPlaceholder")}
                  />
                </div>

                {selectedType === "media" && (
                  <Input
                    label={t("form.organization")}
                    name="organization"
                    placeholder={t("form.organizationPlaceholder")}
                  />
                )}

                <Input
                  label={t("form.subject")}
                  name="subject"
                  required
                  placeholder={
                    selectedType === "support"
                      ? t("form.subjectPlaceholderSupport")
                      : t("form.subjectPlaceholderMedia")
                  }
                />

                <TextArea
                  label={t("form.message")}
                  name="message"
                  required
                  rows={6}
                  placeholder={
                    selectedType === "support"
                      ? t("form.messagePlaceholderSupport")
                      : t("form.messagePlaceholderMedia")
                  }
                />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("form.recaptchaNotice")}{" "}
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-primary"
                    >
                      {t("form.privacyPolicy")}
                    </a>{" "}
                    {t("form.and")}{" "}
                    <a
                      href="https://policies.google.com/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-primary"
                    >
                      {t("form.termsOfService")}
                    </a>{" "}
                    {t("form.apply")}
                  </p>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? t("form.sending") : t("form.sendMessage")}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Other Ways */}
      <section className="py-16 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-10">{t("otherWays.title")}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <a
              href="https://github.com/nostr-wot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors"
            >
              <span className="text-3xl">💻</span>
              <div>
                <h3 className="font-semibold mb-1">{t("otherWays.github.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t("otherWays.github.description")}</p>
              </div>
            </a>
            <a
              href="https://github.com/nostr-wot/nostr-wot-extension/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors"
            >
              <span className="text-3xl">🐛</span>
              <div>
                <h3 className="font-semibold mb-1">{t("otherWays.bugReports.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t("otherWays.bugReports.description")}</p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
