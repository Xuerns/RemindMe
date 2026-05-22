import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RemindMe — Masuk",
  description:
    "Sign in to RemindMe, your serene productivity companion. Manage reminders with calm and clarity.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
