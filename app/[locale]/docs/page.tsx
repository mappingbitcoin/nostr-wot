import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { LinkButton, CodeBlock, InlineCode, TerminalBlock, Section, SectionHeader } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("docs.meta");
  return { title: t("title"), description: t("description") };
}

interface SidebarLink {
  href: string;
  label?: string;
  labelKey?: string;
  isInternal?: boolean;
}

interface SidebarSection {
  key: string;
  links: SidebarLink[];
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    key: "gettingStarted",
    links: [
      { href: "#overview", labelKey: "overview" },
      { href: "#quick-start", labelKey: "quickStart" },
    ],
  },
  {
    key: "extensionCore",
    links: [
      { href: "#ext-setup", labelKey: "setup" },
      { href: "#ext-getdistance", label: "getDistance" },
      { href: "#ext-isinmywot", label: "isInMyWoT" },
      { href: "#ext-getdistancebetween", label: "getDistanceBetween" },
      { href: "#ext-gettrustscore", label: "getTrustScore" },
      { href: "#ext-getdetails", label: "getDetails" },
      { href: "#ext-getconfig", label: "getConfig" },
    ],
  },
  {
    key: "extensionBatch",
    links: [
      { href: "#ext-getdistancebatch", label: "getDistanceBatch" },
      { href: "#ext-gettrustscoreatch", label: "getTrustScoreBatch" },
      { href: "#ext-filterbywot", label: "filterByWoT" },
    ],
  },
  {
    key: "extensionUser",
    links: [
      { href: "#ext-getmypubkey", label: "getMyPubkey" },
      { href: "#ext-isconfigured", label: "isConfigured" },
    ],
  },
  {
    key: "extensionGraph",
    links: [
      { href: "#ext-getfollows", label: "getFollows" },
      { href: "#ext-getcommonfollows", label: "getCommonFollows" },
      { href: "#ext-getstats", label: "getStats" },
      { href: "#ext-getpath", label: "getPath" },
    ],
  },
  {
    key: "sdkIntegration",
    links: [
      { href: "#sdk-setup", labelKey: "sdkSetup" },
      { href: "#sdk-core", labelKey: "sdkCore" },
      { href: "#sdk-batch", labelKey: "sdkBatch" },
      { href: "#sdk-graph", labelKey: "sdkGraph" },
      { href: "#sdk-config", labelKey: "sdkConfig" },
      { href: "#sdk-errors", labelKey: "sdkErrors" },
      { href: "#sdk-react", labelKey: "sdkReact" },
    ],
  },
  {
    key: "publicServers",
    links: [
      { href: "#public-servers", labelKey: "publicServersOverview" },
    ],
  },
  {
    key: "oracleApi",
    links: [
      { href: "#oracle-health", label: "GET /health" },
      { href: "#oracle-stats", label: "GET /stats" },
      { href: "#oracle-follows", label: "GET /follows" },
      { href: "#oracle-common-follows", label: "GET /common-follows" },
      { href: "#oracle-path", label: "GET /path" },
      { href: "#oracle-distance", label: "GET /distance" },
      { href: "#oracle-batch", label: "POST /distance/batch" },
      { href: "#oracle-errors", labelKey: "oracleErrors" },
    ],
  },
  {
    key: "resources",
    links: [
      { href: "/download", labelKey: "extensionGuide", isInternal: true },
      { href: "/oracle", labelKey: "oracleGuide", isInternal: true },
    ],
  },
];

interface TableRow {
  name: string;
  type: string;
  default?: string;
  required?: string;
  description: string;
}

