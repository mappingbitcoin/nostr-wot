import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import HeroAnimation from "@/components/HeroAnimation";
import {
  ScrollReveal,
  AnimatedCounter,
  LinkButton,
  ExternalLinkButton,
  NewsletterForm,
  Section,
  SectionHeader,
  FeatureCard,
  FeatureList,
  StatsGrid,
} from "@/components/ui";
import {
  ShieldIcon,
  SpeedIcon,
  LockIcon,
  PuzzleIcon,
  ServerIcon,
  ArrowRightIcon,
  NostrLogo,
  ExtensionIllustration,
  OracleIllustration,
  CTAIllustration,
  CodeBracketsIcon,
  ChevronDownIcon,
} from "@/components/icons";
import { CodeBlock } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home.meta");
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function Home() {
  const t = await getTranslations("home");

  // JSON-LD structured data for the home page
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Nostr Web of Trust",
    "alternateName": "Nostr WoT",
    "url": "https://nostr-wot.com",
    "logo": "https://nostr-wot.com/icon-512.png",
    "description": "Open infrastructure for trust-based filtering on Nostr. Empower your apps with reputation scoring and social distance metrics.",
    "sameAs": [
      "https://github.com/nostr-wot",
      "https://twitter.com/nostr_wot",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Nostr Web of Trust",
    "url": "https://nostr-wot.com",
    "description": "Open infrastructure for trust-based filtering on Nostr",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://nostr-wot.com/docs?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const navigationJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "SiteNavigationElement",
        "position": 1,
        "name": "Download Extension",
        "description": "Download the WoT browser extension for Chrome, Brave, Edge, and Opera",
        "url": "https://nostr-wot.com/download",
      },
      {
        "@type": "SiteNavigationElement",
        "position": 2,
        "name": "Documentation",
        "description": "API documentation, integration guides, and SDK reference",
        "url": "https://nostr-wot.com/docs",
      },
      {
        "@type": "SiteNavigationElement",
        "position": 3,
        "name": "Features",
        "description": "Explore Web of Trust features: trust scoring, privacy modes, and universal API",
        "url": "https://nostr-wot.com/features",
      },
      {
        "@type": "SiteNavigationElement",
        "position": 4,
        "name": "Oracle Server",
        "description": "Self-hostable WoT Oracle server for social graph queries",
        "url": "https://nostr-wot.com/oracle",
      },
      {
        "@type": "SiteNavigationElement",
        "position": 5,
        "name": "Playground",
        "description": "Interactive API playground to test Web of Trust queries",
        "url": "https://nostr-wot.com/playground",
      },
      {
        "@type": "SiteNavigationElement",
        "position": 6,
        "name": "About",
        "description": "Learn about Web of Trust and social distance on Nostr",
        "url": "https://nostr-wot.com/about",
      },
    ],
  };

  const stats = [
    { value: t("stats.license"), label: t("stats.licenseLabel") },
    { value: t("stats.responseTime"), label: t("stats.responseTimeLabel") },
    { value: <AnimatedCounter end={10} suffix="K+" />, label: t("stats.requestsPerSecondLabel") },
    { value: <AnimatedCounter end={100} suffix="%" />, label: t("stats.selfHostableLabel") },
  ];

  const howItWorksSteps = [
    { title: t("howItWorks.step1.title"), description: t("howItWorks.step1.description") },
    { title: t("howItWorks.step2.title"), description: t("howItWorks.step2.description") },
    { title: t("howItWorks.step3.title"), description: t("howItWorks.step3.description") },
  ];

  const valueProps = [
    { icon: <ShieldIcon className="w-16 h-16" />, title: t("whyWot.decentralized.title"), description: t("whyWot.decentralized.description") },
    { icon: <SpeedIcon className="w-16 h-16" />, title: t("whyWot.fast.title"), description: t("whyWot.fast.description") },
    { icon: <LockIcon className="w-16 h-16" />, title: t("whyWot.privacy.title"), description: t("whyWot.privacy.description") },
  ];

  const extensionFeatures = [
    { title: t("extension.features.clientSide.title"), description: t("extension.features.clientSide.description") },
    { title: t("extension.features.mode.title"), description: t("extension.features.mode.description") },
    { title: t("extension.features.privacy.title"), description: t("extension.features.privacy.description") },
  ];

  const oracleFeatures = [
    { title: t("oracle.features.api.title"), description: t("oracle.features.api.description") },
    { title: t("oracle.features.performance.title"), description: t("oracle.features.performance.description") },
    { title: t("oracle.features.selfHost.title"), description: t("oracle.features.selfHost.description") },
  ];

  const sdkFeatures = [
    { title: t("sdk.features.extensionFirst.title"), description: t("sdk.features.extensionFirst.description") },
    { title: t("sdk.features.typescript.title"), description: t("sdk.features.typescript.description") },
    { title: t("sdk.features.react.title"), description: t("sdk.features.react.description") },
  ];

  const faqItems = [
    { question: t("faq.items.whatIsWot.question"), answer: t("faq.items.whatIsWot.answer") },
    { question: t("faq.items.howDoesItWork.question"), answer: t("faq.items.howDoesItWork.answer") },
    { question: t("faq.items.isItPrivate.question"), answer: t("faq.items.isItPrivate.answer") },
    { question: t("faq.items.whichBrowsers.question"), answer: t("faq.items.whichBrowsers.answer") },
    { question: t("faq.items.isFree.question"), answer: t("faq.items.isFree.answer") },
    { question: t("faq.items.howToIntegrate.question"), answer: t("faq.items.howToIntegrate.answer") },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(navigationJsonLd) }}
      />
      <main>
        {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden -mt-16 pt-16">
        <HeroAnimation />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
          <ScrollReveal animation="fade-down" delay={100}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              {t("hero.badge")}
            </div>
          </ScrollReveal>
          <ScrollReveal animation="zoom-in" delay={200}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
              {t("hero.title")}
              <br />
              <span className="text-primary">{t("hero.titleHighlight")}</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={300}>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("hero.description")}
            </p>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={400}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <LinkButton href="/download" className="hover-lift">{t("hero.downloadButton")}</LinkButton>
              <LinkButton href="/docs" variant="secondary" className="hover-lift">{t("hero.docsButton")}</LinkButton>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={500}>
            <a href="https://nostr.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-nostr transition-colors text-sm">
              <span>{t("hero.builtFor")}</span>
              <NostrLogo className="w-6 h-6 text-nostr" />
              <span>Nostr</span>
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats Section */}
      <Section background="gray" padding="md">
        <StatsGrid stats={stats} />
      </Section>

      {/* How It Works Section */}
      <Section padding="md">
        <ScrollReveal animation="fade-up">
          <SectionHeader title={t("howItWorks.title")} description={t("howItWorks.description")} />
        </ScrollReveal>
        <div className="grid md:grid-cols-3 gap-8">
          {howItWorksSteps.map((step, i) => (
            <ScrollReveal key={i} animation="zoom-in" delay={100 + i * 100}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                  {i + 1}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal animation="fade-up" delay={400}>
          <div className="text-center mt-12">
            <Link href="/about" className="inline-flex items-center gap-2 text-primary font-medium hover:underline link-underline">
              {t("howItWorks.learnMoreLink")}
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
      </Section>

      {/* Value Props Section */}
      <Section background="gray" padding="md" className="overflow-hidden">
        <ScrollReveal animation="fade-up">
          <SectionHeader title={t("whyWot.title")} description={t("whyWot.description")} />
        </ScrollReveal>
        <div className="grid md:grid-cols-3 gap-8">
          {valueProps.map((prop, i) => (
            <ScrollReveal key={i} animation="fade-up" delay={100 + i * 100}>
              <FeatureCard icon={prop.icon} title={prop.title} description={prop.description} className="card-interactive" />
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* WoT Extension Section */}
      <Section padding="lg" className="overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <ScrollReveal animation="fade-right">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium mb-6">
                <PuzzleIcon className="w-4 h-4" />
                {t("extension.badge")}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("extension.title")}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                {t("extension.descriptionStart")}{" "}
                <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">window.nostr.wot</code>{" "}
                {t("extension.descriptionEnd")}
              </p>
              <FeatureList items={extensionFeatures} iconColor="text-purple-600 dark:text-purple-400" className="mb-8" />
              <LinkButton href="/download" className="hover-lift">{t("extension.downloadButton")}</LinkButton>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fade-left" delay={200}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-3xl p-8 border border-purple-200 dark:border-purple-800">
                <ExtensionIllustration />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Section>

      {/* WoT Oracle Section */}
      <Section background="gray" padding="lg" className="overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <ScrollReveal animation="fade-right" className="order-2 lg:order-1">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/40 dark:to-purple-900/40 rounded-3xl p-8 border border-violet-200 dark:border-violet-800">
                <OracleIllustration />
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fade-left" delay={200} className="order-1 lg:order-2">
            <div>
              <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-3 py-1 rounded-full text-sm font-medium mb-6">
                <ServerIcon className="w-4 h-4" />
                {t("oracle.badge")}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("oracle.title")}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t("oracle.description")}</p>
              <FeatureList items={oracleFeatures} iconColor="text-violet-600 dark:text-violet-400" className="mb-8" />
              <LinkButton href="/oracle" className="hover-lift">{t("oracle.learnMoreButton")}</LinkButton>
            </div>
          </ScrollReveal>
        </div>
      </Section>

      {/* SDK Section */}
      <Section padding="lg" className="overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <ScrollReveal animation="fade-right">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-medium mb-6">
                <CodeBracketsIcon className="w-4 h-4" />
                {t("sdk.badge")}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("sdk.title")}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t("sdk.description")}</p>
              <FeatureList items={sdkFeatures} iconColor="text-emerald-600 dark:text-emerald-400" className="mb-8" />
              <div className="flex flex-col sm:flex-row gap-4">
                <LinkButton href="/docs#sdk-setup" className="hover-lift">{t("sdk.viewDocsButton")}</LinkButton>
                <ExternalLinkButton href="https://www.npmjs.com/package/nostr-wot-sdk" variant="secondary" className="hover-lift">
                  {t("sdk.npmButton")}
                </ExternalLinkButton>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fade-left" delay={200}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-3xl p-6 border border-emerald-200 dark:border-emerald-800">
                <CodeBlock
                  language="javascript"
                  code={`import { WoT } from 'nostr-wot-sdk';

const wot = new WoT({
  useExtension: true,
  fallback: {
    oracle: 'https://wot-oracle.mappingbitcoin.com',
    myPubkey: 'your-pubkey...'
  }
});

// Check trust
const score = await wot.getTrustScore(pubkey);
const inNetwork = await wot.isInMyWoT(pubkey);`}
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Section>

      {/* FAQ Section */}
      <Section background="gray" padding="lg">
        <ScrollReveal animation="fade-up">
          <SectionHeader title={t("faq.title")} description={t("faq.description")} />
        </ScrollReveal>
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <ScrollReveal key={i} animation="fade-up" delay={50 + i * 50}>
                <details className="group bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <h3 className="font-semibold text-gray-900 dark:text-white pr-4">{item.question}</h3>
                    <ChevronDownIcon className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180 flex-shrink-0" />
                  </summary>
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.answer}</p>
                  </div>
                </details>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA & Newsletter Section */}
      <section className="py-24 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <ScrollReveal animation="fade-right">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">{t("cta.title")}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t("cta.description")}</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <LinkButton href="/download" className="hover-lift">{t("cta.getExtensionButton")}</LinkButton>
                  <ExternalLinkButton href="https://github.com/nostr-wot/nostr-wot-extension" variant="secondary" className="hover-lift">
                    {t("cta.viewGithubButton")}
                  </ExternalLinkButton>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-left" delay={200}>
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-nostr/10 rounded-full blur-3xl" />
                <CTAIllustration className="w-64 h-64 md:w-80 md:h-80 text-primary relative" />
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal animation="fade-up" delay={300}>
            <div className="mt-20 pt-12 border-t border-gray-200 dark:border-gray-800">
              <div className="text-center max-w-xl mx-auto">
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{t("newsletter.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t("newsletter.description")}</p>
                <NewsletterForm />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      </main>
    </>
  );
}
