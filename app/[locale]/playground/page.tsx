import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PlaygroundContent from "./PlaygroundContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("playground.meta");

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

export default async function PlaygroundPage() {
  const t = await getTranslations("playground.meta");

  // JSON-LD structured data for the playground page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": t("title"),
    "description": t("description"),
    "url": "https://nostr-wot.com/playground",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Test Web of Trust API in real-time",
      "Query trust distances between Nostr users",
      "Explore social graph connections",
      "Interactive API playground",
    ],
    "provider": {
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
      <PlaygroundContent />
    </>
  );
}
