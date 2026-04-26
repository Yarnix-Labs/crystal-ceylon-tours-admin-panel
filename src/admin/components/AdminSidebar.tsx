import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    Map,
    Palmtree,
    FileText,
    Image,
    LogOut,
    Briefcase,
    Star,
    Bell,
    Settings,
    MessageSquare,
    CalendarRange,
    Mail,
    MapPinned,
    Car,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAdminAuth } from "@/admin/context/AdminAuth";
import { useUser } from "@/admin/context/UserContext";
import { Loader } from "@/admin/components/ui/Loader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.jpeg";

const getAdminPath = (path: string) => (path === "/" ? "/admin" : `/admin${path}`);

const menuItems = [
    { title: "Dashboard", path: "/", icon: LayoutDashboard },
    { title: "Booking Inquiries", path: "/bookings", icon: CalendarRange },
    { title: "Custom Bookings", path: "/custom-bookings", icon: MapPinned },
    { title: "Quick Bookings", path: "/quick-bookings", icon: Car },
    { title: "Contact Messages", path: "/messages", icon: MessageSquare },
    { title: "Tour Packages", path: "/tours", icon: Briefcase },
    { title: "Destinations", path: "/destinations", icon: Map },
    { title: "Things To Do", path: "/things-to-do", icon: Palmtree },
    { title: "Blog Posts", path: "/blog", icon: FileText },
    { title: "Image Gallery", path: "/media", icon: Image },
    { title: "Customer Reviews", path: "/reviews", icon: Star },
    { title: "Email List", path: "/email-list", icon: Mail },
    { title: "Notifications", path: "/notifications", icon: Bell },
];

export function AdminSidebar() {
    const location = useLocation();
    const { logout } = useAdminAuth();
    const { userName } = useUser();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }
        setIsLoggingOut(true);
        try {
            toast.success(`Goodbye ${userName}! Come back soon.`);
            await logout();
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <Sidebar collapsible="icon" className="border-r-0">
            <SidebarHeader className="border-b border-white/5">
                <div className="flex items-center gap-3 px-3 py-5 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center transition-all duration-300 ease-out">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-sm shrink-0 group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:w-11 transition-all duration-300 ease-out p-1">
                        <div className="w-full h-full bg-white rounded-lg flex items-center justify-center overflow-hidden">
                            <img src={logo} alt="Crystal Ceylon Tours" className="h-full w-full object-cover" />
                        </div>
                    </div>
                    <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-bold tracking-wide text-[13px] flex items-center gap-0.5">
                            <span className="text-[#02aad7]">Crystal</span>
                            <span className="text-[#fbb03b]">Ceylon Tours</span>
                        </span>
                        <span className="truncate text-[9px] text-white/50 font-semibold uppercase tracking-widest mt-0.5">
                            Admin Panel
                        </span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="py-4">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1 px-2">
                            {menuItems.map((item) => {
                                const url = getAdminPath(item.path);
                                const isActive =
                                    location.pathname === url ||
                                    (item.path !== "/" && location.pathname.startsWith(`${url}/`)) ||
                                    (item.path === "/" && location.pathname === url);

                                return (
                                    <SidebarMenuItem
                                        key={item.title}
                                        className="transition-all duration-300 ease-out"
                                    >
                                        <SidebarMenuButton
                                            isActive={isActive}
                                            tooltip={item.title}
                                            className={cn(
                                                "relative h-10 px-3 text-sm rounded-lg",
                                                "transition-all duration-300 ease-out",
                                                "group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10",
                                                "group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center",
                                                !isActive && "text-white/70 hover:bg-[#fbb03b] hover:text-white hover:translate-x-0.5 active:scale-[0.98]"
                                            )}
                                            style={isActive ? {
                                                background: 'linear-gradient(to right, rgb(251, 176, 59), rgb(230, 150, 40))',
                                                color: 'white',
                                                fontWeight: '600',
                                                boxShadow: '0 4px 6px -1px rgba(251, 176, 59, 0.3)'
                                            } : {}}
                                        >
                                            <Link
                                                to={url}
                                                className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center transition-all duration-300 ease-out"
                                            >
                                                <item.icon
                                                    className={cn(
                                                        "h-[18px] w-[18px] shrink-0 transition-transform duration-300 ease-out",
                                                        isActive ? "scale-110" : "group-hover:scale-105"
                                                    )}
                                                />
                                                <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                                                {isActive && (
                                                    <div className="absolute inset-0 rounded-lg bg-white/10 group-data-[collapsible=icon]:hidden pointer-events-none" />
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-sidebar-border p-2 mt-auto">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            tooltip="Logout"
                            className="h-11 px-3 text-white/70 hover:bg-[#fbb03b] hover:text-white rounded-lg group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center font-medium transition-all duration-300 ease-out active:scale-[0.98]"
                        >
                            {isLoggingOut ? (
                                <Loader size="sm" />
                            ) : (
                                <LogOut className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105" />
                            )}
                            <span className="group-data-[collapsible=icon]:hidden">{isLoggingOut ? "Logging out..." : "Logout"}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}