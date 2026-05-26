"use client";
import { useState, useEffect, ChangeEvent } from "react";

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

function getCategoryStyle(cat: string): CategoryStyle {
  return categoryColors[cat] || { bg: "#F3F4F6", color: "#374151" };
}

interface SubscriptionEntity {
  id: string;
  name: string;
  price: number;
  duDate: string;
  category: string;
  isActive: boolean;
  status: "PAID" | "UPCOMING";
}

function AppIcon({ name }: { name: string }) {
  const colors = [
    "#EF4444", "#3B82F6", "#10B981", "#F59E0B",
    "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
  ];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  return (
    <div style={{
      width: 38, height: 38, borderRadius: 10,
      background: colors[idx],
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: 16, color: "#fff", flexShrink: 0,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {name ? name[0].toUpperCase() : "?"}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isPaid = status === "PAID";
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: isPaid ? "#059669" : "#D97706" }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: isPaid ? "#10B981" : "#F59E0B", display: "inline-block" }} />
      {isPaid ? "Paid" : "Upcoming"}
    </span>
  );
}

function TopCard({ sub }: { sub: SubscriptionEntity }) {
  const isPaid = sub.status === "PAID";
  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "20px 22px",
      border: "1px solid #F1F0F5", flex: 1, minWidth: 200,
      display: "flex", flexDirection: "column", gap: 10,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <AppIcon name={sub.name} />
        <span style={{
          fontSize: 11, fontWeight: 600, padding: "3px 10px",
          borderRadius: 20, letterSpacing: 0.5,
          background: isPaid ? "#D1FAE5" : "#FEF3C7",
          color: isPaid ? "#065F46" : "#92400E",
        }}>
          {isPaid ? "ACTIVE" : "UPCOMING"}
        </span>
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 17, color: "#1A1523", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>{sub.name}</div>
        <div style={{ fontSize: 12, color: "#9CA3AF" }}>
          Renewing on {sub.duDate ? new Date(sub.duDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "-"}
        </div>
      </div>
      <div style={{ fontWeight: 800, fontSize: 22, color: "#1A1523", fontFamily: "'DM Sans', sans-serif" }}>
        Rp {Number(sub.price).toLocaleString("id-ID")}
        <span style={{ fontWeight: 400, fontSize: 13, color: "#9CA3AF" }}> /month</span>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  const [topSubs, setTopSubs] = useState<SubscriptionEntity[]>([]);
  const [allSubs, setAllSubs] = useState<SubscriptionEntity[]>([]);
  const [totalMonthly, setTotalMonthly] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const PAGE_SIZE = 3;

  // --- Add Modal State ---
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addForm, setAddForm] = useState({
    name: "",
    category: "",
    duDate: "",
    price: "",
    status: "UPCOMING" as "PAID" | "UPCOMING",
  });
  const [addLoading, setAddLoading] = useState<boolean>(false);
  const [addError, setAddError] = useState<string>("");

  async function fetchAll(): Promise<void> {
    setLoading(true);
    const USER_ID = localStorage.getItem("id");
    const token = localStorage.getItem("token");
    try {
      const [top3Res, allRes, totalRes, countRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/user/${USER_ID}/top3`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/user/${USER_ID}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/user/${USER_ID}/total-monthly`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/user/${USER_ID}/count`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      ]);
      const top3: SubscriptionEntity[] = await top3Res.json();
      const all: SubscriptionEntity[] = await allRes.json();
      const total: number = await totalRes.json();
      const count: number = await countRes.json();
      setTopSubs(top3);
      setAllSubs(all);
      setTotalMonthly(total);
      setTotalCount(count);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, []);

  async function handleStatusChange(id: string, newStatus: string): Promise<void> {
    const USER_ID = localStorage.getItem("id");
    const token = localStorage.getItem("token");
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${USER_ID}/status?status=${newStatus}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setAllSubs((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: newStatus as "PAID" | "UPCOMING" } : s,
        ),
      );
      setTopSubs((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: newStatus as "PAID" | "UPCOMING" } : s,
        ),
      );
    } catch (e) { console.error(e); }
    setEditingStatus(null);
  }

  async function handleDelete(name: string): Promise<void> {
    const token = localStorage.getItem("token");
    if (!window.confirm(`Hapus subscription "${name}"?`)) return;
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/delete/${encodeURIComponent(name)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchAll();
    } catch (e) { console.error(e); }
  }

  async function handleAddSubmit(): Promise<void> {
    const USER_ID = localStorage.getItem("id");
    const token = localStorage.getItem("token");
    console.log("USER_ID:", USER_ID);       // ← cek apakah null
    console.log("token:", token);           // ← cek apakah null
    console.log("addForm:", addForm);
    if (!addForm.name.trim() || !addForm.category.trim() || !addForm.duDate || !addForm.price) {
      setAddError("Semua field wajib diisi.");
      return;
    }

    if (parseFloat(addForm.price) < 0) {
      setAddError("Harga tidak boleh negatif.");
      return;
    }

    setAddLoading(true);
    setAddError("");
    try {
      const payload = {
        name: addForm.name.trim(),
        category: addForm.category.trim(),
        duDate: addForm.duDate,
        price: parseFloat(addForm.price),
        status: addForm.status,
        active: true,
        userId: USER_ID,
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menambahkan subscription.");
      setShowAddModal(false);
      setAddForm({ name: "", category: "", duDate: "", price: "", status: "UPCOMING" });
      fetchAll();
    } catch (e: unknown) {
      setAddError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    }
    setAddLoading(false);
  }

  function handleSearch(e: ChangeEvent<HTMLInputElement>): void {
    setSearchKeyword(e.target.value);
    setPage(0);
  }

  const filtered = allSubs.filter(s => {
    const matchStatus = filterStatus ? s.status === filterStatus : true;
    const matchSearch = searchKeyword ? s.name.toLowerCase().includes(searchKeyword.toLowerCase()) : true;
    return matchStatus && matchSearch;
  });

  const paginated = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#F8F7FC", padding: "32px 36px", color: "#1A1523" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>Subscription Portfolio</h1>
          <p style={{ color: "#6B7280", marginTop: 6, fontSize: 14, maxWidth: 440 }}>
            Optimize your monthly spending and track renewal dates across all your digital services in one crystalline view.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={searchKeyword}
            onChange={handleSearch}
            style={{
              padding: "8px 14px", borderRadius: 10, border: "1px solid #E5E7EB",
              fontSize: 13, background: "#fff", width: 200, outline: "none",
            }}
          />
          <select
            value={filterStatus}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => { setFilterStatus(e.target.value); setPage(0); }}
            style={{
              padding: "8px 14px", borderRadius: 10, border: "1px solid #E5E7EB",
              fontSize: 13, background: "#fff", cursor: "pointer", outline: "none",
            }}
          >
            <option value="">All Status</option>
            <option value="PAID">Paid</option>
            <option value="UPCOMING">Upcoming</option>
          </select>
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

      {/* All Subscriptions Table */}
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
              {["Platform", "Category", "Billing Date", "Price", "Status", "Actions"].map(col => (
                <th key={col} style={{ textAlign: "left", padding: "8px 12px", color: "#9CA3AF", fontWeight: 600, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase" }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#9CA3AF" }}>No subscriptions found.</td></tr>
            ) : paginated.map(sub => {
              const catStyle = getCategoryStyle(sub.category);
              return (
                <tr key={sub.id} style={{ borderBottom: "1px solid #F9F8FC" }}>
                  <td style={{ padding: "14px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <AppIcon name={sub.name} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{sub.name}</div>
                        <div style={{ color: "#9CA3AF", fontSize: 11 }}>{sub.isActive ? "Monthly Billing" : "Inactive"}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    <span style={{ background: catStyle.bg, color: catStyle.color, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 500 }}>
                      {sub.category}
                    </span>
                  </td>
                  <td style={{ padding: "14px 12px", color: "#6B7280" }}>
                    {sub.duDate ? new Date(sub.duDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "-"}
                  </td>
                  <td style={{ padding: "14px 12px", fontWeight: 600 }}>
                    Rp {Number(sub.price).toLocaleString("id-ID")}
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    {editingStatus === sub.id ? (
                      <select
                        value={sub.status}
                        autoFocus
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => handleStatusChange(sub.id, e.target.value)}
                        onBlur={() => setEditingStatus(null)}
                        style={{ padding: "4px 8px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12, cursor: "pointer" }}
                      >
                        <option value="PAID">Paid</option>
                        <option value="UPCOMING">Upcoming</option>
                      </select>
                    ) : (
                      <span onClick={() => setEditingStatus(sub.id)} style={{ cursor: "pointer" }} title="Click to change status">
                        <StatusBadge status={sub.status} />
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        onClick={() => window.location.href = `/subscriptions/edit/${sub.id}`}
                        title="Edit"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", padding: 4, borderRadius: 6 }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(sub.name)}
                        title="Delete"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", padding: 4, borderRadius: 6 }}
                      >
                        🗑️
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
          <span>
            Showing {filtered.length === 0 ? 0 : page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} subscriptions
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              style={{
                padding: "6px 16px", borderRadius: 8, border: "1px solid #E5E7EB",
                background: page === 0 ? "#F9FAFB" : "#fff", cursor: page === 0 ? "not-allowed" : "pointer",
                color: page === 0 ? "#D1D5DB" : "#374151", fontWeight: 500, fontSize: 13,
              }}
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              style={{
                padding: "6px 16px", borderRadius: 8, border: "1px solid #7C3AED",
                background: page >= totalPages - 1 ? "#F9FAFB" : "#7C3AED",
                cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                color: page >= totalPages - 1 ? "#D1D5DB" : "#fff", fontWeight: 500, fontSize: 13,
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div style={{
        borderRadius: 16, overflow: "hidden", position: "relative",
        background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 60%, #4C1D95 100%)",
        padding: "36px 40px", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: 8 }}>
            Financial Clarity,<br />Minimal Effort.
          </div>
          <p style={{ color: "#C4B5FD", fontSize: 14, maxWidth: 380, margin: "0 0 20px" }}>
            RemindMe uses intelligent analysis to predict upcoming billing spikes so you're never caught off guard.
          </p>
          <button
            onClick={() => window.location.href = "/upgrade"}
            style={{
              background: "#fff", color: "#312E81", border: "none",
              padding: "10px 24px", borderRadius: 10, fontWeight: 700,
              fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Upgrade Your Insights
          </button>
        </div>
        <div style={{ opacity: 0.15, fontSize: 120, position: "absolute", right: 32, top: "50%", transform: "translateY(-50%)" }}>
          💳
        </div>
      </div>

      {/* FAB Add Button */}
      <button
        onClick={() => { setShowAddModal(true); setAddError(""); }}
        title="Add new subscription"
        style={{
          position: "fixed", bottom: 32, right: 32,
          width: 56, height: 56, borderRadius: "50%",
          background: "#7C3AED", color: "#fff", border: "none",
          fontSize: 28, cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, zIndex: 999,
        }}
      >
        +
      </button>

      {/* Add Subscription Modal */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, backdropFilter: "blur(2px)",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 20, padding: "32px 32px 28px",
              width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, color: "#1A1523" }}>Add Subscription</div>
                <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 2 }}>Tambahkan langganan baru kamu</div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "#F3F4F6", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Nama Aplikasi */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Nama Aplikasi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Netflix, Spotify..."
                  value={addForm.name}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1.5px solid #E5E7EB", fontSize: 14, outline: "none",
                    boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </div>

              {/* Kategori */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Kategori
                </label>
                <select
                  value={addForm.category}
                  onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1.5px solid #E5E7EB", fontSize: 14, outline: "none",
                    background: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="">Pilih kategori...</option>
                  {Object.keys(categoryColors).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Tanggal Pembayaran */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Tanggal Pembayaran
                </label>
                <input
                  type="date"
                  value={addForm.duDate}
                  onChange={e => setAddForm(f => ({ ...f, duDate: e.target.value }))}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1.5px solid #E5E7EB", fontSize: 14, outline: "none",
                    fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Harga */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 54000"
                  min="0"
                  value={addForm.price}
                  onChange={e => setAddForm(f => ({ ...f, price: e.target.value }))}
                  onKeyDown={e => {
                    if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
                      e.preventDefault();
                    }
                  }}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1.5px solid #E5E7EB", fontSize: 14, outline: "none",
                    fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Status */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Status
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  {(["PAID", "UPCOMING"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setAddForm(f => ({ ...f, status: s }))}
                      style={{
                        flex: 1, padding: "10px", borderRadius: 10, cursor: "pointer",
                        fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                        border: addForm.status === s ? "2px solid" : "1.5px solid #E5E7EB",
                        borderColor: addForm.status === s ? (s === "PAID" ? "#10B981" : "#F59E0B") : "#E5E7EB",
                        background: addForm.status === s ? (s === "PAID" ? "#D1FAE5" : "#FEF3C7") : "#fff",
                        color: addForm.status === s ? (s === "PAID" ? "#065F46" : "#92400E") : "#6B7280",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: s === "PAID" ? "#10B981" : "#F59E0B", display: "inline-block" }} />
                      {s === "PAID" ? "Paid" : "Upcoming"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {addError && (
                <div style={{ background: "#FEE2E2", color: "#991B1B", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
                  {addError}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid #E5E7EB",
                    background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14,
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleAddSubmit}
                  disabled={addLoading}
                  style={{
                    flex: 1, padding: "11px", borderRadius: 10, border: "none",
                    background: addLoading ? "#C4B5FD" : "#7C3AED", color: "#fff",
                    fontWeight: 700, fontSize: 14, cursor: addLoading ? "not-allowed" : "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {addLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
