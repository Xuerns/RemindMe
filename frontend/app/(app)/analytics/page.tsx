'use client'
import { checkToken } from "@/helper/checkToken";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AnalyticsPage() {
  const router = useRouter();

  useEffect(() => {
    if (!checkToken()) {
      router.push("/");
    }
  }, [])
  return (
    <div>
      
    </div>
  );
}
