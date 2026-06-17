"use client";
import { useState, useEffect, ChangeEvent, useRef } from "react";
import { Pencil, Trash2 } from "lucide-react";

interface CategoryStyle {
  bg: string;
  color: string;
}

const categoryColors: Record<string, CategoryStyle> = {
  Creative: { bg: "#FEF3C7", color: "#92400E" },
  Productivity: { bg: "#E0E7FF", color: "#3730A3" },
  Entertainment: { bg: "#FCE7F3", color: "#9D174D" },
  Music: { bg: "#D1FAE5", color: "#065F46" },
  Design: { bg: "#FEE2E2", color: "#991B1B" },
  Storage: { bg: "#DBEAFE", color: "#1E40AF" },
  Development: { bg: "#F3E8FF", color: "#6B21A8" },
};

const periodLabel: Record<string, string> = {
  ONE_MINUTE: "1 Days",
  ONE_MONTH: "1 Month",
  THREE_MONTH: "3 Month",
  SIX_MONTH: "6 Month",
  TWELVE_MONTH: "12 Month",
};

function getCategoryStyle(cat: string): CategoryStyle {
  return categoryColors[cat] || { bg: "#F3F4F6", color: "#374151" };
}

function computeStatus(duDate: string): "PAID" | "UPCOMING" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(duDate);
  due.setHours(0, 0, 0, 0);
  return due <= today ? "PAID" : "UPCOMING";
}

interface SubscriptionEntity {
  id: string;
  name: string;
  price: number;
  duDate: string;
  category: string;
  isActive?: boolean;
  active?: boolean;
  status: "PAID" | "UPCOMING";
  period: "ONE_MINUTE" | "ONE_MONTH" | "THREE_MONTH" | "SIX_MONTH" | "TWELVE_MONTH";
}

