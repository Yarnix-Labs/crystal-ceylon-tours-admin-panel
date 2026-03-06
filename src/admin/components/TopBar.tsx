import { Bell, Moon, Sun, User, LogOut, Settings, MessageSquare, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/admin/components/ui/Loader";
import { useTheme } from "@/admin/context/ThemeProvider";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminAuth } from "@/admin/context/AdminAuth";
import { useNotification } from "@/admin/context/NotificationContext";
import { useUser } from "@/admin/context/UserContext";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface TopBarProps {
    pageTitle: string;
}

export function TopBar({ pageTitle }: TopBarProps) {
    const { theme, toggleTheme } = useTheme();
    const { logout } = useAdminAuth();
    const { notifications, unreadCount, markAllRead, fetchNotifications, loading: notificationsLoading } = useNotification();
    const { avatarUrl, userName, userEmail, fetchUser } = useUser();
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            toast.success(`Goodbye ${userName}! Come back soon.`);
            await logout();
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleMarkAllRead = async () => {
        if (isMarkingAllRead || unreadCount === 0) return;
        setIsMarkingAllRead(true);
        try {
            await markAllRead();
        } finally {
            setIsMarkingAllRead(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return (
        <div className="flex items-center justify-between w-full px-1">
            <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                    {pageTitle}
                </h1>
            </div>
            
            <div className="flex items-center gap-2">
                {/* Notifications Dropdown */}
                <DropdownMenu onOpenChange={(open) => open && fetchNotifications()}>
                    <DropdownMenuTrigger asChild>
                        <div className="relative cursor-pointer">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 hover:scale-105"
                            >
                                <Bell className="h-5 w-5" />
                                <span className="sr-only">Notifications</span>
                            </Button>
                            {unreadCount > 0 && (
                                <Badge 
                                    className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center p-0 px-1 bg-gradient-to-r from-blue-500 to-blue-600 border-2 border-background text-[10px] font-bold shadow-lg pointer-events-none"
                                >
                                    {unreadCount}
                                </Badge>
                            )}
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 rounded-xl shadow-xl border-2 p-0" align="end">
                        <DropdownMenuLabel className="font-semibold px-4 py-3 border-b flex justify-between items-center bg-muted/30">
                            <span>Notifications</span>
                            <span className="text-xs font-normal text-muted-foreground">{unreadCount} unread</span>
                        </DropdownMenuLabel>
                        <div className="max-h-[300px] overflow-y-auto">
                            {notificationsLoading ? (
                                <div className="p-8 flex flex-col items-center justify-center gap-3">
                                    <Loader size="lg" />
                                    <span className="text-sm text-muted-foreground">Loading notifications...</span>
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.slice(0, 5).map((notification) => (
                                    <DropdownMenuItem 
                                        key={notification.id}
                                        className="p-4 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors border-b last:border-0 items-start gap-3 group"
                                        onSelect={() => navigate("/admin/notifications")}
                                    >
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                            notification.type === 'booking' ? 'bg-blue-500/10 group-hover:bg-blue-500/20' :
                                            notification.type === 'review' ? 'bg-green-500/10 group-hover:bg-green-500/20' :
                                            notification.type === 'alert' ? 'bg-amber-500/10 group-hover:bg-amber-500/20' :
                                            'bg-gray-500/10 group-hover:bg-gray-500/20'
                                        }`}>
                                            {notification.type === 'booking' ? <Bell className="h-4 w-4 text-blue-600 group-hover:text-blue-700" /> :
                                             notification.type === 'review' ? <MessageSquare className="h-4 w-4 text-green-600 group-hover:text-green-700" /> :
                                             notification.type === 'alert' ? <Bell className="h-4 w-4 text-amber-600 group-hover:text-amber-700" /> :
                                             <Settings className="h-4 w-4 text-gray-600 group-hover:text-gray-700" />}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">{notification.title}</p>
                                            <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/80 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground group-hover:text-primary-foreground/70 font-medium pt-1">{notification.createdAt}</p>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="h-2 w-2 bg-blue-500 rounded-full shrink-0 group-hover:bg-blue-400" />
                                        )}
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <div className="p-4 text-center text-muted-foreground text-sm">
                                    No notifications
                                </div>
                            )}
                        </div>
                        <div className="p-2 border-t bg-muted/30 flex gap-2">
                             <Button 
                                variant="ghost" 
                                size="sm" 
                                className="flex-1 text-xs h-8 text-muted-foreground hover:text-white hover:bg-primary transition-colors"
                                onClick={handleMarkAllRead}
                                disabled={unreadCount === 0 || isMarkingAllRead}
                            >
                                {isMarkingAllRead ? (
                                    <Loader size="sm" />
                                ) : (
                                    "Mark all as read"
                                )}
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="flex-1 text-xs h-8 text-muted-foreground hover:text-white hover:bg-primary transition-colors"
                                onClick={() => navigate("/admin/notifications")}
                            >
                                View all
                            </Button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 hover:scale-105 hover:rotate-12"
                >
                    {theme === "light" ? (
                        <Moon className="h-5 w-5" />
                    ) : (
                        <Sun className="h-5 w-5" />
                    )}
                    <span className="sr-only">Toggle theme</span>
                </Button>

                {/* Divider */}
                <div className="h-8 w-px bg-border/50 mx-1" />

                {/* Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative h-10 gap-3 pl-2 pr-3 rounded-xl hover:bg-accent transition-all duration-200 hover:shadow-md group"
                        >
                            <Avatar className="h-8 w-8 ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-200">
                                <AvatarImage src={avatarUrl} alt={userName} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-bold shadow-inner">
                                    {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:flex flex-col items-start transition-opacity">
                                <span className="text-sm font-semibold text-foreground">{userName.split(' ')[0]}</span>
                                <span className="text-xs text-muted-foreground">{userEmail}</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[calc(100vw-2rem)] sm:w-80 rounded-xl shadow-xl border-2 p-2"
                        align="end"
                        forceMount
                    >
                        <DropdownMenuLabel className="font-normal px-3 py-2">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 ring-2 ring-blue-500/30">
                                    <AvatarImage src={avatarUrl} alt={userName} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-base font-bold">
                                        {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col space-y-1 overflow-hidden">
                                    <p className="text-sm font-bold leading-none truncate">{userName}</p>
                                    <p className="text-xs leading-none text-muted-foreground font-medium truncate">
                                        {userEmail}
                                    </p>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem 
                            className="rounded-lg py-2.5 px-3 cursor-pointer transition-colors"
                            onClick={() => navigate("/admin/profile")}
                        >
                            <User className="mr-3 h-4 w-4 text-blue-500" />
                            <span className="font-medium">My Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            className="rounded-lg py-2.5 px-3 cursor-pointer transition-colors"
                            onClick={() => navigate("/admin/settings")}
                        >
                            <Settings className="mr-3 h-4 w-4 text-blue-500" />
                            <span className="font-medium">Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            className="rounded-lg py-2.5 px-3 cursor-pointer transition-colors"
                            onClick={() => navigate("/admin/support")}
                        >
                            <LifeBuoy className="mr-3 h-4 w-4 text-blue-500" />
                            <span className="font-medium">Support / Help</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem 
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="rounded-lg py-2.5 px-3 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 transition-colors font-medium disabled:opacity-50"
                        >
                            {isLoggingOut ? (
                                <Loader size="sm" className="mr-3" />
                            ) : (
                                <LogOut className="mr-3 h-4 w-4" />
                            )}
                            <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}