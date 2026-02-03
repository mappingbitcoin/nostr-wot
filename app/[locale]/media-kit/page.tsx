import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Badge, LinkButton, ExternalLinkButton } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("mediaKit.meta");
  return {
    title: t("title"),
    description: t("description"),
  };
}

function WotLogo({ className }: { className?: string }) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <g stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5">
        <line x1="24" y1="24" x2="24" y2="12" />
        <line x1="24" y1="24" x2="34" y2="17" />
        <line x1="24" y1="24" x2="36" y2="27" />
        <line x1="24" y1="24" x2="30" y2="35" />
        <line x1="24" y1="24" x2="17" y2="34" />
        <line x1="24" y1="24" x2="12" y2="22" />
        <line x1="24" y1="12" x2="18" y2="6" />
        <line x1="24" y1="12" x2="30" y2="6" />
        <line x1="34" y1="17" x2="42" y2="12" />
        <line x1="36" y1="27" x2="43" y2="30" />
        <line x1="30" y1="35" x2="35" y2="42" />
        <line x1="17" y1="34" x2="12" y2="42" />
        <line x1="12" y1="22" x2="5" y2="18" />
      </g>
      <g fill="currentColor" fillOpacity="0.6">
        <circle cx="18" cy="6" r="2.5" />
        <circle cx="30" cy="6" r="2.5" />
        <circle cx="42" cy="12" r="2.5" />
        <circle cx="43" cy="30" r="2.5" />
        <circle cx="35" cy="42" r="2.5" />
        <circle cx="12" cy="42" r="2.5" />
        <circle cx="5" cy="18" r="2.5" />
      </g>
      <g fill="currentColor" fillOpacity="0.9">
        <circle cx="24" cy="12" r="3.5" />
        <circle cx="34" cy="17" r="3.5" />
        <circle cx="36" cy="27" r="3.5" />
        <circle cx="30" cy="35" r="3.5" />
        <circle cx="17" cy="34" r="3.5" />
        <circle cx="12" cy="22" r="3.5" />
      </g>
      <circle cx="24" cy="24" r="5" fill="currentColor" />
    </svg>
  );
}

