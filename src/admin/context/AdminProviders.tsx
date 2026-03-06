import { ReactNode } from "react";
import { AdminAuthProvider } from "./AdminAuth";
import { UserProvider } from "./UserContext";

export const AdminProviders = ({ children }: { children: ReactNode }) => {
    return (
        <AdminAuthProvider>
            <UserProvider>
                {children}
            </UserProvider>
        </AdminAuthProvider>
    );
};
