
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AdminSidebar } from "@/admin/components/AdminSidebar";
import { TopBar } from "@/admin/components/TopBar";
import { ThemeProvider } from "@/admin/context/ThemeProvider";
import { NotificationProvider } from "@/admin/context/NotificationContext";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAdminAuth } from "@/admin/context/AdminAuth";

const getAdminBasePath = () => "/admin";
const getAdminPath = (path: string) => (path === "/" ? "/admin" : `/admin${path}`);

// Map paths to page titles
const pageTitles: Record<string, string> = {
    "": "Dashboard",
    "tours": "Tour Packages",
    "destinations": "Destinations",
    "things-to-do": "Things To Do",
    "blog": "Blog Posts",
    "media": "Image Gallery",
    "reviews": "Customer Reviews",
    "profile": "My Profile",
    "settings": "Settings",
    "notifications": "Notifications",
    "messages": "Contact Messages",
    "bookings": "Booking Inquiries",
};

function getPageTitle(pathname: string, basePath: string): string {
    const pathWithoutBase = basePath 
        ? pathname.replace(basePath, '') 
        : pathname;
    const segments = pathWithoutBase.split('/').filter(Boolean);
    
    // Check if editing/creating (has ID or "new" segment)
    if (segments.length > 1) {
        const baseTitle = pageTitles[segments[0]] || segments[0];
        if (segments[1] === "new") {
            return `New ${baseTitle.replace(/s$/, '')}`;
        }
        return `Edit ${baseTitle.replace(/s$/, '')}`;
    }
    
    return pageTitles[segments[0] || ""] || "Dashboard";
}

function AdminLayoutContent() {
    const location = useLocation();
    const { isAuthenticated, isLoading } = useAdminAuth();
    const basePath = getAdminBasePath();
    const pageTitle = getPageTitle(location.pathname, basePath);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={getAdminPath("/login")} state={{ from: location }} replace />;
    }

    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset className="bg-background">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-card/80 backdrop-blur-sm px-6 sticky top-0 z-10 transition-all">
                    <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <TopBar pageTitle={pageTitle} />
                </header>
                <main className="flex-1 p-6 overflow-auto">
                    <div
                        key={location.pathname}
                        className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-300"
                    >
                        <Outlet />
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}

export default function AdminLayout() {
    return (
        <ThemeProvider>
            <NotificationProvider>
                <AdminLayoutContent />
            </NotificationProvider>
        </ThemeProvider>
    );
}
