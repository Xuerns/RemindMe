"use client";
import { checkToken } from "@/helper/checkToken";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    if (!checkToken()) {
      router.push("/");
    }

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("id");

      const verifyPremium = async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/${userId}/check`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      };
      verifyPremium();
    } catch (err) {
      console.log(err);
    }
  }, []);
  return <div></div>;
}
