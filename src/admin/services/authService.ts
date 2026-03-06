import axiosInstance from "@/api";
import { ENDPOINTS } from "@/api/endpoints";

export interface AdminLoginRequest {
    email: string;
    password: string;
}

export interface AdminLoginResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    };
    timestamp: string;
    path: string;
}

export const adminAuthService = {
    async login(payload: AdminLoginRequest): Promise<AdminLoginResponse> {
        const { data } = await axiosInstance.post<AdminLoginResponse>(ENDPOINTS.authLogin, payload);
        return data;
    },
    async logout(): Promise<AdminLogoutResponse> {
        const { data } = await axiosInstance.post<AdminLogoutResponse>(ENDPOINTS.authLogout);
        return data;
    },
    async forgotPassword(payload: ForgotPasswordRequest): Promise<PasswordResponse> {
        const { data } = await axiosInstance.post<PasswordResponse>(ENDPOINTS.authForgotPassword, payload);
        return data;
    },
    async resetPassword(payload: ResetPasswordRequest): Promise<PasswordResponse> {
        const { data } = await axiosInstance.post<PasswordResponse>(ENDPOINTS.authResetPassword, payload);
        return data;
    },
    async changePassword(payload: ChangePasswordRequest): Promise<PasswordResponse> {
        const { data } = await axiosInstance.post<PasswordResponse>(ENDPOINTS.authChangePassword, payload);
        return data;
    },
};

export interface AdminRefreshResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        accessToken: string;
        refreshToken: string;
    };
    timestamp: string;
    path: string;
}

export interface AdminLogoutResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: null;
    timestamp: string;
    path: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface PasswordResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: null;
    timestamp: string;
    path: string;
}
