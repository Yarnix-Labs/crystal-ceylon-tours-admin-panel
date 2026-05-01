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
    Zap,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAdminAuth } from "@/admin/context/AdminAuth";
import { useUser } from "@/admin/context/UserContext";
import { Loader } from "@/admin/components/ui/Loader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.jpeg";

const getAdminPath = (path: string) => (path === "/" ? "/dashboard" : `/dashboard${path}`);

const menuItems = [
    { title: "Dashboard", path: "/", icon: LayoutDashboard },
    { title: "Booking Inquiries", path: "/bookings", icon: CalendarRange },
    { title: "Custom Bookings", path: "/custom-bookings", icon: MapPinned },
    { title: "Quick Bookings", path: "/quick-bookings", icon: Zap },
    { title: "Contact Messages", path: "/messages", icon: MessageSquare },
    { title: "Tour Packages", path: "/tours", icon: Briefcase },
    { title: "Destinations", path: "/destinations", icon: Map },
    { title: "Things To Do", path: "/things-to-do", icon: Palmtree },
    { title: "Blog Posts", path: "/blog", icon: FileText },
    { title: "Image Gallery", path: "/media", icon: Image },
    { title: "Vehicles", path: "/vehicles", icon: Car },
    { title: "Customer Reviews", path: "/reviews", icon: Star },
    { title: "Email List", path: "/email-list", icon: Mail },
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
        <Sidebar collapsible="icon" className="border-r-0 bg-[#0f172a] text-white flex flex-col h-screen overflow-hidden">
            <SidebarHeader className="border-b border-white/5 bg-[#0f172a] shrink-0">
                <div className="flex items-center gap-3 px-3 py-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center transition-all duration-300 ease-in-out">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-lg shrink-0 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 transition-all duration-500 ease-out p-1 hover:scale-105 active:scale-95">
                        <div className="w-full h-full bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-inner">
                            <img src={logo} alt="Crystal Ceylon Tours" className="h-full w-full object-cover" />
                        </div>
                    </div>
                    <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden animate-in fade-in slide-in-from-left-2 duration-500">
                        <span className="truncate font-black tracking-tight text-[13px] flex items-center gap-0.5">
                            <span className="text-[#02aad7]">CRYSTAL</span>
                            <span className="text-[#fbb03b]">CEYLON</span>
                        </span>
                        <span className="truncate text-[8px] text-white/40 font-bold uppercase tracking-[0.2em] mt-0.5">
                            Management Suite
                        </span>
                    </div>
                </div>
            </SidebarHeader>
            
            <SidebarContent className="flex-1 overflow-y-auto bg-[#0f172a] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <SidebarGroup className="py-2">
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0.5 px-2">
                            {menuItems.map((item) => {
                                const url = getAdminPath(item.path);
                                const isActive =
                                    location.pathname === url ||
                                    (item.path !== "/" && location.pathname.startsWith(`${url}/`)) ||
                                    (item.path === "/" && location.pathname === url);

                                return (
                                    <SidebarMenuItem
                                        key={item.title}
                                        className="transition-all duration-200 ease-out"
                                    >
                                        <SidebarMenuButton
                                            isActive={isActive}
                                            tooltip={item.title}
                                            className={cn(
                                                "relative h-9 px-3 text-sm rounded-lg overflow-hidden",
                                                "transition-all duration-200 ease-in-out",
                                                "group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9",
                                                "group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center",
                                                isActive 
                                                    ? "text-white shadow-lg shadow-black/20" 
                                                    : "text-white/50 hover:text-white hover:bg-white/5 active:scale-[0.98]"
                                            )}
                                            style={isActive ? {
                                                background: 'linear-gradient(135deg, #fbb03b 0%, #d98d1a 100%)',
                                            } : {}}
                                        >
                                            <Link
                                                to={url}
                                                className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
                                            >
                                                <item.icon
                                                    className={cn(
                                                        "h-4 w-4 shrink-0 transition-all duration-300",
                                                        isActive ? "scale-110 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" : "group-hover:scale-110 opacity-70 group-hover:opacity-100"
                                                    )}
                                                />
                                                <span className={cn(
                                                    "truncate group-data-[collapsible=icon]:hidden font-semibold text-[13px]",
                                                    isActive ? "tracking-wide" : "tracking-normal"
                                                )}>
                                                    {item.title}
                                                </span>
                                            </Link>
                                            {/* Active Indicator Glow */}
                                            {isActive && (
                                                <div className="absolute right-0 top-1/4 bottom-1/4 w-1 bg-white/40 rounded-l-full blur-[1px]" />
                                            )}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            
            <SidebarFooter className="border-t border-white/5 bg-[#0f172a] p-2 shrink-0">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            tooltip="Logout"
                            className="h-10 px-3 text-white/50 hover:bg-destructive/10 hover:text-destructive rounded-lg group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center font-bold transition-all duration-300 ease-out active:scale-[0.95]"
                        >
                            {isLoggingOut ? (
                                <Loader size="sm" />
                            ) : (
                                <LogOut className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-1" />
                            )}
                            <span className="group-data-[collapsible=icon]:hidden text-[13px] ml-3">{isLoggingOut ? "Logging out..." : "Sign Out"}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail className="hover:after:bg-primary/20 transition-all" />
        </Sidebar>
    );
}