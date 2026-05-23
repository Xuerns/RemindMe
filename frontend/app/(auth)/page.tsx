"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type FormEvent,
} from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";


interface ValidationResult {
  valid: boolean;
  message: string;
  type: "error" | "success" | "hint";
}


function validateEmail(value: string): ValidationResult {
  if (!value) return { valid: false, message: "", type: "hint" };

  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!value.includes("@")) {
    return {
      valid: false,
      message: "Tambahkan '@' untuk melanjutkan",
      type: "hint",
    };
  }

  if (basicEmailRegex.test(value) && !gmailRegex.test(value)) {
    return {
      valid: false,
      message: "Harap gunakan alamat Gmail (@gmail.com)",
      type: "error",
    };
  }

  if (gmailRegex.test(value)) {
    return { valid: true, message: "Alamat Gmail valid ✓", type: "success" };
  }

  return { valid: false, message: "Format email belum valid", type: "error" };
}

function validatePassword(value: string): ValidationResult {
  if (!value) return { valid: false, message: "", type: "hint" };

  if (value.length < 8) {
    return {
      valid: false,
      message: `Minimal 8 karakter (${value.length}/8)`,
      type: "error",
    };
  }

  if (!/[A-Z]/.test(value)) {
    return {
      valid: false,
      message: "Harus memiliki minimal 1 huruf besar (A-Z)",
      type: "error",
    };
  }

  return { valid: true, message: "Password valid ✓", type: "success" };
}

