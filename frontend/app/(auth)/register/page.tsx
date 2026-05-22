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
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ValidationResult {
  valid: boolean;
  message: string;
  type: "error" | "success" | "hint";
}

function validateUsername(value: string): ValidationResult {
  if (!value) return { valid: false, message: "", type: "hint" };
  if (value.length < 4) {
    return { valid: false, message: `Minimal 4 karakter (${value.length}/4)`, type: "error" };
  }
  return { valid: true, message: "Username valid ✓", type: "success" };
}

function validateEmail(value: string): ValidationResult {
  if (!value) return { valid: false, message: "", type: "hint" };
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!value.includes("@")) {
    return { valid: false, message: "Tambahkan '@' untuk melanjutkan", type: "hint" };
  }
  if (basicEmailRegex.test(value) && !gmailRegex.test(value)) {
    return { valid: false, message: "Harap gunakan alamat Gmail (@gmail.com)", type: "error" };
  }
  if (gmailRegex.test(value)) {
    return { valid: true, message: "Alamat Gmail valid ✓", type: "success" };
  }
  return { valid: false, message: "Format email belum valid", type: "error" };
}

function validatePassword(value: string): ValidationResult {
  if (!value) return { valid: false, message: "", type: "hint" };
  if (value.length < 8) {
    return { valid: false, message: `Minimal 8 karakter (${value.length}/8)`, type: "error" };
  }
  if (!/[A-Z]/.test(value)) {
    return { valid: false, message: "Harus memiliki minimal 1 huruf besar (A-Z)", type: "error" };
  }
  return { valid: true, message: "Password valid ✓", type: "success" };
}

