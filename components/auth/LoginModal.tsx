"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  KeyIcon,
  BunkerIcon,
  QRCodeIcon,
  LinkIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  UserAddIcon,
  ExternalLinkIcon,
  CloseIcon,
  WotExtensionMiniIcon,
} from "@/components/icons";
import { useNostrAuth } from "@/contexts/NostrAuthContext";
import {
  createNostrConnectSession,
  generateNostrConnectURI,
  startNostrConnect,
  type NostrConnectSession,
} from "@/lib/nostr/connect";

// ============================================================================
// Types
// ============================================================================

type LoginMethod = "extension" | "key" | "bunker" | null;
type BunkerMode = "qr" | "url";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MethodCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Loading spinner for buttons
 */
function LoadingSpinner() {
  return (
    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Card button for selecting a login method
 */
function MethodCard({ icon: Icon, title, description, onClick }: MethodCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all group text-left"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {description}
        </div>
      </div>
      <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
    </button>
  );
}

/**
 * Divider with "or" text
 */
function OrDivider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
        {text}
      </span>
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

/**
 * Create account button with distinct styling
 */
function CreateAccountButton({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-300/50 dark:border-purple-700/50 hover:border-purple-400 hover:from-purple-500/20 hover:to-pink-500/20 transition-all group text-left"
    >
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <UserAddIcon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-purple-700 dark:text-purple-300">
          {title}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </div>
      </div>
      <ExternalLinkIcon className="w-5 h-5 text-purple-400 group-hover:text-purple-500 transition-colors" />
    </button>
  );
}

/**
 * Primary action button (used for login actions)
 */
function PrimaryButton({
  onClick,
  disabled,
  isLoading,
  loadingText,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <LoadingSpinner />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Warning/info box
 */
function WarningBox({
  title,
  children,
  variant = "warning",
}: {
  title?: string;
  children: React.ReactNode;
  variant?: "warning" | "info";
}) {
  const colors =
    variant === "warning"
      ? "bg-trust-yellow/10 text-trust-yellow border-trust-yellow/20"
      : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";

  return (
    <div className={`${colors} border rounded-lg p-3 text-sm`}>
      {title && <p className="font-semibold mb-1">{title}</p>}
      <div className={title ? "opacity-80" : ""}>{children}</div>
    </div>
  );
}

// ============================================================================
// Method-Specific Views
// ============================================================================

/**
 * Method selection view - shows all available login options
 */
function MethodSelectionView({
  onSelectMethod,
  onCreateAccount,
  t,
}: {
  onSelectMethod: (method: LoginMethod) => void;
  onCreateAccount: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const loginMethods = [
    {
      id: "extension" as const,
      icon: WotExtensionMiniIcon,
      title: t("login.methods.extension.title"),
      description: t("login.methods.extension.description"),
    },
    {
      id: "key" as const,
      icon: KeyIcon,
      title: t("login.methods.key.title"),
      description: t("login.methods.key.description"),
    },
    {
      id: "bunker" as const,
      icon: BunkerIcon,
      title: t("login.methods.bunker.title"),
      description: t("login.methods.bunker.description"),
    },
  ];

  return (
    <motion.div
      key="methods"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      {/* Explanation */}
      <div className="text-center pb-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("login.subtitle")}
        </p>
      </div>

      {/* Login Methods */}
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {t("login.chooseMethod")}
      </p>

      {loginMethods.map((method) => (
        <MethodCard
          key={method.id}
          icon={method.icon}
          title={method.title}
          description={method.description}
          onClick={() => onSelectMethod(method.id)}
        />
      ))}

      {/* Or Divider */}
      <OrDivider text={t("login.or")} />

      {/* Create Account */}
      <CreateAccountButton
        title={t("login.createAccount.title")}
        description={t("login.createAccount.description")}
        onClick={onCreateAccount}
      />
    </motion.div>
  );
}

/**
 * Extension login view
 */
function ExtensionLoginView({
  hasExtension,
  isLoading,
  onLogin,
  t,
}: {
  hasExtension: boolean | null;
  isLoading: boolean;
  onLogin: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <motion.div
      key="extension"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* No extension warning */}
      {hasExtension === false && (
        <WarningBox title={t("login.noExtensionTitle")}>
          {t("login.noExtensionHelp")}
        </WarningBox>
      )}

      {/* Icon and description */}
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <WotExtensionMiniIcon className="w-8 h-8 text-primary" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {t("login.methods.extension.help")}
        </p>
      </div>

      {/* Connect button */}
      <PrimaryButton
        onClick={onLogin}
        disabled={isLoading}
        isLoading={isLoading}
        loadingText={t("login.connecting")}
      >
        {t("login.connectButton")}
      </PrimaryButton>

      {/* NIP-07 notice */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {t("login.nip07Notice")}
      </p>
    </motion.div>
  );
}

/**
 * Key login view (nsec/npub)
 */
function KeyLoginView({
  keyInput,
  setKeyInput,
  isLoading,
  onLogin,
  t,
}: {
  keyInput: string;
  setKeyInput: (value: string) => void;
  isLoading: boolean;
  onLogin: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <motion.div
      key="key"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Input field */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t("login.methods.key.inputLabel")}
        </label>
        <input
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="nsec1... or npub1..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          autoFocus
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {t("login.methods.key.inputHelp")}
        </p>
      </div>

      {/* Login button */}
      <PrimaryButton
        onClick={onLogin}
        disabled={isLoading || !keyInput.trim()}
        isLoading={isLoading}
        loadingText={t("login.connecting")}
      >
        {t("login.methods.key.submitButton")}
      </PrimaryButton>

      {/* Security warning */}
      <WarningBox>
        <strong>{t("login.methods.key.securityTitle")}:</strong>{" "}
        {t("login.methods.key.securityNote")}
      </WarningBox>
    </motion.div>
  );
}

/**
 * Bunker login view with QR and URL modes
 */
function BunkerLoginView({
  bunkerMode,
  setBunkerMode,
  bunkerInput,
  setBunkerInput,
  nostrConnectUrl,
  isLoading,
  isWaitingForConnection,
  onLogin,
  t,
}: {
  bunkerMode: BunkerMode;
  setBunkerMode: (mode: BunkerMode) => void;
  bunkerInput: string;
  setBunkerInput: (value: string) => void;
  nostrConnectUrl: string;
  isLoading: boolean;
  isWaitingForConnection: boolean;
  onLogin: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <motion.div
      key="bunker"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Mode Toggle */}
      <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
        <button
          onClick={() => setBunkerMode("qr")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            bunkerMode === "qr"
              ? "bg-white dark:bg-gray-600 shadow-sm"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          <QRCodeIcon className="w-4 h-4" />
          {t("login.methods.bunker.scanQR")}
        </button>
        <button
          onClick={() => setBunkerMode("url")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            bunkerMode === "url"
              ? "bg-white dark:bg-gray-600 shadow-sm"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          {t("login.methods.bunker.pasteURL")}
        </button>
      </div>

      {/* Mode-specific content */}
      <AnimatePresence mode="wait">
        {bunkerMode === "qr" ? (
          <BunkerQRView
            nostrConnectUrl={nostrConnectUrl}
            isWaitingForConnection={isWaitingForConnection}
            t={t}
          />
        ) : (
          <BunkerURLView
            bunkerInput={bunkerInput}
            setBunkerInput={setBunkerInput}
            isLoading={isLoading}
            onLogin={onLogin}
            t={t}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * QR code view for bunker login
 */
function BunkerQRView({
  nostrConnectUrl,
  isWaitingForConnection,
  t,
}: {
  nostrConnectUrl: string;
  isWaitingForConnection: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(nostrConnectUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Log the URL for debugging
  console.log("[LoginModal] NostrConnect URL:", nostrConnectUrl);

  return (
    <motion.div
      key="qr"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center py-4"
    >
      {/* QR Code */}
      <div className="bg-white p-4 rounded-xl shadow-inner">
        {nostrConnectUrl ? (
          <QRCodeSVG value={nostrConnectUrl} size={180} level="M" />
        ) : (
          <div className="w-[180px] h-[180px] flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
      </div>

      {/* Status indicator */}
      {isWaitingForConnection && (
        <div className="flex items-center gap-2 mt-3 text-primary">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-medium">{t("login.methods.bunker.waiting")}</span>
        </div>
      )}

      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">
        {t("login.methods.bunker.scanHelp")}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        {t("login.methods.bunker.compatibleApps")}
      </p>

      {/* Copy URL button for debugging/manual use */}
      <button
        onClick={handleCopyUrl}
        className="mt-3 text-xs text-primary hover:underline flex items-center gap-1"
      >
        {copied ? t("login.methods.bunker.copied") : t("login.methods.bunker.copyUrl")}
      </button>
    </motion.div>
  );
}

/**
 * URL input view for bunker login
 */
function BunkerURLView({
  bunkerInput,
  setBunkerInput,
  isLoading,
  onLogin,
  t,
}: {
  bunkerInput: string;
  setBunkerInput: (value: string) => void;
  isLoading: boolean;
  onLogin: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <motion.div
      key="url"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium mb-2">
          {t("login.methods.bunker.urlLabel")}
        </label>
        <input
          type="text"
          value={bunkerInput}
          onChange={(e) => setBunkerInput(e.target.value)}
          placeholder="bunker://..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          autoFocus
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {t("login.methods.bunker.urlHelp")}
        </p>
      </div>

      <PrimaryButton
        onClick={onLogin}
        disabled={isLoading || !bunkerInput.trim()}
        isLoading={isLoading}
        loadingText={t("login.connecting")}
      >
        {t("login.methods.bunker.submitButton")}
      </PrimaryButton>
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const t = useTranslations("playground");
  const {
    isLoading,
    error,
    loginWithExtension,
    loginWithKey,
    loginWithBunker,
    loginWithRemoteSigner,
    clearError,
  } = useNostrAuth();

  // Local state
  const [selectedMethod, setSelectedMethod] = useState<LoginMethod>(null);
  const [hasExtension, setHasExtension] = useState<boolean | null>(null);
  const [bunkerMode, setBunkerMode] = useState<BunkerMode>("qr");
  const [keyInput, setKeyInput] = useState("");
  const [bunkerInput, setBunkerInput] = useState("");

  // Nostr Connect state
  const [nostrConnectSession, setNostrConnectSession] = useState<NostrConnectSession | null>(null);
  const [nostrConnectUrl, setNostrConnectUrl] = useState("");
  const [isWaitingForConnection, setIsWaitingForConnection] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Create Nostr Connect session when bunker method is selected and QR mode is active
  useEffect(() => {
    if (selectedMethod === "bunker" && bunkerMode === "qr" && isOpen) {
      // Create a new session
      const session = createNostrConnectSession();
      setNostrConnectSession(session);

      // Generate the URI for the QR code
      const uri = generateNostrConnectURI(session, "WoT Playground");
      setNostrConnectUrl(uri);

      // Start listening for connection
      setIsWaitingForConnection(true);
      cleanupRef.current = startNostrConnect(session, {
        onConnected: (remotePubkey) => {
          setIsWaitingForConnection(false);
          loginWithRemoteSigner(remotePubkey);
          onClose();
        },
        onError: (errorMsg) => {
          setIsWaitingForConnection(false);
          console.error("Nostr Connect error:", errorMsg);
        },
        onTimeout: () => {
          setIsWaitingForConnection(false);
          // Create a new session on timeout
          const newSession = createNostrConnectSession();
          setNostrConnectSession(newSession);
          setNostrConnectUrl(generateNostrConnectURI(newSession, "WoT Playground"));
        },
      });

      return () => {
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
        setIsWaitingForConnection(false);
      };
    }
  }, [selectedMethod, bunkerMode, isOpen, loginWithRemoteSigner, onClose]);

  // Cleanup on modal close
  useEffect(() => {
    if (!isOpen && cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
      setIsWaitingForConnection(false);
      setNostrConnectSession(null);
      setNostrConnectUrl("");
    }
  }, [isOpen]);

  // Check if extension is available
  const checkExtension = useCallback(() => {
    if (typeof window !== "undefined") {
      setHasExtension(!!window.nostr);
    }
  }, []);

  // Reset state when modal opens/closes
  const handleClose = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    setSelectedMethod(null);
    setKeyInput("");
    setBunkerInput("");
    setIsWaitingForConnection(false);
    clearError();
    onClose();
  }, [onClose, clearError]);

  // Go back to method selection
  const handleBack = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    setSelectedMethod(null);
    setIsWaitingForConnection(false);
    clearError();
  }, [clearError]);

  // Select a login method
  const handleSelectMethod = useCallback(
    (method: LoginMethod) => {
      if (method === "extension") {
        checkExtension();
      }
      setSelectedMethod(method);
      clearError();
    },
    [checkExtension, clearError]
  );

  // Open nstart.me for account creation with WoT branding
  const handleCreateAccount = useCallback(() => {
    // Get current locale for language
    const locale = typeof window !== "undefined"
      ? window.location.pathname.split("/")[1] || "en"
      : "en";

    // Map locale to nstart supported languages (en, es, it, fr, de, ja)
    const langMap: Record<string, string> = { en: "en", es: "es", pt: "en" };
    const lang = langMap[locale] || "en";

    // Build nstart URL with integration parameters
    const params = new URLSearchParams({
      an: "WoT Playground",      // App name
      aa: "6366f1",              // Accent color (primary indigo)
      at: "popup",               // App type
      al: lang,                  // Language
      asf: "true",               // Skip follows suggestions
    });

    const nstartUrl = `https://nstart.me/?${params.toString()}`;
    window.open(nstartUrl, "_blank", "width=600,height=700");
  }, []);

  // Login handlers
  const handleExtensionLogin = useCallback(async () => {
    await loginWithExtension();
    if (!error) {
      handleClose();
    }
  }, [loginWithExtension, error, handleClose]);

  const handleKeyLogin = useCallback(async () => {
    if (!keyInput.trim()) return;
    await loginWithKey(keyInput);
    if (!error) {
      handleClose();
    }
  }, [loginWithKey, keyInput, error, handleClose]);

  const handleBunkerLogin = useCallback(async () => {
    if (!bunkerInput.trim()) return;
    await loginWithBunker(bunkerInput);
    if (!error) {
      handleClose();
    }
  }, [loginWithBunker, bunkerInput, error, handleClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full mx-4 shadow-2xl overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {selectedMethod && (
                <button
                  onClick={handleBack}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-lg font-semibold">{t("login.title")}</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-trust-red/10 text-trust-red border border-trust-red/20 rounded-lg p-3 mb-4 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Method views */}
            <AnimatePresence mode="wait">
              {!selectedMethod ? (
                <MethodSelectionView
                  onSelectMethod={handleSelectMethod}
                  onCreateAccount={handleCreateAccount}
                  t={t}
                />
              ) : selectedMethod === "extension" ? (
                <ExtensionLoginView
                  hasExtension={hasExtension}
                  isLoading={isLoading}
                  onLogin={handleExtensionLogin}
                  t={t}
                />
              ) : selectedMethod === "key" ? (
                <KeyLoginView
                  keyInput={keyInput}
                  setKeyInput={setKeyInput}
                  isLoading={isLoading}
                  onLogin={handleKeyLogin}
                  t={t}
                />
              ) : selectedMethod === "bunker" ? (
                <BunkerLoginView
                  bunkerMode={bunkerMode}
                  setBunkerMode={setBunkerMode}
                  bunkerInput={bunkerInput}
                  setBunkerInput={setBunkerInput}
                  nostrConnectUrl={nostrConnectUrl}
                  isLoading={isLoading}
                  isWaitingForConnection={isWaitingForConnection}
                  onLogin={handleBunkerLogin}
                  t={t}
                />
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
