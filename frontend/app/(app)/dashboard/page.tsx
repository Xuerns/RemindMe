"use client";

import { checkToken } from "@/helper/checkToken";
import useCheck from "@/store/useCheck";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Subscription {
  id: string;
  name: string;
  price: number;
  duDate: string;
  category: string;
  isActive?: boolean;
  active?: boolean;
  status: "PAID" | "UPCOMING";
  period: string;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const changePremiumStatus = useCheck((state) => state.changeStatus);
  const userStatus = useCheck((state) => state.check);

  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [dueSoonList, setDueSoonList] = useState<Subscription[]>([]);
  const [upcomingTotal, setUpcomingTotal] = useState(0);
  const [yearlyTotal, setYearlyTotal] = useState(0);
  const [greeting, setGreeting] = useState("Selamat datang");
  const [tipOfTheDay, setTipOfTheDay] = useState("");

  const financialTips = [
    "Tinjau kembali langganan Anda secara berkala untuk menghindari biaya layanan yang tidak digunakan.",
    "Kelompokkan langganan Anda berdasarkan kategori untuk mempermudah pemantauan anggaran bulanan.",
    "Bayar tagihan langganan tepat waktu untuk memastikan kelancaran aktivitas harian Anda.",
    "Gunakan pengingat otomatis agar Anda selalu siap sebelum dana rekening terpotong otomatis.",
    "Pertimbangkan paket keluarga jika Anda menggunakan layanan berbayar yang sama bersama kerabat.",
    "Nonaktifkan opsi perpanjangan otomatis jika Anda hanya ingin mencoba layanan baru selama satu bulan.",
  ];

  // Generate dynamic greeting based on current local time & select financial tip based on day of month
  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 11) {
      setGreeting("Selamat pagi");
    } else if (currentHour >= 11 && currentHour < 15) {
      setGreeting("Selamat siang");
    } else if (currentHour >= 15 && currentHour < 18) {
      setGreeting("Selamat sore");
    } else {
      setGreeting("Selamat malam");
    }

    const currentDay = new Date().getDate();
    const selectedTip = financialTips[currentDay % financialTips.length];
    setTipOfTheDay(selectedTip);
  }, []);

  // Fetch dashboard overview data
  useEffect(() => {
    if (!checkToken()) {
      router.push("/");
      return;
    }

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("id");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!token || !userId || !apiUrl) {
      setIsLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Verify Premium Status
        const premiumRes = await fetch(`${apiUrl}/api/users/${userId}/check`, {
          headers,
        });
        if (premiumRes.ok) {
          const isUserPremium = await premiumRes.json();
          changePremiumStatus(isUserPremium ? "PREMIUM" : "REGULAR");
        }

        // 2. Fetch User Profile
        const profileRes = await fetch(`${apiUrl}/api/users/${userId}`, {
          headers,
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserProfile(profileData);
        }

        // 3. Fetch Monthly Total
        const totalRes = await fetch(
          `${apiUrl}/api/subscriptions/user/${userId}/total-monthly`,
          { headers },
        );
        if (totalRes.ok) {
          const totalVal = await totalRes.json();
          setMonthlyTotal(totalVal || 0);
        }

        // 4. Fetch Subscriptions
        const subsRes = await fetch(
          `${apiUrl}/api/subscriptions/user/${userId}`,
          { headers },
        );
        if (subsRes.ok) {
          const subsData: Subscription[] = await subsRes.json();

          // Calculate active subscriptions count dynamically
          const activeSubs = subsData.filter(
            (sub) => sub.isActive !== false && sub.active !== false,
          );
          setActiveCount(activeSubs.length);

          // Filter and sort for Due Soon (UPCOMING active subscriptions)
          const upcomingList = subsData
            .filter(
              (sub) =>
                sub.isActive !== false &&
                sub.active !== false &&
                sub.status === "UPCOMING",
            )
            .sort(
              (a, b) =>
                new Date(a.duDate).getTime() - new Date(b.duDate).getTime(),
            );
          setDueSoonList(upcomingList);

          // Calculate upcoming total price
          const totalUpcoming = upcomingList.reduce(
            (sum, sub) => sum + sub.price,
            0,
          );
          setUpcomingTotal(totalUpcoming);

          // Calculate yearly total projection for all active subscriptions
          const totalYearly = subsData
            .filter((sub) => sub.isActive !== false && sub.active !== false)
            .reduce((sum, sub) => {
              let annualPrice = 0;
              switch (sub.period) {
                case "ONE_MINUTE": // Daily (1 Days)
                  annualPrice = sub.price * 365;
                  break;
                case "ONE_MONTH":
                  annualPrice = sub.price * 12;
                  break;
                case "THREE_MONTH":
                  annualPrice = sub.price * 4;
                  break;
                case "SIX_MONTH":
                  annualPrice = sub.price * 2;
                  break;
                case "TWELVE_MONTH":
                  annualPrice = sub.price * 1;
                  break;
                default:
                  annualPrice = sub.price * 12;
              }
              return sum + annualPrice;
            }, 0);
          setYearlyTotal(totalYearly);
        }
      } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [changePremiumStatus, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysRemainingText = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Besok";
    if (diffDays < 0) return `Terlewat ${Math.abs(diffDays)} hari`;
    return `${diffDays} hari lagi`;
  };

  const getDaysRemainingColor = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return "text-red-600 bg-red-50 border-red-100";
    if (diffDays <= 3) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-indigo-600 bg-indigo-50 border-indigo-100";
  };

  const getCategoryColor = (category: string): { bg: string; text: string } => {
    const colors: Record<string, { bg: string; text: string }> = {
      Music: { bg: "bg-emerald-100", text: "text-emerald-700" },
      Entertainment: { bg: "bg-pink-100", text: "text-pink-700" },
      Productivity: { bg: "bg-indigo-100", text: "text-indigo-700" },
      Creative: { bg: "bg-amber-100", text: "text-amber-700" },
      Design: { bg: "bg-rose-100", text: "text-rose-700" },
      Storage: { bg: "bg-blue-100", text: "text-blue-700" },
      Development: { bg: "bg-violet-100", text: "text-violet-700" },
    };
    return colors[category] ?? { bg: "bg-slate-100", text: "text-slate-600" };
  };

  const getUrgencyConfig = (
    dueDateStr: string,
  ): { barColor: string; barWidth: string; dotColor: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays <= 0)
      return {
        barColor: "bg-red-500",
        barWidth: "w-full",
        dotColor: "bg-red-500",
      };
    if (diffDays <= 1)
      return {
        barColor: "bg-red-400",
        barWidth: "w-[90%]",
        dotColor: "bg-red-400",
      };
    if (diffDays <= 3)
      return {
        barColor: "bg-amber-400",
        barWidth: "w-[60%]",
        dotColor: "bg-amber-400",
      };
    if (diffDays <= 7)
      return {
        barColor: "bg-indigo-400",
        barWidth: "w-[35%]",
        dotColor: "bg-indigo-400",
      };
    return {
      barColor: "bg-slate-300",
      barWidth: "w-[15%]",
      dotColor: "bg-slate-300",
    };
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fbf9f9]">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="h-10 w-10 animate-spin text-[#6366F1]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-sm font-medium text-[#43474a]">
            Memuat dasbor...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f9] p-6 md:p-8 text-[#1b1c1c]">
      {/* 1. Header Greeting Section */}
      <div className="mb-5">
        <div className="flex items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1b1c1c] md:text-3xl">
              {greeting}, {userProfile?.username || "Pengguna"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#43474a] md:text-base">
              {tipOfTheDay}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Overview Spends Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Spend Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md">
          <div className="flex items-center gap-4">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-violet-400 group-hover:opacity-[0.70] cursor-pointer">
                Total Pengeluaran Bulan Ini
              </span>
              <span className="mt-1 block text-md font-extrabold text-slate-800">
                {formatCurrency(monthlyTotal)}
              </span>
            </div>
          </div>
          {/* Watermark SVG */}
          <div className="pointer-events-none absolute bottom-[-16px] right-[-16px] text-violet-400 opacity-[0.09]">
            <svg
              className="h-28 w-28"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>

        {/* Upcoming Spends Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md">
          <div className="flex items-center gap-4">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-amber-400 group-hover:opacity-[0.70] cursor-pointer">
                Total Tagihan Segera
              </span>
              <span className="mt-1 block text-md font-extrabold text-slate-800">
                {formatCurrency(upcomingTotal)}
              </span>
            </div>
          </div>
          {/* Watermark SVG */}
          <div className="pointer-events-none absolute bottom-[-16px] right-[-16px] text-amber-400 opacity-[0.09]">
            <svg
              className="h-28 w-28"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Yearly Projection Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md">
          <div className="flex items-center gap-4">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-400 group-hover:opacity-[0.70] cursor-pointer">
                Proyeksi Setahun
              </span>
              <span className="mt-1 block text-md font-extrabold text-slate-800">
                {formatCurrency(yearlyTotal)}
              </span>
            </div>
          </div>
          {/* Watermark SVG */}
          <div className="pointer-events-none absolute bottom-[-16px] right-[-16px] text-emerald-400 opacity-[0.09]">
            <svg
              className="h-28 w-28"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
        </div>

        {/* Active Subscriptions Count Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md">
          <div className="flex items-center gap-4">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-500 group-hover:opacity-[0.70] cursor-pointer">
                Jumlah Langganan Aktif
              </span>
              <span className="mt-1 block text-md font-extrabold text-slate-800">
                {activeCount} Layanan
              </span>
            </div>
          </div>
          {/* Watermark SVG */}
          <div className="pointer-events-none absolute bottom-[-26px] right-[-20px] text-blue-500 opacity-[0.09]">
            <svg
              className="h-28 w-28"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Upcoming Bills (75%) & Premium Promo/Status (25%) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Upcoming Bills List (75% / col-span-9) */}
        <div className="rounded-2xl border border-[#efedee] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] lg:col-span-9">
          {/* Section Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-50 p-2 text-[#6366F1]">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-[#1b1c1c]">
                  Waktu Jatuh Tempo
                </h3>
                <p className="text-xs text-[#43474a]">
                  {dueSoonList.length > 0
                    ? `${dueSoonList.length} tagihan menunggu pembayaran`
                    : "Semua tagihan beres"}
                </p>
              </div>
            </div>
            {dueSoonList.length > 0 && (
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-[#6366F1]">
                {dueSoonList.length} tagihan
              </span>
            )}
          </div>

          {dueSoonList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="rounded-full bg-emerald-50 p-4 text-emerald-500">
                <svg
                  className="h-10 w-10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="mt-3 text-sm font-semibold text-[#1b1c1c]">
                Semua beres!
              </p>
              <p className="mt-1 text-xs text-[#43474a]">
                Tidak ada tagihan yang akan jatuh tempo dalam waktu dekat.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dueSoonList.slice(0, 5).map((subscription) => {
                const catColor = getCategoryColor(subscription.category);
                const urgency = getUrgencyConfig(subscription.duDate);
                const daysText = getDaysRemainingText(subscription.duDate);
                const badgeColor = getDaysRemainingColor(subscription.duDate);
                return (
                  <div
                    key={subscription.id}
                    className="group rounded-xl border border-[#efedee] bg-[#fafafa] p-4 transition-all duration-200 hover:border-indigo-100 hover:bg-white hover:shadow-[0_4px_16px_rgba(99,102,241,0.06)]"
                  >
                    <div className="flex items-center gap-4">
                      {/* Category-colored avatar */}
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold uppercase ${catColor.bg} ${catColor.text}`}
                      >
                        {subscription.name.slice(0, 2)}
                      </div>

                      {/* Name, category, urgency bar */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="truncate font-semibold text-[#1b1c1c]">
                            {subscription.name}
                          </h4>
                          <span className="shrink-0 font-bold text-[#1b1c1c]">
                            {formatCurrency(subscription.price)}
                          </span>
                        </div>

                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${catColor.bg} ${catColor.text}`}
                          >
                            {subscription.category || "Lainnya"}
                          </span>
                          <span
                            className={`rounded-lg border px-3 py-0.5 text-xs font-semibold ${badgeColor}`}
                          >
                            {daysText}
                          </span>
                        </div>

                        {/* Urgency bar */}
                        <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${urgency.barColor} ${urgency.barWidth}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Premium Banner (25% / col-span-3) */}
        <div className="lg:col-span-3">
          {userStatus === "PREMIUM" ? (
            /* Premium Banner Content */
            <div className="flex h-full min-h-[280px] flex-col justify-between rounded-2xl border border-[#43474a] bg-gradient-to-br from-[#1b1c1c] to-[#303031] p-6 text-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
              <div>
                <div className="mb-4 inline-block rounded-xl bg-amber-400/10 p-3 text-amber-400">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
                  RemindMe Premium
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-300">
                  Semua fitur analisis pengeluaran penuh dan ekspor laporan PDF
                  bulanan aktif sepenuhnya.
                </p>
              </div>
              <div className="mt-6">
                <div className="w-full rounded-lg border border-amber-400/20 bg-amber-400/10 py-2.5 text-center text-xs font-semibold tracking-wider text-amber-300 uppercase">
                  Premium Aktif
                </div>
              </div>
            </div>
          ) : (
            /* Regular Promo Banner Content */
            <div className="flex h-full min-h-[280px] flex-col justify-between rounded-2xl border border-[#cfc2d2] bg-gradient-to-br from-[#F3E5F5] to-[#ecdeee] p-6 shadow-[0_10px_30px_rgba(99,102,241,0.02)]">
              <div>
                <div className="mb-4 inline-block rounded-xl bg-white/60 p-3 text-[#6366F1]">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-[#6b616e]">
                  Upgrade Premium
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-[#655b68]">
                  Buka fitur visualisasi analisis pengeluaran mendalam dan
                  ekspor laporan PDF bulanan Anda sekarang.
                </p>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => router.push("/upgrade")}
                  className="w-full cursor-pointer bg-[#6366F1] py-2.5 text-center text-xs font-semibold tracking-wider text-white uppercase rounded-lg shadow-sm hover:bg-[#5053db] transition-all duration-200"
                >
                  Upgrade Sekarang
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
