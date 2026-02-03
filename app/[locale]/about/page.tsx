import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ScrollReveal, LinkButton, Section, SectionHeader } from "@/components/ui";
import {
  ShieldIcon,
  BellIcon,
  SearchIcon,
  StarIcon,
  ArrowDownIcon,
} from "@/components/icons";
import { ReactNode } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about.meta");
  return { title: t("title"), description: t("description") };
}

const HOP_NODES = [
  { key: "you", label: "center", color: "bg-primary", value: null },
  { key: "1", label: "following", color: "bg-trust-green", value: "1" },
  { key: "2", label: "friendsOfFriends", color: "bg-trust-yellow", value: "2" },
  { key: "3+", label: "likelyNoise", color: "bg-trust-red", value: "3+" },
];

const WHY_WORKS_CARDS = ["oneHop", "twoHop", "threeHop"];

const USE_CASES: Array<{ key: string; Icon: (props: { className?: string }) => ReactNode }> = [
  { key: "spamFiltering", Icon: ShieldIcon },
  { key: "trustScores", Icon: StarIcon },
  { key: "smartNotifications", Icon: BellIcon },
  { key: "contentDiscovery", Icon: SearchIcon },
];

const ARCHITECTURE_BLOCKS = [
  { key: "yourApp", color: "blue", width: "max-w-md" },
  { key: "extension", color: "purple", width: "max-w-md" },
];

const ARCHITECTURE_OPTIONS = [
  { key: "localIndex", color: "green", width: "w-48" },
  { key: "oracle", color: "orange", width: "w-48" },
];