export default async function MediaKitPage() {
  const t = await getTranslations("mediaKit");

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Media Kit - Nostr Web of Trust",
    "description": "Brand assets, logos, and guidelines for Nostr Web of Trust. Download official logos and learn about our brand identity.",
    "url": "https://nostr-wot.com/media-kit",
    "publisher": {
      "@type": "Organization",
      "name": "Nostr Web of Trust",
      "url": "https://nostr-wot.com",
      "logo": "https://nostr-wot.com/icon-512.png",
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
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <Badge className="mb-4">{t("hero.badge")}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("hero.title")}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Integration Notice */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-start gap-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="text-3xl">🔧</div>
            <div>
              <h3 className="font-semibold mb-2">{t("integrationNotice.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("integrationNotice.description")}{" "}
                <Link href="/docs" className="text-primary hover:underline">{t("integrationNotice.apiDocs")}</Link> {t("integrationNotice.toGetStarted")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">{t("logo.title")}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12">
            {t("logo.subtitle")}
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-xl p-12 flex flex-col items-center justify-center border border-gray-200">
              <WotLogo className="w-24 h-24 text-primary mb-4" />
              <span className="text-sm text-gray-500">{t("logo.lightBackground")}</span>
            </div>
            <div className="bg-gray-900 rounded-xl p-12 flex flex-col items-center justify-center border border-gray-700">
              <WotLogo className="w-24 h-24 text-white mb-4" />
              <span className="text-sm text-gray-400">{t("logo.darkBackground")}</span>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-center mb-6">{t("logo.variants")}</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
              <div className="flex items-center justify-center gap-2 mb-4 py-4">
                <WotLogo className="w-10 h-10 text-primary" />
                <span className="font-semibold text-lg">Nostr WoT</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{t("logo.logoWordmark")}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
              <div className="flex items-center justify-center mb-4 py-4">
                <WotLogo className="w-10 h-10 text-primary" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{t("logo.logoOnly")}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
              <div className="flex items-center justify-center gap-2 mb-4 py-4 bg-trust-green/10 rounded-lg px-4">
                <WotLogo className="w-6 h-6 text-trust-green" />
                <span className="text-sm font-medium text-trust-green">{t("logo.wotVerified")}</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{t("logo.integrationBadge")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Colors Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">{t("colors.title")}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12">
            {t("colors.subtitle")}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="h-24 bg-primary" />
              <div className="p-4">
                <span className="font-semibold block">{t("colors.primaryPurple.name")}</span>
                <code className="text-sm text-gray-500">#6366F1</code>
                <span className="text-sm text-gray-400 block mt-1">{t("colors.primaryPurple.usage")}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="h-24 bg-primary-dark" />
              <div className="p-4">
                <span className="font-semibold block">{t("colors.primaryDark.name")}</span>
                <code className="text-sm text-gray-500">#4F46E5</code>
                <span className="text-sm text-gray-400 block mt-1">{t("colors.primaryDark.usage")}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="h-24 bg-trust-green" />
              <div className="p-4">
                <span className="font-semibold block">{t("colors.trustGreen.name")}</span>
                <code className="text-sm text-gray-500">#22C55E</code>
                <span className="text-sm text-gray-400 block mt-1">{t("colors.trustGreen.usage")}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="h-24 bg-trust-yellow" />
              <div className="p-4">
                <span className="font-semibold block">{t("colors.cautionYellow.name")}</span>
                <code className="text-sm text-gray-500">#EAB308</code>
                <span className="text-sm text-gray-400 block mt-1">{t("colors.cautionYellow.usage")}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="h-24 bg-trust-red" />
              <div className="p-4">
                <span className="font-semibold block">{t("colors.distantRed.name")}</span>
                <code className="text-sm text-gray-500">#EF4444</code>
                <span className="text-sm text-gray-400 block mt-1">{t("colors.distantRed.usage")}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="h-24 bg-nostr" />
              <div className="p-4">
                <span className="font-semibold block">{t("colors.nostrPurple.name")}</span>
                <code className="text-sm text-gray-500">#8B5CF6</code>
                <span className="text-sm text-gray-400 block mt-1">{t("colors.nostrPurple.usage")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="py-16 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">{t("typography.title")}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12">
            {t("typography.subtitle")}
          </p>

          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">{t("typography.headings")}</span>
              <p className="text-3xl font-bold mb-2">{t("typography.headingsExample")}</p>
              <code className="text-sm text-gray-500">-apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, sans-serif</code>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">{t("typography.body")}</span>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                {t("typography.bodyExample")}
              </p>
              <code className="text-sm text-gray-500">Font weight: 400 | Line height: 1.6</code>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">{t("typography.code")}</span>
              <p className="font-mono text-lg mb-2">await window.nostr.wot.getDistance(pubkey)</p>
              <code className="text-sm text-gray-500">&quot;Fira Code&quot;, Consolas, Monaco, monospace</code>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Examples */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">{t("integrationExamples.title")}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12">
            {t("integrationExamples.subtitle")}
          </p>

          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">{t("integrationExamples.trustBadge.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t("integrationExamples.trustBadge.description")}</p>
              <div className="flex gap-4 flex-wrap">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-trust-green/10 text-trust-green rounded-full">
                  <WotLogo className="w-5 h-5" />
                  <span className="text-sm font-medium">{t("integrationExamples.trustBadge.trusted")} (2 {t("integrationExamples.trustBadge.hops")})</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
                  <WotLogo className="w-5 h-5" />
                  <span className="text-sm font-medium">{t("integrationExamples.trustBadge.unknown")}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">{t("integrationExamples.hopIndicator.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t("integrationExamples.hopIndicator.description")}</p>
              <div className="flex gap-3 flex-wrap">
                <span className="px-3 py-1 bg-trust-green text-white text-sm font-medium rounded-full">1 {t("integrationExamples.hopIndicator.hop")}</span>
                <span className="px-3 py-1 bg-trust-yellow text-white text-sm font-medium rounded-full">2 {t("integrationExamples.hopIndicator.hops")}</span>
                <span className="px-3 py-1 bg-trust-red text-white text-sm font-medium rounded-full">3+ {t("integrationExamples.hopIndicator.hops")}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">{t("integrationExamples.poweredBy.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t("integrationExamples.poweredBy.description")}</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <WotLogo className="w-5 h-5 text-primary" />
                <span className="text-sm">{t("integrationExamples.poweredBy.text")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Guidelines */}
      <section className="py-16 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">{t("usageGuidelines.title")}</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-trust-green">
              <h3 className="font-semibold text-trust-green mb-4">{t("usageGuidelines.do.title")}</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• {t("usageGuidelines.do.items.useOfficial")}</li>
                <li>• {t("usageGuidelines.do.items.maintainSpacing")}</li>
                <li>• {t("usageGuidelines.do.items.indicateIntegration")}</li>
                <li>• {t("usageGuidelines.do.items.linkBack")}</li>
                <li>• {t("usageGuidelines.do.items.pressCoverage")}</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-trust-red">
              <h3 className="font-semibold text-trust-red mb-4">{t("usageGuidelines.dont.title")}</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• {t("usageGuidelines.dont.items.modify")}</li>
                <li>• {t("usageGuidelines.dont.items.outdated")}</li>
                <li>• {t("usageGuidelines.dont.items.endorsement")}</li>
                <li>• {t("usageGuidelines.dont.items.misrepresent")}</li>
                <li>• {t("usageGuidelines.dont.items.busyBackgrounds")}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-lg text-white/80 mb-8">
            {t("cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LinkButton href="/contact" variant="white">
              {t("cta.contactUs")}
            </LinkButton>
            <ExternalLinkButton href="https://github.com/nostr-wot" variant="white-outline">
              {t("cta.viewOnGitHub")}
            </ExternalLinkButton>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
