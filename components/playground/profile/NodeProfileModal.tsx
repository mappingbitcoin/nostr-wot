"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { GraphNode, NodeProfile } from "@/lib/graph/types";
import { useProfileNotes } from "@/hooks/useProfileNotes";
import { useProfileData } from "@/hooks/useProfileData";
import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import ProfileNotes from "./ProfileNotes";

interface NodeProfileModalProps {
  isOpen: boolean;
  node: GraphNode | null;
  profile?: NodeProfile; // Fallback from cache
  onClose: () => void;
  onExpand?: () => void;
}

/**
 * Full-screen modal for displaying extended user profile and notes
 * Fetches all data progressively for fast display
 */
export default function NodeProfileModal({
  isOpen,
  node,
  profile: cachedProfile,
  onClose,
  onExpand,
}: NodeProfileModalProps) {
  const t = useTranslations("playground");

  // Profile and following count - fetched progressively
  const {
    profile: fetchedProfile,
    followingCount,
    isLoadingProfile,
    isLoadingFollowing,
    fetchProfile,
    reset: resetProfile,
  } = useProfileData();

  // Notes - fetched progressively
  const {
    notes,
    isLoading: isLoadingNotes,
    hasMore,
    fetchNotes,
    loadMore,
    reset: resetNotes,
  } = useProfileNotes();

  // Use fetched profile, fallback to cached
  const profile = fetchedProfile || cachedProfile;

  // Fetch all data when modal opens
  useEffect(() => {
    if (isOpen && node) {
      fetchProfile(node.id);
      fetchNotes(node.id);
    } else {
      resetProfile();
      resetNotes();
    }
  }, [isOpen, node, fetchProfile, fetchNotes, resetProfile, resetNotes]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Handle load more
  const handleLoadMore = useCallback(() => {
    loadMore();
  }, [loadMore]);

  if (!isOpen || !node) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal content */}
        <motion.div
          className="relative bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with close button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">
              {t("graph.viewProfile")}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Profile header */}
            <ProfileHeader
              node={node}
              profile={profile}
              followingCount={followingCount}
              isLoadingProfile={isLoadingProfile}
              isLoadingFollowing={isLoadingFollowing}
            />

            {/* About section */}
            {profile?.about && (
              <div className="p-6 border-b border-gray-700">
                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                  {profile.about}
                </p>
              </div>
            )}

            {/* Stats section */}
            <ProfileStats node={node} onExpand={onExpand} />

            {/* Notes section */}
            <ProfileNotes
              notes={notes}
              isLoading={isLoadingNotes}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
