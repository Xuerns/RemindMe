export class HistoryModel {
    public id: string;
    public name: string;
    public price: number;
    public category: string;
    public startDate: string;
    public endDate: string;
    public status: string;

    // Constructor untuk inisialisasi objek
    constructor(data: any) {
        this.id = data.id || "";
        this.name = data.name || "";
        this.price = data.price || 0;
        this.category = data.category || "";
        this.startDate = data.startDate || "";
        this.endDate = data.endDate || "";
        this.status = data.status || "";
    }

    // Enkapsulasi logika format data di dalam class
    public getFormattedPrice(): string {
        return `Rp ${this.price.toLocaleString("id-ID")}`;
    }

    public getValidityPeriod(): string {
        return `${this.startDate} s/d ${this.endDate}`;
    }
}