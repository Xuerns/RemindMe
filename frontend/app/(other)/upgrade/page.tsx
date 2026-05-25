"use client";

import { checkToken } from "@/helper/checkToken";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  ArrowLeft,
  Check,
  X,
  Crown,
  Lock,
  CreditCard,
  Wallet,
  Building2,
  ChevronRight,
  Shield,
  Zap,
} from "lucide-react";
import "./upgrade.css";

type PaymentMethod = "credit_card" | "gopay" | "ovo" | "dana" | "bank_transfer";

interface PaymentMethodConfig {
  id: PaymentMethod;
  label: string;
  icon: React.ReactNode;
  fields: FieldConfig[];
}

interface FieldConfig {
  name: string;
  label: string;
  placeholder: string;
  type: string;
  maxLength?: number;
  pattern?: string;
}

const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: "credit_card",
    label: "Kartu Kredit / Debit",
    icon: <CreditCard size={20} strokeWidth={1.8} />,
    fields: [
      {
        name: "card_number",
        label: "Nomor Kartu",
        placeholder: "1234 5678 9012 3456",
        type: "text",
        maxLength: 19,
        pattern: "[0-9 ]*",
      },
      {
        name: "card_holder",
        label: "Nama Pemegang Kartu",
        placeholder: "Masukkan nama lengkap",
        type: "text",
      },
      {
        name: "expiry",
        label: "Masa Berlaku",
        placeholder: "MM/YY",
        type: "text",
        maxLength: 5,
      },
      {
        name: "cvv",
        label: "CVV",
        placeholder: "123",
        type: "password",
        maxLength: 4,
      },
    ],
  },
  {
    id: "gopay",
    label: "GoPay",
    icon: <Wallet size={20} strokeWidth={1.8} />,
    fields: [
      {
        name: "phone",
        label: "Nomor Telepon GoPay",
        placeholder: "08xxxxxxxxxx",
        type: "tel",
        maxLength: 13,
      },
    ],
  },
  {
    id: "ovo",
    label: "OVO",
    icon: <Wallet size={20} strokeWidth={1.8} />,
    fields: [
      {
        name: "phone",
        label: "Nomor Telepon OVO",
        placeholder: "08xxxxxxxxxx",
        type: "tel",
        maxLength: 13,
      },
    ],
  },
  {
    id: "dana",
    label: "DANA",
    icon: <Wallet size={20} strokeWidth={1.8} />,
    fields: [
      {
        name: "phone",
        label: "Nomor Telepon DANA",
        placeholder: "08xxxxxxxxxx",
        type: "tel",
        maxLength: 13,
      },
    ],
  },
  {
    id: "bank_transfer",
    label: "Transfer Bank",
    icon: <Building2 size={20} strokeWidth={1.8} />,
    fields: [
      {
        name: "bank_name",
        label: "Nama Bank",
        placeholder: "Pilih bank tujuan",
        type: "select",
      },
      {
        name: "account_name",
        label: "Nama Pemilik Rekening",
        placeholder: "Masukkan nama lengkap",
        type: "text",
      },
    ],
  },
];

const BANK_OPTIONS = ["BCA", "BNI", "BRI", "Mandiri", "CIMB Niaga", "BSI"];

const REGULER_FEATURES = [
  { text: "Maks 5 subscription", available: true },
  { text: "Reminder otomatis", available: true },
  { text: "Halaman Analytics", available: false },
  { text: "Subscription tak terbatas", available: false },
  { text: "Dukungan prioritas", available: false },
];

const PREMIUM_FEATURES = [
  { text: "Subscription tak terbatas", available: true },
  { text: "Reminder otomatis", available: true },
  { text: "Halaman Analytics lengkap", available: true },
  { text: "Dukungan prioritas", available: true },
  { text: "Ekspor data CSV", available: true },
];

