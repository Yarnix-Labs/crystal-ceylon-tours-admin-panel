import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { adminAuthService } from "@/admin/services/authService";

interface AdminAuthContextType {
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, newPassword: string, confirmPassword: string) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
    isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check if user is logged in
        const storedAuth = localStorage.getItem("ray_admin_auth");
        const storedToken = localStorage.getItem("ray_auth_token");
        if (storedAuth === "true" || !!storedToken) {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const data = await adminAuthService.login({ email, password });
            const accessToken = data.data.tokens.accessToken;
            const refreshToken = data.data.tokens.refreshToken;
            localStorage.setItem("ray_auth_token", accessToken);
            localStorage.setItem("ray_refresh_token", refreshToken);
            localStorage.setItem("ray_admin_auth", "true");
            setIsAuthenticated(true);
            toast.success("Welcome back, Admin!");

            // Redirect to dashboard if on login page
            const from = location.state?.from?.pathname || "/admin";
            navigate(from, { replace: true });
            return true;
        } catch {
            return false;
        }
    };

    const logout = async () => {
        try {
            await adminAuthService.logout();
        } catch {
            // Ignore logout API failures and still clear client state
        }
        localStorage.removeItem("ray_admin_auth");
        localStorage.removeItem("ray_auth_token");
        localStorage.removeItem("ray_refresh_token");
        setIsAuthenticated(false);
        toast.info("Logged out successfully");
        navigate("/");
    };

    const forgotPassword = async (email: string) => {
        try {
            await adminAuthService.forgotPassword({ email });
            toast.success("Password reset link sent to your email.");
        } catch (error) {
            console.error("Forgot password failed:", error);
            toast.error("Failed to send reset link. Please try again.");
            throw error;
        }
    };

    const resetPassword = async (token: string, newPassword: string, confirmPassword: string) => {
        try {
            await adminAuthService.resetPassword({ token, newPassword, confirmPassword });
            toast.success("Password has been reset successfully.");
        } catch (error) {
            console.error("Reset password failed:", error);
            toast.error("Failed to reset password. Please try again.");
            throw error;
        }
    };

    const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
        try {
            await adminAuthService.changePassword({ currentPassword, newPassword, confirmPassword });
            toast.success("Password changed successfully.");
        } catch (error) {
            console.error("Change password failed:", error);
            toast.error("Failed to change password. Please try again.");
            throw error;
        }
    };

    return (
        <AdminAuthContext.Provider
            value={{
                isAuthenticated,
                login,
                logout,
                forgotPassword,
                resetPassword,
                changePassword,
                isLoading,
            }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error("useAdminAuth must be used within an AdminAuthProvider");
    }
    return context;
};
