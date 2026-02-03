import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Badge, LinkButton, ExternalLinkButton, Section, SectionHeader, StatCard } from "@/components/ui";
import { ScrollReveal } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("oracle.meta");
  return { title: t("title"), description: t("description") };
}

const PERFORMANCE_STATS = [
  { key: "cachedLatency", value: "<1ms" },
  { key: "uncachedLatency", value: "<50ms" },
  { key: "queriesPerSecond", value: "10,000+" },
  { key: "bidirectionalBfs", value: "O(b^d/2)" },
];

const ARCHITECTURE_CARDS = ["graphStorage", "pathfinding", "caching", "rateLimiting"];

const CONFIG_ROWS = [
  { variable: "RELAYS", default: "damus, nos.lol, nostr.band", key: "relays" },
  { variable: "HTTP_PORT", default: "8080", key: "httpPort" },
  { variable: "DB_PATH", default: "wot.db", key: "dbPath" },
  { variable: "RATE_LIMIT_PER_MINUTE", default: "100", key: "rateLimit" },
  { variable: "CACHE_SIZE", default: "10000", key: "cacheSize" },
  { variable: "CACHE_TTL_SECS", default: "300", key: "cacheTtl" },
];

const SELF_HOSTING_BLOCKS = [
  {
    key: "docker",
    code: `# Pull and run the image
docker pull ghcr.io/nostr-wot/wot-oracle:v1.0.0

docker run -d \\
  -p 8080:8080 \\
  -v wot-data:/app/data \\
  ghcr.io/nostr-wot/wot-oracle:v1.0.0`,
  },
  {
    key: "dockerCompose",
    code: `git clone https://github.com/nostr-wot/wot-oracle.git
cd wot-oracle
docker-compose up -d`,
  },
  {
    key: "fromSource",
    code: `git clone https://github.com/nostr-wot/wot-oracle.git
cd wot-oracle
cargo build --release
./target/release/wot-oracle`,
  },
];

const API_ENDPOINTS = [
  {
    key: "distance",
    request: "GET /distance?from=PUBKEY1&to=PUBKEY2",
    response: `{
  "from": "PUBKEY1",
  "to": "PUBKEY2",
  "distance": 2,
  "paths": 5,
  "mutual": false,
  "bridging_nodes": ["PUBKEY3", "PUBKEY4"]
}`,
  },
  {
    key: "batch",
    request: `POST /distance/batch
Content-Type: application/json

{
  "from": "PUBKEY1",
  "targets": ["PUBKEY2", "PUBKEY3", "PUBKEY4"]
}`,
    response: `{
  "from": "PUBKEY1",
  "results": [
    { "to": "PUBKEY2", "distance": 1 },
    { "to": "PUBKEY3", "distance": 2 },
    { "to": "PUBKEY4", "distance": null }
  ]
}`,
  },
  {
    key: "stats",
    response: `{
  "total_pubkeys": 1250000,
  "total_follows": 8500000,
  "last_sync": "2024-01-15T10:30:00Z",
  "cache_hit_rate": 0.85
}`,
  },
  {
    key: "health",
    response: `{ "status": "healthy", "uptime": 864000 }`,
  },
];