function Confetti() {
  const colors = [
    "var(--color-primary-container)",
    "var(--color-secondary-container)",
    "var(--color-tertiary-container)",
    "var(--color-secondary)",
    "var(--color-tertiary)",
  ];

  const pieces = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * 360;
    const distance = 60 + Math.random() * 100;
    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance - 40;
    const rotation = Math.random() * 720 - 360;
    return {
      id: i,
      color: colors[i % colors.length],
      x: `${x}px`,
      y: `${y}px`,
      r: `${rotation}deg`,
      delay: `${Math.random() * 0.3}s`,
      size: 6 + Math.random() * 6,
    };
  });

  return (
    <>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="upgrade-confetti-piece"
          style={
            {
              background: p.color,
              width: p.size,
              height: p.size,
              left: "50%",
              top: "50%",
              animationDelay: p.delay,
              "--confetti-x": p.x,
              "--confetti-y": p.y,
              "--confetti-r": p.r,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
}

function SuccessCheck() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle
        cx="40"
        cy="40"
        r="36"
        stroke="var(--color-success)"
        strokeWidth="3"
        className="upgrade-success-ring"
        strokeLinecap="round"
      />
      <path
        d="M25 42 L35 52 L55 30"
        stroke="var(--color-success)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="upgrade-success-check"
      />
    </svg>
  );
}

