import { AxiosError } from "axios";

/**
 * Standard API Error Response Format
 * Used by all backend APIs
 */
export interface ApiErrorResponse {
    success: false;
    statusCode: number;
    message: string;
    data: null;
    error?: {
        code: string;
    };
    timestamp?: string;
    path?: string;
}

/**
 * Standard API Success Response Format
 */
export interface ApiSuccessResponse<T> {
    success: true;
    statusCode: number;
    message: string;
    data: T;
    timestamp?: string;
    path?: string;
}

/**
 * Standard API Response (can be success or error)
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Custom Error class for API errors
 */
export class ApiError extends Error {
    public readonly code?: string;
    public readonly statusCode: number;
    public readonly path?: string;
    public readonly timestamp?: string;

    constructor(
        message: string,
        statusCode: number,
        code?: string,
        path?: string,
        timestamp?: string
    ) {
        super(message);
        this.name = "ApiError";
        this.code = code;
        this.statusCode = statusCode;
        this.path = path;
        this.timestamp = timestamp;
        
        // Maintains proper stack trace for where our error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }
}

/**
 * Handles API responses and throws appropriate errors
 * 
 * @param response - The API response (can be success or error format)
 * @param defaultErrorMessage - Default error message if response doesn't have one
 * @returns The data from successful response
 * @throws ApiError if response indicates failure
 */
export function handleApiResponse<T>(
    response: ApiResponse<T>,
    defaultErrorMessage: string = "An error occurred"
): T {
    // Check if response indicates failure
    if (!response.success || !response.data) {
        const errorMessage = response.message || defaultErrorMessage;
        throw new ApiError(
            errorMessage,
            response.statusCode,
            response.error?.code,
            response.path,
            response.timestamp
        );
    }

    return response.data;
}

/**
 * Handles axios errors and converts them to ApiError
 * 
 * @param error - The axios error
 * @param defaultErrorMessage - Default error message if error doesn't have one
 * @throws ApiError
 */
export function handleAxiosError(
    error: unknown,
    defaultErrorMessage: string = "An error occurred"
): never {
    // If it's already our custom ApiError, re-throw it
    if (error instanceof ApiError) {
        throw error;
    }

    // Handle axios errors
    if (error instanceof AxiosError) {
        const responseData = error.response?.data as ApiErrorResponse | undefined;
        
        // If response has our standard error format
        if (responseData && !responseData.success) {
            throw new ApiError(
                responseData.message || defaultErrorMessage,
                responseData.statusCode || error.response?.status || 500,
                responseData.error?.code,
                responseData.path,
                responseData.timestamp
            );
        }

        // Otherwise, use axios error details
        const message = 
            (error.response?.data as { message?: string })?.message ||
            error.message ||
            defaultErrorMessage;
        
        throw new ApiError(
            message,
            error.response?.status || 500,
            undefined,
            error.config?.url,
            new Date().toISOString()
        );
    }

    // Handle other errors
    const message = error instanceof Error ? error.message : defaultErrorMessage;
    throw new ApiError(message, 500);
}

/**
 * Wraps an async API call with error handling
 * 
 * @param apiCall - The async API function to call
 * @param defaultErrorMessage - Default error message if error occurs
 * @returns The result of the API call
 * @throws ApiError if the API call fails
 */
export async function withErrorHandling<T>(
    apiCall: () => Promise<ApiResponse<T>>,
    defaultErrorMessage: string = "An error occurred"
): Promise<T> {
    try {
        const response = await apiCall();
        return handleApiResponse(response, defaultErrorMessage);
    } catch (error) {
        handleAxiosError(error, defaultErrorMessage);
        throw error; // This will never execute, but TypeScript needs it
    }
}