export default async function OraclePage() {
  const t = await getTranslations("oracle");

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "WoT Oracle Server",
    "applicationCategory": "WebApplication",
    "operatingSystem": "Linux, Docker",
    "description": "Self-hostable REST API server for Web of Trust social graph queries. Query social distance, find paths, and analyze follow relationships on Nostr.",
    "url": "https://nostr-wot.com/oracle",
    "codeRepository": "https://github.com/nostr-wot/wot-oracle",
    "programmingLanguage": "Rust",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Sub-millisecond cached queries",
      "Bidirectional BFS pathfinding",
      "10,000+ queries per second",
      "Self-hostable with Docker",
      "REST API with batch support",
    ],
    "author": {
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
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Badge className="mb-4">{t("hero.badge")}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("hero.title")}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">{t("hero.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ExternalLinkButton href="https://github.com/nostr-wot/wot-oracle">{t("hero.viewOnGitHub")}</ExternalLinkButton>
            <LinkButton href="/docs" variant="secondary">{t("hero.apiDocs")}</LinkButton>
          </div>
        </div>
      </section>

      {/* What It Does */}
      <Section padding="md">
        <SectionHeader title={t("whatItDoes.title")} />
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-4">{t("whatItDoes.description")}</p>
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center">
          <strong className="text-gray-900 dark:text-white">{t("whatItDoes.example")}</strong> {t("whatItDoes.exampleText")}
        </p>
      </Section>

      {/* Performance */}
      <Section background="gray" padding="md">
        <SectionHeader title={t("performance.title")} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PERFORMANCE_STATS.map((stat, i) => (
            <ScrollReveal key={stat.key} animation="fade-up" delay={i * 100}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
                <span className="block text-4xl font-bold text-primary mb-2">{stat.value}</span>
                <span className="text-gray-600 dark:text-gray-400">{t(`performance.${stat.key}`)}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* API Endpoints */}
      <Section padding="md">
        <SectionHeader title={t("apiEndpoints.title")} />
        <div className="space-y-8">
          {API_ENDPOINTS.map((endpoint) => (
            <div key={endpoint.key} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2">
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{t(`apiEndpoints.${endpoint.key}.title`)}</code>
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t(`apiEndpoints.${endpoint.key}.description`)}</p>
              <div className="space-y-3">
                {endpoint.request && (
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400">{t("apiEndpoints.distance.request")}</div>
                    <pre className="p-4 text-sm overflow-x-auto">
                      <code className="text-gray-100">{endpoint.request}</code>
                    </pre>
                  </div>
                )}
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  {endpoint.request && <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400">{t("apiEndpoints.distance.response")}</div>}
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-gray-100">{endpoint.response}</code>
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Self-Hosting */}
      <Section background="gray" padding="md">
        <SectionHeader title={t("selfHosting.title")} description={t("selfHosting.subtitle")} />
        <div className="space-y-6">
          {SELF_HOSTING_BLOCKS.map((block) => (
            <div key={block.key} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">{t(`selfHosting.${block.key}`)}</h3>
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <pre className="p-4 text-sm overflow-x-auto">
                  <code className="text-gray-100">{block.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Configuration */}
      <Section padding="md">
        <SectionHeader title={t("configuration.title")} description={t("configuration.subtitle")} />
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 font-semibold">{t("configuration.table.variable")}</th>
                <th className="text-left p-4 font-semibold">{t("configuration.table.default")}</th>
                <th className="text-left p-4 font-semibold">{t("configuration.table.description")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {CONFIG_ROWS.map((row) => (
                <tr key={row.variable}>
                  <td className="p-4">
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">{row.variable}</code>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{row.default}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{t(`configuration.${row.key}.description`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Architecture */}
      <Section background="gray" padding="md">
        <SectionHeader title={t("architecture.title")} />
        <div className="grid md:grid-cols-2 gap-6">
          {ARCHITECTURE_CARDS.map((card, i) => (
            <ScrollReveal key={card} animation="fade-up" delay={i * 100}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 h-full">
                <h3 className="text-lg font-semibold mb-3">{t(`architecture.${card}.title`)}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t(`architecture.${card}.description`)}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* Public Instance */}
      <Section padding="md">
        <SectionHeader title={t("publicInstance.title")} description={t("publicInstance.subtitle")} />
        <div className="bg-gray-900 rounded-lg overflow-hidden max-w-xl mx-auto">
          <pre className="p-4 text-center overflow-x-auto">
            <code className="text-gray-100">https://wot-oracle.mappingbitcoin.com</code>
          </pre>
        </div>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-4 text-sm">{t("publicInstance.rateLimit")}</p>
      </Section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-lg text-white/80 mb-8">{t("cta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ExternalLinkButton href="https://github.com/nostr-wot/wot-oracle" variant="white">{t("cta.viewSource")}</ExternalLinkButton>
            <LinkButton href="/download" variant="white-outline">{t("cta.learnExtension")}</LinkButton>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
