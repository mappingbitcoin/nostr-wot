import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy.meta");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy - Nostr Web of Trust",
    "description": "Privacy policy for Nostr Web of Trust website, browser extension, and Oracle server. Learn how we protect your data and respect your privacy.",
    "url": "https://nostr-wot.com/privacy",
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
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("intro.description")}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-0">
                {t("intro.commitment")}
              </p>
            </div>

            {/* Table of Contents */}
            <nav className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-12 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4">{t("contents.title")}</h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#website" className="hover:text-primary">{t("contents.website")}</a></li>
                <li><a href="#extension" className="hover:text-primary">{t("contents.extension")}</a></li>
                <li><a href="#oracle" className="hover:text-primary">{t("contents.oracle")}</a></li>
                <li><a href="#third-party" className="hover:text-primary">{t("contents.thirdParty")}</a></li>
                <li><a href="#data-retention" className="hover:text-primary">{t("contents.dataRetention")}</a></li>
                <li><a href="#your-rights" className="hover:text-primary">{t("contents.yourRights")}</a></li>
                <li><a href="#changes" className="hover:text-primary">{t("contents.changes")}</a></li>
                <li><a href="#contact" className="hover:text-primary">{t("contents.contact")}</a></li>
              </ul>
            </nav>

            {/* Website Privacy */}
            <section id="website" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{t("website.title")}</h2>

              <h3 className="text-lg font-semibold mb-3">{t("website.infoCollected.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t("website.infoCollected.description")}</p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                <li>
                  <strong className="text-gray-900 dark:text-white">{t("website.infoCollected.analytics.title")}</strong> {t("website.infoCollected.analytics.description")}
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-white">{t("website.infoCollected.contactForm.title")}</strong> {t("website.infoCollected.contactForm.description")}
                </li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">{t("website.howWeUse.title")}</h3>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                <li>{t("website.howWeUse.items.improve")}</li>
                <li>{t("website.howWeUse.items.respond")}</li>
                <li>{t("website.howWeUse.items.understand")}</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">{t("website.cookies.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("website.cookies.description")}{" "}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {t("website.cookies.optOutLink")}
                </a>
                .
              </p>
            </section>

            {/* Extension Privacy */}
            <section id="extension" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{t("extension.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t("extension.intro")}
              </p>

              <h3 className="text-lg font-semibold mb-3">{t("extension.dataStorage.title")}</h3>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                <li>
                  <strong className="text-gray-900 dark:text-white">{t("extension.dataStorage.pubkey.title")}</strong> {t("extension.dataStorage.pubkey.description")}
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-white">{t("extension.dataStorage.configuration.title")}</strong> {t("extension.dataStorage.configuration.description")}
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-white">{t("extension.dataStorage.localGraph.title")}</strong> {t("extension.dataStorage.localGraph.description")}
                </li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">{t("extension.operatingModes.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("extension.operatingModes.description")}
              </p>

              <div className="space-y-4 mb-6">
                <div className="bg-trust-green/5 border border-trust-green/20 rounded-xl p-4">
                  <h4 className="font-semibold text-trust-green mb-2">{t("extension.operatingModes.local.title")}</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• {t("extension.operatingModes.local.items.processedLocally")}</li>
                    <li>• {t("extension.operatingModes.local.items.fetchedDirectly")}</li>
                    <li>• {t("extension.operatingModes.local.items.noDataSent")}</li>
                    <li>• {t("extension.operatingModes.local.items.completelyPrivate")}</li>
                  </ul>
                </div>

                <div className="bg-trust-yellow/5 border border-trust-yellow/20 rounded-xl p-4">
                  <h4 className="font-semibold text-trust-yellow mb-2">{t("extension.operatingModes.remote.title")}</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• {t("extension.operatingModes.remote.items.sentToOracle")}</li>
                    <li>• {t("extension.operatingModes.remote.items.oracleSees")}</li>
                    <li>• {t("extension.operatingModes.remote.items.fasterResults")}</li>
                    <li>• {t("extension.operatingModes.remote.items.selfHost")}</li>
                  </ul>
                </div>

                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
                  <h4 className="font-semibold mb-2">{t("extension.operatingModes.hybrid.title")}</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• {t("extension.operatingModes.hybrid.items.localFirst")}</li>
                    <li>• {t("extension.operatingModes.hybrid.items.fallback")}</li>
                    <li>• {t("extension.operatingModes.hybrid.items.balances")}</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-3">{t("extension.doesNot.title")}</h3>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                <li>{t("extension.doesNot.items.browsingHistory")}</li>
                <li>{t("extension.doesNot.items.ads")}</li>
                <li>{t("extension.doesNot.items.sellData")}</li>
                <li>{t("extension.doesNot.items.privateKeys")}</li>
                <li>{t("extension.doesNot.items.telemetry")}</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">{t("extension.permissions.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">{t("extension.permissions.description")}</p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li><strong className="text-gray-900 dark:text-white">{t("extension.permissions.storage.title")}</strong> {t("extension.permissions.storage.description")}</li>
                <li><strong className="text-gray-900 dark:text-white">{t("extension.permissions.scripting.title")}</strong> {t("extension.permissions.scripting.description")}</li>
              </ul>
            </section>

            {/* Oracle API */}
            <section id="oracle" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{t("oracle.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("oracle.intro")}
              </p>

              <h3 className="text-lg font-semibold mb-3">{t("oracle.dataCollected.title")}</h3>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                <li><strong className="text-gray-900 dark:text-white">{t("oracle.dataCollected.queryData.title")}</strong> {t("oracle.dataCollected.queryData.description")}</li>
                <li><strong className="text-gray-900 dark:text-white">{t("oracle.dataCollected.ipAddress.title")}</strong> {t("oracle.dataCollected.ipAddress.description")}</li>
                <li><strong className="text-gray-900 dark:text-white">{t("oracle.dataCollected.timestamps.title")}</strong> {t("oracle.dataCollected.timestamps.description")}</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">{t("oracle.dataNotCollected.title")}</h3>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                <li>{t("oracle.dataNotCollected.items.noLog")}</li>
                <li>{t("oracle.dataNotCollected.items.noAssociate")}</li>
                <li>{t("oracle.dataNotCollected.items.noTrack")}</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">{t("oracle.selfHosting.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("oracle.selfHosting.description")}{" "}
                <Link href="/oracle" className="text-primary hover:underline">{t("oracle.selfHosting.link")}</Link>{t("oracle.selfHosting.descriptionContinued")}
              </p>
            </section>

            {/* Third-Party Services */}
            <section id="third-party" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{t("thirdParty.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t("thirdParty.intro")}</p>

              <h3 className="text-lg font-semibold mb-3">{t("thirdParty.googleAnalytics.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {t("thirdParty.googleAnalytics.description")}{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {t("thirdParty.googleAnalytics.privacyPolicy")}
                </a>
                {t("thirdParty.googleAnalytics.configured")}
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-1 mb-6">
                <li>{t("thirdParty.googleAnalytics.items.anonymize")}</li>
                <li>{t("thirdParty.googleAnalytics.items.disableSharing")}</li>
                <li>{t("thirdParty.googleAnalytics.items.disableAdvertising")}</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">{t("thirdParty.recaptcha.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t("thirdParty.recaptcha.description")}{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {t("thirdParty.recaptcha.privacyPolicy")}
                </a>{" "}
                {t("thirdParty.recaptcha.and")}{" "}
                <a
                  href="https://policies.google.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {t("thirdParty.recaptcha.termsOfService")}
                </a>
                .
              </p>

              <h3 className="text-lg font-semibold mb-3">{t("thirdParty.resend.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t("thirdParty.resend.description")}{" "}
                <a
                  href="https://resend.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {t("thirdParty.resend.privacyPolicy")}
                </a>
                .
              </p>

              <h3 className="text-lg font-semibold mb-3">{t("thirdParty.nostrRelays.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("thirdParty.nostrRelays.description")}
              </p>
            </section>

            {/* Data Retention */}
            <section id="data-retention" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{t("dataRetention.title")}</h2>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li><strong className="text-gray-900 dark:text-white">{t("dataRetention.items.analytics.title")}</strong> {t("dataRetention.items.analytics.description")}</li>
                <li><strong className="text-gray-900 dark:text-white">{t("dataRetention.items.contactForm.title")}</strong> {t("dataRetention.items.contactForm.description")}</li>
                <li><strong className="text-gray-900 dark:text-white">{t("dataRetention.items.extensionData.title")}</strong> {t("dataRetention.items.extensionData.description")}</li>
                <li><strong className="text-gray-900 dark:text-white">{t("dataRetention.items.rateLimit.title")}</strong> {t("dataRetention.items.rateLimit.description")}</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section id="your-rights" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{t("yourRights.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t("yourRights.description")}</p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                <li><strong className="text-gray-900 dark:text-white">{t("yourRights.items.access.title")}</strong> {t("yourRights.items.access.description")}</li>
                <li><strong className="text-gray-900 dark:text-white">{t("yourRights.items.deletion.title")}</strong> {t("yourRights.items.deletion.description")}</li>
                <li><strong className="text-gray-900 dark:text-white">{t("yourRights.items.optOut.title")}</strong> {t("yourRights.items.optOut.description")}</li>
                <li><strong className="text-gray-900 dark:text-white">{t("yourRights.items.control.title")}</strong> {t("yourRights.items.control.description")}</li>
                <li><strong className="text-gray-900 dark:text-white">{t("yourRights.items.portability.title")}</strong> {t("yourRights.items.portability.description")}</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400">
                To exercise these rights, please{" "}
                <Link href="/contact" className="text-primary hover:underline">{t("yourRights.contactLink")}</Link>.
              </p>
            </section>

            {/* Changes */}
            <section id="changes" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{t("changes.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("changes.description")}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {t("changes.significant")}
              </p>
            </section>

            {/* Contact */}
            <section id="contact" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{t("contact.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t("contact.description")} <Link href="/contact" className="text-primary hover:underline">{t("contact.link")}</Link>.
              </p>
            </section>

            {/* Open Source */}
            <section>
              <h2 className="text-2xl font-bold mb-4">{t("openSource.title")}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("openSource.description")}
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>
                  <a
                    href="https://github.com/nostr-wot/nostr-wot-extension"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {t("openSource.extensionSource")}
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/nostr-wot/wot-oracle"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {t("openSource.oracleSource")}
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
