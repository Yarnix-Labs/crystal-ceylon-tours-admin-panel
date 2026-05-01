import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/admin/components/ui/PageHeader";
import { Loader, ButtonLoader } from "@/admin/components/ui/Loader";
import { DeleteDialog } from "@/admin/components/ui/DeleteDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
    Search, 
    RefreshCcw, 
    Eye, 
    Trash2, 
    Archive,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    CalendarRange,
    Users,
    Mail,
    Phone,
    Globe,
    MessageSquare,
    StickyNote,
    Check,
    TrendingUp,
    Compass,
    Activity
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    customBookingService,
    type CustomBookingItem,
    type CustomBookingStatus,
    type CustomBookingMeta,
} from "@/admin/services/customBookingService";

// Types matching the API response
type InquiryStatus = CustomBookingStatus;
type Inquiry = CustomBookingItem;

export default function CustomBookingInquiries() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [noteText, setNoteText] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [meta, setMeta] = useState<CustomBookingMeta | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [inquiryToDelete, setInquiryToDelete] = useState<number | null>(null);

    const [isFetchingInquiry, setIsFetchingInquiry] = useState(false);

    const loadInquiries = async (page: number, currentFilter: string, showLoading: boolean = true) => {
        try {
            if (showLoading) {
                setIsLoading(true);
            } else {
                setIsFetchingInquiry(true);
            }
            let response;
            if (currentFilter === "all") {
                response = await customBookingService.getAll(page);
            } else {
                response = await customBookingService.filterByStatus(currentFilter as InquiryStatus, page);
            }
            setInquiries(response.data.items);
            setMeta(response.data.meta);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load custom booking inquiries");
        } finally {
            setIsLoading(false);
            setIsFetchingInquiry(false);
        }
    };

    useEffect(() => {
        loadInquiries(currentPage, filter, true);
    }, [filter]);

    useEffect(() => {
        if (currentPage > 1 || inquiries.length > 0) {
            loadInquiries(currentPage, filter, false);
        }
    }, [currentPage]);

    // Filter Logic
    const filteredInquiries = inquiries.filter(inq => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
            inq.fullName.toLowerCase().includes(searchLower) ||
            inq.email.toLowerCase().includes(searchLower) ||
            inq.phoneNumber.includes(searchQuery);
        return matchesSearch;
    });

    const handleFilterChange = (value: string) => {
        setFilter(value);
        setCurrentPage(1);
    };

    const handleViewInquiry = async (inq: Inquiry) => {
        // Open sheet immediately with available data
        setSelectedInquiry(inq);
        setIsSheetOpen(true);
        setNoteText(inq.adminNote || "");
        setIsFetchingInquiry(true);
        
        try {
            // Fetch the full inquiry details
            const response = await customBookingService.getById(inq.id);
            if (response.success) {
                setSelectedInquiry(response.data);
                setNoteText(response.data.adminNote || "");
            }
        } catch (error) {
            console.error("Error fetching inquiry details:", error);
            toast.error("Failed to load inquiry details");
        } finally {
            setIsFetchingInquiry(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setInquiryToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!inquiryToDelete) return;

        try {
            setIsDeleting(true);
            await customBookingService.delete(inquiryToDelete);
            toast.success("Inquiry deleted successfully");
            if (selectedInquiry?.id === inquiryToDelete) setIsSheetOpen(false);
            await loadInquiries(currentPage, filter);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete inquiry");
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setInquiryToDelete(null);
        }
    };

    const handleStatusChange = async (newStatus: InquiryStatus) => {
        if (!selectedInquiry) return;

        try {
            setIsUpdatingStatus(true);
            await customBookingService.updateStatus(selectedInquiry.id, { 
                status: newStatus,
            });

            updateInquiry(selectedInquiry.id, { 
                status: newStatus,
                updatedAt: new Date().toISOString()
            });
            
            toast.success(`Status updated to ${newStatus}`);
            await loadInquiries(currentPage, filter);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleSaveNote = async () => {
        if (!selectedInquiry) return;

        try {
            setIsSavingNote(true);
            await customBookingService.updateAdminNote(selectedInquiry.id, {
                adminNote: noteText,
            });

            updateInquiry(selectedInquiry.id, {
                adminNote: noteText,
                updatedAt: new Date().toISOString()
            });

            toast.success("Admin note saved");
            await loadInquiries(currentPage, filter);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save admin note");
        } finally {
            setIsSavingNote(false);
        }
    };

    const handleWhatsAppContact = () => {
        if (!selectedInquiry) return;
        const message = encodeURIComponent(`Hello ${selectedInquiry.fullName}, regarding your custom booking inquiry...`);
        const whatsappUrl = `https://wa.me/${selectedInquiry.whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    const updateInquiry = (id: number, updates: Partial<Inquiry>) => {
        setInquiries(prev => prev.map(inq => 
            inq.id === id ? { ...inq, ...updates } : inq
        ));
        if (selectedInquiry?.id === id) {
            setSelectedInquiry(prev => prev ? { ...prev, ...updates } : null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'NEW': return <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>;
            case 'CONTACTED': return <Badge className="bg-orange-500 hover:bg-orange-600">Contacted</Badge>;
            case 'CONFIRMED': return <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>;
            case 'CLOSED': return <Badge variant="secondary">Closed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                heading="Custom Booking Inquiries"
                description="Manage custom tour booking enquiries from customers"
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search inquiries..."
                            className="pl-9 w-[200px] lg:w-[300px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={filter} onValueChange={handleFilterChange}>
                        <SelectTrigger className="w-[140px]">
                            <div className="flex items-center gap-2">
                                <Archive className="w-3 h-3 text-muted-foreground" />
                                <SelectValue placeholder="Filter" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Inquiries</SelectItem>
                            <SelectItem value="NEW">New</SelectItem>
                            <SelectItem value="CONTACTED">Contacted</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button 
                        variant="outline" 
                        size="icon"
                        onClick={async () => {
                            await loadInquiries(currentPage, filter, false);
                            toast.success("Refreshed");
                        }}
                        disabled={isLoading || isFetchingInquiry}
                    >
                        <RefreshCcw className={cn("h-4 w-4", (isLoading || isFetchingInquiry) && "animate-spin")} />
                    </Button>
                </div>
            </AdminPageHeader>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6 flex items-center justify-between space-y-0">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Total Inquiries</p>
                            <p className="text-2xl font-bold">{inquiries.length}</p>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <CalendarRange className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center justify-between space-y-0">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">New / Pending</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {inquiries.filter(i => i.status === 'NEW').length}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                            <Users className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center justify-between space-y-0">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                            <p className="text-2xl font-bold text-green-600">
                                {inquiries.filter(i => i.status === 'CONFIRMED').length}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                            <Check className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center justify-between space-y-0">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Conversion</p>
                            <p className="text-2xl font-bold">
                                {Math.round((inquiries.filter(i => i.status === 'CONFIRMED').length / inquiries.length) * 100) || 0}%
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm bg-card relative">
                {/* Inline loader for subsequent data fetching */}
                {isFetchingInquiry && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader size="lg" />
                            <p className="text-sm text-muted-foreground">Updating...</p>
                        </div>
                    </div>
                )}
                <div className="rounded-md border overflow-x-auto">
                    <Table className="min-w-[640px]">
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[100px]">Status</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>Guest Info</TableHead>
                                <TableHead className="hidden md:table-cell">Details</TableHead>
                                <TableHead className="hidden lg:table-cell">Vehicle</TableHead>
                                <TableHead className="hidden xl:table-cell">Submitted</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-48">
                                        <div className="flex justify-center">
                                            <Loader size="lg" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredInquiries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No inquiries found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredInquiries.map((inq) => (
                                    <TableRow 
                                        key={inq.id}
                                        className={cn(
                                            "cursor-pointer transition-colors group",
                                            inq.status === 'NEW' ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                                        )}
                                        onClick={() => handleViewInquiry(inq)}
                                    >
                                        <TableCell>{getStatusBadge(inq.status)}</TableCell>
                                        <TableCell className="font-medium whitespace-nowrap">
                                            {new Date(inq.startDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="max-w-[180px]">
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-medium truncate" title={inq.fullName}>{inq.fullName}</span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1 min-w-0">
                                                    <Mail className="w-3 h-3 shrink-0" />
                                                    <span className="truncate" title={inq.email}>{inq.email}</span>
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <Users className="w-3 h-3 text-muted-foreground" />
                                                    <span>{inq.travelers} pax</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <CalendarRange className="w-3 h-3 text-muted-foreground" />
                                                    <span>{inq.numberOfDays} days</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell max-w-[200px]">
                                            <div className="flex items-center gap-3">
                                                {inq.vehicle?.image && (
                                                    <div className="h-10 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border bg-muted/50">
                                                        <img src={inq.vehicle.image} alt={inq.vehicle.name} className="h-full w-full object-cover" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-sm text-primary truncate" title={inq.vehicle?.type}>{inq.vehicle?.type}</span>
                                                    <span className="text-xs text-muted-foreground truncate">{inq.vehicle?.name} • {inq.vehicle?.model}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden xl:table-cell text-muted-foreground text-sm">
                                            {new Date(inq.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="hover:text-white hover:bg-primary"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                {meta && inquiries.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t bg-muted/10">
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
                                    disabled={!meta.hasPreviousPage || isLoading}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={!meta.hasPreviousPage || isLoading}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    disabled={!meta.hasNextPage || isLoading}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setCurrentPage(meta.totalPages)}
                                    disabled={!meta.hasNextPage || isLoading}
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Detail Drawer */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl overflow-y-auto">
                    {isFetchingInquiry ? (
                        <div className="flex flex-col items-center justify-center h-full py-12">
                            <Loader size="lg" />
                            <p className="mt-4 text-sm text-muted-foreground">Loading inquiry details...</p>
                        </div>
                    ) : selectedInquiry && (
                        <div className="space-y-6 pb-8">
                            {/* Header Section */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start justify-between pr-10">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-extrabold tracking-tight break-words text-foreground">
                                            {selectedInquiry.fullName}
                                        </h2>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Globe className="h-4 w-4" />
                                            <span className="font-medium">{selectedInquiry.country}</span>
                                            <span className="text-border">•</span>
                                            <CalendarRange className="h-4 w-4" />
                                            <span className="font-medium">{selectedInquiry.numberOfDays} Days Trip</span>
                                        </div>
                                    </div>
                                    <Select 
                                        value={selectedInquiry.status} 
                                        onValueChange={(val: InquiryStatus) => handleStatusChange(val)}
                                        disabled={isUpdatingStatus}
                                    >
                                        <SelectTrigger className={cn(
                                            "w-[160px] h-10 font-semibold border-none shadow-sm transition-all",
                                            selectedInquiry.status === 'NEW' && "bg-blue-100 text-blue-700 hover:bg-blue-200",
                                            selectedInquiry.status === 'CONTACTED' && "bg-orange-100 text-orange-700 hover:bg-orange-200",
                                            selectedInquiry.status === 'CONFIRMED' && "bg-green-100 text-green-700 hover:bg-green-200",
                                            selectedInquiry.status === 'CLOSED' && "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                        )}>
                                            {isUpdatingStatus ? <Loader size="sm" /> : <SelectValue />}
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NEW" className="text-blue-600 font-medium">New Inquiry</SelectItem>
                                            <SelectItem value="CONTACTED" className="text-orange-600 font-medium">Contacted</SelectItem>
                                            <SelectItem value="CONFIRMED" className="text-green-600 font-medium">Confirmed</SelectItem>
                                            <SelectItem value="CLOSED" className="text-slate-600 font-medium">Closed / Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Contact Quick Actions */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <a 
                                        href={`mailto:${selectedInquiry.email}`}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Email Address</span>
                                            <span className="text-sm font-medium truncate">{selectedInquiry.email}</span>
                                        </div>
                                    </a>
                                    <a 
                                        href={`tel:${selectedInquiry.phoneNumber}`}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Phone Number</span>
                                            <span className="text-sm font-medium truncate">{selectedInquiry.phoneNumber}</span>
                                        </div>
                                    </a>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                                {/* Trip Schedule Card */}
                                <Card className="border-none bg-muted/20 shadow-none">
                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                                            <CalendarRange className="h-4 w-4" />
                                            Trip Schedule
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Start Date</span>
                                                <span className="font-semibold text-base">
                                                    {new Date(selectedInquiry.startDate).toLocaleDateString(undefined, { 
                                                        month: 'long', 
                                                        day: 'numeric', 
                                                        year: 'numeric' 
                                                    })}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Duration</span>
                                                    <span className="font-bold text-lg text-primary">{selectedInquiry.numberOfDays} Days</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Group Size</span>
                                                    <span className="font-bold text-lg">{selectedInquiry.travelers} People</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Vehicle Preference Card */}
                                <Card className="border-none bg-primary/5 shadow-none overflow-hidden group">
                                    <CardContent className="p-0 space-y-0">
                                        {selectedInquiry.vehicle?.image ? (
                                            <div className="relative h-32 w-full bg-muted overflow-hidden">
                                                <img 
                                                    src={selectedInquiry.vehicle.image} 
                                                    alt={selectedInquiry.vehicle.name} 
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                                />
                                                <div className="absolute top-2 left-2">
                                                    <Badge className="bg-primary text-white border-none shadow-sm px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                                                        {selectedInquiry.vehicle?.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-primary/5 border-b border-border/50">
                                                <Badge className="bg-primary text-white border-none shadow-sm px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                                                    {selectedInquiry.vehicle?.type}
                                                </Badge>
                                            </div>
                                        )}
                                        <div className="p-4 space-y-1">
                                            <div className="text-sm font-bold text-foreground">
                                                {selectedInquiry.vehicle?.name}
                                            </div>
                                            <div className="flex items-center justify-end text-[11px] text-muted-foreground">
                                                <span className="font-mono opacity-50">#{selectedInquiry.vehicleId}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Special Requests */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                                    <MessageSquare className="h-4 w-4" />
                                    Special Requests & Requirements
                                </div>
                                <div className="bg-card border border-dashed border-border rounded-2xl p-6 text-sm whitespace-pre-wrap break-words italic text-foreground/80 leading-relaxed shadow-sm">
                                    {selectedInquiry.specialRequests || "The customer did not provide any special requests for this booking."}
                                </div>
                            </div>



                            {/* Main Contact Button */}
                            <Button
                                className="w-full h-14 bg-[#25D366] hover:bg-[#128C7E] text-white gap-3 rounded-2xl shadow-lg shadow-green-500/20 text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                                onClick={handleWhatsAppContact}
                            >
                                <MessageSquare className="h-6 w-6 fill-current" />
                                Chat with {selectedInquiry.fullName.split(' ')[0]}
                            </Button>

                            <Separator className="my-2" />

                            {/* Admin Management Section */}
                            <div className="space-y-4 bg-muted/30 p-6 rounded-2xl border border-border/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        <StickyNote className="h-4 w-4" />
                                        Internal Admin Notes
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-medium">Last updated: {new Date(selectedInquiry.updatedAt).toLocaleString()}</span>
                                </div>
                                <Textarea 
                                    placeholder="Add internal notes about your conversation with this customer..." 
                                    className="min-h-[120px] resize-none border-none focus-visible:ring-1 focus-visible:ring-primary/20 bg-background/50 rounded-xl p-4 text-sm"
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                />
                                <div className="flex items-center justify-between">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteClick(selectedInquiry.id)}
                                        disabled={isDeleting}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 h-10 px-4 rounded-xl"
                                    >
                                        <ButtonLoader loading={isDeleting}>
                                            <Trash2 className="h-4 w-4" /> Delete
                                        </ButtonLoader>
                                    </Button>

                                    <Button
                                        onClick={handleSaveNote}
                                        disabled={isSavingNote}
                                        className="gap-2 h-10 px-6 rounded-xl shadow-md"
                                    >
                                        <ButtonLoader loading={isSavingNote}>
                                            <Check className="h-4 w-4" /> Save Note
                                        </ButtonLoader>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                title="Delete Custom Booking Inquiry"
                description="Are you sure you want to delete this custom inquiry? This action cannot be undone."
            />
        </div>
    );
}
