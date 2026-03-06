import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, Clock, Calendar, MessageSquare, AlertTriangle, Trash2, CheckCircle2, Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Star, Lock, CheckCheck } from "lucide-react";
import { Loader, ButtonLoader } from "@/admin/components/ui/Loader";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotification } from "@/admin/context/NotificationContext";
import { notificationService, Notification, NotificationStats } from "@/admin/services/notificationService";
import { useToast } from "@/components/ui/use-toast";

export default function Notifications() {
    const { toast } = useToast();
    const { 
        notifications: contextNotifications, 
        stats: contextStats, 
        loading: contextLoading,
        fetchNotifications: fetchContextNotifications,
        markAllRead: contextMarkAllRead,
        markRead: contextMarkRead,
        favorite,
        unfavorite
    } = useNotification();
    
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [stats, setStats] = useState<NotificationStats>({ totalUnread: 0, totalRead: 0 });
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [loading, setLoading] = useState(false);
    
    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    const [activeTab, setActiveTab] = useState<"all" | "unread" | "read" | "favorites">("all");

    // Sync with context on mount
    useEffect(() => {
        fetchContextNotifications();
    }, [fetchContextNotifications]);

    // Update local state when context changes
    useEffect(() => {
        setNotifications(contextNotifications);
        setStats(contextStats);
    }, [contextNotifications, contextStats]);

    const [fetching, setFetching] = useState(false);

    // Fetch notifications with pagination
    const fetchNotifications = async (page: number = 1, showLoading: boolean = true) => {
        if (showLoading) {
            setLoading(true);
        } else {
            setFetching(true);
        }
        try {
            let response;
            if (activeTab === "favorites") {
                response = await notificationService.getFavorites(page);
            } else {
                response = await notificationService.getAll(page);
            }

            if (response.success) {
                setNotifications(response.data.items);
                setStats(response.data.stats);
                setCurrentPage(response.data.meta.page);
                setTotalPages(response.data.meta.totalPages);
                setTotalItems(response.data.meta.total);
                setHasNextPage(response.data.meta.hasNextPage);
                setHasPreviousPage(response.data.meta.hasPreviousPage);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch notifications",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
            setFetching(false);
        }
    };

    // Fetch on mount and when tab/page changes
    useEffect(() => {
        fetchNotifications(1);
    }, [activeTab]);

    // Handle page change
    const handlePageChange = (page: number) => {
        fetchNotifications(page, false);
    };

    // Mark all as read
    const handleMarkAllRead = async () => {
        try {
            await contextMarkAllRead();
            toast({
                title: "Success",
                description: "All notifications marked as read",
            });
            fetchNotifications(currentPage);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to mark all as read",
                variant: "destructive",
            });
        }
    };

    // Mark single as read
    const handleMarkRead = async (id: number) => {
        try {
            await contextMarkRead(id);
            toast({
                title: "Success",
                description: "Notification marked as read",
            });
            fetchNotifications(currentPage);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to mark as read",
                variant: "destructive",
            });
        }
    };

    // Toggle favorite
    const handleToggleFavorite = async (id: number, isFavorite: boolean) => {
        try {
            if (isFavorite) {
                await unfavorite(id);
            } else {
                await favorite(id);
            }
            
            toast({
                title: "Success",
                description: isFavorite ? "Removed from favorites" : "Added to favorites",
            });
            fetchNotifications(currentPage);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update favorite status",
                variant: "destructive",
            });
        }
    };

    const getIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case "auth": return <Lock className="h-5 w-5 text-blue-500" />;
            case "success": return <CheckCheck className="h-5 w-5 text-green-500" />;
            case "booking": return <Calendar className="h-5 w-5 text-blue-500" />;
            case "review": return <MessageSquare className="h-5 w-5 text-green-500" />;
            case "alert": return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            default: return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type.toLowerCase()) {
            case "auth": return "bg-blue-500/10";
            case "success": return "bg-green-500/10";
            case "booking": return "bg-blue-500/10";
            case "review": return "bg-green-500/10";
            case "alert": return "bg-amber-500/10";
            default: return "bg-gray-500/10";
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMins = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMs / 3600000);
        const diffInDays = Math.floor(diffInMs / 86400000);

        if (diffInMins < 1) return "Just now";
        if (diffInMins < 60) return `${diffInMins}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Filter notifications based on search and type
    const filteredNotifications = notifications.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            n.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "all" || n.type?.toLowerCase() === typeFilter.toLowerCase();
        const matchesStatus = activeTab === "all" ? true : 
                            activeTab === "unread" ? !n.isRead : 
                            activeTab === "read" ? n.isRead :
                            activeTab === "favorites" ? n.isFavorite : true;
        
        return matchesSearch && matchesType && matchesStatus;
    });

    const NotificationList = ({ items }: { items: Notification[] }) => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-16">
                    <Loader size="lg" />
                    <p className="text-muted-foreground text-sm mt-4">Loading notifications...</p>
                </div>
            );
        }

        if (fetching) {
            return (
                <div className="flex flex-col items-center justify-center py-16">
                    <Loader size="lg" />
                    <p className="text-muted-foreground text-sm mt-4">Updating...</p>
                </div>
            );
        }

        if (items.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Bell className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">No notifications found</h3>
                    <p className="text-muted-foreground text-sm max-w-sm">
                        {searchQuery || typeFilter !== "all" 
                            ? "Try adjusting your filters to find what you're looking for." 
                            : "You're all caught up! No notifications to display."}
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {items.map((notification) => (
                        <motion.div
                            key={notification.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div 
                                className={cn(
                                    "group relative flex gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md",
                                    notification.isRead 
                                        ? "bg-card/50 border-border opacity-75 hover:opacity-100" 
                                        : "bg-card border-l-4 border-l-primary shadow-sm"
                                )}
                            >
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-colors mt-0.5",
                                    notification.isRead ? "bg-muted" : getBgColor(notification.type || "")
                                )}>
                                    {getIcon(notification.type || "")}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1 overflow-hidden">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <h3 className={cn("text-sm font-medium truncate", !notification.isRead && "text-foreground font-semibold")}>
                                                {notification.title}
                                            </h3>
                                            {!notification.isRead && (
                                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary/10 text-primary hover:bg-primary/20">New</Badge>
                                            )}
                                            {notification.isFavorite && (
                                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0 whitespace-nowrap">
                                            <Clock className="h-3 w-3" /> {formatDate(notification.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                        {notification.message}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity justify-center">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className={cn(
                                            "h-8 w-8 hover:bg-amber-500/10",
                                            notification.isFavorite ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"
                                        )}
                                        onClick={() => handleToggleFavorite(notification.id, notification.isFavorite)} 
                                        title={notification.isFavorite ? "Remove from favorites" : "Add to favorites"}
                                        disabled={contextLoading}
                                    >
                                        {contextLoading ? <Loader size="sm" /> : <Star className={cn("h-4 w-4", notification.isFavorite && "fill-current")} />}
                                    </Button>
                                    {!notification.isRead && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-blue-500 hover:bg-blue-500/10 hover:text-blue-600" 
                                            onClick={() => handleMarkRead(notification.id)} 
                                            title="Mark as read"
                                            disabled={contextLoading}
                                        >
                                            {contextLoading ? <Loader size="sm" /> : <CheckCircle2 className="h-4 w-4" />}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="p-6 space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
                        <p className="text-muted-foreground mt-1">
                            Stay updated with your account activities and important updates.
                        </p>
                    </div>
                     <div className="flex gap-2">
                        {stats.totalUnread > 0 && (
                            <Button 
                                onClick={handleMarkAllRead} 
                                variant="outline"
                                className="gap-2"
                                disabled={contextLoading}
                            >
                                <ButtonLoader loading={contextLoading}>
                                    <Check className="w-4 h-4" />
                                    Mark all as read
                                </ButtonLoader>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <Card className="border border-border bg-white dark:bg-card shadow-sm">
                    <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setActiveTab(value as any)}>
                        <div className="p-4 border-b border-border space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="overflow-x-auto">
                                <TabsList className="bg-muted/50 p-1 h-10 w-fit">
                                    <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                                        All
                                        <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">{totalItems}</Badge>
                                    </TabsTrigger>
                                    <TabsTrigger value="unread" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                                        Unread
                                        {stats.totalUnread > 0 && (
                                            <Badge variant="default" className="ml-2 h-5 px-1.5 text-[10px] bg-primary text-primary-foreground">{stats.totalUnread}</Badge>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger value="read" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                                        Read
                                        {stats.totalRead > 0 && (
                                            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">{stats.totalRead}</Badge>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger value="favorites" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                                        <Star className="h-3.5 w-3.5 mr-1" />
                                        Favorites
                                    </TabsTrigger>
                                </TabsList>
                                </div>

                                <div className="flex items-center gap-2 flex-1 sm:justify-end">
                                    <div className="relative w-full max-w-xs min-w-0">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input 
                                            placeholder="Search..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 h-9 bg-background"
                                        />
                                    </div>
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger className="w-[130px] h-9 bg-background">
                                            <div className="flex items-center gap-2">
                                                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                                                <SelectValue placeholder="Type" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="auth">Auth</SelectItem>
                                            <SelectItem value="success">Success</SelectItem>
                                            <SelectItem value="booking">Bookings</SelectItem>
                                            <SelectItem value="review">Reviews</SelectItem>
                                            <SelectItem value="alert">Alerts</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <CardContent className="p-0">
                            <ScrollArea className="h-[600px] p-4">
                                <TabsContent value="all" className="mt-0 space-y-4">
                                    <NotificationList items={filteredNotifications} />
                                </TabsContent>
                                <TabsContent value="unread" className="mt-0 space-y-4">
                                    <NotificationList items={filteredNotifications} />
                                </TabsContent>
                                <TabsContent value="read" className="mt-0 space-y-4">
                                    <NotificationList items={filteredNotifications} />
                                </TabsContent>
                                <TabsContent value="favorites" className="mt-0 space-y-4">
                                    <NotificationList items={filteredNotifications} />
                                </TabsContent>
                            </ScrollArea>
                            
                            {/* Pagination */}
                            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/10">
                                <div className="text-sm text-muted-foreground">
                                    Showing page {currentPage} of {totalPages} ({totalItems} total)
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handlePageChange(1)}
                                        disabled={!hasPreviousPage || loading}
                                    >
                                        <ChevronsLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={!hasPreviousPage || loading}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm font-medium px-3">{currentPage}</span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={!hasNextPage || loading}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={!hasNextPage || loading}
                                    >
                                        <ChevronsRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
}