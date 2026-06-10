import { create } from "zustand";

interface CheckState {
    check: "PREMIUM" | "REGULAR";
    changeStatus: (status: "PREMIUM" | "REGULAR") => void;
}

const useCheck = create<CheckState>((set) => ({
    check: "REGULAR",
    changeStatus: (status) => set({ check: status }),
}));

export default useCheck;