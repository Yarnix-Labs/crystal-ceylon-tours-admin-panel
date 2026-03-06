import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { notificationService, Notification, NotificationStats } from "@/admin/services/notificationService";

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    readCount: number;
    stats: NotificationStats;
    loading: boolean;
    fetchNotifications: (page?: number) => Promise<void>;
    markAllRead: () => Promise<void>;
    markRead: (id: number) => Promise<void>;
    favorite: (id: number) => Promise<void>;
    unfavorite: (id: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [stats, setStats] = useState<NotificationStats>({ totalUnread: 0, totalRead: 0 });
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async (page: number = 1) => {
        setLoading(true);
        try {
            const response = await notificationService.getAll(page);
            if (response.success) {
                setNotifications(response.data.items);
                setStats(response.data.stats);
            }
        } catch (error) {
            toast.error("Failed to fetch notifications");
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-fetch notifications every 20 seconds
    useEffect(() => {
        fetchNotifications();
        
        const interval = setInterval(() => {
            fetchNotifications();
        }, 20000); // 20 seconds
        
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAllRead = useCallback(async () => {
        try {
            const response = await notificationService.markAllRead();
            if (response.success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setStats(prev => ({ totalUnread: 0, totalRead: prev.totalUnread + prev.totalRead }));
                toast.success("All notifications marked as read");
            }
        } catch (error) {
            toast.error("Failed to mark all as read");
        }
    }, []);

    const markRead = useCallback(async (id: number) => {
        try {
            const response = await notificationService.markRead(id);
            if (response.success) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
                setStats(prev => ({ ...prev, totalUnread: Math.max(0, prev.totalUnread - 1), totalRead: prev.totalRead + 1 }));
            }
        } catch (error) {
            toast.error("Failed to mark as read");
        }
    }, []);

    const favorite = useCallback(async (id: number) => {
        try {
            const response = await notificationService.favorite(id);
            if (response.success) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isFavorite: true } : n));
            }
        } catch (error) {
            toast.error("Failed to add to favorites");
        }
    }, []);

    const unfavorite = useCallback(async (id: number) => {
        try {
            const response = await notificationService.unfavorite(id);
            if (response.success) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isFavorite: false } : n));
            }
        } catch (error) {
            toast.error("Failed to remove from favorites");
        }
    }, []);

    const unreadCount = stats.totalUnread;
    const readCount = stats.totalRead;

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            unreadCount, 
            readCount,
            stats,
            loading,
            fetchNotifications,
            markAllRead, 
            markRead, 
            favorite,
            unfavorite
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
}
