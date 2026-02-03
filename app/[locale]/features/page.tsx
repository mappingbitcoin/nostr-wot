import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ScrollReveal,
  LinkButton,
  ExternalLinkButton,
  CodeBlock,
  Section,
  SectionHeader,
  ModeCard,
  StepsList,
} from "@/components/ui";
import {
  NetworkIcon,
  ServerIcon,
  LockIcon,
  ArrowRightIcon,
  CodeBracketsIcon,
  AnimatedLinkIcon,
  AnimatedGlobeIcon,
  AnimatedScaleIcon,
  AnimatedCalculatorIcon,
  AnimatedWrenchIcon,
  AnimatedChartIcon,
  AnimatedLockIcon,
  AnimatedRocketIcon,
  CheckCircleIcon,
} from "@/components/icons";
import {
  TrustSpectrumVisualization,
  ScoringDetailsGrid,
  DashboardPreview,
  FormulaDisplay,
  SettingsPreview,
} from "@/components/features";

// Code examples
const API_EXAMPLE = `// Check trust in any Nostr app
const trusted = await window.nostr.wot.isInMyWoT(pubkey);
const distance = await window.nostr.wot.getDistance(pubkey);
const score = await window.nostr.wot.getTrustScore(pubkey);`;

const FULL_API_EXAMPLE = `// Check if extension is available
if (window.nostr?.wot) {
  // Simple boolean check
  const inNetwork = await window.nostr.wot.isInMyWoT(pubkey, maxHops);

  // Get exact distance (number of hops)
  const hops = await window.nostr.wot.getDistance(pubkey);

  // Get full trust score (0-1 based on distance + bonuses)
  const score = await window.nostr.wot.getTrustScore(pubkey);

  // Get detailed trust info (paths, mutual, bridging nodes)
  const details = await window.nostr.wot.getDetails(pubkey);

  // Get current extension configuration
  const config = await window.nostr.wot.getConfig();
}`;

// Data arrays
const COMPATIBLE_APPS = ["Primal", "Coracle", "Snort", "Habla", "Yakihonne"];