export default async function AboutPage() {
  const t = await getTranslations("about");

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Nostr Web of Trust",
    "description": "Learn how Web of Trust uses social distance to filter spam and verify reputation on Nostr without central authorities.",
    "url": "https://nostr-wot.com/about",
    "mainEntity": {
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
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal animation="fade-down">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">{t("hero.title")}</h1>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{t("hero.subtitle")}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Problem Section */}
      <Section padding="md">
        <ScrollReveal animation="fade-up">
          <SectionHeader title={t("problem.title")} />
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            {t("problem.description")}{" "}
            <strong className="text-gray-900 dark:text-white">{t("problem.socialDistance")}</strong>
            {t("problem.descriptionContinued")}
          </p>
        </ScrollReveal>

        {/* Hops Visualization */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-12">
          {HOP_NODES.map((node, i) => (
            <ScrollReveal key={node.key} animation="zoom-in" delay={i * 100}>
              <div className="flex flex-col items-center">
                {i > 0 && <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-700 hidden sm:block absolute -left-6" />}
                <div className={`w-16 h-16 rounded-full ${node.color} text-white flex items-center justify-center font-bold text-lg ${node.key === "you" ? "animate-pulse-glow" : ""}`}>
                  {node.value || t(`hops.${node.key}`)}
                </div>
                <span className="text-sm text-gray-500 mt-2">{t(`hops.${node.label}`)}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal animation="fade-up" delay={400}>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8">
            <h3 className="font-semibold text-lg mb-4 text-center">{t("whyWorks.title")}</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              {WHY_WORKS_CARDS.map((card) => (
                <div key={card} className="card-interactive p-4 rounded-lg bg-white dark:bg-gray-700">
                  <strong className="block text-gray-900 dark:text-white mb-2">{t(`whyWorks.${card}.title`)}</strong>
                  <p className="text-gray-600 dark:text-gray-400">{t(`whyWorks.${card}.description`)}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </Section>

      {/* Architecture Section */}
      <Section background="gray" padding="md">
        <ScrollReveal animation="fade-up">
          <SectionHeader title={t("architecture.title")} />
        </ScrollReveal>
        <div className="space-y-4">
          {ARCHITECTURE_BLOCKS.map((block, i) => (
            <ScrollReveal key={block.key} animation={i === 0 ? "fade-down" : "fade-up"} delay={i * 200}>
              <div className="flex justify-center">
                <div className={`bg-${block.color}-50 dark:bg-${block.color}-900/20 border border-${block.color}-200 dark:border-${block.color}-800 rounded-lg p-4 text-center ${block.width} w-full card-interactive`}>
                  <strong className="block text-gray-900 dark:text-white">{t(`architecture.${block.key}.title`)}</strong>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t(`architecture.${block.key}.description`)}</span>
                </div>
              </div>
              {i < ARCHITECTURE_BLOCKS.length - 1 && (
                <ScrollReveal animation="zoom-in" delay={(i + 1) * 100}>
                  <div className="text-center text-2xl text-gray-400 mt-4">
                    <ArrowDownIcon className="w-6 h-6 mx-auto animate-bounce" />
                  </div>
                </ScrollReveal>
              )}
            </ScrollReveal>
          ))}

          <ScrollReveal animation="zoom-in" delay={300}>
            <div className="text-center text-2xl text-gray-400">
              <ArrowDownIcon className="w-6 h-6 mx-auto animate-bounce" style={{ animationDelay: "0.2s" }} />
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={400}>
            <div className="flex justify-center items-center gap-4 flex-wrap">
              {ARCHITECTURE_OPTIONS.map((option, i) => (
                <>
                  {i > 0 && <span className="text-gray-400 font-medium">{t("architecture.or")}</span>}
                  <div
                    key={option.key}
                    className={`bg-${option.color}-50 dark:bg-${option.color}-900/20 border border-${option.color}-200 dark:border-${option.color}-800 rounded-lg p-4 text-center ${option.width} card-interactive`}
                  >
                    <strong className="block text-gray-900 dark:text-white">{t(`architecture.${option.key}.title`)}</strong>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t(`architecture.${option.key}.description`)}</span>
                  </div>
                </>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal animation="zoom-in" delay={500}>
            <div className="text-center text-2xl text-gray-400">
              <ArrowDownIcon className="w-6 h-6 mx-auto animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={600}>
            <div className="flex justify-center">
              <div className="bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center max-w-md w-full card-interactive">
                <strong className="block text-gray-900 dark:text-white">{t("architecture.relays.title")}</strong>
                <span className="text-sm text-gray-500 dark:text-gray-400">{t("architecture.relays.description")}</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Section>

      {/* Use Cases Section */}
      <Section padding="md">
        <ScrollReveal animation="fade-up">
          <SectionHeader title={t("useCases.title")} description={t("useCases.subtitle")} />
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {USE_CASES.map((useCase, i) => (
            <ScrollReveal key={useCase.key} animation="fade-up" delay={i * 100}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 card-interactive h-full">
                <useCase.Icon className="w-12 h-12 mb-4" />
                <h3 className="font-semibold mb-2">{t(`useCases.${useCase.key}.title`)}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t(`useCases.${useCase.key}.description`)}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* Code Examples Section */}
      <Section background="gray" padding="md">
        <ScrollReveal animation="fade-up">
          <SectionHeader title={t("codeExamples.title")} />
        </ScrollReveal>
        <div className="grid md:grid-cols-2 gap-6">
          <ScrollReveal animation="fade-right" delay={100}>
            <div className="bg-gray-900 dark:bg-gray-800 rounded-xl overflow-hidden card-interactive">
              <div className="bg-gray-800 dark:bg-gray-700 px-4 py-2 text-sm text-gray-400">{t("codeExamples.javascript")}</div>
              <pre className="p-4 text-sm overflow-x-auto">
                <code className="text-gray-100">{`// Check if someone is in your web of trust
if (window.nostr?.wot) {
  const distance = await window.nostr.wot.getDistance(pubkey);

  if (distance !== null && distance <= 2) {
    console.log("Trusted! " + distance + " hops away");
  }
}`}</code>
              </pre>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fade-left" delay={200}>
            <div className="bg-gray-900 dark:bg-gray-800 rounded-xl overflow-hidden card-interactive">
              <div className="bg-gray-800 dark:bg-gray-700 px-4 py-2 text-sm text-gray-400">{t("codeExamples.restApi")}</div>
              <pre className="p-4 text-sm overflow-x-auto">
                <code className="text-gray-100">{`# Query social distance between two users
curl "https://wot-oracle.example.com/distance?\\
from=PUBKEY1&to=PUBKEY2"

# Response
{
  "distance": 2,
  "paths": 5,
  "mutual": false
}`}</code>
              </pre>
            </div>
          </ScrollReveal>
        </div>
      </Section>

      {/* CTA Section */}
      <Section padding="md">
        <ScrollReveal animation="zoom-in">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t("cta.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LinkButton href="/docs" className="hover-lift">{t("cta.readDocs")}</LinkButton>
              <LinkButton href="/download" variant="secondary" className="hover-lift">{t("cta.getExtension")}</LinkButton>
            </div>
          </div>
        </ScrollReveal>
      </Section>
      </main>
    </>
  );
}
