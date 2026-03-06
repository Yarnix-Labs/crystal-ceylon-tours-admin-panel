
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, TrendingUp, TrendingDown, MessageSquare, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { VisitorChart } from "@/admin/components/dashboard/VisitorChart";
import { InquiryChart } from "@/admin/components/dashboard/InquiryChart";
import { CountryChart } from "@/admin/components/dashboard/CountryChart";
import { TrafficChart } from "@/admin/components/dashboard/TrafficChart";
import { DeviceChart } from "@/admin/components/dashboard/DeviceChart";
import { useEffect, useState } from "react";
import { dashboardService } from "@/admin/services/dashboardService";
import { toast } from "sonner";

interface StatCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ElementType;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    iconColor?: string;
    iconBgColor?: string;
}

function StatCard({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend, 
    trendValue,
    iconColor = "text-primary",
    iconBgColor = "bg-primary/10"
}: StatCardProps) {
    return (
        <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", iconBgColor)}>
                    <Icon className={cn("h-5 w-5", iconColor)} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight">{value}</div>
                <div className="flex items-center text-sm mt-2">
                    {trend === "up" && (
                        <div className="flex items-center text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full mr-2">
                            <TrendingUp className="mr-1 h-3.5 w-3.5" />
                            <span className="font-medium">{trendValue}</span>
                        </div>
                    )}
                    {trend === "down" && (
                        <div className="flex items-center text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full mr-2">
                            <TrendingDown className="mr-1 h-3.5 w-3.5" />
                            <span className="font-medium">{trendValue}</span>
                        </div>
                    )}
                    <span className="text-muted-foreground ml-1">{description}</span>
                </div>
            </CardContent>
        </Card>
    );
}


export default function Dashboard() {
    const [stats, setStats] = useState({
        totalBookingsCurrentMonth: 0,
        confirmedBookingsCurrentMonth: 0,
        conversionRateCurrentMonth: 0,
        unreadMessages: 0,
    });
    const [weeklyBookings, setWeeklyBookings] = useState<{ day: string; count: number }[]>([]);
    const [overviewData, setOverviewData] = useState<{
        countries: Array<{ country: string; activeUsers: number }>;
        deviceTypes: { desktop: number; mobile: number; tablet: number };
        visitorInsights: Array<{ date: string; activeUsers: number }>;
        trafficSources: Array<{ source: string; activeUsers: number }>;
    } | null>(null);
    const [totalVisitors, setTotalVisitors] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            // Fetch stats, analytics, and overview in parallel
            const [statsResponse, analyticsResponse, overviewResponse] = await Promise.all([
                dashboardService.getStats(),
                dashboardService.getAnalytics(),
                dashboardService.getOverview().catch(err => {
                    console.error("Error fetching overview:", err);
                    return null;
                }),
            ]);
            
            if (statsResponse.success && statsResponse.data) {
                setStats(statsResponse.data);
            }
            
            if (analyticsResponse.success && analyticsResponse.data) {
                setWeeklyBookings(analyticsResponse.data.weeklyBookings);
            }

            if (overviewResponse) {
                setOverviewData(overviewResponse);
                // Calculate total visitors from visitorInsights
                const total = overviewResponse.visitorInsights.reduce(
                    (sum, insight) => sum + insight.activeUsers,
                    0
                );
                setTotalVisitors(total);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* 1. Header is handled by layout, so we start with stats */}
            
            {/* KPI Cards Row */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard
                    title="Total Visitors"
                    value={isLoading ? "-" : totalVisitors.toLocaleString()}
                    description="last 30 days"
                    trend="up"
                    trendValue="+12%"
                    icon={Users}
                    iconColor="text-blue-600"
                    iconBgColor="bg-blue-100 dark:bg-blue-500/10"
                />
                <StatCard
                    title="Booking Inquiries"
                    value={isLoading ? "-" : stats.totalBookingsCurrentMonth.toString()}
                    description="this month"
                    trend="up"
                    trendValue="+8%"
                    icon={FileText}
                    iconColor="text-purple-600"
                    iconBgColor="bg-purple-100 dark:bg-purple-500/10"
                />
                <StatCard
                    title="Confirmed Bookings"
                    value={isLoading ? "-" : stats.confirmedBookingsCurrentMonth.toString()}
                    description="this month"
                    trend="up"
                    trendValue="+15%"
                    icon={CalendarCheck}
                    iconColor="text-emerald-600"
                    iconBgColor="bg-emerald-100 dark:bg-emerald-500/10"
                />
                <StatCard
                    title="Conversion Rate"
                    value={isLoading ? "-" : `${stats.conversionRateCurrentMonth}%`}
                    description="avg. rate"
                    trend="down"
                    trendValue="-0.5%"
                    icon={TrendingUp}
                    iconColor="text-amber-600"
                    iconBgColor="bg-amber-100 dark:bg-amber-500/10"
                />
                <StatCard
                    title="Unread Messages"
                    value={isLoading ? "-" : stats.unreadMessages.toString()}
                    description="needs attention"
                    trend="neutral"
                    trendValue=""
                    icon={MessageSquare}
                    iconColor="text-rose-600"
                    iconBgColor="bg-rose-100 dark:bg-rose-500/10"
                />
            </div>

            {/* Row 1: Main Chart */}
            <Card className="border-0 shadow-sm bg-card">
                <CardHeader>
                    <CardTitle className="text-lg">Website Visitors</CardTitle>
                    <CardDescription>
                        Traffic overview for the last 30 days
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <VisitorChart data={overviewData?.visitorInsights || []} />
                </CardContent>
            </Card>

            {/* Row 2: Secondary Charts */}
            <div className="grid gap-5 md:grid-cols-3">
                <Card className="border-0 shadow-sm bg-card">
                    <CardHeader>
                        <CardTitle className="text-base">Device Types</CardTitle>
                        <CardDescription>User device breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DeviceChart data={overviewData?.deviceTypes || { desktop: 0, mobile: 0, tablet: 0 }} />
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-card">
                    <CardHeader>
                        <CardTitle className="text-base">Top Countries</CardTitle>
                        <CardDescription>By visitor count</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CountryChart data={overviewData?.countries || []} />
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-card">
                    <CardHeader>
                        <CardTitle className="text-base">Traffic Sources</CardTitle>
                        <CardDescription>Where users come from</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TrafficChart data={overviewData?.trafficSources || []} />
                    </CardContent>
                </Card>
            </div>

            {/* Row 3: Booking Inquiries */}
            <Card className="border-0 shadow-sm bg-card">
                <CardHeader>
                    <CardTitle className="text-base">Booking Inquiries</CardTitle>
                    <CardDescription>Weekly trend</CardDescription>
                </CardHeader>
                <CardContent>
                    <InquiryChart data={weeklyBookings} />
                </CardContent>
            </Card>
        </div>
    );
}
