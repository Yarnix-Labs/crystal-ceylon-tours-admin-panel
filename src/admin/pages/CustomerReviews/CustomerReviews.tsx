import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye,
    Share2, Copy, Check, Facebook, Mail, Plus, Search, Star, MessageSquare, Clock, CheckCircle2, XCircle, MoreHorizontal, Edit, Trash2, RefreshCcw
} from "lucide-react";
import { Loader, ButtonLoader } from "@/admin/components/ui/Loader";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { DeleteDialog } from "@/admin/components/ui/DeleteDialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ReviewStatus, AdminReview } from "@/admin/services/reviewService";
import {
    useReviewsAdminList,
    useReviewsFilter,
    useReviewMutations,
} from "@/hooks/useAdminData";

const STATUS_UI: Record<string, "pending" | "approved" | "rejected"> = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
};

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        "h-3 w-3",
                        star <= rating 
                            ? "fill-amber-400 text-amber-400" 
                            : "fill-muted text-muted"
                    )}
                />
            ))}
        </div>
    );
}

function formatDate(raw: string | undefined | null): string {
    if (!raw) return "—";
    try {
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(new Date(raw));
    } catch {
        return raw;
    }
}

export default function CustomerReviews() {
    const navigate = useNavigate();
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [viewReview, setViewReview] = useState<AdminReview | null>(null);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = `https://review.crystalceylontours.com`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOptions = [
        {
            name: "WhatsApp",
            icon: <MessageSquare className="w-5 h-5 text-green-500" />,
            url: `https://wa.me/?text=${encodeURIComponent(`We'd love to hear your feedback! Please leave us a review here: ${shareUrl}`)}`,
            color: "hover:bg-green-50 hover:text-green-700",
        },
        {
            name: "Email",
            icon: <Mail className="w-5 h-5 text-blue-500" />,
            url: `mailto:?subject=${encodeURIComponent("Share your experience with Crystal Ceylon Tours")}&body=${encodeURIComponent(`Hello!\n\nWe hope you enjoyed your trip with us. We'd greatly appreciate it if you could share your experience by leaving a review at: ${shareUrl}\n\nThank you!`)}`,
            color: "hover:bg-blue-50 hover:text-blue-700",
        },
        {
            name: "Facebook",
            icon: <Facebook className="w-5 h-5 text-[#1877F2]" />,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            color: "hover:bg-blue-50 hover:text-[#1877F2]",
        },
    ];

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);

    const statusForApi = statusFilter === "all" ? null : (statusFilter.toUpperCase() as ReviewStatus);
    const { data: listData, isLoading: loadingList, isFetching: fetchingList } = useReviewsAdminList(
        currentPage,
        statusFilter === "all"
    );
    const { data: filterData, isLoading: loadingFilter, isFetching: fetchingFilter } = useReviewsFilter(
        statusForApi,
        currentPage,
        statusFilter !== "all"
    );

    const isLoading = statusFilter === "all" ? loadingList : loadingFilter;
    const isFetching = statusFilter === "all" ? fetchingList : fetchingFilter;
    const currentResponse = statusFilter === "all" ? listData : filterData;
    const items = currentResponse?.items ?? [];
    const meta = currentResponse?.meta;

    const { deleteMutation, updateStatusMutation } = useReviewMutations();

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId, {
                onSettled: () => setDeleteId(null),
            });
        }
    };

    const updateReviewStatus = (id: string, status: "APPROVED" | "REJECTED") => {
        updateStatusMutation.mutate(
            { id, status },
            {
                onError: () => toast.error("Failed to update status"),
            }
        );
    };

    const clearFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
    };

    const stats = useMemo(() => {
        const total = meta?.total ?? items.length;
        const pendingInPage = items.filter(
            (r) => (r.status ?? "").toUpperCase() === "PENDING"
        ).length;
        const pending =
            statusFilter === "pending" ? (meta?.total ?? pendingInPage) : statusFilter === "all" ? pendingInPage : 0;
        const avgRating =
            items.length > 0
                ? (items.reduce((acc, r) => acc + r.rating, 0) / items.length).toFixed(1)
                : "0.0";
        return { total, pending, avgRating };
    }, [items, meta, statusFilter]);

    const filteredData = useMemo(() => {
        return items.filter((item) => {
            const name = item.name || item.customerName || "";
            const email = item.email || item.customerEmail || "";
            const title = item.title || "";
            const comment = item.comment || "";
            const tourName = item.tourName || "";
            const matchesSearch =
                name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tourName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [items, searchQuery]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    // Skeleton loading for first load, inline loader for subsequent updates
    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                </div>
                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 relative">
            {/* Delete Loader Overlay */}
            {deleteMutation.isPending && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-background rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl">
                        <Loader size="xl" />
                        <p className="text-lg font-semibold text-foreground">Deleting review...</p>
                        <p className="text-sm text-muted-foreground">Please wait</p>
                    </div>
                </div>
            )}
            <div className="p-6 space-y-6 animate-in fade-in duration-500">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Customer Reviews</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage feedback and testimonials from your travelers
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline"
                            onClick={() => setIsShareDialogOpen(true)}
                            className="gap-2 border-primary/20 text-primary hover:bg-primary/5 shadow-sm transition-all duration-200"
                        >
                            <Share2 className="w-4 h-4" />
                            Share Link
                        </Button>
                        <Button 
                            onClick={() => navigate("/admin/reviews/new")}
                            className="gap-2 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            <Plus className="w-4 h-4" />
                            Add Review
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
                    <Card className="border border-border bg-white dark:bg-card shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-primary/10">
                                    <MessageSquare className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                                    <p className="text-xs text-muted-foreground">Total Reviews</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border border-border bg-white dark:bg-card shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-amber-500/10">
                                    <Clock className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                                    <p className="text-xs text-muted-foreground">Pending Approval</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border border-border bg-white dark:bg-card shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-yellow-500/10">
                                    <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.avgRating}</p>
                                    <p className="text-xs text-muted-foreground">Average Rating</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Table Section */}
                <div className="bg-white dark:bg-card rounded-xl border border-border shadow-sm overflow-hidden relative">
                    {/* Inline loader for subsequent data fetching */}
                    {isFetching && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <Loader size="lg" />
                                <p className="text-sm text-muted-foreground">Updating...</p>
                            </div>
                        </div>
                    )}
                    {/* Filters Toolbar */}
                    <div className="border-b border-border p-4 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-muted/20">
                        <div className="flex items-center gap-2 w-full max-w-2xl">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search reviews..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-10 bg-background border-border focus:border-primary"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px] h-10 bg-background border-border">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                            {(searchQuery || statusFilter !== "all") && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={clearFilters} 
                                    className="h-10 px-3 text-muted-foreground hover:text-foreground gap-2"
                                >
                                    <RefreshCcw className="h-3.5 w-3.5" />
                                    Reset
                                </Button>
                            )}

                            <div className="text-sm text-muted-foreground ml-auto">
                                Showing <span className="font-medium text-foreground">{filteredData.length}</span>
                                {meta ? ` of ${meta.total}` : ""}
                            </div>
                        </div>
                    </div>

                    {/* Desktop Table */}
                    <div className="overflow-x-auto hidden sm:block">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="bg-muted/30 border-b border-border">
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tour / Activity</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[110px]">Rating</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[120px]">Date</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[110px]">Status</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[130px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item) => {
                                    const statusLower = STATUS_UI[(item.status ?? "").toUpperCase()] ?? "pending";
                                    const displayName = item.name || item.customerName || "";
                                    const displayEmail = item.email || item.customerEmail || "";
                                    const tourName = item.tourName ?? item.title ?? "—";
                                    return (
                                        <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                            {/* Customer */}
                                            <td className="px-4 py-4 max-w-[220px]">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                        <span className="text-primary font-semibold text-sm">
                                                            {(displayName || "?").charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-semibold text-sm text-foreground truncate max-w-[160px]">{displayName || "—"}</span>
                                                        <span className="text-xs text-muted-foreground truncate max-w-[160px]">{displayEmail}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Tour / Activity */}
                                            <td className="px-4 py-4 max-w-[200px]">
                                                <TooltipProvider delayDuration={300}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="text-sm text-foreground truncate block max-w-[180px] cursor-default">
                                                                {tourName}
                                                            </span>
                                                        </TooltipTrigger>
                                                        {tourName !== "—" && (
                                                            <TooltipContent side="top" className="max-w-xs break-words">
                                                                {tourName}
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </td>
                                            {/* Rating */}
                                            <td className="px-4 py-4">
                                                <StarRating rating={item.rating} />
                                            </td>
                                            {/* Date */}
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</span>
                                            </td>
                                            {/* Status */}
                                            <td className="px-4 py-4">
                                                {statusLower === "approved" && (
                                                    <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20">Approved</Badge>
                                                )}
                                                {statusLower === "pending" && (
                                                    <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 border-amber-500/20">Pending</Badge>
                                                )}
                                                {statusLower === "rejected" && (
                                                    <Badge variant="destructive" className="bg-red-500/15 text-red-600 border-red-500/20">Rejected</Badge>
                                                )}
                                            </td>
                                            {/* Actions */}
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {(item.status ?? "").toUpperCase() === "PENDING" && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 gap-1 text-xs border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                                                                    disabled={updateStatusMutation.isPending}
                                                                >
                                                                    {updateStatusMutation.isPending && updateStatusMutation.variables?.id === item.id ? (
                                                                        <Loader size="sm" />
                                                                    ) : (
                                                                        <Clock className="h-3.5 w-3.5" />
                                                                    )}
                                                                    Review
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-40">
                                                                <DropdownMenuItem
                                                                    onClick={() => updateReviewStatus(item.id, "APPROVED")}
                                                                    disabled={updateStatusMutation.isPending}
                                                                    className="gap-2 text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                                                                >
                                                                    {updateStatusMutation.isPending && updateStatusMutation.variables?.id === item.id && updateStatusMutation.variables?.status === "APPROVED" ? (
                                                                        <Loader size="sm" />
                                                                    ) : (
                                                                        <CheckCircle2 className="h-4 w-4" />
                                                                    )}
                                                                    Approve
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => updateReviewStatus(item.id, "REJECTED")}
                                                                    disabled={updateStatusMutation.isPending}
                                                                    className="gap-2 text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                >
                                                                    {updateStatusMutation.isPending && updateStatusMutation.variables?.id === item.id && updateStatusMutation.variables?.status === "REJECTED" ? (
                                                                        <Loader size="sm" />
                                                                    ) : (
                                                                        <XCircle className="h-4 w-4" />
                                                                    )}
                                                                    Reject
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                        onClick={() => setViewReview(item)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => navigate(`/admin/reviews/${item.id}`)}
                                                                className="gap-2"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => setDeleteId(item.id)}
                                                                disabled={deleteMutation.isPending && deleteId === item.id}
                                                                className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                                                            >
                                                                {deleteMutation.isPending && deleteId === item.id ? (
                                                                    <Loader size="sm" />
                                                                ) : (
                                                                    <Trash2 className="h-4 w-4" />
                                                                )}
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="sm:hidden divide-y divide-border">
                        {filteredData.map((item) => {
                            const statusLower = STATUS_UI[(item.status ?? "").toUpperCase()] ?? "pending";
                            const displayName = item.name || item.customerName || "—";
                            const displayEmail = item.email || item.customerEmail || "";
                            const tourName = item.tourName ?? item.title ?? "—";
                            return (
                                <div key={item.id} className="p-4 space-y-3">
                                    {/* Customer Row */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <span className="text-primary font-semibold text-sm">
                                                    {(displayName || "?").charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm text-foreground truncate">{displayName}</p>
                                                <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                onClick={() => setViewReview(item)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => navigate(`/admin/reviews/${item.id}`)} className="gap-2">
                                                        <Edit className="h-4 w-4" />Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteId(item.id)}
                                                        className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                    {/* Tour name */}
                                    <p className="text-sm text-foreground break-words line-clamp-2">{tourName}</p>
                                    {/* Meta row */}
                                    <div className="flex items-center justify-between gap-2">
                                        <StarRating rating={item.rating} />
                                        <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                                        {statusLower === "approved" && <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-xs">Approved</Badge>}
                                        {statusLower === "pending" && <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 border-amber-500/20 text-xs">Pending</Badge>}
                                        {statusLower === "rejected" && <Badge variant="destructive" className="bg-red-500/15 text-red-600 border-red-500/20 text-xs">Rejected</Badge>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {meta && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
                            <div className="text-sm text-muted-foreground">
                                Showing {Math.min((currentPage - 1) * meta.limit + 1, meta.total)} to{" "}
                                {Math.min(currentPage * meta.limit, meta.total)} of {meta.total} records
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-sm font-medium">
                                    Page {currentPage} of {meta.totalPages || 1}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setCurrentPage(1)}
                                        disabled={!meta.hasPreviousPage}
                                    >
                                        <ChevronsLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={!meta.hasPreviousPage}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                        disabled={!meta.hasNextPage}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setCurrentPage(meta.totalPages)}
                                        disabled={!meta.hasNextPage}
                                    >
                                        <ChevronsRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {filteredData.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">No reviews found</h3>
                            <p className="text-muted-foreground text-sm max-w-sm">
                                {searchQuery 
                                    ? "Try adjusting your search to find what you're looking for."
                                    : "Get started by adding your first customer review."
                                }
                            </p>
                            {!searchQuery && (
                                <Button 
                                    onClick={() => navigate("/admin/reviews/new")}
                                    className="mt-4 gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Review
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                <DeleteDialog
                    open={!!deleteId}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    onConfirm={handleDelete}
                    title="Delete Review"
                    description="Are you sure you want to delete this review? This action cannot be undone."
                />
            </div>

            <Dialog open={!!viewReview} onOpenChange={(open) => !open && setViewReview(null)}>
                <DialogContent className="max-w-3xl overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>Review Details</DialogTitle>
                        <DialogDescription>
                            Detailed view of the customer review.
                        </DialogDescription>
                    </DialogHeader>
                    {viewReview && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1 min-w-0 overflow-hidden">
                                    <h4 className="text-sm font-medium text-muted-foreground">Customer</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="text-primary font-semibold text-xs">
                                                {(viewReview.name || viewReview.customerName || "?").charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex flex-col min-w-0 overflow-hidden">
                                            <span className="font-medium text-sm break-all">{viewReview.name || viewReview.customerName || "—"}</span>
                                            <span className="text-xs text-muted-foreground break-all">{viewReview.email || viewReview.customerEmail}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1 min-w-0 overflow-hidden">
                                    <h4 className="text-sm font-medium text-muted-foreground">Tour / Activity</h4>
                                    <p className="text-sm font-medium break-all">{viewReview.tourName || viewReview.title || "—"}</p>
                                </div>
                                <div className="space-y-1 min-w-0 overflow-hidden">
                                    <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span>{formatDate(viewReview.createdAt)}</span>
                                    </div>
                                </div>
                                <div className="space-y-1 min-w-0 overflow-hidden">
                                    <h4 className="text-sm font-medium text-muted-foreground">Rating & Status</h4>
                                    <div className="flex items-center gap-3">
                                        <StarRating rating={viewReview.rating} />
                                        <Badge variant="outline">{viewReview.status}</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">Review Content</h4>
                                <div className="bg-muted/30 p-4 rounded-lg border border-border max-h-60 overflow-y-auto overflow-x-hidden">
                                    {viewReview.title && (
                                        <h5 className="font-semibold text-foreground mb-2 break-all">{viewReview.title}</h5>
                                    )}
                                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-all">
                                        {viewReview.comment || "—"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2 sm:gap-0">
                        {viewReview && (viewReview.status ?? "").toUpperCase() === "PENDING" && (
                            <div className="flex items-center gap-2 mr-auto">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        updateReviewStatus(viewReview.id, "APPROVED");
                                        setViewReview(null);
                                    }}
                                    disabled={updateStatusMutation.isPending}
                                    className="gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                                >
                                    {updateStatusMutation.isPending && updateStatusMutation.variables?.id === viewReview.id && updateStatusMutation.variables?.status === "APPROVED" ? (
                                        <Loader size="sm" />
                                    ) : (
                                        <CheckCircle2 className="h-4 w-4" />
                                    )}
                                    Approve
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        updateReviewStatus(viewReview.id, "REJECTED");
                                        setViewReview(null);
                                    }}
                                    disabled={updateStatusMutation.isPending}
                                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                    {updateStatusMutation.isPending && updateStatusMutation.variables?.id === viewReview.id && updateStatusMutation.variables?.status === "REJECTED" ? (
                                        <Loader size="sm" />
                                    ) : (
                                        <XCircle className="h-4 w-4" />
                                    )}
                                    Reject
                                </Button>
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="space-y-3 pb-4">
                        <DialogTitle className="text-2xl font-bold text-center">Share Review Link</DialogTitle>
                        <DialogDescription className="text-center text-base">
                            Send this link to your customers to collect their feedback.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                        {/* URL Display and Copy */}
                        <div className="flex items-center gap-2 p-1.5 bg-muted/50 rounded-2xl border border-border">
                            <div className="flex-1 px-3 text-sm font-medium text-muted-foreground truncate">
                                {shareUrl}
                            </div>
                            <Button 
                                size="sm" 
                                className={cn(
                                    "rounded-xl gap-2 transition-all duration-300",
                                    copied ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
                                )}
                                onClick={handleCopyLink}
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                {copied ? "Copied!" : "Copy Link"}
                            </Button>
                        </div>

                        {/* Social Share Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            {shareOptions.map((option) => (
                                <a
                                    key={option.name}
                                    href={option.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        "flex flex-col items-center justify-center p-4 rounded-2xl border border-border bg-card transition-all duration-300 gap-2 shadow-sm hover:shadow-md",
                                        option.color
                                    )}
                                >
                                    {option.icon}
                                    <span className="text-xs font-semibold">{option.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
