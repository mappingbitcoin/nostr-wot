"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui";
import { GraphPlayground } from "@/components/playground";
import { useWoTContext, useExtension } from "nostr-wot-sdk/react";

export default function PlaygroundContent() {
  const t = useTranslations("playground");
  const { wot, isReady } = useWoTContext();
  const extension = useExtension();

  const formatPubkey = (pk: string) => {
    return `${pk.slice(0, 8)}...${pk.slice(-8)}`;
  };

  // Show loading while extension initializes
  if (!extension.isChecked) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Connecting to WoT extension...
          </p>
        </div>
      </main>
    );
  }

  // Show message if extension not installed
  if (!extension.isInstalled) {
    return (
      <main className="min-h-screen">
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge className="mb-4">{t("hero.badge")}</Badge>
            <h1 className="text-4xl font-bold mb-4">{t("hero.title")}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              {t("hero.subtitle")}
            </p>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                WoT Extension Required
              </h2>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                To use the playground, please install the Web of Trust browser extension.
              </p>
              <a
                href="/download"
                className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Download Extension
              </a>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Show connecting state
  if (extension.isConnecting) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Connecting to extension...
          </p>
        </div>
      </main>
    );
  }

  // Show error if connection failed
  if (extension.error) {
    return (
      <main className="min-h-screen">
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Connection Error
              </h2>
              <p className="text-red-700 dark:text-red-300 mb-4">
                {extension.error}
              </p>
              <button
                onClick={() => extension.connect()}
                className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Get pubkey from WoT instance
  const userPubkey = wot ? null : null; // Will be populated by useGraphData

  // Show graph when extension is connected
  return (
    <main className="min-h-screen">
      <div className="py-4 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge>{t("hero.badge")}</Badge>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("hero.title")}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-trust-green rounded-full animate-pulse" />
              <span className="text-gray-400">Extension Connected</span>
            </div>
          </div>
        </div>

        {/* Graph visualization */}
        <div className="max-w-7xl mx-auto">
          <GraphPlayground />
        </div>
      </div>
    </main>
  );
}
