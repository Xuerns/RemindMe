export class HistoryModel {
    public id: string;
    public name: string;
    public price: number;
    public category: string;
    public startDate: string;
    public endDate: string;
    public status: string;       // Status asli saat dicatat (immutable)
    public recordedAt: string;   // Tanggal pencatatan history

    // Constructor untuk inisialisasi objek
    constructor(data: any) {
        this.id = data.id || "";
        this.name = data.name || "";
        this.price = data.price || 0;
        this.category = data.category || "";
        this.startDate = data.startDate || "";
        this.endDate = data.endDate || "";
        this.status = data.status || "";
        this.recordedAt = data.recordedAt || "";
    }

    // Enkapsulasi logika format data di dalam class
    public getFormattedPrice(): string {
        return `Rp ${this.price.toLocaleString("id-ID")}`;
    }

    public getValidityPeriod(): string {
        return `${this.startDate} s/d ${this.endDate}`;
    }

    // Hitung status tampilan secara dinamis dari endDate.
    // History DB tidak diubah, tapi tampilan menyesuaikan tanggal hari ini.
    // Jika status asli bukan ACTIVE (mis. CANCELED/UPGRADED/DOWNGRADED), tampilkan apa adanya.
    public getDisplayStatus(): string {
        if (this.status !== "ACTIVE") return this.status;
        if (!this.endDate) return this.status;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(this.endDate);
        return end < today ? "EXPIRED" : "ACTIVE";
    }
}