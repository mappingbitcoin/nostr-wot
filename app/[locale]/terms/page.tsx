import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("terms.meta");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function TermsPage() {
  const t = await getTranslations("terms");

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms of Service - Nostr Web of Trust",
    "description": "Terms of service for using Nostr Web of Trust website, browser extension, and Oracle server.",
    "url": "https://nostr-wot.com/terms",
    "publisher": {
      "@type": "Organization",
      "name": "Nostr Web of Trust",
      "url": "https://nostr-wot.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">{t("hero.title")}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t("hero.lastUpdated")}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-6">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            {/* Intro */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-12">
              <p className="text-gray-600 dark:text-gray-400 mb-0">
                {t("intro.description")}
              </p>
            </div>

            {/* Table of Contents */}
            <nav className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-12 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4">{t("contents.title")}</h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#acceptance" className="hover:text-primary">{t("contents.acceptance")}</a></li>
                <li><a href="#license" className="hover:text-primary">{t("contents.license")}</a></li>
                <li><a href="#use-restrictions" className="hover:text-primary">{t("contents.useRestrictions")}</a></li>
                <li><a href="#extension" className="hover:text-primary">{t("contents.extension")}</a></li>
                <li><a href="#oracle" className="hover:text-primary">{t("contents.oracle")}</a></li>
                <li><a href="#disclaimer" className="hover:text-primary">{t("contents.disclaimer")}</a></li>
                <li><a href="#limitation" className="hover:text-primary">{t("contents.limitation")}</a></li>
                <li><a href="#changes" className="hover:text-primary">{t("contents.changes")}</a></li>
                <li><a href="#contact" className="hover:text-primary">{t("contents.contact")}</a></li>
              </ul>
            </nav>

            {/* Acceptance of Terms */}
            <section id="acceptance" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{t("acceptance.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("acceptance.description")}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {t("acceptance.agreement")}
              </p>
            </section>

            {/* License */}
            <section id="license" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{t("license.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("license.description")}
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3">{t("license.mitTitle")}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {t("license.mitDescription")}
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 text-sm space-y-2">
                  <li>{t("license.rights.use")}</li>
                  <li>{t("license.rights.copy")}</li>
                  <li>{t("license.rights.modify")}</li>
                  <li>{t("license.rights.distribute")}</li>
                </ul>
              </div>
            </section>

            {/* Use Restrictions */}
            <section id="use-restrictions" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{t("useRestrictions.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("useRestrictions.description")}
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>{t("useRestrictions.items.illegal")}</li>
                <li>{t("useRestrictions.items.harm")}</li>
                <li>{t("useRestrictions.items.interfere")}</li>
                <li>{t("useRestrictions.items.reverseEngineer")}</li>
                <li>{t("useRestrictions.items.impersonate")}</li>
                <li>{t("useRestrictions.items.spam")}</li>
              </ul>
            </section>

            {/* Browser Extension */}
            <section id="extension" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{t("extension.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("extension.description")}
              </p>

              <h3 className="text-lg font-semibold mb-3">{t("extension.functionality.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("extension.functionality.description")}
              </p>

              <h3 className="text-lg font-semibold mb-3">{t("extension.updates.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("extension.updates.description")}
              </p>

              <h3 className="text-lg font-semibold mb-3">{t("extension.thirdParty.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("extension.thirdParty.description")}
              </p>
            </section>

            {/* Oracle API */}
            <section id="oracle" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{t("oracle.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("oracle.description")}
              </p>

              <h3 className="text-lg font-semibold mb-3">{t("oracle.availability.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("oracle.availability.description")}
              </p>

              <h3 className="text-lg font-semibold mb-3">{t("oracle.rateLimit.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("oracle.rateLimit.description")}
              </p>

              <h3 className="text-lg font-semibold mb-3">{t("oracle.accuracy.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("oracle.accuracy.description")}
              </p>
            </section>

            {/* Disclaimer */}
            <section id="disclaimer" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{t("disclaimer.title")}</h2>
              <div className="bg-trust-yellow/5 border border-trust-yellow/20 rounded-xl p-6">
                <p className="text-gray-600 dark:text-gray-400 mb-4 font-medium">
                  {t("disclaimer.asIs")}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t("disclaimer.noWarranty")}
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 text-sm">
                  <li>{t("disclaimer.items.merchantability")}</li>
                  <li>{t("disclaimer.items.fitness")}</li>
                  <li>{t("disclaimer.items.nonInfringement")}</li>
                  <li>{t("disclaimer.items.accuracy")}</li>
                </ul>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section id="limitation" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{t("limitation.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("limitation.description")}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {t("limitation.noLiability")}
              </p>
            </section>

            {/* Changes to Terms */}
            <section id="changes" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{t("changes.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("changes.description")}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {t("changes.notification")}
              </p>
            </section>

            {/* Contact */}
            <section id="contact">
              <h2 className="text-2xl font-bold mb-4">{t("contact.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t("contact.description")}{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  {t("contact.link")}
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
