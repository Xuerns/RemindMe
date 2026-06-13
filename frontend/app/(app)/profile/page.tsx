"use client";

import { useEffect, useState, useRef } from "react";
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
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [premiumExpiryDate, setPremiumExpiryDate] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!checkToken()) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("id");
        
        if (!userId) return;

        // Fetch Profile
        const resUser = await fetch(`${API_URL}/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (resUser.ok) {
          const data = await resUser.json();
          setUsername(data.username || "");
          setEmail(data.email || "");
          setUserType(data.type || "REGULAR");
          setProfilePicture(data.profilePicture || null);
          setPremiumExpiryDate(data.premiumExpiryDate || null);
        }

        // Fetch Subscriptions
        const resSubs = await fetch(`${API_URL}/api/subscriptions/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (resSubs.ok) {
          const data = await resSubs.json();
          setSubscriptions(data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
          email,
          type: userType,
          profilePicture
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

  // Dynamic Calculations
  const activeSubs = subscriptions.filter(s => s.isActive !== false && s.active !== false);
  const activeCount = activeSubs.length;
  
  const monthlyCost = activeSubs.reduce((sum, s) => sum + Number(s.price), 0);
  
  const renewalCount = subscriptions.filter(s => (s.isActive !== false && s.active !== false) && s.status === "UPCOMING").length;

  // Favorite Category calculation based on frequency
  const categoryCounts: Record<string, number> = {};
  activeSubs.forEach(s => {
    if (s.category) {
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    }
  });
  let favoriteCategory = "-";
  let maxCount = 0;
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      favoriteCategory = cat;
    }
  }

  // Most Expensive calculation
  let mostExpensiveSub = null;
  if (activeSubs.length > 0) {
    mostExpensiveSub = activeSubs.reduce((max, s) => Number(s.price) > Number(max.price) ? s : max, activeSubs[0]);
  }
  const mostExpensiveText = mostExpensiveSub 
    ? `${mostExpensiveSub.name} (Rp ${Number(mostExpensiveSub.price).toLocaleString("id-ID")})`
    : "-";

  // Next Renewal calculation
  let nextRenewalSub = null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const futureSubs = activeSubs.filter(s => s.duDate && new Date(s.duDate) >= now);
  if (futureSubs.length > 0) {
    nextRenewalSub = futureSubs.reduce((closest, s) => {
      return new Date(s.duDate) < new Date(closest.duDate) ? s : closest;
    }, futureSubs[0]);
  } else if (activeSubs.length > 0) {
    nextRenewalSub = activeSubs.reduce((closest, s) => {
      return new Date(s.duDate) < new Date(closest.duDate) ? s : closest;
    }, activeSubs[0]);
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans selection:bg-primary-container selection:text-primary pb-12">
      <div className="w-full mx-auto px-6 md:px-12 lg:px-16 xl:px-24 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        
        {/* Compact Header */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div 
              onClick={handleAvatarClick}
              className="relative group/avatar cursor-pointer shrink-0"
            >
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-50 shadow-md group-hover/avatar:opacity-90 transition-opacity"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center ring-4 ring-slate-50 shadow-md group-hover/avatar:opacity-90 transition-opacity text-slate-400">
                  <User className="w-10 h-10" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />
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
              className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 shadow-sm hover:shadow transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        <div className={`grid grid-cols-1 ${userType === "PREMIUM" ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-4 mb-8`}>
          {userType === "PREMIUM" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Masa Aktif</p>
                <p className="text-base font-extrabold text-slate-800">
                  {premiumExpiryDate ? formatDate(premiumExpiryDate) : "-"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Monthly</p>
              <p className="text-2xl font-extrabold text-slate-800">
                Rp {monthlyCost.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Renewal</p>
              <p className="text-2xl font-extrabold text-slate-800">{renewalCount}</p>
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
                <div className="p-2 rounded-lg bg-primary-container text-primary">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                  <input
                    value={username}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^[a-zA-Z\s]*$/.test(val)) {
                        setUsername(val);
                      }
                    }}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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

            {/* Upgrade Banner for REGULAR users */}
            {userType === "REGULAR" && (
              <section className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent rounded-3xl border border-amber-500/20 shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-amber-500 text-white shrink-0 shadow-md shadow-amber-500/20">
                    <Zap className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Upgrade ke Premium</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      Buka semua fitur premium untuk mengelola keuangan dan langganan Anda secara tak terbatas:
                    </p>
                    <ul className="text-[11px] text-slate-600 font-medium mt-3 space-y-1.5 list-disc list-inside">
                      <li>Langganan tanpa batas (Regular maks. 5)</li>
                      <li>Grafik analisis & laporan mendalam</li>
                      <li>Ekspor laporan pengeluaran bulanan</li>
                    </ul>
                    <button 
                      onClick={() => router.push("/upgrade")}
                      className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition-all duration-200 cursor-pointer"
                    >
                      Upgrade Sekarang
                    </button>
                  </div>
                </div>
              </section>
            )}

          </div>

          {/* Right Column - Contextual Cards */}
          <div className="flex flex-col gap-8 lg:col-span-4">
            
            {/* Insights */}
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary-container text-primary">
                  <Star className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Insights</h2>
              </div>
              
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Favorite Category</p>
                  <p className="text-base font-extrabold text-slate-800">{favoriteCategory}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Most Expensive</p>
                  <p className="text-base font-extrabold text-slate-800">{mostExpensiveText}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Next Renewal</p>
                  {nextRenewalSub ? (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-base font-extrabold text-slate-800">{nextRenewalSub.name}</p>
                      <span className="text-[10px] font-bold text-primary bg-primary-container px-2 py-0.5 rounded border border-primary-container">
                        {formatDate(nextRenewalSub.duDate)}
                      </span>
                    </div>
                  ) : (
                    <p className="text-base font-extrabold text-slate-800">-</p>
                  )}
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