function validateConfirmPassword(password: string, confirm: string): ValidationResult {
  if (!confirm) return { valid: false, message: "", type: "hint" };
  if (confirm !== password) {
    return { valid: false, message: "Password tidak cocok", type: "error" };
  }
  return { valid: true, message: "Password cocok ✓", type: "success" };
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

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [usernameFocused, setUsernameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const [usernameTouched, setUsernameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const uv = validateUsername(username);
  const ev = validateEmail(email);
  const pv = validatePassword(password);
  const cv = validateConfirmPassword(password, confirmPassword);
  const isFormValid = uv.valid && ev.valid && pv.valid && cv.valid;

  const router = useRouter();

  const labelColor = (focused: boolean, touched: boolean, v: ValidationResult) =>
    touched && v.type === "error" && v.message ? "text-error"
    : touched && v.type === "success" ? "text-success"
    : focused ? "text-primary"
    : "text-on-surface";

  const iconColor = (focused: boolean, touched: boolean, v: ValidationResult) =>
    touched && v.type === "error" && v.message ? "text-error"
    : touched && v.type === "success" ? "text-success"
    : focused ? "text-primary"
    : "text-outline-variant";

  const inputClasses = (focused: boolean, touched: boolean, v: ValidationResult) => {
    const base = "w-full py-3 pl-[50px] pr-12 border-2 rounded-3xl text-[15px] text-on-surface outline-none transition-all duration-300 placeholder:text-outline-variant placeholder:font-normal";
    if (touched && v.type === "error" && v.message) {
      return cx(base, "border-error bg-[#fff5f5] animate-shake-error", focused && "ring-4 ring-error/8");
    }
    if (touched && v.type === "success") {
      return cx(base, "border-success bg-[#f5fff5]", focused && "ring-4 ring-success/8");
    }
    if (focused) {
      return cx(base, "border-primary bg-surface-container-lowest ring-4 ring-primary/8");
    }
    return cx(base, "border-transparent bg-surface-container-low");
  };

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setUsernameTouched(true);
      setEmailTouched(true);
      setPasswordTouched(true);
      setConfirmTouched(true);

      if (!isFormValid) {
        if (!uv.valid) usernameRef.current?.focus();
        else if (!ev.valid) emailRef.current?.focus();
        else if (!pv.valid) passwordRef.current?.focus();
        else if (!cv.valid) confirmRef.current?.focus();
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg);
        }
        router.push("/");
      } catch (err: any) {
        alert(err.message || "Terjadi kesalahan saat mendaftar. Silakan coba lagi.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [isFormValid, uv.valid, ev.valid, pv.valid, cv.valid, username, email, password],
  );

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement("span");
    ripple.className = "absolute rounded-full bg-white/30 animate-ripple pointer-events-none";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px";
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  useEffect(() => {
    const t = setTimeout(() => usernameRef.current?.focus(), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden relative bg-background">
      {/* Left Panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-12 py-6 relative animate-slide-in-left opacity-0 max-lg:py-4 max-lg:px-6">
        <div className="w-full max-w-[420px]">
          {/* Heading */}
          <div className="animate-fade-in-up opacity-0 mb-1" style={{ animationDelay: "0.4s" }}>
            <h1 className="font-display text-[28px] font-bold text-on-surface tracking-[-0.02em] leading-[1.2] m-0 max-sm:text-[22px]">
              Buat Akun Baru
            </h1>
            <p className="text-[14px] text-on-surface-variant mt-1 m-0 leading-relaxed">
              Daftar sekarang dan mulai kelola langganan kamu dengan mudah.
            </p>
          </div>

          {/* Form */}
          <form className="mt-3 flex flex-col gap-0" onSubmit={handleSubmit} noValidate>

            {/* USERNAME */}
            <div className="animate-fade-in-up opacity-0" style={{ animationDelay: "0.45s" }}>
              <label htmlFor="register-username" className={cx("block text-[13px] font-semibold mb-1.5 tracking-[0.01em] transition-colors duration-300", labelColor(usernameFocused, usernameTouched, uv))}>
                Username
              </label>
              <div className="relative flex items-center">
                <User size={18} className={cx("absolute left-[18px] z-[1] pointer-events-none transition-all duration-300", iconColor(usernameFocused, usernameTouched, uv), usernameFocused && "scale-105")} />
                <input ref={usernameRef} id="register-username" type="text"
                  className={inputClasses(usernameFocused, usernameTouched, uv)}
                  placeholder="Masukkan username" value={username}
                  onChange={(e) => { setUsername(e.target.value); if (!usernameTouched) setUsernameTouched(true); }}
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => { setUsernameFocused(false); setUsernameTouched(true); }}
                  autoComplete="username" />
                {usernameTouched && uv.message && (
                  <div className="absolute right-4 flex items-center justify-center">
                    {uv.type === "success" ? <Check size={16} className="text-success animate-check-pop" /> : <X size={16} className="text-error animate-check-pop" />}
                  </div>
                )}
              </div>
              <div className="min-h-[20px] py-0">
                {usernameTouched && uv.message && (
                  <span className={cx("text-xs font-medium leading-[1.4] animate-fade-in-up", uv.type === "error" && "text-error", uv.type === "success" && "text-success")}>{uv.message}</span>
                )}
              </div>
            </div>

            {/* EMAIL */}
            <div className="animate-fade-in-up opacity-0" style={{ animationDelay: "0.5s" }}>
              <label htmlFor="register-email" className={cx("block text-[13px] font-semibold mb-1.5 tracking-[0.01em] transition-colors duration-300", labelColor(emailFocused, emailTouched, ev))}>
                Alamat Gmail
              </label>
              <div className="relative flex items-center">
                <Mail size={18} className={cx("absolute left-[18px] z-[1] pointer-events-none transition-all duration-300", iconColor(emailFocused, emailTouched, ev), emailFocused && "scale-105")} />
                <input ref={emailRef} id="register-email" type="email"
                  className={inputClasses(emailFocused, emailTouched, ev)}
                  placeholder="contoh@gmail.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); if (!emailTouched) setEmailTouched(true); }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => { setEmailFocused(false); setEmailTouched(true); }}
                  autoComplete="email" />
                {emailTouched && ev.message && (
                  <div className="absolute right-4 flex items-center justify-center">
                    {ev.type === "success" ? <Check size={16} className="text-success animate-check-pop" /> : ev.type === "error" ? <X size={16} className="text-error animate-check-pop" /> : null}
                  </div>
                )}
              </div>
              <div className="min-h-[20px] py-0">
                {emailTouched && ev.message && (
                  <span className={cx("text-xs font-medium leading-[1.4] animate-fade-in-up", ev.type === "error" && "text-error", ev.type === "success" && "text-success", ev.type === "hint" && "text-outline")}>{ev.message}</span>
                )}
              </div>
            </div>

            {/* PASSWORD */}
            <div className="animate-fade-in-up opacity-0" style={{ animationDelay: "0.55s" }}>
              <label htmlFor="register-password" className={cx("block text-[13px] font-semibold mb-1.5 tracking-[0.01em] transition-colors duration-300", labelColor(passwordFocused, passwordTouched, pv))}>
                Password
              </label>
              <div className="relative flex items-center">
                <Lock size={18} className={cx("absolute left-[18px] z-[1] pointer-events-none transition-all duration-300", iconColor(passwordFocused, passwordTouched, pv), passwordFocused && "scale-105")} />
                <input ref={passwordRef} id="register-password" type={showPassword ? "text" : "password"}
                  className={inputClasses(passwordFocused, passwordTouched, pv)}
                  placeholder="Masukkan password" value={password}
                  onChange={(e) => { setPassword(e.target.value); if (!passwordTouched) setPasswordTouched(true); }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => { setPasswordFocused(false); setPasswordTouched(true); }}
                  autoComplete="new-password" />
                {passwordTouched && pv.message && (
                  <div className="absolute right-12 flex items-center justify-center">
                    {pv.type === "success" ? <Check size={16} className="text-success animate-check-pop" /> : <X size={16} className="text-error animate-check-pop" />}
                  </div>
                )}
                <button type="button" className="absolute right-3.5 bg-transparent border-none p-1.5 cursor-pointer text-outline rounded-full flex items-center justify-center transition-all duration-250 hover:bg-surface-container hover:text-primary" onClick={() => setShowPassword((p) => !p)} tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="min-h-[20px] py-0">
                {passwordTouched && pv.message && (
                  <span className={cx("text-xs font-medium leading-[1.4] animate-fade-in-up", pv.type === "error" && "text-error", pv.type === "success" && "text-success")}>{pv.message}</span>
                )}
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="animate-fade-in-up opacity-0" style={{ animationDelay: "0.6s" }}>
              <label htmlFor="register-confirm" className={cx("block text-[13px] font-semibold mb-1.5 tracking-[0.01em] transition-colors duration-300", labelColor(confirmFocused, confirmTouched, cv))}>
                Konfirmasi Password
              </label>
              <div className="relative flex items-center">
                <Lock size={18} className={cx("absolute left-[18px] z-[1] pointer-events-none transition-all duration-300", iconColor(confirmFocused, confirmTouched, cv), confirmFocused && "scale-105")} />
                <input ref={confirmRef} id="register-confirm" type={showConfirmPassword ? "text" : "password"}
                  className={inputClasses(confirmFocused, confirmTouched, cv)}
                  placeholder="Ulangi password" value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (!confirmTouched) setConfirmTouched(true); }}
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => { setConfirmFocused(false); setConfirmTouched(true); }}
                  autoComplete="new-password" />
                {confirmTouched && cv.message && (
                  <div className="absolute right-12 flex items-center justify-center">
                    {cv.type === "success" ? <Check size={16} className="text-success animate-check-pop" /> : <X size={16} className="text-error animate-check-pop" />}
                  </div>
                )}
                <button type="button" className="absolute right-3.5 bg-transparent border-none p-1.5 cursor-pointer text-outline rounded-full flex items-center justify-center transition-all duration-250 hover:bg-surface-container hover:text-primary" onClick={() => setShowConfirmPassword((p) => !p)} tabIndex={-1}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="min-h-[20px] py-0">
                {confirmTouched && cv.message && (
                  <span className={cx("text-xs font-medium leading-[1.4] animate-fade-in-up", cv.type === "error" && "text-error", cv.type === "success" && "text-success")}>{cv.message}</span>
                )}
              </div>
            </div>

            {/* SUBMIT */}
            <div className="mt-2 animate-fade-in-up opacity-0" style={{ animationDelay: "0.7s" }}>
              <button type="submit" disabled={isSubmitting} onClick={handleRipple}
                className="w-full py-3.5 px-8 border-none rounded-full bg-primary text-on-primary text-[15px] font-semibold cursor-pointer relative overflow-hidden transition-all duration-300 tracking-[0.01em] hover:bg-inverse-surface hover:-translate-y-px hover:shadow-elevated active:scale-[0.98] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="flex items-center justify-center gap-2 relative z-[1]">
                  {isSubmitting ? (
                    <><span className="w-5 h-5 border-[2.5px] border-white/30 border-t-on-primary rounded-full animate-spin" />Memproses...</>
                  ) : (
                    <>Daftar Sekarang<ArrowRight size={18} /></>
                  )}
                </span>
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-4 animate-fade-in opacity-0" style={{ animationDelay: "0.8s" }}>
            <div className="flex-1 h-px bg-outline-variant/40" />
            <span className="text-xs text-outline font-medium tracking-[0.04em] uppercase">atau</span>
            <div className="flex-1 h-px bg-outline-variant/40" />
          </div>

          {/* Footer */}
          <div className="text-center animate-fade-in opacity-0" style={{ animationDelay: "0.9s" }}>
            <p className="text-sm text-on-surface-variant">
              Sudah punya akun?{" "}
              <Link href="/" className="text-primary font-semibold no-underline transition-colors duration-250 hover:text-on-surface">Masuk sekarang</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-[1.1] relative flex flex-col justify-end items-start p-12 overflow-hidden animate-slide-in-right opacity-0 max-lg:hidden">
        <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(160deg, var(--color-primary-container) 0%, var(--color-surface-container-high) 40%, var(--color-secondary-container) 80%, var(--color-tertiary-container) 100%)" }} />
        <div className="absolute w-[300px] h-[300px] -top-[50px] -right-[50px] rounded-full blur-[60px] opacity-40 bg-primary-fixed animate-morph-blob z-0" />
        <div className="absolute w-[250px] h-[250px] bottom-[100px] -left-10 rounded-full blur-[60px] opacity-40 bg-secondary-fixed animate-morph-blob z-0" style={{ animationDelay: "-4s" }} />
        <div className="absolute w-[200px] h-[200px] top-1/2 right-[20%] rounded-full blur-[60px] opacity-40 bg-tertiary-fixed animate-morph-blob z-0" style={{ animationDelay: "-8s" }} />
        <DecoDots count={16} className="top-10 left-10 grid-cols-[repeat(4,6px)]" />
        <DecoDots count={20} className="bottom-10 right-10 grid-cols-[repeat(5,6px)]" />
        <div className="absolute w-[150px] h-[150px] top-[15%] left-[10%] rounded-full border-2 border-on-surface opacity-[0.06] z-0" />
        <div className="absolute w-20 h-20 bottom-[20%] right-[15%] rounded-full border-2 border-on-surface opacity-[0.06] z-0" />
        <div className="relative z-[1] mt-9 max-w-full animate-fade-in-up opacity-0" style={{ animationDelay: "0.8s" }}>
          <blockquote className="m-0 font-display text-2xl font-semibold text-[#ffffff] leading-[1.5] tracking-[-0.01em]">
            &ldquo;Satu langkah kecil untuk daftar,<br />satu langkah besar untuk tidak lupa bayar langganan.&rdquo;
          </blockquote>
        </div>
      </div>
    </div>
  );
}