const MODE_CARDS = [
  { key: "remote", icon: ServerIcon, iconColor: "text-blue-500", iconBg: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10" },
  { key: "local", icon: LockIcon, iconColor: "text-emerald-500", iconBg: "bg-gradient-to-br from-emerald-500/10 to-green-500/10" },
  { key: "hybrid", icon: NetworkIcon, iconColor: "text-primary", iconBg: "bg-gradient-to-br from-primary/20 to-purple-500/20", recommended: true },
];

const GET_STARTED_STEPS = [
  { title: "Install the extension", description: "Add to Chrome, Brave, Edge, or Opera" },
  { title: "Enter your pubkey", description: "Or connect with nos2x, Alby, or any NIP-07 signer" },
  { title: "Choose your mode", description: "Remote for speed, Local for privacy, or Hybrid for both" },
  { title: "Customize scoring", description: "Adjust trust weights to match your preferences" },
  { title: "Browse Nostr", description: "Your Web of Trust now follows you everywhere" },
];

const PRIVACY_MODES = [
  {
    icon: ServerIcon,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    title: "Remote Mode",
    description: "Queries sent to oracle server",
    features: ["No content data shared", "Only pubkey lookups", "No logging or tracking"],
  },
  {
    icon: LockIcon,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    title: "Local Mode",
    description: "Everything stays in your browser",
    features: ["Zero external requests", "No tracking or analytics", "Export your data anytime", "Works completely offline"],
    featured: true,
    badge: "Maximum Privacy",
  },
];

export default async function FeaturesPage() {
  const t = await getTranslations("features");

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Nostr Web of Trust Features",
    "description": "Explore WoT features: universal API, trust scoring, privacy modes, customizable settings, and seamless integration with any Nostr app.",
    "url": "https://nostr-wot.com/features",
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": "Nostr Web of Trust",
      "applicationCategory": "DeveloperApplication",
      "featureList": [
        "Universal window.nostr.wot API",
        "Customizable trust scoring",
        "Remote, Local, and Hybrid modes",
        "Privacy-first design",
        "Real-time social distance queries",
        "Batch operations support",
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal animation="fade-down">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 border border-primary/20">
              <NetworkIcon className="w-4 h-4" />
              {t("hero.badge")}
            </div>
          </ScrollReveal>
          <ScrollReveal animation="zoom-in" delay={100}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
              {t("hero.title")}
              <br />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {t("hero.titleHighlight")}
              </span>
            </h1>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200}>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {t("hero.description")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Universal API Section */}
      <Section background="gradient">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal animation="fade-right">
            <div>
              <div className="inline-flex items-center gap-2 text-primary mb-6">
                <AnimatedLinkIcon className="w-6 h-6" />
                <span className="font-semibold text-sm uppercase tracking-wider">{t("universalApi.badge")}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">{t("universalApi.title")}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">{t("universalApi.description")}</p>
              <div className="flex flex-wrap gap-2">
                {COMPATIBLE_APPS.map((app) => (
                  <span key={app} className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium shadow-sm border border-gray-200 dark:border-gray-700">
                    {app}
                  </span>
                ))}
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {t("universalApi.compatibleApps")}
                </span>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fade-left" delay={200}>
            <CodeBlock code={API_EXAMPLE} language="javascript" />
          </ScrollReveal>
        </div>
      </Section>

      {/* Choose Your Source Section */}
      <Section>
        <ScrollReveal animation="fade-up">
          <SectionHeader
            badgeIcon={<AnimatedGlobeIcon className="w-6 h-6" />}
            badge={t("chooseSource.badge")}
            title={t("chooseSource.title")}
            description={t("chooseSource.description")}
          />
        </ScrollReveal>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {MODE_CARDS.map((card, i) => (
            <ScrollReveal key={card.key} animation="fade-up" delay={100 + i * 100}>
              <ModeCard
                icon={<card.icon className={`w-7 h-7 ${card.iconColor}`} />}
                iconBg={card.iconBg}
                title={t(`chooseSource.${card.key}.title`)}
                description={t(`chooseSource.${card.key}.description`)}
                features={[
                  t(`chooseSource.${card.key}.features.${card.key === "remote" ? "instant" : card.key === "local" ? "privacy" : "fast"}`),
                  t(`chooseSource.${card.key}.features.${card.key === "remote" ? "noStorage" : card.key === "local" ? "relays" : "privacy"}`),
                  t(`chooseSource.${card.key}.features.${card.key === "remote" ? "default" : card.key === "local" ? "offline" : "coverage"}`),
                  t(`chooseSource.${card.key}.features.${card.key === "remote" ? "selfHosted" : card.key === "local" ? "export" : "fallback"}`),
                ]}
                bestFor={card.recommended ? undefined : t(`chooseSource.${card.key}.bestFor`)}
                recommended={card.recommended}
                recommendedLabel={card.recommended ? t("chooseSource.hybrid.recommended") : undefined}
              />
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* Trust Scoring Section */}
      <Section background="gradient">
        <ScrollReveal animation="fade-up">
          <SectionHeader
            badgeIcon={<AnimatedScaleIcon className="w-6 h-6" />}
            badge={t("trustScoring.badge")}
            title={t("trustScoring.title")}
            description={t("trustScoring.description")}
          />
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={100}>
          <TrustSpectrumVisualization />
        </ScrollReveal>
        <ScoringDetailsGrid />
      </Section>

      {/* Formula Section */}
      <Section>
        <ScrollReveal animation="fade-up">
          <SectionHeader
            badgeIcon={<AnimatedCalculatorIcon className="w-6 h-6" />}
            badge={t("formula.badge")}
            title={t("formula.title")}
          />
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={100}>
          <FormulaDisplay />
        </ScrollReveal>
      </Section>

      {/* Settings Preview Section */}
      <Section background="gradient">
        <ScrollReveal animation="fade-up">
          <SectionHeader
            badgeIcon={<AnimatedWrenchIcon className="w-6 h-6" />}
            badge={t("settings.badge")}
            title={t("settings.title")}
          />
        </ScrollReveal>
        <SettingsPreview />
      </Section>

      {/* Dashboard Preview */}
      <Section>
        <ScrollReveal animation="fade-up">
          <SectionHeader
            badgeIcon={<AnimatedChartIcon className="w-6 h-6" />}
            badge={t("dashboard.badge")}
            title={t("dashboard.title")}
          />
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={100}>
          <DashboardPreview />
        </ScrollReveal>
      </Section>

      {/* Privacy Section */}
      <Section background="gradient">
        <ScrollReveal animation="fade-up">
          <SectionHeader
            badgeIcon={<AnimatedLockIcon className="w-6 h-6" />}
            badge={t("privacy.badge")}
            title={t("privacy.title")}
          />
        </ScrollReveal>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PRIVACY_MODES.map((mode, i) => (
            <ScrollReveal key={mode.title} animation="fade-up" delay={100 + i * 100}>
              <div className={mode.featured ? "relative bg-gradient-to-br from-primary/5 via-purple-500/5 to-indigo-500/5 rounded-2xl p-8 border-2 border-primary/30 h-full" : "bg-white dark:bg-gray-800/50 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700/50 h-full"}>
                {mode.badge && (
                  <div className="absolute -top-3 left-6">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">{mode.badge}</span>
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl ${mode.iconBg} flex items-center justify-center mb-6`}>
                  <mode.icon className={`w-6 h-6 ${mode.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{mode.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{mode.description}</p>
                <ul className="space-y-3">
                  {mode.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircleIcon className="w-5 h-5 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* Get Started Section */}
      <Section>
        <ScrollReveal animation="fade-up">
          <SectionHeader
            badgeIcon={<AnimatedRocketIcon className="w-6 h-6" />}
            badge={t("getStarted.badge")}
            title={t("getStarted.title")}
          />
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={100}>
          <div className="max-w-4xl mx-auto">
            <StepsList steps={GET_STARTED_STEPS} />
          </div>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={200}>
          <div className="text-center mt-12">
            <LinkButton href="/download" size="lg" className="hover-lift shadow-lg shadow-primary/30">
              Download Extension
            </LinkButton>
          </div>
        </ScrollReveal>
      </Section>

      {/* API for Developers Section */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal animation="fade-up">
            <SectionHeader
              badgeIcon={<CodeBracketsIcon className="w-5 h-5" />}
              badge={t("api.badge")}
              title={t("api.title")}
              className="text-white"
            />
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <CodeBlock code={FULL_API_EXAMPLE} language="javascript" showLineNumbers />
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200}>
            <div className="text-center mt-10">
              <Link href="/docs" className="inline-flex items-center gap-2 text-primary font-medium hover:underline text-lg">
                {t("api.viewDocs")}
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Final CTA */}
      <Section>
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("pricing.title")}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">{t("pricing.description")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LinkButton href="/download" size="lg" className="hover-lift shadow-lg shadow-primary/30">
                Get the Extension
              </LinkButton>
              <ExternalLinkButton href="https://github.com/nostr-wot/nostr-wot" variant="secondary" size="lg" className="hover-lift">
                View on GitHub
              </ExternalLinkButton>
            </div>
          </div>
        </ScrollReveal>
      </Section>
      </main>
    </>
  );
}