export default function UpgradePage() {
  const router = useRouter();

  /* ── State ── */
  const [isPremium, setIsPremium] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  /* Auth check & Fetch premium status */
  useEffect(() => {
    if (!checkToken()) {
      router.push("/");
      return;
    }

    const checkPremiumStatus = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("id");
      if (!userId || !token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const userData = await res.json();
          if (userData.type === "PREMIUM") {
            setIsPremium(true);
          }
        }
      } catch (err) {
        console.error("Gagal memuat status user:", err);
      }
    };

    checkPremiumStatus();
  }, [router]);
  const [isClosing, setIsClosing] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  /* ── Handlers ── */
  const openPopup = useCallback(() => {
    setShowPopup(true);
    setIsClosing(false);
    setStep(1);
    setSelectedMethod(null);
    setFormData({});
    setFormErrors({});
    setIsProcessing(false);
    setShowSuccess(false);
    document.body.style.overflow = "hidden";
  }, []);

  const closePopup = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setShowPopup(false);
      setIsClosing(false);
      document.body.style.overflow = "";
    }, 250);
  }, []);

  /* Escape key */
  useEffect(() => {
    if (!showPopup) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isProcessing && !showSuccess) closePopup();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [showPopup, isProcessing, showSuccess, closePopup]);

  /* Outside click */
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !isProcessing &&
        !showSuccess
      ) {
        closePopup();
      }
    },
    [closePopup, isProcessing, showSuccess],
  );

  const selectMethod = (id: PaymentMethod) => {
    setSelectedMethod(id);
    setFormData({});
    setFormErrors({});
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    /* Auto-format card number */
    if (fieldName === "card_number") {
      value = value
        .replace(/\D/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
    }
    /* Auto-format expiry */
    if (fieldName === "expiry") {
      value = value.replace(/\D/g, "");
      if (value.length >= 2) {
        value = value.slice(0, 2) + "/" + value.slice(2);
      }
    }
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (formErrors[fieldName]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    if (!selectedMethod) return false;
    const method = PAYMENT_METHODS.find((m) => m.id === selectedMethod);
    if (!method) return false;

    const errors: Record<string, string> = {};
    method.fields.forEach((field) => {
      const val = formData[field.name]?.trim();
      if (!val) {
        errors[field.name] = `${field.label} wajib diisi`;
      } else if (
        field.name === "card_number" &&
        val.replace(/\s/g, "").length < 16
      ) {
        errors[field.name] = "Nomor kartu harus 16 digit";
      } else if (field.name === "phone" && val.length < 10) {
        errors[field.name] = "Nomor telepon tidak valid";
      } else if (field.name === "cvv" && val.length < 3) {
        errors[field.name] = "CVV tidak valid";
      } else if (
        field.name === "expiry" &&
        (val.length < 5 || !val.includes("/"))
      ) {
        errors[field.name] = "Format MM/YY";
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goToStep2 = () => {
    if (selectedMethod) setStep(2);
  };

  const goBackToStep1 = () => {
    setStep(1);
    setFormErrors({});
  };

  const handlePay = async () => {
    if (!validateForm()) return;
    setIsProcessing(true);

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("id");

    const payload = {
      userId: userId,
      paymentMethod: selectedMethod,
      noTelpon: formData.phone || null,
      bankName: formData.bank_name || null,
      accountName: formData.account_name || formData.card_holder || null,
      cardNumber: formData.card_number
        ? formData.card_number.replace(/\s/g, "")
        : null,
      cardExpired: formData.expiry || null,
      cvv: formData.cvv || null,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/make`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(errorMsg);
      }

      setIsProcessing(false);
      setShowSuccess(true);
      setStep(3);

      setTimeout(() => {
        document.body.style.overflow = "";
        router.push("/dashboard");
      }, 3000);
    } catch {
      setIsProcessing(false);
      alert("Pembayaran gagal, silahkan coba lagi!");
    }
  };

  const currentMethod = PAYMENT_METHODS.find((m) => m.id === selectedMethod);
  const progressWidth = step === 1 ? "33%" : step === 2 ? "66%" : "100%";

  return (
    <div className="relative min-h-screen bg-surface overflow-hidden">
      {/* ── Decorative background orbs ── */}
      <div className="upgrade-orb upgrade-orb--primary" />
      <div className="upgrade-orb upgrade-orb--secondary" />
      <div className="upgrade-orb upgrade-orb--tertiary" />

      {/* ── Top bar ── */}
      <div className="relative z-10 px-6 py-5 flex items-center gap-3 sm:px-10 sm:py-6">
        <button
          id="upgrade-back-btn"
          onClick={() => router.push("/dashboard")}
          className="upgrade-back-btn flex items-center gap-2 
                     text-on-surface-variant text-sm font-medium
                     px-4 py-2.5 rounded-full
                     bg-surface-container-lowest/70
                     border border-outline-variant/30"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          <span>Kembali ke Dashboard</span>
        </button>
      </div>

      {/* ── Page content ── */}
      <div className="relative z-10 max-w-[960px] mx-auto px-6 pt-4 pb-20 sm:px-10">
        {/* ── Headline ── */}
        <div className="text-center mb-12 upgrade-heading-enter">
          <h1
            className="text-on-surface font-bold tracking-tight leading-tight m-0"
            style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
          >
            Tingkatkan Produktivitasmu
          </h1>
          <p className="text-on-surface-variant text-base mt-3 max-w-[50ch] mx-auto leading-relaxed m-0">
            Kelola semua subscription tanpa batas dan dapatkan insight lengkap
            untuk pengelolaan keuangan yang lebih cerdas.
          </p>
        </div>

        {/* ── Plan Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mx-auto">
          {/* ─── Reguler Card ─── */}
          <div
            className="upgrade-card-enter bg-surface-container-lowest 
                       rounded-3xl p-8 relative
                       border border-outline-variant/20"
            style={{ boxShadow: "var(--shadow-ambient)" }}
          >
            <div className="mb-6">
              <p className="text-sm font-semibold text-on-surface-variant tracking-wide uppercase m-0">
                Reguler
              </p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-bold text-on-surface tracking-tight">
                  Gratis
                </span>
              </div>
              <p className="text-sm text-on-surface-variant mt-2 m-0">
                Cocok untuk mulai mencatat subscription
              </p>
            </div>

            <div className="w-full h-px bg-outline-variant/20 mb-6" />

            <ul className="space-y-3 mb-8 list-none p-0 m-0">
              {REGULER_FEATURES.map((f, i) => (
                <li
                  key={i}
                  className="upgrade-feature-item flex items-center gap-3 text-sm"
                >
                  {f.available ? (
                    <span
                      className="upgrade-check-enter shrink-0 w-5 h-5 rounded-full 
                                 bg-primary-container flex items-center justify-center"
                    >
                      <Check
                        size={12}
                        strokeWidth={2.5}
                        className="text-primary"
                      />
                    </span>
                  ) : (
                    <span
                      className="shrink-0 w-5 h-5 rounded-full bg-surface-container 
                                 flex items-center justify-center"
                    >
                      <Lock
                        size={10}
                        strokeWidth={2}
                        className="text-outline"
                      />
                    </span>
                  )}
                  <span
                    className={f.available ? "text-on-surface" : "text-outline"}
                  >
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>

            <button
              id="upgrade-reguler-btn"
              disabled={!isPremium}
              className={`w-full py-3 px-6 rounded-full text-sm font-semibold transition-all duration-200
                         ${!isPremium 
                           ? "bg-surface-container text-on-surface-variant cursor-default opacity-60" 
                           : "bg-primary text-on-primary cursor-pointer hover:bg-primary/90"}`}
            >
              {!isPremium ? "Paket Saat Ini" : "Kembali ke Reguler"}
            </button>
          </div>

          {/* ─── Premium Card ─── */}
          <div
            className="upgrade-card-enter upgrade-shimmer relative
                       rounded-3xl p-8 overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, var(--color-inverse-surface) 0%, #2d4258 50%, var(--color-inverse-surface) 100%)",
              boxShadow:
                "var(--shadow-elevated), 0 0 0 1px rgba(255,255,255,0.06) inset",
            }}
          >
            {/* Recommended badge */}
            <div
              className="upgrade-badge-pulse absolute top-6 right-6 
                         flex items-center gap-1.5 px-3 py-1 rounded-full
                         bg-secondary text-on-secondary text-xs font-semibold"
            >
              <Crown size={12} strokeWidth={2.2} />
              Terbaik
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-inverse-on-surface/60 tracking-wide uppercase m-0">
                Premium
              </p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-sm text-inverse-on-surface/50 font-medium">
                  Rp
                </span>
                <span className="text-4xl font-bold text-inverse-on-surface tracking-tight">
                  99.999
                </span>
                <span className="text-sm text-inverse-on-surface/50 font-medium">
                  /bulan
                </span>
              </div>
              <p className="text-sm text-inverse-on-surface/50 mt-2 m-0">
                Semua fitur, tanpa batasan
              </p>
            </div>

            <div className="w-full h-px bg-white/10 mb-6" />

            <ul className="space-y-3 mb-8 list-none p-0 m-0">
              {PREMIUM_FEATURES.map((f, i) => (
                <li
                  key={i}
                  className="upgrade-feature-item flex items-center gap-3 text-sm"
                >
                  <span
                    className="upgrade-check-enter shrink-0 w-5 h-5 rounded-full 
                               bg-secondary flex items-center justify-center"
                  >
                    <Check
                      size={12}
                      strokeWidth={2.5}
                      className="text-on-secondary"
                    />
                  </span>
                  <span className="text-inverse-on-surface/90">{f.text}</span>
                </li>
              ))}
            </ul>

            <button
              id="upgrade-premium-btn"
              onClick={openPopup}
              disabled={isPremium}
              className={`upgrade-btn-press relative z-10 w-full py-3.5 px-6 rounded-full
                         text-sm font-semibold border-0 transition-all duration-200
                         ${isPremium ? "opacity-60 cursor-not-allowed" : "cursor-pointer text-on-secondary"}`}
              style={{
                background: isPremium 
                  ? "var(--color-surface-container)" 
                  : "linear-gradient(135deg, var(--color-secondary) 0%, var(--color-tertiary) 100%)",
                boxShadow: isPremium ? "none" : "0 6px 24px -4px rgba(101, 91, 104, 0.4)",
                color: isPremium ? "var(--color-on-surface-variant)" : "var(--color-on-secondary)"
              }}
            >
              <span className="flex items-center justify-center gap-2">
                {isPremium ? (
                  <>
                    <Crown size={16} strokeWidth={2.2} />
                    Paket Saat Ini
                  </>
                ) : (
                  <>
                    <Zap size={16} strokeWidth={2.2} />
                    Upgrade Sekarang
                  </>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* ── Trust bar ── */}
        <div className="flex items-center justify-center gap-6 mt-10 text-xs text-on-surface-variant/60">
          <span className="flex items-center gap-1.5">
            <Shield size={14} strokeWidth={1.8} />
            Pembayaran aman
          </span>
          <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
          <span>Bisa dibatalkan kapanpun</span>
          <span className="w-1 h-1 rounded-full bg-outline-variant/40 hidden sm:block" />
          <span className="hidden sm:inline">Garansi 30 hari</span>
        </div>
      </div>

      {showPopup && (
        <div className="upgrade-overlay" onClick={handleOverlayClick}>
          <div
            className={`upgrade-overlay-bg ${isClosing ? "upgrade-overlay-bg--exit" : "upgrade-overlay-bg--enter"}`}
          />

          <div
            ref={panelRef}
            className={`upgrade-panel ${isClosing ? "upgrade-panel--exit" : "upgrade-panel--enter"}`}
          >
            {/* ── Panel header ── */}
            {!showSuccess && (
              <div className="px-7 pt-6 pb-4 border-b border-outline-variant/15">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-on-surface m-0">
                      {step === 1
                        ? "Pilih Metode Pembayaran"
                        : "Detail Pembayaran"}
                    </h2>
                    <p className="text-xs text-on-surface-variant mt-1 m-0">
                      Premium · Rp99.999/bulan
                    </p>
                  </div>
                  <button
                    id="upgrade-popup-close"
                    onClick={closePopup}
                    disabled={isProcessing}
                    className="w-8 h-8 rounded-xl flex items-center justify-center
                               text-on-surface-variant hover:bg-surface-container
                               transition-colors duration-200 cursor-pointer
                               border-0 bg-transparent
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <X size={16} strokeWidth={2} />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 rounded-full bg-surface-container overflow-hidden">
                  <div
                    className="upgrade-progress-fill h-full rounded-full"
                    style={{
                      width: progressWidth,
                      background:
                        "linear-gradient(90deg, var(--color-secondary) 0%, var(--color-tertiary) 100%)",
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-on-surface-variant/50 mt-1.5 font-medium">
                  <span className={step >= 1 ? "text-secondary" : ""}>
                    Metode
                  </span>
                  <span className={step >= 2 ? "text-secondary" : ""}>
                    Detail
                  </span>
                  <span className={step >= 3 ? "text-secondary" : ""}>
                    Selesai
                  </span>
                </div>
              </div>
            )}

            {/* ── Step 1: Choose payment method ── */}
            {step === 1 && (
              <div className="p-7 upgrade-step-enter">
                <div className="space-y-2.5">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      id={`payment-method-${method.id}`}
                      onClick={() => selectMethod(method.id)}
                      className={`upgrade-method-tile w-full flex items-center gap-4 
                                  px-4 py-3.5 rounded-2xl text-left
                                  border bg-transparent
                                  ${
                                    selectedMethod === method.id
                                      ? "upgrade-method-tile--active"
                                      : "border-outline-variant/20 hover:border-outline-variant/40"
                                  }`}
                    >
                      <span
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          selectedMethod === method.id
                            ? "bg-secondary text-on-secondary"
                            : "bg-surface-container text-on-surface-variant"
                        } transition-colors duration-200`}
                      >
                        {method.icon}
                      </span>
                      <span className="flex-1 text-sm font-medium text-on-surface">
                        {method.label}
                      </span>
                      <ChevronRight
                        size={16}
                        strokeWidth={1.8}
                        className={`text-outline-variant transition-colors duration-200 ${
                          selectedMethod === method.id ? "text-secondary" : ""
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <button
                  id="upgrade-step2-btn"
                  onClick={goToStep2}
                  disabled={!selectedMethod}
                  className="upgrade-btn-press w-full mt-6 py-3.5 rounded-full
                             text-sm font-semibold cursor-pointer border-0
                             transition-opacity duration-200
                             disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: selectedMethod
                      ? "linear-gradient(135deg, var(--color-secondary) 0%, var(--color-tertiary) 100%)"
                      : "var(--color-surface-container)",
                    color: selectedMethod
                      ? "var(--color-on-secondary)"
                      : "var(--color-on-surface-variant)",
                    boxShadow: selectedMethod
                      ? "0 6px 20px -4px rgba(101, 91, 104, 0.35)"
                      : "none",
                  }}
                >
                  Lanjutkan
                </button>
              </div>
            )}

            {/* ── Step 2: Payment details ── */}
            {step === 2 && currentMethod && (
              <div className="p-7 upgrade-step-enter">
                {/* Back to step 1 */}
                <button
                  id="upgrade-back-step1"
                  onClick={goBackToStep1}
                  className="flex items-center gap-1.5 text-xs font-medium
                             text-on-surface-variant mb-5 
                             bg-transparent border-0 cursor-pointer
                             hover:text-on-surface transition-colors duration-200 p-0"
                >
                  <ArrowLeft size={14} strokeWidth={2} />
                  Kembali
                </button>

                {/* Selected method label */}
                <div className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-surface-container/50">
                  <span className="w-9 h-9 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shrink-0">
                    {currentMethod.icon}
                  </span>
                  <span className="text-sm font-medium text-on-surface">
                    {currentMethod.label}
                  </span>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  {currentMethod.fields.map((field) => (
                    <div key={field.name}>
                      <label
                        htmlFor={`field-${field.name}`}
                        className="block text-xs font-semibold text-on-surface-variant mb-1.5 tracking-wide"
                      >
                        {field.label}
                      </label>
                      {field.type === "select" ? (
                        <select
                          id={`field-${field.name}`}
                          value={formData[field.name] || ""}
                          onChange={(e) =>
                            handleFieldChange(field.name, e.target.value)
                          }
                          className={`upgrade-input w-full px-4 py-3 rounded-xl text-sm
                                     bg-surface-container-lowest
                                     border text-on-surface
                                     appearance-none cursor-pointer
                                     ${
                                       formErrors[field.name]
                                         ? "border-error"
                                         : "border-outline-variant/25"
                                     }`}
                        >
                          <option value="">Pilih bank</option>
                          {BANK_OPTIONS.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={`field-${field.name}`}
                          type={field.type}
                          placeholder={field.placeholder}
                          maxLength={field.maxLength}
                          value={formData[field.name] || ""}
                          onChange={(e) =>
                            handleFieldChange(field.name, e.target.value)
                          }
                          className={`upgrade-input w-full px-4 py-3 rounded-xl text-sm
                                     bg-surface-container-lowest
                                     border text-on-surface
                                     placeholder:text-outline-variant/50
                                     ${
                                       formErrors[field.name]
                                         ? "border-error"
                                         : "border-outline-variant/25"
                                     }`}
                        />
                      )}
                      {formErrors[field.name] && (
                        <p className="text-xs text-error mt-1 m-0 font-medium">
                          {formErrors[field.name]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Order summary */}
                <div className="mt-6 p-4 rounded-2xl bg-surface-container/40 space-y-2">
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>Paket Premium</span>
                    <span>Rp99.999</span>
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>Biaya layanan</span>
                    <span>Rp0</span>
                  </div>
                  <div className="w-full h-px bg-outline-variant/15" />
                  <div className="flex justify-between text-sm font-semibold text-on-surface">
                    <span>Total</span>
                    <span>Rp99.999</span>
                  </div>
                </div>

                {/* Pay button */}
                <button
                  id="upgrade-pay-btn"
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="upgrade-btn-press w-full mt-6 py-3.5 rounded-full
                             text-sm font-semibold cursor-pointer border-0
                             text-on-secondary
                             disabled:cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-secondary) 0%, var(--color-tertiary) 100%)",
                    boxShadow: "0 6px 20px -4px rgba(101, 91, 104, 0.35)",
                    opacity: isProcessing ? 0.8 : 1,
                  }}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2.5">
                      <span className="upgrade-spinner" />
                      Memproses...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Shield size={16} strokeWidth={2} />
                      Bayar Rp99.999
                    </span>
                  )}
                </button>

                <p className="text-[10px] text-on-surface-variant/50 text-center mt-3 m-0">
                  Pembayaran diproses dengan enkripsi end-to-end
                </p>
              </div>
            )}

            {/* ── Step 3: Success ── */}
            {step === 3 && showSuccess && (
              <div className="p-10 text-center upgrade-step-enter relative">
                {/* Confetti */}
                <div className="relative inline-block mb-5">
                  <Confetti />
                  <SuccessCheck />
                </div>

                <h2 className="text-xl font-bold text-on-surface m-0">
                  Pembayaran Berhasil!
                </h2>
                <p className="text-sm text-on-surface-variant mt-2 mb-0 max-w-[32ch] mx-auto leading-relaxed">
                  Selamat! Akun kamu telah di-upgrade ke Premium. Nikmati semua
                  fitur tanpa batas.
                </p>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-on-surface-variant/50">
                  <span
                    className="upgrade-spinner"
                    style={{
                      borderColor: "var(--color-outline-variant)",
                      borderTopColor: "var(--color-secondary)",
                      width: 14,
                      height: 14,
                      borderWidth: 2,
                    }}
                  />
                  Mengalihkan ke dashboard...
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