function DecoDots({ count, className }: { count: number; className: string }) {
  return (
    <div className={`absolute z-0 grid gap-[18px] opacity-15 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-on-surface" />
      ))}
    </div>
  );
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function LoginPage() {
  /* ── state ── */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── focus ── */
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  /* ── touched ── */
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  /* ── refs ── */
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  /* ── derived ── */
  const ev = validateEmail(email);
  const pv = validatePassword(password);
  const isFormValid = ev.valid && pv.valid;

  const router = useRouter();

  /* ── conditional helpers ── */
  const labelColor = (
    focused: boolean,
    touched: boolean,
    v: ValidationResult,
  ) =>
    touched && v.type === "error" && v.message
      ? "text-error"
      : touched && v.type === "success"
        ? "text-success"
        : focused
          ? "text-primary"
          : "text-on-surface";

  const iconColor = (
    focused: boolean,
    touched: boolean,
    v: ValidationResult,
  ) =>
    touched && v.type === "error" && v.message
      ? "text-error"
      : touched && v.type === "success"
        ? "text-success"
        : focused
          ? "text-primary"
          : "text-outline-variant";

  const inputClasses = (
    focused: boolean,
    touched: boolean,
    v: ValidationResult,
  ) => {
    const base =
      "w-full py-4 pl-[50px] pr-12 border-2 rounded-3xl text-[15px] text-on-surface outline-none transition-all duration-300 placeholder:text-outline-variant placeholder:font-normal";

    if (touched && v.type === "error" && v.message) {
      return cx(
        base,
        "border-error bg-[#fff5f5] animate-shake-error",
        focused && "ring-4 ring-error/8",
      );
    }
    if (touched && v.type === "success") {
      return cx(
        base,
        "border-success bg-[#f5fff5]",
        focused && "ring-4 ring-success/8",
      );
    }
    if (focused) {
      return cx(
        base,
        "border-primary bg-surface-container-lowest ring-4 ring-primary/8",
      );
    }
    return cx(base, "border-transparent bg-surface-container-low");
  };

  /* ── submit ── */
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setEmailTouched(true);
      setPasswordTouched(true);

      if (!isFormValid) {
        if (!ev.valid) emailRef.current?.focus();
        else if (!pv.valid) passwordRef.current?.focus();
        return;
      }

      setIsSubmitting(true);
      
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg)
        }

        const response = await res.json();
        localStorage.setItem("token", response.token);
        localStorage.setItem("id", response.id);

        router.push("/dashboard");
      } catch (err) {
        alert("login gagal");
      } finally {
        setIsSubmitting(false);
      } 
    },
    [isFormValid, ev.valid, pv.valid, password, email],
  );

  /* ── ripple ── */
  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement("span");
    ripple.className =
      "absolute rounded-full bg-white/30 animate-ripple pointer-events-none";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px";
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  /* ── auto-focus ── */
  useEffect(() => {
    const t = setTimeout(() => emailRef.current?.focus(), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      id="login-page"
      className="flex min-h-screen overflow-hidden relative bg-background"
    >
      <div
        className="flex-1 flex flex-col justify-center items-center p-12 relative 
                   animate-slide-in-left opacity-0
                   max-lg:py-8 max-lg:px-6"
      >
        <div className="w-full max-w-[420px]">
          {/* ── Heading ── */}
          <div
            className="animate-fade-in-up opacity-0 mb-2"
            style={{ animationDelay: "0.4s" }}
          >
            <h1 className="font-display text-[32px] font-bold text-on-surface tracking-[-0.02em] leading-[1.2] m-0 max-sm:text-[26px]">
              Selamat Datang
            </h1>
            <p className="text-[15px] text-on-surface-variant mt-2 m-0 leading-relaxed">
              Masuk ke akun kamu untuk melanjutkan perjalanan produktif.
            </p>
          </div>

          {/* ── Form ── */}
          <form
            id="login-form"
            className="mt-5 flex flex-col gap-1.5"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* ──────── EMAIL ──────── */}
            <div
              className="animate-fade-in-up opacity-0"
              style={{ animationDelay: "0.5s" }}
            >
              <label
                htmlFor="login-email"
                className={cx(
                  "block text-[13px] font-semibold mb-2 tracking-[0.01em] transition-colors duration-300",
                  labelColor(emailFocused, emailTouched, ev),
                )}
              >
                Alamat Gmail
              </label>

              <div className="relative flex items-center">
                <Mail
                  size={18}
                  className={cx(
                    "absolute left-[18px] z-[1] pointer-events-none transition-all duration-300",
                    iconColor(emailFocused, emailTouched, ev),
                    emailFocused && "scale-105",
                  )}
                />

                <input
                  ref={emailRef}
                  id="login-email"
                  type="email"
                  className={inputClasses(emailFocused, emailTouched, ev)}
                  placeholder="contoh@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (!emailTouched) setEmailTouched(true);
                  }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => {
                    setEmailFocused(false);
                    setEmailTouched(true);
                  }}
                  autoComplete="email"
                />

                {/* status icon */}
                {emailTouched && ev.message && (
                  <div className="absolute right-12 flex items-center justify-center">
                    {ev.type === "success" ? (
                      <Check
                        size={16}
                        className="text-success animate-check-pop"
                      />
                    ) : ev.type === "error" ? (
                      <X size={16} className="text-error animate-check-pop" />
                    ) : null}
                  </div>
                )}
              </div>

              {/* validation message */}
              <div className="min-h-[28px] py-1">
                {emailTouched && ev.message && (
                  <span
                    className={cx(
                      "text-xs font-medium leading-[1.4] animate-fade-in-up",
                      ev.type === "error" && "text-error",
                      ev.type === "success" && "text-success",
                      ev.type === "hint" && "text-outline",
                    )}
                  >
                    {ev.message}
                  </span>
                )}
              </div>
            </div>

            {/* ──────── PASSWORD ──────── */}
            <div
              className="animate-fade-in-up opacity-0"
              style={{ animationDelay: "0.6s" }}
            >
              <label
                htmlFor="login-password"
                className={cx(
                  "block text-[13px] font-semibold mb-2 tracking-[0.01em] transition-colors duration-300",
                  labelColor(passwordFocused, passwordTouched, pv),
                )}
              >
                Password
              </label>

              <div className="relative flex items-center">
                <Lock
                  size={18}
                  className={cx(
                    "absolute left-[18px] z-[1] pointer-events-none transition-all duration-300",
                    iconColor(passwordFocused, passwordTouched, pv),
                    passwordFocused && "scale-105",
                  )}
                />

                <input
                  ref={passwordRef}
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className={inputClasses(passwordFocused, passwordTouched, pv)}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (!passwordTouched) setPasswordTouched(true);
                  }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => {
                    setPasswordFocused(false);
                    setPasswordTouched(true);
                  }}
                  autoComplete="current-password"
                />

                {/* status icon */}
                {passwordTouched && pv.message && (
                  <div className="absolute right-12 flex items-center justify-center">
                    {pv.type === "success" ? (
                      <Check
                        size={16}
                        className="text-success animate-check-pop"
                      />
                    ) : pv.type === "error" ? (
                      <X size={16} className="text-error animate-check-pop" />
                    ) : null}
                  </div>
                )}

                {/* toggle visibility */}
                <button
                  type="button"
                  className="absolute right-3.5 bg-transparent border-none p-1.5 cursor-pointer text-outline rounded-full
                             flex items-center justify-center transition-all duration-250
                             hover:bg-surface-container hover:text-primary"
                  onClick={() => setShowPassword((p) => !p)}
                  tabIndex={-1}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* validation message */}
              <div className="min-h-[28px] py-1">
                {passwordTouched && pv.message && (
                  <span
                    className={cx(
                      "text-xs font-medium leading-[1.4] animate-fade-in-up",
                      pv.type === "error" && "text-error",
                      pv.type === "success" && "text-success",
                      pv.type === "hint" && "text-outline",
                    )}
                  >
                    {pv.message}
                  </span>
                )}
              </div>
            </div>

            {/* ──────── REMEMBER / FORGOT ──────── */}
            <div
              className="flex justify-between items-center mt-1 animate-fade-in-up opacity-0"
              style={{ animationDelay: "0.7s" }}
            >
              <label
                id="remember-me"
                className="flex items-center gap-2.5 cursor-pointer select-none"
                onClick={() => setRememberMe((p) => !p)}
              >
                <div
                  className={cx(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0",
                    rememberMe
                      ? "border-primary bg-primary"
                      : "border-outline-variant bg-surface-container-lowest",
                  )}
                >
                  {rememberMe && (
                    <Check
                      size={12}
                      className="text-on-primary animate-check-pop"
                      strokeWidth={3}
                    />
                  )}
                </div>
                <span className="text-[13px] text-on-surface-variant font-medium">
                  Ingat saya
                </span>
              </label>

              <a
                href="#"
                id="forgot-password-link"
                className="relative text-[13px] font-semibold text-primary transition-colors duration-250 hover:text-on-surface
                           after:content-[''] after:absolute after:bottom-[-2px] after:left-0
                           after:h-[1.5px] after:w-0 after:bg-primary
                           after:transition-all after:duration-300
                           hover:after:w-full"
              >
                Lupa Password?
              </a>
            </div>

            {/* ──────── SUBMIT ──────── */}
            <div
              className="mt-7 animate-fade-in-up opacity-0"
              style={{ animationDelay: "0.8s" }}
            >
              <button
                type="submit"
                id="login-submit-btn"
                disabled={isSubmitting}
                onClick={handleRipple}
                className="w-full py-4 px-8 border-none rounded-full bg-primary text-on-primary
                           text-[15px] font-semibold cursor-pointer relative overflow-hidden
                           transition-all duration-300 tracking-[0.01em]
                           hover:bg-inverse-surface hover:-translate-y-px hover:shadow-elevated
                           active:scale-[0.98] active:translate-y-0
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2 relative z-[1]">
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 border-[2.5px] border-white/30 border-t-on-primary rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Masuk
                      <ArrowRight size={18} />
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>

          {/* ── Divider ── */}
          <div
            className="flex items-center gap-4 my-7 animate-fade-in opacity-0"
            style={{ animationDelay: "0.9s" }}
          >
            <div className="flex-1 h-px bg-outline-variant/40" />
            <span className="text-xs text-outline font-medium tracking-[0.04em] uppercase">
              atau
            </span>
            <div className="flex-1 h-px bg-outline-variant/40" />
          </div>

          {/* ── Footer ── */}
          <div
            className="mt-3 text-center animate-fade-in opacity-0"
            style={{ animationDelay: "1.1s" }}
          >
            <p className="text-sm text-on-surface-variant">
              Belum punya akun?{" "}
              <Link
                href="/register"
                id="register-link"
                className="text-primary font-semibold no-underline transition-colors duration-250 hover:text-on-surface"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div
        className="flex-[1.1] relative flex flex-col justify-end items-start p-12 overflow-hidden
                   animate-slide-in-right opacity-0
                   max-lg:hidden"
      >
        {/* gradient bg */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(160deg, var(--color-primary-container) 0%, var(--color-surface-container-high) 40%, var(--color-secondary-container) 80%, var(--color-tertiary-container) 100%)",
          }}
        />

        {/* blobs */}
        <div className="absolute w-[300px] h-[300px] -top-[50px] -right-[50px] rounded-full blur-[60px] opacity-40 bg-primary-fixed animate-morph-blob z-0" />
        <div
          className="absolute w-[250px] h-[250px] bottom-[100px] -left-10 rounded-full blur-[60px] opacity-40 bg-secondary-fixed animate-morph-blob z-0"
          style={{ animationDelay: "-4s" }}
        />
        <div
          className="absolute w-[200px] h-[200px] top-1/2 right-[20%] rounded-full blur-[60px] opacity-40 bg-tertiary-fixed animate-morph-blob z-0"
          style={{ animationDelay: "-8s" }}
        />

        {/* decorative dots */}
        <DecoDots
          count={16}
          className="top-10 left-10 grid-cols-[repeat(4,6px)]"
        />
        <DecoDots
          count={20}
          className="bottom-10 right-10 grid-cols-[repeat(5,6px)]"
        />

        {/* decorative rings */}
        <div className="absolute w-[150px] h-[150px] top-[15%] left-[10%] rounded-full border-2 border-on-surface opacity-[0.06] z-0" />
        <div className="absolute w-20 h-20 bottom-[20%] right-[15%] rounded-full border-2 border-on-surface opacity-[0.06] z-0" />

        {/* quote */}
        <div
          className="relative z-[1] mt-9 max-w-full animate-fade-in-up opacity-0"
          style={{ animationDelay: "0.8s" }}
        >
          <blockquote className="m-0 font-display text-2xl font-semibold text-[#ffffff] leading-[1.5] tracking-[-0.01em]">
            &ldquo;Spotify, Netflix, YouTube Premium, iCloud...
            <br />
            tanpa sadar, langganan terus bertambah setiap bulannya.
            Sudah tahu belum, berapa total yang kamu bayar?&rdquo;
          </blockquote>
        </div>
      </div>
    </div>
  );
}
