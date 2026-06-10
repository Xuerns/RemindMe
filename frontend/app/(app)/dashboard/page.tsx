"use client";
import { checkToken } from "@/helper/checkToken";
import useCheck from "@/store/useCheck";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const checkPremium = useCheck((state) => state.changeStatus);
  const status = useCheck((state) => state.check);

  useEffect(() => {
    if (!checkToken()) {
      router.push("/");
    }

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("id");

      const verifyPremium = async () => {
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
      verifyPremium();
    } catch (err) {
      console.log(err);
    }
  }, [status]);
  return <div></div>;
}
