import { HistoryModel } from "./historyModel";

export class HistoryService {
    private baseUrl: string;

    constructor() {
        // Enkapsulasi base URL
        this.baseUrl = "http://localhost:8080/api/history";
    }

    public async fetchHistoryByUserId(userId: string, token: string | null): Promise<HistoryModel[]> {
        if (!userId) return [];

        try {
            const response = await fetch(`${this.baseUrl}/user/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token ? `Bearer ${token}` : ""
                }
            });

            if (!response.ok) {
                throw new Error("Gagal mengambil data dari server");
            }

            const data = await response.json();
            
            // Memetakan (Mapping) JSON mentah menjadi sekumpulan Object dari Class HistoryModel
            return data.map((item: any) => new HistoryModel(item));

        } catch (error) {
            console.error("Error Fetching History:", error);
            return [];
        }
    }
}