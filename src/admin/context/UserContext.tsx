import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { profileService, UserProfile } from "@/admin/services/profileService";

interface UserContextType {
    user: UserProfile | null;
    avatarUrl: string;
    userName: string;
    userEmail: string;
    fetchUser: () => Promise<void>;
    updateAvatar: (url: string) => void;
    updateUser: (user: UserProfile) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string>("");
    const [userName, setUserName] = useState<string>("Admin User");
    const [userEmail, setUserEmail] = useState<string>("admin@ravlankatravels.com");

    const fetchUser = useCallback(async () => {
        try {
            const response = await profileService.getMe();
            if (response.success && response.data) {
                setUser(response.data);
                setAvatarUrl(response.data.avatar || "");
                setUserName(`${response.data.firstName} ${response.data.lastName}`);
                setUserEmail(response.data.email);
            }
        } catch (error) {
            console.error("[UserContext] Failed to fetch user");
        }
    }, []);

    const updateAvatar = useCallback((url: string) => {
        setAvatarUrl(url);
        if (user) {
            setUser({ ...user, avatar: url });
        }
    }, [user]);

    const updateUser = useCallback((newUser: UserProfile) => {
        setUser(newUser);
        setAvatarUrl(newUser.avatar || "");
        setUserName(`${newUser.firstName} ${newUser.lastName}`);
        setUserEmail(newUser.email);
    }, []);

    return (
        <UserContext.Provider
            value={{
                user,
                avatarUrl,
                userName,
                userEmail,
                fetchUser,
                updateAvatar,
                updateUser,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
