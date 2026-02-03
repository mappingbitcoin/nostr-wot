import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ScrollReveal, LinkButton, ExternalLinkButton, Section, TerminalBlock } from "@/components/ui";
import HowItWorksAnimation from "@/components/HowItWorksAnimation";
import {
  ChromeIcon,
  BraveIcon,
  EdgeIcon,
  OperaIcon,
  LightningIcon,
  LockOutlineIcon,
  CodeOutlineIcon,
} from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("download.meta");
  return { title: t("title"), description: t("description") };
}

const CHROME_STORE_URL = "https://chrome.google.com/webstore/detail/nostr-wot-extension";

const BROWSERS = [
  { key: "chrome", Icon: ChromeIcon },
  { key: "brave", Icon: BraveIcon },
  { key: "edge", Icon: EdgeIcon },
  { key: "opera", Icon: OperaIcon },
];

const FAQ_KEYS = ["whatIsWot", "howExtensionWorks", "isDataPrivate", "supportedBrowsers", "nostrAccount", "isFree"];

const FEATURES = [
  { key: "instantQueries", Icon: LightningIcon },
  { key: "privacyOptions", Icon: LockOutlineIcon },
  { key: "simpleApi", Icon: CodeOutlineIcon },
];

export default async function DownloadPage() {
  const t = await getTranslations("download");

  // JSON-LD structured data for the extension
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Nostr Web of Trust Extension",
    "applicationCategory": "BrowserApplication",
    "operatingSystem": "Chrome, Brave, Edge, Opera",
    "description": "Browser extension that provides Web of Trust API for Nostr apps. Filter spam, verify reputation, and explore your social graph.",
    "url": "https://nostr-wot.com/download",
    "downloadUrl": "https://chrome.google.com/webstore/detail/nostr-wot-extension",
    "softwareVersion": "1.0.0",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Instant trust queries",
      "Privacy-first design",
      "Simple window.nostr.wot API",
      "Local and remote modes",
    ],
    "screenshot": "https://nostr-wot.com/og-image.png",
    "author": {
      "@type": "Organization",
      "name": "Nostr Web of Trust",
      "url": "https://nostr-wot.com",
    },
  };

  const animationPosts = [
    { hop: "1", color: "trust-green", label: t("howItWorks.trusted"), delay: "0s", width: "100%" },
    { hop: "2", color: "trust-yellow", label: `2 ${t("howItWorks.hops")}`, delay: "0.2s", width: "75%" },
    { hop: "?", color: "trust-red", label: t("howItWorks.hidden"), delay: "0.4s", opacity: "opacity-40", width: "50%" },
  ];

  const buildCommands = [
    `# ${t("buildFromSource.clone")}`,
    "git clone https://github.com/nostr-wot/nostr-wot-extension.git",
    `# ${t("buildFromSource.install")}`,
    "cd nostr-wot-extension && npm install",
    `# ${t("buildFromSource.build")}`,
    "npm run build",
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        {/* Hero + Downloads */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal animation="fade-down">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("hero.title")}</h1>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">{t("hero.subtitle")}</p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {BROWSERS.map((browser, i) => (
              <ScrollReveal key={browser.key} animation="fade-up" delay={150 + i * 75}>
                <a
                  href={CHROME_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:shadow-lg transition-all group"
                >
                  <browser.Icon className="w-12 h-12 mb-4 text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors" />
                  <span className="font-semibold mb-1">{t(`browsers.${browser.key}.name`)}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t(`browsers.${browser.key}.description`)}</span>
                </a>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal animation="fade-up" delay={500}>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
              {t("browsers.firefoxNotice")}{" "}
              <a href="https://github.com/nostr-wot/nostr-wot-extension" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {t("browsers.starRepo")}
              </a>{" "}
              {t("browsers.toGetNotified")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works Animation */}
      <Section background="gray" padding="md">
        <ScrollReveal animation="fade-up">
          <h2 className="text-2xl font-bold text-center mb-4">{t("howItWorks.title")}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-xl mx-auto">{t("howItWorks.subtitle")}</p>
        </ScrollReveal>
        <ScrollReveal animation="zoom-in" delay={100}>
          <HowItWorksAnimation posts={animationPosts} codeComment={t("howItWorks.codeComment")} />
        </ScrollReveal>
      </Section>

      {/* Features */}
      <Section padding="md">
        <ScrollReveal animation="fade-up">
          <h2 className="text-2xl font-bold text-center mb-12">{t("features.title")}</h2>
        </ScrollReveal>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {FEATURES.map((feature, i) => (
            <ScrollReveal key={feature.key} animation="fade-up" delay={i * 100}>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t(`features.${feature.key}.title`)}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t(`features.${feature.key}.description`)}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section background="gray" padding="md">
        <ScrollReveal animation="fade-up">
          <h2 className="text-2xl font-bold text-center mb-12">{t("faq.title")}</h2>
        </ScrollReveal>
        <div className="space-y-4 max-w-3xl mx-auto">
          {FAQ_KEYS.map((key, i) => (
            <ScrollReveal key={key} animation="fade-up" delay={i * 50}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-2">{t(`faq.items.${key}.question`)}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{t(`faq.items.${key}.answer`)}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* Build from Source */}
      <Section padding="md">
        <ScrollReveal animation="fade-up">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CodeOutlineIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">{t("buildFromSource.title")}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t("buildFromSource.description")}</p>
                <TerminalBlock commands={buildCommands} className="mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t("buildFromSource.loadInstructions")}</p>
                <a
                  href="https://github.com/nostr-wot/nostr-wot-extension"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline text-sm"
                >
                  {t("buildFromSource.viewOnGitHub")}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Section>

      {/* CTA */}
      <Section background="gray" padding="md">
        <ScrollReveal animation="zoom-in">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">{t("cta.title")}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">{t("cta.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ExternalLinkButton href={CHROME_STORE_URL}>{t("cta.installExtension")}</ExternalLinkButton>
              <LinkButton href="/docs" variant="secondary">{t("cta.readDocs")}</LinkButton>
            </div>
          </div>
        </ScrollReveal>
      </Section>
      </main>
    </>
  );
}