function AppIcon({ name }: { name: string }) {
  const colors = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  return (
    <div style={{ width: 38, height: 38, borderRadius: 10, background: colors[idx], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#fff", flexShrink: 0, fontFamily: "'DM Sans',sans-serif" }}>
      {name ? name[0].toUpperCase() : "?"}
    </div>
  );
}

function TopCard({ sub }: { sub: SubscriptionEntity }) {
  const isPaid = sub.status === "PAID";
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1px solid #F1F0F5", flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <AppIcon name={sub.name} />
        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, letterSpacing: 0.5, background: isPaid ? "#D1FAE5" : "#FEF3C7", color: isPaid ? "#065F46" : "#92400E" }}>
          {isPaid ? "PAID" : "UPCOMING"}
        </span>
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 17, color: "#1A1523", marginBottom: 2, fontFamily: "'DM Sans',sans-serif" }}>{sub.name}</div>
        <div style={{ fontSize: 12, color: "#9CA3AF" }}>
          Renewing on {sub.duDate ? new Date(sub.duDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "-"}
        </div>
      </div>
      <div style={{ fontWeight: 800, fontSize: 22, color: "#1A1523", fontFamily: "'DM Sans',sans-serif" }}>
        Rp {Number(sub.price).toLocaleString("id-ID")}
        <span style={{ fontWeight: 400, fontSize: 13, color: "#9CA3AF" }}> /{sub.period ? periodLabel[sub.period] : "month"}</span>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 14, outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" };
const selectStyle: React.CSSProperties = { ...inputStyle, background: "#fff", cursor: "pointer" };

export default function SubscriptionPage() {
  const [topSubs, setTopSubs] = useState<SubscriptionEntity[]>([]);
  const [allSubs, setAllSubs] = useState<SubscriptionEntity[]>([]);
  const [totalMonthly, setTotalMonthly] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPeriod, setFilterPeriod] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
  const [filterHover, setFilterHover] = useState<"status" | "period" | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 3;

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addForm, setAddForm] = useState({ name: "", category: "", duDate: "", price: "", period: "THREE_MONTH" as "ONE_MINUTE" | "ONE_MONTH" | "THREE_MONTH" | "SIX_MONTH" | "TWELVE_MONTH" });
  const [addLoading, setAddLoading] = useState<boolean>(false);
  const [addError, setAddError] = useState<string>("");

  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({ id: "", name: "", category: "", duDate: "", price: "", period: "THREE_MONTH" as "ONE_MINUTE" | "ONE_MONTH" | "THREE_MONTH" | "SIX_MONTH" | "TWELVE_MONTH", isActive: true });
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [editError, setEditError] = useState<string>("");

  const [userType, setUserType] = useState<string>("");
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  async function fetchAll(): Promise<void> {
    setLoading(true);
    const USER_ID = localStorage.getItem("id");
    const token = localStorage.getItem("token");
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);  // ← tambahkan
    console.log("USER_ID:", USER_ID);                           // ← tambahkan
    console.log("token:", token);
    try {
      const [top3Res, allRes, totalRes, countRes, userRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/user/${USER_ID}/top3`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/user/${USER_ID}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/user/${USER_ID}/total-monthly`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/user/${USER_ID}/count`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${USER_ID}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const top3: SubscriptionEntity[] = top3Res.ok ? await top3Res.json() : [];
      const all: SubscriptionEntity[] = allRes.ok ? await allRes.json() : [];
      const total: number = totalRes.ok ? await totalRes.json() : 0;
      const count: number = countRes.ok ? await countRes.json() : 0;
      const user = userRes.ok ? await userRes.json() : null;
      setTopSubs(top3);
      setAllSubs(all);
      setTotalMonthly(total);
      setTotalCount(count);
      if (user) setUserType(user.type);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => {
    setMounted(true);
    fetchAll();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
        setFilterHover(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleStatusChange(id: string, newStatus: string): Promise<void> {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/${id}/status?status=${newStatus}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      setAllSubs(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as "PAID" | "UPCOMING" } : s));
      setTopSubs(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as "PAID" | "UPCOMING" } : s));
      fetchAll();
    } catch (e) { console.error(e); }
  }

  async function handleDelete(): Promise<void> {
    if (!deleteConfirm) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/delete/${deleteConfirm.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchAll();
    } catch (e) { console.error(e); }
    setDeleteConfirm(null);
  }

  async function handleAddSubmit(): Promise<void> {
    const USER_ID = localStorage.getItem("id");
    const token = localStorage.getItem("token");
    if (!addForm.name.trim() || !addForm.category.trim() || !addForm.duDate || !addForm.price) {
      setAddError("Semua field wajib diisi."); return;
    }
    if (parseFloat(addForm.price) < 0) {
      setAddError("Harga tidak boleh negatif."); return;
    }
    setAddLoading(true);
    setAddError("");
    try {
      const payload = {
        name: addForm.name.trim(),
        category: addForm.category.trim(),
        duDate: addForm.duDate,
        price: parseFloat(addForm.price),
        status: computeStatus(addForm.duDate),
        period: addForm.period,
        active: true,
        userId: USER_ID,
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/add`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error ? `Gagal: ${errData.error} (Cause: ${errData.cause})` : "Gagal menambahkan subscription.");
      }
      setShowAddModal(false);
      setAddForm({ name: "", category: "", duDate: "", price: "", period: "THREE_MONTH" });
      fetchAll();
    } catch (e: unknown) {
      setAddError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    }
    setAddLoading(false);
  }

  function openEditModal(sub: SubscriptionEntity): void {
    setEditForm({
      id: sub.id,
      name: sub.name,
      category: sub.category,
      duDate: sub.duDate ? sub.duDate.slice(0, 10) : "",
      price: String(sub.price),
      status: sub.status,
      period: sub.period,
      isActive: sub.isActive !== false && sub.active !== false,
    });
    setEditError("");
    setShowEditModal(true);
  }

  async function handleEditSubmit(): Promise<void> {
    const USER_ID = localStorage.getItem("id");
    const token = localStorage.getItem("token");
    if (!editForm.duDate || !editForm.price) {
      setEditError("Semua field wajib diisi."); return;
    }
    if (parseFloat(editForm.price) < 0) {
      setEditError("Harga tidak boleh negatif."); return;
    }
    setEditLoading(true);
    setEditError("");
    try {
      const payload = {
        name: editForm.name,
        category: editForm.category,
        duDate: editForm.duDate,
        price: parseFloat(editForm.price),
        status: computeStatus(editForm.duDate),
        period: editForm.period,
        active: editForm.isActive,
        userId: USER_ID,
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/${editForm.id}`, { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Gagal mengupdate subscription.");
      setShowEditModal(false);
      fetchAll();
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    }
    setEditLoading(false);
  }

  function handleSearch(e: ChangeEvent<HTMLInputElement>): void {
    setSearchKeyword(e.target.value);
    setPage(0);
  }

  const filtered = allSubs.filter(s => {
    const matchStatus = filterStatus ? s.status === filterStatus : true;
    const matchPeriod = filterPeriod ? s.period === filterPeriod : true;
    const matchSearch = searchKeyword ? s.name.toLowerCase().includes(searchKeyword.toLowerCase()) : true;
    return matchStatus && matchPeriod && matchSearch;
  });

  const paginated = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const activeFilterCount = (filterStatus ? 1 : 0) + (filterPeriod ? 1 : 0);

  if (!mounted) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#F8F7FC", padding: "32px 36px", color: "#1A1523" }}>
        <div style={{ color: "#9CA3AF" }}>Loading page...</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", minHeight: "100vh", background: "#F8F7FC", padding: "32px 36px", color: "#1A1523" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>Subscription List</h1>
          <p style={{ color: "#6B7280", marginTop: 6, fontSize: 14, maxWidth: 440 }}>
            Optimize your monthly spending and track renewal dates across all your digital services in one crystalline view.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="text" placeholder="Search subscriptions..." value={searchKeyword} onChange={handleSearch}
            style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 13, background: "#fff", width: 200, outline: "none" }} />

          {/* Filter Dropdown */}
          <div ref={filterRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowFilterMenu(v => !v)}
              style={{ padding: "8px 14px", borderRadius: 10, border: activeFilterCount > 0 ? "1.5px solid #7C3AED" : "1px solid #E5E7EB", background: activeFilterCount > 0 ? "#F5F3FF" : "#fff", color: activeFilterCount > 0 ? "#7C3AED" : "#374151", fontSize: 13, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans',sans-serif" }}
            >
              Filters
              {activeFilterCount > 0 && (
                <span style={{ background: "#7C3AED", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{activeFilterCount}</span>
              )}
              ▾
            </button>

            {showFilterMenu && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#fff", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: "1px solid #F1F0F5", zIndex: 200, minWidth: 160 }}>

                {/* Status */}
                <div onMouseEnter={() => setFilterHover("status")} onMouseLeave={() => setFilterHover(null)} style={{ position: "relative" }}>
                  <div style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: filterHover === "status" ? "#F5F3FF" : "transparent", color: filterStatus ? "#7C3AED" : "#374151", fontWeight: filterStatus ? 600 : 400, borderRadius: "12px 12px 0 0" }}>
                    Status {filterStatus && <span style={{ fontSize: 11, color: "#7C3AED" }}>({filterStatus === "PAID" ? "Paid" : "Upcoming"})</span>}
                    <span style={{ fontSize: 11 }}>›</span>
                  </div>
                  {filterHover === "status" && (
                    <div style={{ position: "absolute", right: "100%", top: 0, background: "#fff", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: "1px solid #F1F0F5", minWidth: 140, zIndex: 201 }}>
                      {[{ value: "", label: "Semua" }, { value: "PAID", label: "● Paid" }, { value: "UPCOMING", label: "● Upcoming" }].map(opt => (
                        <div key={opt.value} onClick={() => { setFilterStatus(opt.value); setPage(0); setShowFilterMenu(false); setFilterHover(null); }}
                          style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", background: filterStatus === opt.value ? "#F5F3FF" : "transparent", color: filterStatus === opt.value ? "#7C3AED" : opt.value === "PAID" ? "#059669" : opt.value === "UPCOMING" ? "#D97706" : "#374151", fontWeight: filterStatus === opt.value ? 600 : 400, borderRadius: 8 }}>
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Periode */}
                <div onMouseEnter={() => setFilterHover("period")} onMouseLeave={() => setFilterHover(null)} style={{ position: "relative" }}>
                  <div style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: filterHover === "period" ? "#F5F3FF" : "transparent", color: filterPeriod ? "#7C3AED" : "#374151", fontWeight: filterPeriod ? 600 : 400, borderRadius: "0 0 12px 12px" }}>
                    Periode {filterPeriod && <span style={{ fontSize: 11, color: "#7C3AED" }}>({periodLabel[filterPeriod]})</span>}
                    <span style={{ fontSize: 11 }}>›</span>
                  </div>
                  {filterHover === "period" && (
                    <div style={{ position: "absolute", right: "100%", top: 0, background: "#fff", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: "1px solid #F1F0F5", minWidth: 140, zIndex: 201 }}>
                      {[{ value: "", label: "Semua" }, { value: "ONE_MINUTE", label: "1 Days" }, { value: "ONE_MONTH", label: "1 Month" }, { value: "THREE_MONTH", label: "3 Month" }, { value: "SIX_MONTH", label: "6 Month" }, { value: "TWELVE_MONTH", label: "12 Month" }].map(opt => (
                        <div key={opt.value} onClick={() => { setFilterPeriod(opt.value); setPage(0); setShowFilterMenu(false); setFilterHover(null); }}
                          style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", background: filterPeriod === opt.value ? "#F5F3FF" : "transparent", color: filterPeriod === opt.value ? "#7C3AED" : "#374151", fontWeight: filterPeriod === opt.value ? 600 : 400, borderRadius: 8 }}>
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top 3 Cards */}
      {loading ? (
        <div style={{ color: "#9CA3AF", marginBottom: 24 }}>Loading...</div>
      ) : (
        <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          {topSubs.map(sub => <TopCard key={sub.id} sub={sub} />)}
        </div>
      )}

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F0F5", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontWeight: 700, fontSize: 18 }}>All Subscriptions</span>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#1A1523" }}>
            Total Monthly: <span style={{ color: "#7C3AED" }}>Rp {Number(totalMonthly).toLocaleString("id-ID")}</span>
          </span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
              {["Platform", "Category", "Billing Date", "Price", "Period", "Status", "Active", "Actions"].map(col => (
                <th key={col} style={{ textAlign: "left", padding: "8px 12px", color: "#9CA3AF", fontWeight: 600, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase" }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#9CA3AF" }}>No subscriptions found.</td></tr>
            ) : paginated.map(sub => {
              const catStyle = getCategoryStyle(sub.category);
              return (
                <tr key={sub.id} style={{ borderBottom: "1px solid #F9F8FC" }}>
                  <td style={{ padding: "14px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <AppIcon name={sub.name} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{sub.name}</div>
                        <div style={{ color: "#9CA3AF", fontSize: 11 }}>{(sub.isActive !== false && sub.active !== false) ? "Monthly Billing" : "Inactive"}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    <span style={{ background: catStyle.bg, color: catStyle.color, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 500 }}>{sub.category}</span>
                  </td>
                  <td style={{ padding: "14px 12px", color: "#6B7280" }}>
                    {sub.duDate ? new Date(sub.duDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "-"}
                  </td>
                  <td style={{ padding: "14px 12px", fontWeight: 600 }}>
                    Rp {Number(sub.price).toLocaleString("id-ID")}
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    <span style={{ background: "#EDE9FE", color: "#5B21B6", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 500 }}>
                      {sub.period ? periodLabel[sub.period] : "-"}
                    </span>
                  </td>
                  <td style={{ padding: "16px 12px" }}>
                    <span style={{
                      padding: "4px 10px", borderRadius: 8, fontWeight: 600, fontSize: 12,
                      background: sub.status === "PAID" ? "#D1FAE5" : "#FEF3C7",
                      color: sub.status === "PAID" ? "#065F46" : "#92400E",
                      display: "inline-flex", alignItems: "center", gap: 5,
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: sub.status === "PAID" ? "#10B981" : "#F59E0B", display: "inline-block" }} />
                      {sub.status === "PAID" ? "Paid" : "Upcoming"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    <span style={{ background: sub.active ? "#D1FAE5" : "#F3F4F6", color: sub.active ? "#065F46" : "#6B7280", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 500 }}>
                      {sub.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => openEditModal(sub)} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", padding: 4, borderRadius: 6 }}>
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleteConfirm({ id: sub.id, name: sub.name })} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", padding: 4, borderRadius: 6 }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, fontSize: 13, color: "#6B7280" }}>
          <span>Showing {filtered.length === 0 ? 0 : page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} subscriptions</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid #E5E7EB", background: page === 0 ? "#F9FAFB" : "#fff", cursor: page === 0 ? "not-allowed" : "pointer", color: page === 0 ? "#D1D5DB" : "#374151", fontWeight: 500, fontSize: 13 }}>
              Previous
            </button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
              style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid #7C3AED", background: page >= totalPages - 1 ? "#F9FAFB" : "#7C3AED", cursor: page >= totalPages - 1 ? "not-allowed" : "pointer", color: page >= totalPages - 1 ? "#D1D5DB" : "#fff", fontWeight: 500, fontSize: 13 }}>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div style={{ borderRadius: 16, overflow: "hidden", position: "relative", background: "linear-gradient(135deg,#1E1B4B 0%,#312E81 60%,#4C1D95 100%)", padding: "36px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: 8 }}>Financial Clarity,<br />Minimal Effort.</div>
          <p style={{ color: "#C4B5FD", fontSize: 14, maxWidth: 380, margin: "0 0 20px" }}>RemindMe uses intelligent analysis to predict upcoming billing spikes so you're never caught off guard.</p>
          <button onClick={() => window.location.href = "/upgrade"} style={{ background: "#fff", color: "#312E81", border: "none", padding: "10px 24px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            Upgrade Your Insights
          </button>
        </div>
        <div style={{ opacity: 0.15, fontSize: 120, position: "absolute", right: 32, top: "50%", transform: "translateY(-50%)" }}>💳</div>
      </div>

      {/* FAB */}
      <button
        onClick={() => { if (userType === "REGULAR" && totalCount >= 5) { setShowUpgradeModal(true); } else { setShowAddModal(true); setAddError(""); } }}
        title="Add new subscription"
        style={{ position: "fixed", bottom: 32, right: 32, width: 56, height: 56, borderRadius: "50%", background: "#7C3AED", color: "#fff", border: "none", fontSize: 28, cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, zIndex: 999 }}
      >+</button>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div onClick={() => setDeleteConfirm(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(2px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "32px", width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", fontFamily: "'DM Sans',sans-serif", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🗑️</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#1A1523", marginBottom: 8 }}>Hapus Subscription</div>
            <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 24 }}>
              Yakin ingin menghapus <span style={{ fontWeight: 700, color: "#1A1523" }}>"{deleteConfirm.name}"</span>?
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Tidak</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: "#EF4444", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div onClick={() => setShowEditModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(2px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "32px 32px 28px", width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", fontFamily: "'DM Sans',sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, color: "#1A1523" }}>Edit Subscription</div>
                <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 2 }}>Perbarui data langganan kamu</div>
              </div>
              <button onClick={() => setShowEditModal(false)} style={{ background: "#F3F4F6", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              <div>
                <label style={labelStyle}>Tanggal Pembayaran</label>
                <input type="date" value={editForm.duDate} onChange={e => setEditForm(f => ({ ...f, duDate: e.target.value }))} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Harga (Rp)</label>
                <input type="number" min="0" value={editForm.price}
                  onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                  onKeyDown={e => { if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") e.preventDefault(); }}
                  style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Periode Pembayaran</label>
                <select value={editForm.period} onChange={e => setEditForm(f => ({ ...f, period: e.target.value as "ONE_MINUTE" | "ONE_MONTH" | "THREE_MONTH" | "SIX_MONTH" | "TWELVE_MONTH" }))} style={selectStyle}>
                  <option value="ONE_MINUTE">1 Days</option>
                  <option value="ONE_MONTH">1 Month</option>
                  <option value="THREE_MONTH">3 Month</option>
                  <option value="SIX_MONTH">6 Month</option>
                  <option value="TWELVE_MONTH">12 Month</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Status Aktif</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {([true, false] as const).map(val => (
                    <button key={String(val)} onClick={() => setEditForm(f => ({ ...f, isActive: val }))}
                      style={{ flex: 1, padding: "10px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans',sans-serif", border: editForm.isActive === val ? "2px solid" : "1.5px solid #E5E7EB", borderColor: editForm.isActive === val ? (val ? "#10B981" : "#EF4444") : "#E5E7EB", background: editForm.isActive === val ? (val ? "#D1FAE5" : "#FEE2E2") : "#fff", color: editForm.isActive === val ? (val ? "#065F46" : "#991B1B") : "#6B7280", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: val ? "#10B981" : "#EF4444", display: "inline-block" }} />
                      {val ? "Active" : "Inactive"}
                    </button>
                  ))}
                </div>
              </div>

              {editError && <div style={{ background: "#FEE2E2", color: "#991B1B", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>{editError}</div>}

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Batal</button>
                <button onClick={handleEditSubmit} disabled={editLoading} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: editLoading ? "#C4B5FD" : "#7C3AED", color: "#fff", fontWeight: 700, fontSize: 14, cursor: editLoading ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                  {editLoading ? "Menyimpan..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div onClick={() => setShowAddModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(2px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "32px 32px 28px", width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", fontFamily: "'DM Sans',sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, color: "#1A1523" }}>Add Subscription</div>
                <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 2 }}>Tambahkan langganan baru kamu</div>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: "#F3F4F6", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              <div>
                <label style={labelStyle}>Nama Aplikasi</label>
                <input type="text" placeholder="Contoh: Netflix, Spotify..." value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Kategori</label>
                <select value={addForm.category} onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))} style={selectStyle}>
                  <option value="">Pilih kategori...</option>
                  {Object.keys(categoryColors).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Tanggal Pembayaran</label>
                <input type="date" value={addForm.duDate} onChange={e => setAddForm(f => ({ ...f, duDate: e.target.value }))} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Harga (Rp)</label>
                <input type="number" placeholder="Contoh: 54000" min="0" value={addForm.price}
                  onChange={e => setAddForm(f => ({ ...f, price: e.target.value }))}
                  onKeyDown={e => { if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") e.preventDefault(); }}
                  style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Periode Pembayaran</label>
                <select value={addForm.period} onChange={e => setAddForm(f => ({ ...f, period: e.target.value as "ONE_MINUTE" | "ONE_MONTH" | "THREE_MONTH" | "SIX_MONTH" | "TWELVE_MONTH" }))} style={selectStyle}>
                  <option value="ONE_MINUTE">1 Days</option>
                  <option value="ONE_MONTH">1 Month</option>
                  <option value="THREE_MONTH">3 Month</option>
                  <option value="SIX_MONTH">6 Month</option>
                  <option value="TWELVE_MONTH">12 Month</option>
                </select>
              </div>

              {addError && <div style={{ background: "#FEE2E2", color: "#991B1B", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>{addError}</div>}

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Batal</button>
                <button onClick={handleAddSubmit} disabled={addLoading} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: addLoading ? "#C4B5FD" : "#7C3AED", color: "#fff", fontWeight: 700, fontSize: 14, cursor: addLoading ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                  {addLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div onClick={() => setShowUpgradeModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(2px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "32px", width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", fontFamily: "'DM Sans',sans-serif", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⭐</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: "#1A1523", marginBottom: 8 }}>Batas Subscription Tercapai</div>
            <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}>Kamu sudah mencapai batas <span style={{ fontWeight: 700, color: "#1A1523" }}>5 subscription</span> untuk akun reguler.</div>
            <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 24 }}>Upgrade ke Premium untuk menambahkan subscription tanpa batas!</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowUpgradeModal(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Nanti Saja</button>
              <button onClick={() => window.location.href = "/upgrade"} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#7C3AED,#4C1D95)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Upgrade Sekarang</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
