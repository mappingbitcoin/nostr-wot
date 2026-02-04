"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { GraphNode, NodeProfile } from "@/lib/graph/types";
import { formatPubkey } from "@/lib/graph/transformers";

interface ProfileHeaderProps {
  node: GraphNode;
  profile?: NodeProfile;
  followingCount?: number | null;
  isLoadingProfile?: boolean;
  isLoadingFollowing?: boolean;
}

/**
 * Profile header with avatar, name, NIP-05, and external links
 * Shows loading states progressively
 */
export default function ProfileHeader({
  node,
  profile,
  followingCount,
  isLoadingProfile,
  isLoadingFollowing,
}: ProfileHeaderProps) {
  const t = useTranslations("playground");
  const [copied, setCopied] = useState(false);

  const handleCopyPubkey = async () => {
    try {
      await navigator.clipboard.writeText(node.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard errors
    }
  };

  const displayName = useMemo(
    () =>
      profile?.displayName || profile?.name || node.label || "Unknown",
    [profile, node.label]
  );

  const avatarUrl = node.picture || profile?.picture;

  return (
    <div className="p-6 border-b border-gray-700">
      <div className="flex items-start gap-4">
        {/* Large avatar */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-20 h-20 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-700"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 ring-2 ring-gray-600">
            <span className="text-3xl text-gray-400">
              {displayName[0].toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Display name */}
          <h2 className="text-xl font-semibold text-white truncate">
            {displayName}
          </h2>

          {/* Username if different from display name */}
          {profile?.name && profile.name !== profile.displayName && (
            <p className="text-sm text-gray-400 truncate">@{profile.name}</p>
          )}

          {/* NIP-05 with verification badge */}
          {profile?.nip05 && (
            <div className="flex items-center gap-1 mt-1">
              <svg
                className="w-4 h-4 text-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-primary truncate">
                {profile.nip05}
              </span>
            </div>
          )}

          {/* Pubkey with copy button */}
          <button
            onClick={handleCopyPubkey}
            className="flex items-center gap-1.5 text-xs text-gray-500 font-mono hover:text-gray-300 transition-colors mt-2 group"
            title={t("graph.copyPubkey")}
          >
            <span>{formatPubkey(node.id)}</span>
            {copied ? (
              <svg
                className="w-3.5 h-3.5 text-trust-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Following count and external links */}
      <div className="flex items-center gap-4 mt-4">
        {/* Following count with loading state */}
        {isLoadingFollowing ? (
          <div className="text-sm flex items-center gap-2">
            <div className="w-8 h-4 bg-gray-700 rounded animate-pulse" />
            <span className="text-gray-400">{t("graph.following")}</span>
          </div>
        ) : followingCount !== undefined && followingCount !== null && followingCount > 0 ? (
          <div className="text-sm">
            <span className="font-semibold text-white">{followingCount.toLocaleString()}</span>
            <span className="text-gray-400 ml-1">{t("graph.following")}</span>
          </div>
        ) : null}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Links */}
        <div className="flex items-center gap-2">
          {/* Full profile page - opens in new tab */}
          <Link
            href={`/profile/${node.id}`}
            target="_blank"
            className="px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary/80 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            {t("graph.viewFullProfile")}
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
