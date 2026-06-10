"use client";

import { useEffect, useState } from "react";
import { 
  User, Camera, Mail, Award, CreditCard, Smartphone, CheckCircle2, 
  BarChart2, Calendar, Settings2, Bell, Wallet, Star, Clock, Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { checkToken } from "@/helper/checkToken";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("REGULAR");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!checkToken()) {
      router.push("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("id");
        
        if (!userId) return;

        const res = await fetch(`${API_URL}/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUsername(data.username || "");
          setEmail(data.email || "");
          setUserType(data.type || "REGULAR");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("id");

      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          email
        }),
      });

      if (res.ok) {
        setMessage("Profile updated!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans selection:bg-violet-100 selection:text-violet-900 pb-12">
      <div className="w-full mx-auto px-6 md:px-12 lg:px-16 xl:px-24 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        
        {/* Compact Header */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="relative group/avatar cursor-pointer shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256" 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-50 shadow-md group-hover/avatar:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {username || "User"}
                </h1>
                {userType === "PREMIUM" && (
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold tracking-wider uppercase shadow-sm">
                    Premium
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {message && (
              <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {message}
              </span>
            )}
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 shadow-sm hover:shadow transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active</p>
              <p className="text-2xl font-extrabold text-slate-800">8</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Monthly</p>
              <p className="text-2xl font-extrabold text-slate-800">245K</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Renewal</p>
              <p className="text-2xl font-extrabold text-slate-800">2</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8">
          {/* Left Column - Forms */}
          <div className="flex flex-col gap-8 lg:col-span-8">
            
            {/* Personal Information Group */}
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                  <input
                    value={email}
                    disabled
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 bg-slate-100/50 cursor-not-allowed"
                  />
                </div>

              </div>
            </section>


          </div>

          {/* Right Column - Contextual Cards */}
          <div className="flex flex-col gap-8 lg:col-span-4">
            

            {/* Insights */}
            <section className="bg-slate-900 rounded-3xl border border-slate-800 shadow-lg p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500 opacity-20 blur-3xl rounded-full"></div>
              <div className="flex items-center gap-2 mb-6 relative z-10">
                <Star className="w-4 h-4 text-violet-400" />
                <h3 className="text-xs font-bold text-violet-200 uppercase tracking-widest">Insights</h3>
              </div>
              
              <div className="flex flex-col gap-6 relative z-10">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Favorite Category</p>
                  <p className="text-sm font-bold text-white">Entertainment</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Most Expensive</p>
                  <p className="text-sm font-bold text-white">Adobe Creative Cloud</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Next Renewal</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">Netflix</p>
                    <span className="text-[10px] font-bold text-violet-300 bg-violet-900/50 px-2 py-0.5 rounded border border-violet-700/50">12 Juni 2026</span>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
