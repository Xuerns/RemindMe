"use client";

import { checkToken } from "@/helper/checkToken";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Layers,
  CreditCard,
  ChevronDown,
  LockIcon,
} from "lucide-react";
import useCheck from "@/store/useCheck";

const API_BASE = "http://localhost:8080/api/reports";

// bentuk data laporan yang diterima dari backend
interface SubscriptionEntity {
  id: string;
  name: string;
  price: number;
  duDate: string;
  category: string;
  active: boolean;
  status: "PAID" | "UPCOMING";
}

interface ReportData {
  id: string;
  userId: string;
  month: number;
  year: number;
  generatedAt: string;
  monthlyTotal: number;
  totalAmount: number;
  summaryByCategory: Record<string, number>;
  savingsTips: string[];
  subscriptions: SubscriptionEntity[];
}

const monthsList = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

function getCurrentUserId() {
  return localStorage.getItem("id") || localStorage.getItem("userId") || "";
}

function getToken() {
  return localStorage.getItem("token") || "";
}
//fungsi nya agar Token dikirim agar backend bisa memastikan request berasal dari user yang sudah login
function getAuthHeaders() {
  const token = getToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

export default function AnalyticsPage() {
  const router = useRouter();
  const status = useCheck((state) => state.check);
  const checkPremium = useCheck((state) => state.changeStatus);

  // State Manajemen
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  // Premium Lock State
  const [analyticsLocked, setAnalyticsLocked] = useState<"REGULER" | "PREMIUM">(
    "REGULER",
  );
  const [checkingAccess, setCheckingAccess] = useState<boolean>(true);

  // CDN Chart.js Load State
  const [chartJsLoaded, setChartJsLoaded] = useState<boolean>(false);

  // Refs untuk Grafik
  const donutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const barCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const donutChartInstanceRef = useRef<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const barChartInstanceRef = useRef<any>(null);

  
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).Chart) {
        Promise.resolve().then(() => setChartJsLoaded(true));
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/chart.js";
      script.async = true;
      script.onload = () => {
        Promise.resolve().then(() => setChartJsLoaded(true));
      };
      document.body.appendChild(script);
    }
  }, []);

  // 2. Autentikasi Pengecekan Token
  useEffect(() => {
    if (!checkToken()) {
      router.push("/");
    }
    verifyPremium();
  }, [router, status]);
  // pengecekan akses analytics berdasarkan status premium atau reguler, jika tidak ada token maka akses analytics akan terkunci dan diarahkan untuk upgrade ke premium, jika ada token maka akan dicek ke backend apakah user tersebut memiliki akses analytics atau tidak, jika tidak maka akses analytics akan terkunci sesuai dengan status user (reguler atau premium)
  const checkAnalyticsAccess = useCallback(async () => {
    const userId = getCurrentUserId();
    const token = getToken();
    // kalau userId atau token tidak ada, proses akses dihentikan.
    if (!userId || !token) {
      if (status !== "PREMIUM") {
        setAnalyticsLocked("REGULER");
      } else {
        setAnalyticsLocked("PREMIUM");
      }
      // memberhentikan proses pengecekan akses analytics
      setCheckingAccess(false);
      return false;
    }
    // cek akses analytics, boleh atau tidak
    try {
      // pengambilan API
      const res = await fetch(`${API_BASE}/access?userId=${userId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      // jika pengambilan API gagal
      if (!res.ok) {
        if (status !== "PREMIUM") {
          setAnalyticsLocked("REGULER");
        } else {
          setAnalyticsLocked("PREMIUM");
        }
        //menghentikan proses akses analytics
        setCheckingAccess(false);
        return false;
      }
      // jika pengambilan AI berhasil
      if (status !== "PREMIUM") {
        setAnalyticsLocked("REGULER");
      } else {
        setAnalyticsLocked("PREMIUM");
      }
      setCheckingAccess(false);
      return true;
    } catch {
      if (status !== "PREMIUM") {
        setAnalyticsLocked("REGULER");
      } else {
        setAnalyticsLocked("PREMIUM");
      }
      setCheckingAccess(false);
      return false;
    } // bedanya try dan catch adalah try berhasil menghubungi backend dan catch gagal hubungi backend. outputnya sama yaitu stop checking akses
  }, [status]); 
  // cek apakah user premium/tidak
 const verifyPremium = async () => {
      const userId = getCurrentUserId();
      const token = getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/check`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

    const data = await res.json();
    if (data === true) {
      checkPremium("PREMIUM");
    }
  };

  // 3. Mengambil Data Laporan dari Backend
  const fetchReportData = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);

    const canAccess = await checkAnalyticsAccess();

    if (!canAccess) {
      setReportData(null);
      setLoading(false);
      return;
    }

    const userId = getCurrentUserId();

    if (!userId) {
      setReportData(null);
      setLoading(false);
      return;
    }

    const isYearly = viewMode === "yearly";
    const url = isYearly
      ? `${API_BASE}/yearly?userId=${userId}&year=${selectedYear}`
      : `${API_BASE}/monthly?userId=${userId}&month=${selectedMonth}&year=${selectedYear}`;

    try {
      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        console.warn("Gagal mengambil data dari API backend");
        setReportData(null);
        return;
      }
      // stelah backend response, akan disimpan ke state reportData
      const data: ReportData = await res.json();
      setReportData(data);
    } catch (err) {
      console.warn("Gagal mengambil data laporan:", err);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [viewMode, selectedMonth, selectedYear, checkAnalyticsAccess]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // 4. Penggambaran Donut & Bar Charts (Chart.js)
  useEffect(() => {
    if (!chartJsLoaded || !reportData || analyticsLocked !== "PREMIUM") return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ChartClass = (window as any).Chart;
    if (!ChartClass) return;

    // A. RENDER DONUT CHART (Category Breakdown)
    if (donutCanvasRef.current) {
      const ctx = donutCanvasRef.current.getContext("2d");
      if (ctx) {
        if (donutChartInstanceRef.current) {
          donutChartInstanceRef.current.destroy();
        }

        const categoryData = reportData.summaryByCategory || {};
        const labels = Object.keys(categoryData);
        const values = Object.values(categoryData);

        const donutColors = [
          "#7C3AED",
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#EC4899",
          "#8B5CF6",
        ];

        donutChartInstanceRef.current = new ChartClass(ctx, {
          type: "doughnut",
          data: {
            labels: labels.length > 0 ? labels : ["Tidak ada data"],
            datasets: [
              {
                data: values.length > 0 ? values : [0],
                backgroundColor:
                  values.length > 0
                    ? donutColors.slice(0, labels.length)
                    : ["#E5E7EB"],
                borderWidth: 3,
                borderColor: "#ffffff",
                hoverOffset: 12,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "70%",
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  padding: 20,
                  usePointStyle: true,
                  pointStyle: "circle",
                  font: {
                    family: "'Inter', sans-serif",
                    weight: 500,
                    size: 11,
                  },
                  color: "#1e293b",
                },
              },
              tooltip: {
                backgroundColor: "#0f172a",
                titleFont: {
                  family: "'Inter', sans-serif",
                  size: 13,
                  weight: "bold",
                },
                bodyFont: { family: "'Inter', sans-serif", size: 12 },
                padding: 12,
                cornerRadius: 12,
                callbacks: {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  label: function (context: any) {
                    const label = context.label || "";
                    const value = context.parsed || 0;
                    return ` ${label}: Rp ${value.toLocaleString("id-ID")}`;
                  },
                },
              },
            },
          },
        });
      }
    }

    // B. RENDER BAR CHART (Services Comparison)
    if (barCanvasRef.current) {
      const ctx = barCanvasRef.current.getContext("2d");
      if (ctx) {
        if (barChartInstanceRef.current) {
          barChartInstanceRef.current.destroy();
        }

        const subs = reportData.subscriptions || [];
        const labels = subs.map((s) => s.name);
        const values = subs.map((s) => s.price);

        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(124, 58, 237, 0.85)");
        gradient.addColorStop(1, "rgba(124, 58, 237, 0.2)");

        barChartInstanceRef.current = new ChartClass(ctx, {
          type: "bar",
          data: {
            labels: labels.length > 0 ? labels : ["Tidak ada data"],
            datasets: [
              {
                label: "Harga Langganan (Rp)",
                data: values.length > 0 ? values : [0],
                backgroundColor:
                  values.length > 0 ? gradient : "rgba(229, 231, 235, 0.5)",
                borderColor: values.length > 0 ? "#7C3AED" : "#D1D5DB",
                borderWidth: 1.5,
                borderRadius: 8,
                barThickness: 26,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                backgroundColor: "#0f172a",
                titleFont: {
                  family: "'Inter', sans-serif",
                  size: 13,
                  weight: "bold",
                },
                bodyFont: { family: "'Inter', sans-serif", size: 12 },
                padding: 12,
                cornerRadius: 12,
                callbacks: {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  label: function (context: any) {
                    return ` Harga: Rp ${context.parsed.y.toLocaleString("id-ID")}`;
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: "#f1f5f9",
                },
                ticks: {
                  font: { family: "'Inter', sans-serif", size: 10 },
                  color: "#64748b",
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  callback: function (value: any) {
                    if (value >= 1000) {
                      return value / 1000 + "k";
                    }
                    return value;
                  },
                },
              },
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  font: { family: "'Inter', sans-serif", size: 10 },
                  color: "#64748b",
                },
              },
            },
          },
        });
      }
    }

    return () => {
      if (donutChartInstanceRef.current) {
        donutChartInstanceRef.current.destroy();
      }

      if (barChartInstanceRef.current) {
        barChartInstanceRef.current.destroy();
      }
    };
  }, [chartJsLoaded, reportData, analyticsLocked]);

  const getTopCategory = () => {
    if (!reportData || !reportData.summaryByCategory) return "-";

    const data = reportData.summaryByCategory;
    let topCat = "-";
    let maxVal = 0;

    Object.entries(data).forEach(([cat, val]) => {
      if (val > maxVal) {
        maxVal = val;
        topCat = cat;
      }
    });

    return topCat;
  };

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        minHeight: "100vh",
        background: "#F8F9FF",
        padding: "36px 40px",
        color: "#0D1C2E",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className={
          analyticsLocked !== "PREMIUM" && !checkingAccess
            ? "pointer-events-none select-none blur-sm transition duration-300"
            : "transition duration-300"
        }
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Header Dashboard */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-[32px] font-extrabold tracking-tight m-0 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-violet-600 animate-pulse" />
              Analytics Insight
            </h1>
            <p className="text-slate-500 mt-2 text-sm max-w-lg m-0">
              Analisis portofolio keuangan dan visualisasi langganan digital
              Anda dalam satu laporan terpadu yang memukau.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex">
              <button
                onClick={() => setViewMode("monthly")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  viewMode === "monthly"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Bulanan
              </button>
              <button
                onClick={() => setViewMode("yearly")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  viewMode === "yearly"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Tahunan
              </button>
            </div>

            {viewMode === "monthly" && (
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="appearance-none bg-white border border-slate-200 rounded-2xl px-4 py-2.5 pr-10 text-xs font-semibold text-slate-700 shadow-sm outline-none cursor-pointer hover:border-violet-300 transition"
                >
                  {monthsList.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="appearance-none bg-white border border-slate-200 rounded-2xl px-4 py-2.5 pr-10 text-xs font-semibold text-slate-700 shadow-sm outline-none cursor-pointer hover:border-violet-300 transition"
              >
                {[2025, 2026, 2027].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center gap-5 hover:translate-y-[-4px] hover:shadow-md transition-all duration-300 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold tracking-wider uppercase block">
                Total Pengeluaran
              </span>
              <span className="font-display text-2xl font-extrabold text-slate-800 mt-1 block">
                Rp{" "}
                {reportData
                  ? Number(reportData.monthlyTotal).toLocaleString("id-ID")
                  : 0}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                Periode: {viewMode === "monthly" ? "Per Bulan" : "Per Tahun"}
              </span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50/50 rounded-full blur-2xl -z-10" />
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center gap-5 hover:translate-y-[-4px] hover:shadow-md transition-all duration-300 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold tracking-wider uppercase block">
                Layanan Aktif
              </span>
              <span className="font-display text-2xl font-extrabold text-slate-800 mt-1 block">
                {reportData?.subscriptions
                  ? reportData.subscriptions.length
                  : 0}{" "}
                Subscriptions
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                Optimized & Tracked
              </span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-full blur-2xl -z-10" />
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center gap-5 hover:translate-y-[-4px] hover:shadow-md transition-all duration-300 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold tracking-wider uppercase block">
                Kategori Terbesar
              </span>
              <span className="font-display text-2xl font-extrabold text-slate-800 mt-1 block">
                {getTopCategory()}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                Kontribusi biaya tertinggi
              </span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/50 rounded-full blur-2xl -z-10" />
          </div>
        </div>

        {/* Main Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm lg:col-span-5 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-800 m-0">
                Kategori Breakdown
              </h3>
              <p className="text-slate-400 text-xs mt-1 mb-6 m-0">
                Persentase pengeluaran langganan Anda berdasarkan kategori
                pelayanan.
              </p>
            </div>
            <div className="relative h-64 w-full flex items-center justify-center">
              {loading ? (
                <div className="text-slate-400 text-sm">
                  Menyusun bagan kategori...
                </div>
              ) : (
                <canvas ref={donutCanvasRef} />
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm lg:col-span-7 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-800 m-0">
                Skala Perbandingan Harga
              </h3>
              <p className="text-slate-400 text-xs mt-1 mb-6 m-0">
                Perbandingan kontribusi pengeluaran tiap-tiap layanan langganan
                secara individual.
              </p>
            </div>
            <div className="relative h-64 w-full flex items-center justify-center">
              {loading ? (
                <div className="text-slate-400 text-sm">
                  Menyusun skala perbandingan...
                </div>
              ) : (
                <canvas ref={barCanvasRef} />
              )}
            </div>
          </div>
        </div>

        {/* Tips Menghemat & Ringkasan Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm lg:col-span-4 flex flex-col relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-violet-600 animate-bounce" />
              <h3 className="font-display text-lg font-bold text-slate-800 m-0">
                Tips Menghemat Cerdas
              </h3>
            </div>
            <p className="text-slate-400 text-xs mb-4 m-0 leading-relaxed">
              AI-like tips otomatis yang didesain secara adaptif berdasarkan
              analisis pengeluaran periode ini:
            </p>

            <div className="flex-1 flex flex-col gap-3 justify-center">
              {loading ? (
                <div className="text-slate-400 text-xs">
                  Menganalisis langganan Anda...
                </div>
              ) : reportData?.savingsTips &&
                reportData.savingsTips.length > 0 ? (
                reportData.savingsTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-violet-50/50 border border-violet-100 rounded-2xl flex items-start gap-2.5 text-xs text-violet-950 leading-relaxed font-medium"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-600 mt-1.5 shrink-0" />
                    <div>{tip}</div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-xs text-center py-6">
                  Tidak ada tips untuk periode saat ini.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm lg:col-span-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-800 m-0">
                  Layanan Kontributor
                </h3>
                <p className="text-slate-400 text-xs mt-1 m-0">
                  Layanan aktif yang berkontribusi pada neraca pengeluaran
                  periode ini.
                </p>
              </div>
              <span className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-[10px] font-bold tracking-wider uppercase">
                {reportData?.subscriptions
                  ? reportData.subscriptions.length
                  : 0}{" "}
                Layanan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Nama Layanan", "Kategori", "Billing Date", "Harga"].map(
                      (col) => (
                        <th
                          key={col}
                          className="pb-3 text-slate-400 font-bold uppercase tracking-wider text-[10px]"
                        >
                          {col}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-slate-400"
                      >
                        Memuat rincian layanan...
                      </td>
                    </tr>
                  ) : !reportData?.subscriptions ||
                    reportData.subscriptions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-slate-400"
                      >
                        Tidak ada kontributor layanan pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    reportData.subscriptions.map((sub) => (
                      <tr
                        key={sub.id}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition"
                      >
                        <td className="py-3 font-semibold text-slate-800">
                          {sub.name}
                        </td>
                        <td className="py-3">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium text-[10px]">
                            {sub.category}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500">
                          {sub.duDate
                            ? new Date(sub.duDate).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                        <td className="py-3 font-bold text-slate-800">
                          Rp {Number(sub.price).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {analyticsLocked !== "PREMIUM" && !checkingAccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/45 backdrop-blur-[2px]">
          <div className="mx-4 max-w-md rounded-[28px] border border-slate-100 bg-white p-10 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-4xl">
              <LockIcon size={32}/>
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900">
              Analytics Khusus Premium
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              Upgrade ke Premium untuk membuka grafik pengeluaran, ringkasan
              kategori, insight penghematan, dan export report.
            </p>

            <button
              onClick={() => router.push("/upgrade")}
              className="mt-8 w-full rounded-2xl bg-slate-700 px-6 py-3 text-sm font-bold text-white shadow-md shadow-slate-200 hover:bg-slate-800 transition"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
