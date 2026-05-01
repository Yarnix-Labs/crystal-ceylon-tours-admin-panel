import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { ENDPOINTS } from "@/api/endpoints";

/** Base URL for the API (no trailing slash). Set VITE_API_URL for production. */
export const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

/** Dedicated client for refresh token requests */
const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
    withCredentials: false,
});

// Only one refresh in flight; others wait and reuse the result
let refreshPromise: Promise<{ accessToken: string; refreshToken: string } | null> | null = null;

const refreshAccessToken = async (): Promise<{ accessToken: string; refreshToken: string } | null> => {
    const refreshToken = localStorage.getItem("ray_refresh_token");
    if (!refreshToken) {
        if (import.meta.env.DEV) console.warn("[Auth] No refresh token in storage");
        return null;
    }

    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        try {
            // Backend: POST /auth/refresh with body { "refreshToken": "..." }
            const { data } = await refreshClient.post(ENDPOINTS.authRefresh, { refreshToken });
            // Support common response shapes: data.data, data.tokens, or data itself
            const raw = data as Record<string, unknown>;
            const tokens =
                (raw?.data as { accessToken?: string; refreshToken?: string } | undefined) ||
                (raw?.tokens as { accessToken?: string; refreshToken?: string } | undefined) ||
                (raw as { accessToken?: string; refreshToken?: string });
            const access = tokens?.accessToken ?? (tokens as { access_token?: string })?.access_token;
            const refresh = tokens?.refreshToken ?? (tokens as { refresh_token?: string })?.refresh_token;
            if (access && refresh) {
                return { accessToken: access, refreshToken: refresh };
            }
            if (import.meta.env.DEV) console.warn("[Auth] Refresh response missing accessToken/refreshToken", data);
            return null;
        } catch (err: unknown) {
            const ax = err as { response?: { status?: number; data?: unknown }; message?: string; code?: string };
            const status = ax.response?.status;
            const isCorsOrNetwork = !ax.response && (ax.code === "ERR_NETWORK" || ax.message?.toLowerCase().includes("network"));
            if (import.meta.env.DEV) {
                console.warn("[Auth] Refresh failed", { status, code: ax.code, message: ax.message, data: ax.response?.data });
            } else {
                console.warn(
                    "[Auth] Refresh failed on hosted admin.",
                    isCorsOrNetwork
                        ? "Check: 1) VITE_API_URL environment variable is set correctly, 2) API CORS allows your domain"
                        : status === 401
                            ? "Refresh token invalid or expired."
                            : `Status: ${status ?? ax.message}.`
                );
            }
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};

// Request interceptor: attach auth token when present (admin)
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("ray_auth_token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: 401 handling + global error toast
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const status = error.response?.status;
        const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
        const message =
            (error.response?.data as { message?: string })?.message ||
            error.message ||
            "An unexpected error occurred";

        if (status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            const tokens = await refreshAccessToken();
            if (tokens) {
                localStorage.setItem("ray_auth_token", tokens.accessToken);
                localStorage.setItem("ray_refresh_token", tokens.refreshToken);
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
                return axiosInstance(originalRequest);
            }
        }

        if (status === 401) {
            const hadToken = !!localStorage.getItem("ray_auth_token");
            localStorage.removeItem("ray_auth_token");
            localStorage.removeItem("ray_refresh_token");
            // Redirect to login when session expired
            if (hadToken && typeof window !== "undefined") {
                window.location.href = "/";
                return Promise.reject(error);
            }
        }

        toast.error(message);
        return Promise.reject(error);
    }
);

export const publicAxios: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

export default axiosInstance;
