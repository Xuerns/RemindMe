"use client";
import { checkToken } from "@/helper/checkToken";
import { useRouter } from "next/navigation";
import { useEffect,useState } from "react";
import { Bell, BellOff, CheckCheck, Clock, RefreshCw } from "lucide-react";

interface Notification {
  id: string;
  message: string;
  scheduledAt: string;
  sent: boolean;
}

export default function NotificationsPage() {
  const router = useRouter();
const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!checkToken()) {
      router.push("/");
      return;
    }
    fetchNotifications();
  }, []);

  const getUserId = () => localStorage.getItem("id") ?? "";

  const fetchNotifications = async () => {
    setLoading(true);
    console.log("fetch jalan"); // ← tambah ini
    console.log("userId:", getUserId()); //
    console.log("token:", localStorage.getItem("token")); 
    try {
      const token = localStorage.getItem("token");
      const userId = getUserId();
      const res = await fetch(`/api/notifications/all/${userId}`, {
  headers: { Authorization: `Bearer ${token}` },
});
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    setMarking(true);
    try {
      const token = localStorage.getItem("token");
      const userId = getUserId();
      await fetch(`/api/notifications/read/all/${userId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchNotifications();
    } finally {
      setMarking(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.sent).length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getDaysUrgency = (message: string) => {
    const match = message.match(/(\d+) hari/);
    if (!match) return "normal";
    const days = parseInt(match[1]);
    if (days <= 1) return "critical";
    if (days <= 3) return "high";
    return "normal";
  };

  return (
    <div className="min-h-screen bg-surface p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-on-surface tracking-tight">
              Notifikasi
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              {unreadCount > 0
                ? `${unreadCount} notifikasi belum dibaca`
                : "Semua notifikasi sudah dibaca"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="w-9 h-9 rounded-xl border border-outline-variant
                         flex items-center justify-center
                         text-on-surface-variant hover:bg-surface-container
                         transition-all duration-200 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={marking}
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                           bg-primary text-on-primary text-sm font-medium
                           hover:bg-inverse-surface transition-all duration-200
                           disabled:opacity-50"
              >
                <CheckCheck size={15} />
                {marking ? "Memproses..." : "Tandai Semua Dibaca"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        // Skeleton
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-surface-container animate-pulse"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
            <BellOff size={24} className="text-outline-variant" />
          </div>
          <h3 className="font-display text-lg font-semibold text-on-surface mb-2">
            Tidak ada notifikasi
          </h3>
          <p className="text-sm text-on-surface-variant max-w-xs">
            Notifikasi jatuh tempo subscription kamu akan muncul di sini.
          </p>
        </div>
      ) : (
        // Notification list
        <div className="space-y-2">
          {notifications.map((notif, i) => {
            const urgency = getDaysUrgency(notif.message);
            return (
              <div
                key={notif.id}
                className={`
                  relative flex items-start gap-4 p-4 rounded-2xl border
                  transition-all duration-200
                  ${!notif.sent
                    ? "bg-surface-container-lowest border-outline-variant/30"
                    : "bg-surface border-transparent opacity-60"
                  }
                `}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Urgency indicator */}
                <div
                  className={`
                    shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                    ${urgency === "critical" ? "bg-error/10" : urgency === "high" ? "bg-tertiary-container" : "bg-primary-container"}
                  `}
                >
                  <Bell
                    size={16}
                    className={
                      urgency === "critical"
                        ? "text-error"
                        : urgency === "high"
                          ? "text-on-tertiary-container"
                          : "text-on-primary-container"
                    }
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-relaxed ${!notif.sent ? "text-on-surface font-medium" : "text-on-surface-variant"}`}
                  >
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Clock size={11} className="text-outline-variant" />
                    <span className="text-xs text-outline-variant">
                      {formatDate(notif.scheduledAt)}
                    </span>
                  </div>
                </div>

                {/* Unread dot */}
                {!notif.sent && (
                  <div className="shrink-0 w-2 h-2 rounded-full bg-primary mt-1" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
