import axiosInstance from "@/api";
import { ENDPOINTS } from "@/api/endpoints";



/**
 * User profile
 */
export interface UserProfile {

    id: string;

    email: string;

    firstName: string;

    lastName: string;

    phone: string;

    avatar: string | null;

    role: string;

    status: string;

    createdAt: string;
}



/**
 * Get profile response
 */
export interface GetProfileResponse {

    success: boolean;

    statusCode: number;

    message: string;

    data: UserProfile;

    timestamp: string;

    path: string;
}



/**
 * Update profile payload
 */
export interface UpdateProfilePayload {

    firstName: string;

    lastName: string;

    phoneNumber: string;

    avatar?: string;
}



/**
 * Upload profile image response
 */
export interface UploadProfileResponse {

    success: boolean;

    statusCode: number;

    message: string;

    data: {
        url: string;
    };

    timestamp: string;

    path: string;
}

export interface ChangePasswordPayload {

    currentPassword: string;

    newPassword: string;

    confirmPassword: string;
}


export interface ChangePasswordResponse {

    success: boolean;

    statusCode: number;

    message: string;

    data: null;

    timestamp: string;

    path: string;
}

/**
 * Profile Service
 */
export const profileService = {



    /**
     * GET /auth/me
     */
    async getMe(): Promise<GetProfileResponse> {

        const { data } =
            await axiosInstance.get(
                ENDPOINTS.authMe
            );

        return data;
    },



    /**
     * PUT /auth/profile/update
     */
    async updateProfile(
        payload: UpdateProfilePayload
    ): Promise<GetProfileResponse> {

        const { data } =
            await axiosInstance.put(
                ENDPOINTS.authUpdateProfile,
                payload
            );

        return data;
    },



    /**
     * POST /storage/upload/profile
     */
    async uploadProfileImage(
        file: File
    ): Promise<UploadProfileResponse> {

        const formData = new FormData();

        formData.append("file", file);

        const { data } =
            await axiosInstance.post(
                ENDPOINTS.storageUploadProfile,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

        return data;
    },

    /**
 * POST /auth/change/password
 */
async changePassword(
    payload: ChangePasswordPayload
): Promise<ChangePasswordResponse> {

    const { data } =
        await axiosInstance.post(
            ENDPOINTS.authChangePassword,
            payload
        );

    return data;
},


};
