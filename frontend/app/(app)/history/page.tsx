"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { HistoryModel } from "./historyModel";
import { HistoryService } from "./historyService";

export default function HistoryPage() {
  const [histories, setHistories] = useState<HistoryModel[]>([]);
  const [loading, setLoading] = useState(true);

  // Instansiasi Object Service OOP
  const historyService = new HistoryService();

  useEffect(() => {
    const loadData = async () => {
      let userId = "";
      const token = localStorage.getItem("token");
      
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          userId = decoded.id || decoded.sub || decoded.userId; 
        } catch (error) {
          console.error("Token error");
        }
      }

      if (userId) {
        // Memanggil method dari Service Object
        const dataObjects = await historyService.fetchHistoryByUserId(userId, token);
        setHistories(dataObjects);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "RENEWED":
      case "UPGRADED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "EXPIRED":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "CANCELED":
      case "DOWNGRADED":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Riwayat Langganan</h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : histories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Belum ada riwayat langganan.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Langganan</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Harga</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Masa Aktif</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {histories.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                  {/* Memanggil Method bawaan Object Model! */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                    {item.getFormattedPrice()} 
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.getValidityPeriod()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-semibold text-gray-700">{item.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}