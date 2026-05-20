import Sidebar from "@/components/Sidebar";
import ProfilePage from "./Profilpage";

export default function Page() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <ProfilePage />
    </div>
  );
}