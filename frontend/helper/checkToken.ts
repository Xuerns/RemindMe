import { jwtDecode } from "jwt-decode";

export function checkToken() {
    const token = localStorage.getItem("token");
    if (!token) {
        return false;
    }
    
    try {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp! < Date.now() / 1000;

        if (isExpired) {
            localStorage.removeItem("token");
            return false;
        }
        return true;
    } catch  {
        localStorage.removeItem("token");
        return false;
    }
}