function ParamTable({ rows, hasDefault, hasRequired }: { rows: TableRow[]; hasDefault?: boolean; hasRequired?: boolean }) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="text-left p-3 font-semibold">Name</th>
            <th className="text-left p-3 font-semibold">Type</th>
            {hasDefault && <th className="text-left p-3 font-semibold">Default</th>}
            {hasRequired && <th className="text-left p-3 font-semibold">Required</th>}
            <th className="text-left p-3 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td className="p-3 border-t border-gray-200 dark:border-gray-700"><InlineCode>{row.name}</InlineCode></td>
              <td className="p-3 border-t border-gray-200 dark:border-gray-700">{row.type}</td>
              {hasDefault && <td className="p-3 border-t border-gray-200 dark:border-gray-700">{row.default || "-"}</td>}
              {hasRequired && <td className="p-3 border-t border-gray-200 dark:border-gray-700">{row.required}</td>}
              <td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function DocsPage() {
  const t = await getTranslations("docs");

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "name": "Nostr Web of Trust Documentation",
    "description": "Complete API documentation for the Nostr Web of Trust extension, SDK, and Oracle server. Learn how to integrate trust scoring into your Nostr apps.",
    "url": "https://nostr-wot.com/docs",
    "author": {
      "@type": "Organization",
      "name": "Nostr Web of Trust",
      "url": "https://nostr-wot.com",
    },
    "about": {
      "@type": "SoftwareApplication",
      "name": "Nostr Web of Trust",
    },
    "articleSection": [
      "Getting Started",
      "Extension API",
      "SDK Integration",
      "Oracle REST API",
    ],
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
          <p className="text-xl text-gray-600 dark:text-gray-400">{t("hero.subtitle")}</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <nav className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              {SIDEBAR_SECTIONS.map((section) => (
                <div key={section.key}>
                  <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
                    {t(`sidebar.${section.key}`)}
                  </h3>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        {link.isInternal ? (
                          <Link href={link.href} className="text-gray-600 dark:text-gray-400 hover:text-primary">
                            {link.labelKey ? t(`sidebar.${link.labelKey}`) : link.label}
                          </Link>
                        ) : (
                          <a href={link.href} className="text-gray-600 dark:text-gray-400 hover:text-primary">
                            {link.labelKey ? t(`sidebar.${link.labelKey}`) : link.label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <section id="overview" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">{t("overview.title")}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t("overview.description")}</p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                  <li>
                    <strong className="text-gray-900 dark:text-white">{t("overview.extension.title")}</strong> - {t("overview.extension.description")}{" "}
                    <InlineCode>{t("overview.extension.api")}</InlineCode> {t("overview.extension.forClientSide")}
                  </li>
                  <li>
                    <strong className="text-gray-900 dark:text-white">{t("overview.oracle.title")}</strong> - {t("overview.oracle.description")}
                  </li>
                </ul>
                <p className="text-gray-600 dark:text-gray-400">
                  {t("overview.fundamentalQuestion")} <em>{t("overview.question")}</em>
                </p>
              </section>

              <section id="quick-start" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">{t("quickStart.title")}</h2>
                <h3 className="text-lg font-semibold mb-3">{t("quickStart.browser")}</h3>
                <CodeBlock
                  language="javascript"
                  className="mb-6"
                  code={`// Check if extension is available
if (window.nostr?.wot) {
  // Get distance to a pubkey
  const distance = await window.nostr.wot.getDistance(
    "npub1targetpubkey..."
  );

  if (distance !== null && distance <= 2) {
    // Within web of trust
    console.log(\`Trusted: \${distance} hops away\`);
  } else {
    // Outside web of trust or not connected
    console.log("Not in your web of trust");
  }
}`}
                />
                <h3 className="text-lg font-semibold mb-3">{t("quickStart.server")}</h3>
                <CodeBlock
                  language="javascript"
                  code={`// Using fetch
const response = await fetch(
  \`https://wot-oracle.mappingbitcoin.com/distance?\` +
  \`from=\${fromPubkey}&to=\${toPubkey}\`
);
const data = await response.json();

console.log(\`Distance: \${data.distance}\`);
console.log(\`Paths: \${data.paths}\`);
console.log(\`Mutual follow: \${data.mutual}\`);`}
                />
              </section>

              <section id="ext-setup" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">{t("extensionSetup.title")}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t("extensionSetup.description")} <InlineCode>{t("extensionSetup.api")}</InlineCode> {t("extensionSetup.objectInto")}
                </p>
                <CodeBlock
                  language="javascript"
                  code={`// Feature detection
function hasWoT() {
  return typeof window !== "undefined" &&
         window.nostr?.wot !== undefined;
}

// Wait for extension to load
async function waitForWoT(timeout = 3000) {
  const start = Date.now();
  while (!hasWoT() && Date.now() - start < timeout) {
    await new Promise(r => setTimeout(r, 100));
  }
  return hasWoT();
}`}
                />
              </section>

              <section id="ext-getdistance" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>{t("getDistance.title")}</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t("getDistance.description")}</p>
                <h3 className="text-lg font-semibold mb-3">{t("getDistance.parameters")}</h3>
                <ParamTable
                  rows={[{ name: "targetPubkey", type: "string", description: "Hex or npub format pubkey" }]}
                />
                <h3 className="text-lg font-semibold mb-3">{t("getDistance.returns")}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <InlineCode>Promise&lt;number | null&gt;</InlineCode> - {t("getDistance.returnsDescription")}{" "}
                  <InlineCode>{t("getDistance.null")}</InlineCode> {t("getDistance.ifNotConnected")}
                </p>
                <h3 className="text-lg font-semibold mb-3">{t("getDistance.example")}</h3>
                <CodeBlock
                  language="javascript"
                  code={`const distance = await window.nostr.wot.getDistance(
  "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d"
);

switch (distance) {
  case null:
    console.log("Not connected");
    break;
  case 0:
    console.log("This is you");
    break;
  case 1:
    console.log("Direct follow");
    break;
  default:
    console.log(\`\${distance} hops away\`);
}`}
                />
              </section>

              <section id="ext-isinmywot" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>{t("isInMyWot.title")}</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t("isInMyWot.description")}</p>
                <h3 className="text-lg font-semibold mb-3">{t("isInMyWot.parameters")}</h3>
                <ParamTable
                  hasDefault
                  rows={[
                    { name: "targetPubkey", type: "string", default: "-", description: "Hex or npub format pubkey" },
                    { name: "maxHops", type: "number", default: "3", description: 'Maximum hops to consider "trusted"' },
                  ]}
                />
                <h3 className="text-lg font-semibold mb-3">{t("isInMyWot.returns")}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4"><InlineCode>Promise&lt;boolean&gt;</InlineCode></p>
                <h3 className="text-lg font-semibold mb-3">{t("isInMyWot.example")}</h3>
                <CodeBlock
                  language="javascript"
                  code={`// Check with default threshold (3 hops)
const trusted = await window.nostr.wot.isInMyWoT(pubkey);

// Stricter check (2 hops)
const veryTrusted = await window.nostr.wot.isInMyWoT(pubkey, 2);

// Filter a list of pubkeys
const pubkeys = ["npub1...", "npub2...", "npub3..."];
const trusted = await Promise.all(
  pubkeys.map(p => window.nostr.wot.isInMyWoT(p, 2))
);
const trustedPubkeys = pubkeys.filter((_, i) => trusted[i]);`}
                />
              </section>

              <section id="ext-getdistancebetween" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>{t("getDistanceBetween.title")}</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t("getDistanceBetween.description")}</p>
                <h3 className="text-lg font-semibold mb-3">{t("getDistanceBetween.parameters")}</h3>
                <ParamTable
                  rows={[
                    { name: "fromPubkey", type: "string", description: "Source pubkey" },
                    { name: "toPubkey", type: "string", description: "Target pubkey" },
                  ]}
                />
                <h3 className="text-lg font-semibold mb-3">Returns</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4"><InlineCode>Promise&lt;number | null&gt;</InlineCode></p>
                <h3 className="text-lg font-semibold mb-3">Example</h3>
                <CodeBlock
                  language="javascript"
                  code={`// Check how connected two other users are
const distance = await window.nostr.wot.getDistanceBetween(
  alicePubkey,
  bobPubkey
);

if (distance === 1) {
  console.log("Alice follows Bob directly");
}`}
                />
              </section>

              <section id="ext-gettrustscore" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>{t("getTrustScore.title")}</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t("getTrustScore.description")}</p>
                <h3 className="text-lg font-semibold mb-3">{t("getTrustScore.parameters")}</h3>
                <ParamTable
                  rows={[{ name: "targetPubkey", type: "string", description: "Hex or npub format pubkey" }]}
                />
                <h3 className="text-lg font-semibold mb-3">{t("getTrustScore.returns")}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <InlineCode>Promise&lt;number | null&gt;</InlineCode> - {t("getTrustScore.returnsDescription")}{" "}
                  <InlineCode>{t("getTrustScore.null")}</InlineCode> {t("getTrustScore.ifNotConnected")}
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
                  <p className="font-mono text-sm mb-3">{t("getTrustScore.formula")}</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold mb-2">{t("getTrustScore.distanceWeights.title")}</p>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                        <li>{t("getTrustScore.distanceWeights.hop1")}</li>
                        <li>{t("getTrustScore.distanceWeights.hop2")}</li>
                        <li>{t("getTrustScore.distanceWeights.hop3")}</li>
                        <li>{t("getTrustScore.distanceWeights.hop4plus")}</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">{t("getTrustScore.pathBonuses.title")}</p>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                        <li>{t("getTrustScore.pathBonuses.hop2")}</li>
                        <li>{t("getTrustScore.pathBonuses.hop3")}</li>
                        <li>{t("getTrustScore.pathBonuses.hop4plus")}</li>
                        <li>{t("getTrustScore.pathBonuses.max")}</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-3">{t("getTrustScore.example")}</h3>
                <CodeBlock
                  language="javascript"
                  code={`const score = await window.nostr.wot.getTrustScore(pubkey);

if (score === null) {
  console.log("Not connected");
} else if (score >= 0.7) {
  console.log("Highly trusted");
} else if (score >= 0.3) {
  console.log("Somewhat trusted");
} else {
  console.log("Low trust score");
}`}
                />
              </section>

              <section id="ext-getdetails" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>{t("getDetails.title")}</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t("getDetails.description")}</p>
                <h3 className="text-lg font-semibold mb-3">{t("getDetails.parameters")}</h3>
                <ParamTable
                  rows={[{ name: "targetPubkey", type: "string", description: "Hex or npub format pubkey" }]}
                />
                <h3 className="text-lg font-semibold mb-3">{t("getDetails.returns")}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <InlineCode>Promise&lt;TrustDetails | null&gt;</InlineCode> - {t("getDetails.returnsDescription")}
                </p>
                <h3 className="text-lg font-semibold mb-3">{t("getDetails.example")}</h3>
                <CodeBlock
                  language="javascript"
                  code={`const details = await window.nostr.wot.getDetails(pubkey);

if (details) {
  console.log(\`Distance: \${details.distance} hops\`);
  console.log(\`Trust score: \${details.score}\`);
  console.log(\`Connection paths: \${details.paths}\`);
  console.log(\`Mutual follow: \${details.mutual}\`);
  console.log(\`Bridging nodes: \${details.bridgingNodes.join(", ")}\`);
}`}
                />
              </section>

              <section id="ext-getconfig" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>{t("getConfig.title")}</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t("getConfig.description")}</p>
                <h3 className="text-lg font-semibold mb-3">{t("getConfig.returns")}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <InlineCode>Promise&lt;WoTConfig&gt;</InlineCode> - {t("getConfig.returnsDescription")}
                </p>
                <h3 className="text-lg font-semibold mb-3">{t("getConfig.example")}</h3>
                <CodeBlock
                  language="javascript"
                  code={`const config = await window.nostr.wot.getConfig();

console.log(\`Mode: \${config.mode}\`); // "remote", "local", or "hybrid"
console.log(\`Max hops: \${config.maxHops}\`);
console.log(\`Timeout: \${config.timeout}ms\`);
console.log(\`Scoring config:\`, config.scoring);`}
                />
              </section>

              {/* Batch Operations */}
              <section id="ext-getdistancebatch" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>getDistanceBatch(targets)</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Get distances for multiple pubkeys in a single call.</p>
                <h3 className="text-lg font-semibold mb-3">Parameters</h3>
                <ParamTable
                  rows={[{ name: "targets", type: "string[]", description: "Array of hex pubkeys" }]}
                />
                <h3 className="text-lg font-semibold mb-3">Returns</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <InlineCode>Promise&lt;Record&lt;string, number | null&gt;&gt;</InlineCode> - Map of pubkey to hop count
                </p>
                <h3 className="text-lg font-semibold mb-3">Example</h3>
                <CodeBlock
                  language="javascript"
                  code={`const distances = await window.nostr.wot.getDistanceBatch([
  "pubkey1...",
  "pubkey2...",
  "pubkey3..."
]);

// { "pubkey1...": 1, "pubkey2...": 2, "pubkey3...": null }`}
                />
              </section>

              <section id="ext-gettrustscoreatch" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>getTrustScoreBatch(targets)</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Get trust scores for multiple pubkeys in a single call.</p>
                <h3 className="text-lg font-semibold mb-3">Parameters</h3>
                <ParamTable
                  rows={[{ name: "targets", type: "string[]", description: "Array of hex pubkeys" }]}
                />
                <h3 className="text-lg font-semibold mb-3">Returns</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <InlineCode>Promise&lt;Record&lt;string, number | null&gt;&gt;</InlineCode> - Map of pubkey to score (0-1)
                </p>
                <h3 className="text-lg font-semibold mb-3">Example</h3>
                <CodeBlock
                  language="javascript"
                  code={`const scores = await window.nostr.wot.getTrustScoreBatch([
  "pubkey1...",
  "pubkey2...",
  "pubkey3..."
]);

// { "pubkey1...": 0.95, "pubkey2...": 0.45, "pubkey3...": null }`}
                />
              </section>

              <section id="ext-filterbywot" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>filterByWoT(pubkeys, maxHops?)</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Filter a list of pubkeys to only those within the Web of Trust.</p>
                <h3 className="text-lg font-semibold mb-3">Parameters</h3>
                <ParamTable
                  hasDefault
                  rows={[
                    { name: "pubkeys", type: "string[]", default: "-", description: "Array of hex pubkeys" },
                    { name: "maxHops", type: "number", default: "3", description: "Override default max hops" },
                  ]}
                />
                <h3 className="text-lg font-semibold mb-3">Returns</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <InlineCode>Promise&lt;string[]&gt;</InlineCode> - Filtered array of pubkeys within WoT
                </p>
                <h3 className="text-lg font-semibold mb-3">Example</h3>
                <CodeBlock
                  language="javascript"
                  code={`// Filter to only trusted pubkeys
const allPubkeys = ["pk1...", "pk2...", "pk3...", "pk4..."];
const trusted = await window.nostr.wot.filterByWoT(allPubkeys);
// Returns only those within 3 hops

// Stricter filtering (2 hops)
const veryTrusted = await window.nostr.wot.filterByWoT(allPubkeys, 2);`}
                />
              </section>

              {/* User Info */}
              <section id="ext-getmypubkey" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>getMyPubkey()</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Returns the configured user&apos;s pubkey.</p>
                <h3 className="text-lg font-semibold mb-3">Returns</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <InlineCode>Promise&lt;string | null&gt;</InlineCode> - Hex pubkey or null if not configured
                </p>
                <h3 className="text-lg font-semibold mb-3">Example</h3>
                <CodeBlock
                  language="javascript"
                  code={`const myPubkey = await window.nostr.wot.getMyPubkey();

if (myPubkey) {
  console.log(\`Configured as: \${myPubkey}\`);
} else {
  console.log("Extension not configured");
}`}
                />
              </section>

              <section id="ext-isconfigured" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>isConfigured()</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Check if the extension is configured and ready.</p>
                <h3 className="text-lg font-semibold mb-3">Returns</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <InlineCode>Promise&lt;ConfigStatus&gt;</InlineCode>
                </p>
                <CodeBlock
                  language="typescript"
                  className="mb-6"
                  code={`interface ConfigStatus {
  configured: boolean;
  mode: 'remote' | 'local' | 'hybrid';
  hasLocalGraph: boolean;
}`}
                />
                <h3 className="text-lg font-semibold mb-3">Example</h3>
                <CodeBlock
                  language="javascript"
                  code={`const status = await window.nostr.wot.isConfigured();

if (status.configured) {
  console.log(\`Mode: \${status.mode}\`);
  console.log(\`Has local graph: \${status.hasLocalGraph}\`);
} else {
  console.log("Please configure the extension");
}`}
                />
              </section>

              {/* Graph Queries */}
              <section id="ext-getfollows" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>getFollows(pubkey?)</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Get the follow list for a pubkey.</p>
                <h3 className="text-lg font-semibold mb-3">Parameters</h3>
                <ParamTable
                  hasDefault
                  rows={[{ name: "pubkey", type: "string", default: "user's pubkey", description: "Hex pubkey (defaults to user's pubkey)" }]}
                />
                <h3 className="text-lg font-semibold mb-3">Returns</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <InlineCode>Promise&lt;string[]&gt;</InlineCode> - Array of followed pubkeys
                </p>
                <h3 className="text-lg font-semibold mb-3">Example</h3>
                <CodeBlock
                  language="javascript"
                  code={`// Get your own follows
const myFollows = await window.nostr.wot.getFollows();

// Get someone else's follows
const theirFollows = await window.nostr.wot.getFollows("pubkey...");

console.log(\`Following \${myFollows.length} accounts\`);`}
                />
              </section>

              <section id="ext-getcommonfollows" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>getCommonFollows(pubkey)</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Get mutual follows between the user and a target.</p>
                <h3 className="text-lg font-semibold mb-3">Parameters</h3>
                <ParamTable
                  rows={[{ name: "pubkey", type: "string", description: "Hex pubkey" }]}
                />
                <h3 className="text-lg font-semibold mb-3">Returns</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <InlineCode>Promise&lt;string[]&gt;</InlineCode> - Array of common followed pubkeys
                </p>
                <h3 className="text-lg font-semibold mb-3">Example</h3>
                <CodeBlock
                  language="javascript"
                  code={`const common = await window.nostr.wot.getCommonFollows("pubkey...");

console.log(\`You have \${common.length} follows in common\`);
console.log("Common follows:", common);`}
                />
              </section>

              <section id="ext-getstats" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>getStats()</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Get graph statistics.</p>
                <h3 className="text-lg font-semibold mb-3">Returns</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <InlineCode>Promise&lt;GraphStats&gt;</InlineCode>
                </p>
                <CodeBlock
                  language="typescript"
                  className="mb-6"
                  code={`interface GraphStats {
  nodes: number;              // Pubkeys with follow lists stored
  edges: number;              // Total follow relationships
  uniquePubkeys: number;      // Total unique pubkeys in graph
  lastSync: number | null;    // Unix timestamp (ms) of last sync
  nodesPerDepth: Record<number, number> | null;  // Nodes per hop depth
  syncDepth: number | null;   // Max depth used in last sync
  dbSizeBytes: number;        // Estimated database size
}`}
                />
                <h3 className="text-lg font-semibold mb-3">Example</h3>
                <CodeBlock
                  language="javascript"
                  code={`const stats = await window.nostr.wot.getStats();

console.log(\`Nodes: \${stats.nodes}\`);
console.log(\`Edges: \${stats.edges}\`);
console.log(\`Unique pubkeys: \${stats.uniquePubkeys}\`);
console.log(\`Last sync: \${new Date(stats.lastSync).toISOString()}\`);
console.log(\`Nodes per depth:\`, stats.nodesPerDepth);
// e.g., { "0": 1, "1": 487, "2": 14935 }
console.log(\`DB size: \${(stats.dbSizeBytes / 1024 / 1024).toFixed(2)} MB\`);`}
                />
              </section>

              <section id="ext-getpath" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>getPath(target)</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Get an actual path from the user to the target.</p>
                <h3 className="text-lg font-semibold mb-3">Parameters</h3>
                <ParamTable
                  rows={[{ name: "target", type: "string", description: "Hex pubkey" }]}
                />
                <h3 className="text-lg font-semibold mb-3">Returns</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <InlineCode>Promise&lt;string[] | null&gt;</InlineCode> - Array of pubkeys representing the path [user, ..., target], or null if not connected
                </p>
                <h3 className="text-lg font-semibold mb-3">Example</h3>
                <CodeBlock
                  language="javascript"
                  code={`const path = await window.nostr.wot.getPath("targetPubkey...");

if (path) {
  console.log(\`Path length: \${path.length - 1} hops\`);
  console.log("Path:", path);
  // ["myPubkey", "friend", "friendOfFriend", "targetPubkey"]
} else {
  console.log("No path found");
}`}
                />
              </section>

              {/* SDK Integration */}
              <section id="sdk-setup" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">{t("sdk.title")}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t("sdk.description")}</p>

                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8 font-mono text-sm">
                  <p className="text-center mb-2">Your Application</p>
                  <p className="text-center mb-2">↓</p>
                  <p className="text-center mb-2">nostr-wot-sdk</p>
                  <p className="text-center text-gray-500 dark:text-gray-400">↙ useExtension: true ↘</p>
                  <div className="flex justify-center gap-8 mt-2">
                    <span className="text-trust-green">Extension Found</span>
                    <span className="text-trust-yellow">Oracle Fallback</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-3">{t("sdk.install.title")}</h3>
                <TerminalBlock commands={["npm install nostr-wot-sdk"]} />

                <h3 className="text-lg font-semibold mb-3 mt-8">{t("sdk.options.title")}</h3>
                <ParamTable
                  hasDefault
                  rows={[
                    { name: "useExtension", type: "boolean", default: "false", description: "Enable extension detection. When true, SDK checks for window.nostr.wot" },
                    { name: "myPubkey", type: "string", default: "-", description: "Your hex pubkey. Required when useExtension: false" },
                    { name: "oracle", type: "string", default: "https://nostr-wot.com", description: "Oracle API base URL for fallback" },
                    { name: "maxHops", type: "number", default: "3", description: "Default maximum search depth" },
                    { name: "timeout", type: "number", default: "5000", description: "Request timeout in milliseconds" },
                    { name: "scoring", type: "Partial<ScoringConfig>", default: "See below", description: "Trust score weights" },
                    { name: "fallback", type: "WoTFallbackOptions", default: "-", description: "Config used when extension unavailable" },
                  ]}
                />

                <h3 className="text-lg font-semibold mb-3 mt-8">Example Configurations</h3>
                <CodeBlock
                  language="javascript"
                  className="mb-6"
                  code={`// Extension-first (recommended for browsers)
const wot = new WoT({
  useExtension: true,
  fallback: {
    oracle: 'https://nostr-wot.com',
    myPubkey: 'abc123...'
  }
});

// Oracle-only (for servers or when extension not needed)
const wot = new WoT({
  myPubkey: 'abc123...',
  oracle: 'https://nostr-wot.com'
});`}
                />
              </section>

              <section id="sdk-core" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">Core Methods</h2>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-3"><InlineCode>getDistance(target, options?)</InlineCode></h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Returns the shortest path length (number of hops) from your pubkey to the target.</p>
                    <ParamTable
                      hasDefault
                      rows={[
                        { name: "target", type: "string", default: "-", description: "Target pubkey (64-char hex)" },
                        { name: "options.maxHops", type: "number", default: "3", description: "Override default max hops" },
                        { name: "options.timeout", type: "number", default: "5000", description: "Override default timeout" },
                      ]}
                    />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Returns:</strong> <InlineCode>Promise&lt;number | null&gt;</InlineCode> - Hop count (1 = direct follow), or null if not reachable
                    </p>
                    <CodeBlock
                      language="javascript"
                      code={`const hops = await wot.getDistance('def456...');

if (hops === null) {
  console.log('Not connected');
} else if (hops === 1) {
  console.log('Direct follow');
} else {
  console.log(\`\${hops} hops away\`);
}`}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3"><InlineCode>isInMyWoT(target, options?)</InlineCode></h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Checks if a pubkey is within your Web of Trust (reachable within maxHops).</p>
                    <ParamTable
                      hasDefault
                      rows={[
                        { name: "target", type: "string", default: "-", description: "Target pubkey (64-char hex)" },
                        { name: "options.maxHops", type: "number", default: "3", description: "Override default max hops" },
                      ]}
                    />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Returns:</strong> <InlineCode>Promise&lt;boolean&gt;</InlineCode>
                    </p>
                    <CodeBlock
                      language="javascript"
                      code={`const trusted = await wot.isInMyWoT('def456...', { maxHops: 2 });

if (trusted) {
  console.log('Within 2 hops - trusted');
} else {
  console.log('Outside trust circle');
}`}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3"><InlineCode>getTrustScore(target, options?)</InlineCode></h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Returns a normalized trust score (0-1) based on distance, path count, and configured weights.</p>
                    <ParamTable
                      hasDefault
                      rows={[
                        { name: "target", type: "string", default: "-", description: "Target pubkey (64-char hex)" },
                        { name: "options.maxHops", type: "number", default: "3", description: "Override default max hops" },
                      ]}
                    />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Returns:</strong> <InlineCode>Promise&lt;number&gt;</InlineCode> - Score from 0 (not connected) to 1 (maximum trust)
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
                      <p className="font-mono text-sm mb-2">Formula: score = (1 / (hops + 1)) × distanceWeight × (1 + bonuses)</p>
                      <p className="font-mono text-sm text-gray-500">bonuses = mutualBonus (if mutual) + min(pathBonus × (paths - 1), maxPathBonus)</p>
                    </div>
                    <CodeBlock
                      language="javascript"
                      code={`const score = await wot.getTrustScore('def456...');

if (score >= 0.7) {
  console.log('Highly trusted');
} else if (score >= 0.3) {
  console.log('Moderately trusted');
} else if (score > 0) {
  console.log('Low trust');
} else {
  console.log('Not in network');
}`}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3"><InlineCode>getDistanceBetween(from, to, options?)</InlineCode></h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Returns the hop distance between any two pubkeys (not just from your pubkey).</p>
                    <ParamTable
                      hasDefault
                      rows={[
                        { name: "from", type: "string", default: "-", description: "Source pubkey (64-char hex)" },
                        { name: "to", type: "string", default: "-", description: "Target pubkey (64-char hex)" },
                        { name: "options.maxHops", type: "number", default: "3", description: "Override default max hops" },
                      ]}
                    />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Returns:</strong> <InlineCode>Promise&lt;number | null&gt;</InlineCode>
                    </p>
                    <CodeBlock
                      language="javascript"
                      code={`const hops = await wot.getDistanceBetween('alice...', 'bob...');
console.log(\`Alice and Bob are \${hops} hops apart\`);`}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3"><InlineCode>getDetails(target, options?)</InlineCode></h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Returns detailed connection information including hop count and number of distinct paths.</p>
                    <ParamTable
                      hasDefault
                      rows={[
                        { name: "target", type: "string", default: "-", description: "Target pubkey (64-char hex)" },
                        { name: "options.maxHops", type: "number", default: "3", description: "Override default max hops" },
                      ]}
                    />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Returns:</strong> <InlineCode>Promise&lt;DistanceResult | null&gt;</InlineCode>
                    </p>
                    <CodeBlock
                      language="typescript"
                      className="mb-4"
                      code={`interface DistanceResult {
  hops: number;          // Distance in hops
  paths: number;         // Number of distinct paths
  bridges?: string[];    // First-hop pubkeys (oracle only)
  mutual?: boolean;      // Mutual follow status (oracle only)
}`}
                    />
                    <CodeBlock
                      language="javascript"
                      code={`const details = await wot.getDetails('def456...');

if (details) {
  console.log(\`\${details.hops} hops via \${details.paths} paths\`);
  if (details.bridges) {
    console.log(\`Connected through: \${details.bridges.join(', ')}\`);
  }
}`}
                    />
                  </div>
                </div>
              </section>

              <section id="sdk-batch" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">Batch Operations</h2>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-3"><InlineCode>batchCheck(targets, options?)</InlineCode></h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Efficiently checks multiple pubkeys, returning distance, score, and WoT status for each.</p>
                    <ParamTable
                      hasDefault
                      rows={[
                        { name: "targets", type: "string[]", default: "-", description: "Array of pubkeys (64-char hex)" },
                        { name: "options.maxHops", type: "number", default: "3", description: "Override default max hops" },
                      ]}
                    />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Returns:</strong> <InlineCode>Promise&lt;Map&lt;string, BatchResult&gt;&gt;</InlineCode>
                    </p>
                    <CodeBlock
                      language="typescript"
                      className="mb-4"
                      code={`interface BatchResult {
  pubkey: string;
  distance: number | null;
  score: number;
  inWoT: boolean;
}`}
                    />
                    <CodeBlock
                      language="javascript"
                      code={`const results = await wot.batchCheck(['pk1...', 'pk2...', 'pk3...']);

for (const [pubkey, result] of results) {
  console.log(\`\${pubkey}: \${result.inWoT ? 'trusted' : 'unknown'} (score: \${result.score})\`);
}`}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3"><InlineCode>getDistanceBatch(targets)</InlineCode></h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get distances for multiple pubkeys in a single call.</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Returns:</strong> <InlineCode>Promise&lt;Record&lt;string, number | null&gt;&gt;</InlineCode>
                    </p>
                    <CodeBlock
                      language="javascript"
                      code={`const distances = await wot.getDistanceBatch(['pk1...', 'pk2...', 'pk3...']);
// { 'pk1...': 2, 'pk2...': null, 'pk3...': 1 }`}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3"><InlineCode>getTrustScoreBatch(targets)</InlineCode></h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get trust scores for multiple pubkeys in a single call.</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Returns:</strong> <InlineCode>Promise&lt;Record&lt;string, number | null&gt;&gt;</InlineCode>
                    </p>
                    <CodeBlock
                      language="javascript"
                      code={`const scores = await wot.getTrustScoreBatch(['pk1...', 'pk2...']);
// { 'pk1...': 0.72, 'pk2...': null }`}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3"><InlineCode>filterByWoT(pubkeys, options?)</InlineCode></h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Filters a list of pubkeys to only those within your Web of Trust.</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Returns:</strong> <InlineCode>Promise&lt;string[]&gt;</InlineCode> - Filtered array containing only WoT members
                    </p>
                    <CodeBlock
                      language="javascript"
                      code={`const allUsers = ['pk1...', 'pk2...', 'pk3...', 'pk4...'];
const trustedUsers = await wot.filterByWoT(allUsers, { maxHops: 2 });
// Only returns pubkeys within 2 hops`}
                    />
                  </div>
                </div>
              </section>

              <section id="sdk-graph" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">Graph Queries (Extension-Only)</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">These methods require the browser extension. They return empty arrays or null when the extension is unavailable.</p>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-3"><InlineCode>getFollows(pubkey?)</InlineCode></h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get the follow list for a pubkey. Defaults to your pubkey.</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Returns:</strong> <InlineCode>Promise&lt;string[]&gt;</InlineCode> - Array of followed pubkeys
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Fallback: Returns [] if extension unavailable</p>
                    <CodeBlock
                      language="javascript"
                      code={`// Get your follows
const myFollows = await wot.getFollows();

// Get someone else's follows
const theirFollows = await wot.getFollows('def456...');`}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3"><InlineCode>getCommonFollows(pubkey)</InlineCode></h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get mutual follows between you and a target (people you both follow).</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Returns:</strong> <InlineCode>Promise&lt;string[]&gt;</InlineCode> - Array of common followed pubkeys
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Fallback: Returns [] if extension unavailable</p>
                    <CodeBlock
                      language="javascript"
                      code={`const common = await wot.getCommonFollows('def456...');
console.log(\`You both follow \${common.length} people\`);`}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3"><InlineCode>getPath(target)</InlineCode></h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get an actual path from you to the target (the chain of follows).</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Returns:</strong> <InlineCode>Promise&lt;string[] | null&gt;</InlineCode> - Array of pubkeys [yourPubkey, ..., target], or null
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Fallback: Returns null if extension unavailable</p>
                    <CodeBlock
                      language="javascript"
                      code={`const path = await wot.getPath('def456...');

if (path) {
  console.log('Connection path:');
  path.forEach((pk, i) => {
    if (i === 0) console.log(\`  You (\${pk})\`);
    else if (i === path.length - 1) console.log(\`  → Target (\${pk})\`);
    else console.log(\`  → \${pk}\`);
  });
}`}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3"><InlineCode>getStats()</InlineCode></h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get graph statistics from the extension.</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Returns:</strong> <InlineCode>Promise&lt;GraphStats | null&gt;</InlineCode>
                    </p>
                    <CodeBlock
                      language="typescript"
                      className="mb-4"
                      code={`interface GraphStats {
  nodes: number;        // Number of pubkeys in graph
  edges: number;        // Number of follow relationships
  lastSync: number | null;  // Unix timestamp of last sync
  size: string;         // Human-readable size (e.g., "12 MB")
}`}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Fallback: Returns null if extension unavailable</p>
                    <CodeBlock
                      language="javascript"
                      code={`const stats = await wot.getStats();

if (stats) {
  console.log(\`Graph: \${stats.nodes} users, \${stats.edges} follows\`);
  console.log(\`Size: \${stats.size}\`);
}`}
                    />
                  </div>
                </div>
              </section>

              <section id="sdk-config" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">User &amp; Configuration</h2>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-3"><InlineCode>getMyPubkey()</InlineCode></h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get the current user&apos;s pubkey. Falls back through extension → NIP-07 → provided myPubkey option.</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Returns:</strong> <InlineCode>Promise&lt;string&gt;</InlineCode>
                    </p>
                    <CodeBlock
                      language="javascript"
                      code={`const myPubkey = await wot.getMyPubkey();
console.log(\`Your pubkey: \${myPubkey}\`);`}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3"><InlineCode>isUsingExtension()</InlineCode></h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Check if the SDK is using the browser extension.</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Returns:</strong> <InlineCode>Promise&lt;boolean&gt;</InlineCode>
                    </p>
                    <CodeBlock
                      language="javascript"
                      code={`if (await wot.isUsingExtension()) {
  console.log('Using local extension data (fast, offline)');
} else {
  console.log('Using oracle API (requires network)');
}`}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3"><InlineCode>isConfigured()</InlineCode></h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Check if the extension is configured and ready.</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Returns:</strong> <InlineCode>Promise&lt;ExtensionStatus | null&gt;</InlineCode>
                    </p>
                    <CodeBlock
                      language="typescript"
                      className="mb-4"
                      code={`interface ExtensionStatus {
  configured: boolean;     // Extension has been set up
  mode: 'remote' | 'local' | 'hybrid';  // Operating mode
  hasLocalGraph: boolean;  // Local graph data available
}`}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Fallback: Returns null if extension unavailable</p>
                    <CodeBlock
                      language="javascript"
                      code={`const status = await wot.isConfigured();

if (status?.configured) {
  console.log(\`Mode: \${status.mode}\`);
  console.log(\`Local graph: \${status.hasLocalGraph ? 'yes' : 'no'}\`);
}`}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3"><InlineCode>getExtensionConfig()</InlineCode></h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get the extension&apos;s current configuration.</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Returns:</strong> <InlineCode>Promise&lt;ExtensionConfig | null&gt;</InlineCode>
                    </p>
                    <CodeBlock
                      language="typescript"
                      className="mb-4"
                      code={`interface ExtensionConfig {
  maxHops: number;
  timeout: number;
  scoring: Partial<ScoringConfig>;
}`}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3"><InlineCode>getOracle()</InlineCode></h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get the configured oracle URL.</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Returns:</strong> <InlineCode>string</InlineCode>
                    </p>
                    <CodeBlock
                      language="javascript"
                      code={`const oracleUrl = wot.getOracle();
// 'https://nostr-wot.com'`}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3"><InlineCode>getScoringConfig()</InlineCode></h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get the current scoring configuration.</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Returns:</strong> <InlineCode>ScoringConfig</InlineCode>
                    </p>
                    <CodeBlock
                      language="typescript"
                      className="mb-4"
                      code={`interface ScoringConfig {
  distanceWeights: Record<number, number>;
  mutualBonus: number;
  pathBonus: number;
  maxPathBonus: number;
}`}
                    />
                    <CodeBlock
                      language="javascript"
                      code={`const scoring = wot.getScoringConfig();
console.log(\`Weight for 2 hops: \${scoring.distanceWeights[2]}\`);`}
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-3 mt-8">Default Scoring Configuration</h3>
                <CodeBlock
                  language="javascript"
                  code={`const DEFAULT_SCORING = {
  distanceWeights: {
    1: 1.0,    // Direct follow
    2: 0.5,    // 2 hops
    3: 0.25,   // 3 hops
    4: 0.1,    // 4+ hops
  },
  mutualBonus: 0.5,     // +50% if mutual follow
  pathBonus: 0.1,       // +10% per additional path
  maxPathBonus: 0.5,    // Cap at +50% from paths
};`}
                />

                <h3 className="text-lg font-semibold mb-3 mt-8">Custom Scoring</h3>
                <CodeBlock
                  language="javascript"
                  code={`const wot = new WoT({
  useExtension: true,
  scoring: {
    distanceWeights: {
      1: 1.0,
      2: 0.7,   // Higher trust for 2-hop
      3: 0.4,
    },
    mutualBonus: 0.3,
    pathBonus: 0.15,
    maxPathBonus: 0.6,
  }
});`}
                />
              </section>

              <section id="sdk-errors" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">Error Handling</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">The SDK throws typed errors for different failure scenarios:</p>

                <CodeBlock
                  language="javascript"
                  className="mb-6"
                  code={`import {
  WoT,
  WoTError,        // Base error class
  NetworkError,    // Network/HTTP failures
  NotFoundError,   // Pubkey not in graph
  TimeoutError,    // Request timeout
  ValidationError  // Invalid parameters
} from 'nostr-wot-sdk';

try {
  const hops = await wot.getDistance('invalid');
} catch (e) {
  if (e instanceof ValidationError) {
    console.log(\`Invalid input: \${e.message} (field: \${e.field})\`);
  } else if (e instanceof NetworkError) {
    console.log(\`Network error: \${e.message} (status: \${e.statusCode})\`);
  } else if (e instanceof TimeoutError) {
    console.log(\`Timeout after \${e.timeout}ms\`);
  } else if (e instanceof NotFoundError) {
    console.log(\`Pubkey not found: \${e.pubkey}\`);
  }
}`}
                />

                <h3 className="text-lg font-semibold mb-3">Method Availability</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="text-left p-3 font-semibold">Method</th>
                        <th className="text-left p-3 font-semibold">Extension</th>
                        <th className="text-left p-3 font-semibold">Oracle Fallback</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700">getDistance</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes</td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700">isInMyWoT</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes</td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700">getTrustScore</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes</td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700">getDistanceBetween</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes</td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700">getDetails</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes (+ bridges, mutual)</td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700">batchCheck</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes</td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700">filterByWoT</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes (via batchCheck)</td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700">getFollows</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-red">Returns []</td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700">getCommonFollows</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-red">Returns []</td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700">getPath</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-red">Returns null</td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700">getStats</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-red">Returns null</td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700">isConfigured</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-red">Returns null</td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700">getExtensionConfig</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-red">Returns null</td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700">getMyPubkey</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-trust-green">From options</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-4 mt-8">
                  <a href="https://www.npmjs.com/package/nostr-wot-sdk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
                    {t("sdk.links.npm")} →
                  </a>
                  <a href="https://github.com/nostr-wot/nostr-wot-sdk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
                    {t("sdk.links.github")} →
                  </a>
                </div>
              </section>

              <section id="sdk-react" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">{t("sdk.react.title")}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t("sdk.react.description")}</p>
                <CodeBlock
                  language="tsx"
                  className="mb-6"
                  code={`import { useWoT, WoTProvider } from 'nostr-wot-sdk/react';

// Wrap your app with the provider
function App() {
  return (
    <WoTProvider options={{ useExtension: true }}>
      <Profile />
    </WoTProvider>
  );
}

// Use the hook in components
function Profile({ pubkey }) {
  const { getDistance, getTrustScore, isLoading } = useWoT();
  const [trust, setTrust] = useState(null);

  useEffect(() => {
    async function checkTrust() {
      const score = await getTrustScore(pubkey);
      setTrust(score);
    }
    checkTrust();
  }, [pubkey]);

  if (isLoading) return <span>Loading...</span>;

  return (
    <div>
      Trust Score: {trust !== null ? trust.toFixed(2) : 'Not connected'}
    </div>
  );
}`}
                />
              </section>

              <section id="public-servers" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">Public Servers</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  We provide public infrastructure for the Nostr Web of Trust ecosystem. These servers are free to use for development and moderate production workloads.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">O</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">WoT Oracle</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">REST API for trust queries</p>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3 mb-3">
                      <code className="text-sm text-gray-100">https://wot-oracle.mappingbitcoin.com</code>
                    </div>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Distance &amp; path queries</li>
                      <li>• Batch operations (up to 100 targets)</li>
                      <li>• Graph statistics</li>
                      <li>• Rate limit: 100 req/min</li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">R</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">Nostr Relay</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">WebSocket relay for Nostr events</p>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3 mb-3">
                      <code className="text-sm text-gray-100">wss://relay.mappingbitcoin.com</code>
                    </div>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Standard Nostr relay (NIP-01)</li>
                      <li>• Used by WoT Oracle for sync</li>
                      <li>• Open for public use</li>
                      <li>• Optimized for follow lists</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Self-hosting:</strong> For higher rate limits or private deployments, you can run your own WoT Oracle instance.
                    See the <Link href="/oracle" className="text-primary hover:underline">Oracle Guide</Link> for setup instructions.
                  </p>
                </div>
              </section>

              <section id="oracle-health" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>{t("oracleHealth.title")}</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t("oracleHealth.description")}</p>
                <h3 className="text-lg font-semibold mb-3">{t("oracleHealth.response")}</h3>
                <CodeBlock
                  language="json"
                  code={`{
  "status": "healthy",
  "version": "0.2.0"
}`}
                />
              </section>

              <section id="oracle-stats" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>{t("oracleStats.title")}</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t("oracleStats.description")}</p>
                <h3 className="text-lg font-semibold mb-3">{t("oracleStats.response")}</h3>
                <CodeBlock
                  language="json"
                  code={`{
  "node_count": 150000,
  "edge_count": 2500000,
  "nodes_with_follows": 120000,
  "cache": {
    "size": 5432,
    "hits": 12345,
    "misses": 678
  },
  "locks": {
    "read_count": 100000,
    "write_count": 5000,
    "read_wait_ns": 123456,
    "write_wait_ns": 78901
  }
}`}
                />
              </section>

              <section id="oracle-follows" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>GET /follows</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Get the follow list for a pubkey.</p>
                <h3 className="text-lg font-semibold mb-3">Query Parameters</h3>
                <ParamTable
                  hasRequired
                  rows={[
                    { name: "pubkey", type: "string", required: "Yes", description: "64-char hex pubkey" },
                  ]}
                />
                <h3 className="text-lg font-semibold mb-3">Response</h3>
                <CodeBlock
                  language="json"
                  code={`{
  "pubkey": "82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2",
  "follows": [
    "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d",
    "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"
  ]
}`}
                />
              </section>

              <section id="oracle-common-follows" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>GET /common-follows</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Get common follows between two pubkeys.</p>
                <h3 className="text-lg font-semibold mb-3">Query Parameters</h3>
                <ParamTable
                  hasRequired
                  rows={[
                    { name: "from", type: "string", required: "Yes", description: "64-char hex pubkey" },
                    { name: "to", type: "string", required: "Yes", description: "64-char hex pubkey" },
                  ]}
                />
                <h3 className="text-lg font-semibold mb-3">Response</h3>
                <CodeBlock
                  language="json"
                  code={`{
  "from": "82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2",
  "to": "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d",
  "common_follows": [
    "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"
  ]
}`}
                />
              </section>

              <section id="oracle-path" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>GET /path</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Get an actual path between two pubkeys.</p>
                <h3 className="text-lg font-semibold mb-3">Query Parameters</h3>
                <ParamTable
                  hasRequired
                  hasDefault
                  rows={[
                    { name: "from", type: "string", required: "Yes", default: "-", description: "64-char hex pubkey" },
                    { name: "to", type: "string", required: "Yes", default: "-", description: "64-char hex pubkey" },
                    { name: "max_hops", type: "int", required: "No", default: "5", description: "Max hops (1-10)" },
                  ]}
                />
                <h3 className="text-lg font-semibold mb-3">Response</h3>
                <CodeBlock
                  language="json"
                  className="mb-4"
                  code={`{
  "from": "82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2",
  "to": "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d",
  "path": ["fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"]
}`}
                />
                <h3 className="text-lg font-semibold mb-3">Path Values</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="text-left p-3 font-semibold">Scenario</th>
                        <th className="text-left p-3 font-semibold">path</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700">Direct follow (from → to)</td><td className="p-3 border-t border-gray-200 dark:border-gray-700"><InlineCode>[]</InlineCode></td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700">One intermediate (from → A → to)</td><td className="p-3 border-t border-gray-200 dark:border-gray-700"><InlineCode>[&quot;A&quot;]</InlineCode></td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700">Two intermediate (from → A → B → to)</td><td className="p-3 border-t border-gray-200 dark:border-gray-700"><InlineCode>[&quot;A&quot;, &quot;B&quot;]</InlineCode></td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700">Same pubkey</td><td className="p-3 border-t border-gray-200 dark:border-gray-700"><InlineCode>[]</InlineCode></td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700">Not reachable</td><td className="p-3 border-t border-gray-200 dark:border-gray-700"><InlineCode>null</InlineCode></td></tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section id="oracle-distance" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>{t("oracleDistance.title")}</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t("oracleDistance.description")}</p>
                <h3 className="text-lg font-semibold mb-3">{t("oracleDistance.queryParameters")}</h3>
                <ParamTable
                  hasRequired
                  hasDefault
                  rows={[
                    { name: "from", type: "string", required: "Yes", default: "-", description: "64-char hex pubkey" },
                    { name: "to", type: "string", required: "Yes", default: "-", description: "64-char hex pubkey" },
                    { name: "max_hops", type: "int", required: "No", default: "5", description: "Max hops (1-10)" },
                    { name: "include_bridges", type: "bool", required: "No", default: "false", description: "Include bridge nodes" },
                    { name: "bypass_cache", type: "bool", required: "No", default: "false", description: "Skip cache" },
                  ]}
                />
                <h3 className="text-lg font-semibold mb-3">Response</h3>
                <CodeBlock
                  language="json"
                  className="mb-4"
                  code={`{
  "from": "82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2",
  "to": "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d",
  "hops": 2,
  "path_count": 3,
  "mutual_follow": false,
  "bridges": ["fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"]
}`}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Note: <InlineCode>hops</InlineCode> is <InlineCode>null</InlineCode> if not reachable. <InlineCode>bridges</InlineCode> only present if <InlineCode>include_bridges=true</InlineCode>.
                </p>
                <h3 className="text-lg font-semibold mb-3">Example</h3>
                <TerminalBlock
                  commands={[
                    'curl "https://wot-oracle.mappingbitcoin.com/distance?from=82341f...&to=3bf0c6...&include_bridges=true"'
                  ]}
                />
              </section>

              <section id="oracle-batch" className="mb-16">
                <h2 className="text-2xl font-bold mb-4"><InlineCode>{t("oracleBatch.title")}</InlineCode></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t("oracleBatch.description")}</p>
                <h3 className="text-lg font-semibold mb-3">{t("oracleBatch.requestBody")}</h3>
                <CodeBlock
                  language="json"
                  className="mb-6"
                  code={`{
  "from": "82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2",
  "targets": [
    "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d",
    "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"
  ],
  "max_hops": 5,
  "include_bridges": false,
  "bypass_cache": false
}`}
                />
                <h3 className="text-lg font-semibold mb-3">Response</h3>
                <CodeBlock
                  language="json"
                  className="mb-4"
                  code={`{
  "from": "82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2",
  "results": [
    {
      "from": "82341f...",
      "to": "3bf0c6...",
      "hops": 2,
      "path_count": 1,
      "mutual_follow": false
    },
    {
      "from": "82341f...",
      "to": "fa984b...",
      "hops": 1,
      "path_count": 1,
      "mutual_follow": true
    }
  ]
}`}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Limit: Max 100 targets per request.
                </p>
                <h3 className="text-lg font-semibold mb-3">Example</h3>
                <TerminalBlock
                  commands={[
                    'curl -X POST "https://wot-oracle.mappingbitcoin.com/distance/batch" \\',
                    '  -H "Content-Type: application/json" \\',
                    '  -d \'{"from": "82341f...", "targets": ["3bf0c6...", "fa984b..."]}\''
                  ]}
                />
              </section>

              <section id="oracle-errors" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">Error Handling</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">All endpoints return errors in a consistent format:</p>
                <CodeBlock
                  language="json"
                  className="mb-6"
                  code={`{
  "error": "Invalid pubkey length: expected 64, got 32",
  "code": "INVALID_PUBKEY_LENGTH"
}`}
                />

                <h3 className="text-lg font-semibold mb-3">Error Codes</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="text-left p-3 font-semibold">Code</th>
                        <th className="text-left p-3 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><InlineCode>INVALID_PUBKEY_LENGTH</InlineCode></td><td className="p-3 border-t border-gray-200 dark:border-gray-700">Pubkey must be 64 characters</td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><InlineCode>INVALID_PUBKEY_FORMAT</InlineCode></td><td className="p-3 border-t border-gray-200 dark:border-gray-700">Pubkey must be hexadecimal</td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><InlineCode>INVALID_MAX_HOPS</InlineCode></td><td className="p-3 border-t border-gray-200 dark:border-gray-700">max_hops must be 1-10</td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><InlineCode>TOO_MANY_TARGETS</InlineCode></td><td className="p-3 border-t border-gray-200 dark:border-gray-700">Max 100 targets in batch</td></tr>
                      <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><InlineCode>INTERNAL_ERROR</InlineCode></td><td className="p-3 border-t border-gray-200 dark:border-gray-700">Server error</td></tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-semibold mb-3">HTTP Status Codes</h3>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                  <li><strong>200</strong> - Success</li>
                  <li><strong>400</strong> - Validation errors (invalid pubkey, parameters)</li>
                  <li><strong>429</strong> - Rate limited</li>
                  <li><strong>500</strong> - Internal server error</li>
                </ul>
              </section>

              <section className="mb-16">
                <h2 className="text-2xl font-bold mb-4">{t("rateLimits.title")}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t("rateLimits.description")}{" "}
                  <InlineCode>{t("rateLimits.url")}</InlineCode> {t("rateLimits.hasLimits")}
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                  <li>{t("rateLimits.limits.requestsPerMinute")}</li>
                  <li>{t("rateLimits.limits.batchCount")}</li>
                  <li>{t("rateLimits.limits.headers")} <InlineCode>X-RateLimit-Remaining</InlineCode>, <InlineCode>X-RateLimit-Reset</InlineCode></li>
                </ul>
                <p className="text-gray-600 dark:text-gray-400">
                  {t("rateLimits.selfHost")} <Link href="/oracle" className="text-primary hover:underline">{t("rateLimits.selfHostLink")}</Link>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
      </main>
    </>
  );
}
