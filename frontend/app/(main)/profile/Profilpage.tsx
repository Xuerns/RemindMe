"use client";

import { useState } from "react";
import {
  User,
  Shield,
  AlignLeft,
  Bell,
  Smartphone,
  LogIn,
  RotateCcw,
  KeyRound,
  PlusCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Camera,
  AlertTriangle,
} from "lucide-react";

const activityItems = [
  {
    icon: LogIn,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    title: "Logged in from San Francisco",
    meta: "2 hours ago • Chrome on MacOS",
  },
  {
    icon: RotateCcw,
    iconColor: "text-green-500",
    iconBg: "bg-green-50",
    title: "Subscription renewed",
    meta: "Yesterday • Spotify Premium",
  },
  {
    icon: KeyRound,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50",
    title: "Password updated",
    meta: "Oct 12, 2025 • System Security",
  },
  {
    icon: PlusCircle,
    iconColor: "text-violet-500",
    iconBg: "bg-violet-50",
    title: "New subscription added",
    meta: "Oct 05, 2025 • Netflix 8K",
  },
];

function PasswordInput({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          defaultValue={placeholder}
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition pr-10"
        />
        <button
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      {/* Top bar */}
      <header className="h-12 bg-white border-b border-slate-100 flex items-center px-6 gap-2 sticky top-0 z-10">
        <div className="flex-1">
          <div className="w-64 h-8 rounded-lg bg-slate-100 flex items-center px-3 gap-2">
            <span className="text-xs text-slate-400">Search settings…</span>
          </div>
        </div>
        <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-violet-50 hover:text-violet-600 transition">
          <Bell className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 ml-2">
          <img
            src="https://i.pravatar.cc/32?img=5"
            alt="Alex Rivera"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-200"
          />
          <span className="text-sm font-semibold text-slate-700">Alex Rivera</span>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-[1fr_280px] gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-5">
          {/* Page title */}
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Profile</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your account information, security settings, and view your recent activity
              within the RemindMe ecosystem.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end -mt-12">
            <button className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition shadow-sm">
              Discard Changes
            </button>
            <button className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-violet-700 transition shadow-sm">
              Save Updates
            </button>
          </div>

          {/* Personal Information */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-4 h-4 text-violet-500" />
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                Personal Information
              </h2>
            </div>

            <div className="flex gap-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src="https://i.pravatar.cc/80?img=5"
                  alt="Alex Rivera"
                  className="w-20 h-20 rounded-xl object-cover ring-2 ring-slate-100"
                />
                <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center shadow">
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>

              {/* Fields */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Full Name
                  </label>
                  <input
                    defaultValue="Alex Rivera"
                    className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Email Address
                  </label>
                  <input
                    defaultValue="alex.rivera@example"
                    className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Phone Number
                  </label>
                  <input
                    defaultValue="+1 (555) 000-0000"
                    className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Timezone
                  </label>
                  <select className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition appearance-none">
                    <option>Pacific Time (PT)</option>
                    <option>Eastern Time (ET)</option>
                    <option>UTC</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Shield className="w-4 h-4 text-violet-500" />
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                Security
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <PasswordInput label="Current Password" placeholder="••••••••••" />
              <PasswordInput label="New Password" placeholder="••••••••••" />
              <PasswordInput label="Confirm Password" placeholder="••••••••" />
            </div>
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-bold text-slate-400">i</span>
              Password must be at least 12 characters and include a special character.
            </p>
          </section>

          {/* Account Preferences */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <AlignLeft className="w-4 h-4 text-violet-500" />
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                Account Preferences
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Email Notifications</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Receive weekly summaries of your subscriptions
                  </p>
                </div>
                <button
                  onClick={() => setEmailNotif(!emailNotif)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                    emailNotif ? "bg-violet-500" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                      emailNotif ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Two-Factor */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button className="px-4 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:border-violet-300 hover:text-violet-700 transition">
                  Enable
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5">
          {/* Activity History */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4">
              Activity History
            </h2>
            <div className="flex flex-col gap-3">
              {activityItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                  >
                    <item.icon className={`w-3.5 h-3.5 ${item.iconColor}`} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 leading-snug">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.meta}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-xs text-violet-600 font-semibold hover:text-violet-800 flex items-center gap-1 transition">
              View All Activity <ChevronRight className="w-3 h-3" />
            </button>
          </section>

          {/* Danger Zone */}
          <section className="bg-white rounded-xl border border-red-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-bold text-red-500 uppercase tracking-widest">
                Danger Zone
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Once you delete your account, there is no going back. Please be certain. All
              subscription tracking and history will be permanently erased.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition shadow-sm shadow-red-100"
            >
              Delete Account
            </button>
          </section>

          {/* Need Help */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-4 h-4 text-violet-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Need help?</p>
              <button className="text-xs text-violet-600 font-medium hover:text-violet-800 transition">
                Contact RemindMe Support
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Delete Account</h3>
            </div>
            <p className="text-sm text-slate-500 mb-5">
              This action is permanent and cannot be undone. All your data will be erased.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}