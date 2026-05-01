import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/admin/components/ui/PageHeader";
import { Loader, OverlayLoader, ButtonLoader } from "@/admin/components/ui/Loader";
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
    SheetHeader,
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
    Car
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    bookingService,
    type BookingItem,
    type BookingStatus,
    type BookingMeta,
} from "@/admin/services/bookingService";

// Types matching the API response
type InquiryStatus = BookingStatus;
type Inquiry = BookingItem;

export default function BookingInquiries() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [noteText, setNoteText] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [meta, setMeta] = useState<BookingMeta | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [inquiryToDelete, setInquiryToDelete] = useState<number | null>(null);

    const [isFetchingInquiry, setIsFetchingInquiry] = useState(false);

    const loadInquiries = async (page: number, showLoading: boolean = true) => {
        try {
            if (showLoading) {
                setIsLoading(true);
            } else {
                setIsFetchingInquiry(true);
            }
            const response = await bookingService.getAll(page);
            setInquiries(response.data.items);
            setMeta(response.data.meta);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load booking inquiries");
        } finally {
            setIsLoading(false);
            setIsFetchingInquiry(false);
        }
    };

    useEffect(() => {
        loadInquiries(currentPage, true);
    }, []);

    useEffect(() => {
        if (currentPage > 1 || inquiries.length > 0) {
            loadInquiries(currentPage, false);
        }
    }, [currentPage]);

    // Filter Logic
    const filteredInquiries = inquiries.filter(inq => {
        const matchesFilter = filter === "all" || inq.status === filter;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
            inq.name.toLowerCase().includes(searchLower) ||
            inq.email.toLowerCase().includes(searchLower) ||
            inq.phoneNumber.includes(searchQuery) ||
            inq.country.toLowerCase().includes(searchLower);
        return matchesFilter && matchesSearch;
    });

    const handleViewInquiry = async (inq: Inquiry) => {
        // Open sheet immediately with available data
        setSelectedInquiry(inq);
        setIsSheetOpen(true);
        setNoteText(inq.adminNote || "");
        setIsFetchingInquiry(true);
        
        try {
            // Fetch the full inquiry details
            const response = await bookingService.getById(inq.id);
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
            await bookingService.delete(inquiryToDelete);
            toast.success("Inquiry deleted successfully");
            if (selectedInquiry?.id === inquiryToDelete) setIsSheetOpen(false);
            await loadInquiries(currentPage);
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
            await bookingService.updateStatus(selectedInquiry.id, { 
                status: newStatus,
            });

            updateInquiry(selectedInquiry.id, { 
                status: newStatus,
                updatedAt: new Date().toISOString()
            });
            
            toast.success(`Status updated to ${newStatus}`);
            await loadInquiries(currentPage);
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
            await bookingService.updateAdminNote(selectedInquiry.id, {
                adminNote: noteText,
            });

            updateInquiry(selectedInquiry.id, {
                adminNote: noteText,
                updatedAt: new Date().toISOString()
            });

            toast.success("Admin note saved");
            await loadInquiries(currentPage);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save admin note");
        } finally {
            setIsSavingNote(false);
        }
    };

    const handleWhatsAppContact = () => {
        if (!selectedInquiry) return;
        const message = encodeURIComponent(`Hello ${selectedInquiry.name}, regarding your booking inquiry...`);
        const whatsappUrl = `https://wa.me/${selectedInquiry.whatsapp.replace(/[^0-9]/g, '')}?text=${message}`;
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
                heading="Booking Inquiries"
                description="Manage tour booking enquiries from customers"
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
                    <Select value={filter} onValueChange={setFilter}>
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
                            await loadInquiries(currentPage, false);
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
                                <TableHead>Arrival Date</TableHead>
                                <TableHead>Guest Info</TableHead>
                                <TableHead className="hidden md:table-cell">Details</TableHead>
                                <TableHead className="hidden lg:table-cell">Price</TableHead>
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
                                            {new Date(inq.arrivalDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="max-w-[220px]">
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold truncate text-foreground" title={inq.name}>{inq.name}</span>
                                                <span className="text-xs font-medium text-primary truncate" title={inq.tourPackage?.name}>
                                                    {inq.tourPackage?.name || "Standard Tour"}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                    <Mail className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">{inq.email}</span>
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <Users className="w-3 h-3 text-muted-foreground" />
                                                    <span>{inq.passengers} Passengers</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <Globe className="w-3 h-3 text-muted-foreground" />
                                                    <span>{inq.country}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell font-bold text-primary">
                                            USD {inq.price.toLocaleString()}
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
                            <SheetTitle className="sr-only">Booking Inquiry from {selectedInquiry.name}</SheetTitle>
                            <SheetDescription className="sr-only">
                                Booking inquiry details and management options
                            </SheetDescription>
                            
                            {/* Header Section */}
                            <div className="relative -mx-6 -mt-6 mb-6 px-6 py-8 bg-muted/30 border-b">
                                <div className="flex items-start justify-between pr-10">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-extrabold tracking-tight break-words text-foreground">
                                            {selectedInquiry.name}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="flex items-center gap-1.5 bg-background px-2.5 py-1 rounded-full border shadow-sm text-xs font-semibold text-muted-foreground">
                                                <Globe className="h-3.5 w-3.5 text-primary" />
                                                {selectedInquiry.country}
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-background px-2.5 py-1 rounded-full border shadow-sm text-xs font-semibold text-muted-foreground">
                                                <Users className="h-3.5 w-3.5 text-primary" />
                                                {selectedInquiry.passengers} Passengers
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-background px-2.5 py-1 rounded-full border shadow-sm text-xs font-semibold text-muted-foreground">
                                                <CalendarRange className="h-3.5 w-3.5 text-primary" />
                                                ID: #{selectedInquiry.id}
                                            </div>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                {/* Booking Schedule Card */}
                                <Card className="border shadow-sm bg-card overflow-hidden">
                                    <div className="bg-muted/50 px-4 py-2 border-b">
                                        <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                                            <CalendarRange className="h-3.5 w-3.5" />
                                            Arrival Details
                                        </div>
                                    </div>
                                    <CardContent className="p-5">
                                        <div className="space-y-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Arrival Date</span>
                                                <span className="font-semibold text-base mt-0.5">
                                                    {new Date(selectedInquiry.arrivalDate).toLocaleDateString(undefined, { 
                                                        month: 'long', 
                                                        day: 'numeric', 
                                                        year: 'numeric' 
                                                    })}
                                                </span>
                                            </div>
                                            <div className="pt-3 border-t">
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Group Size</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="font-bold text-xl text-primary">{selectedInquiry.passengers}</span>
                                                    <span className="text-sm font-medium text-muted-foreground">Travelers</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Package & Price Card */}
                                <Card className="border shadow-sm bg-primary/5 overflow-hidden">
                                    <div className="bg-primary/10 px-4 py-2 border-b border-primary/10">
                                        <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                                            <TrendingUp className="h-3.5 w-3.5" />
                                            Package & Price
                                        </div>
                                    </div>
                                    <CardContent className="p-5">
                                        <div className="space-y-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Selected Tour Package</span>
                                                <span className="font-bold text-sm text-foreground leading-tight mt-1">
                                                    {selectedInquiry.tourPackage?.name || "Standard Tour Package"}
                                                </span>
                                            </div>
                                            <div className="pt-3 border-t">
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Estimated Total</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="font-bold text-xl text-primary">USD {selectedInquiry.price.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Vehicle Preference Section */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                                    <Car className="h-3.5 w-3.5 text-primary" />
                                    Vehicle Preference
                                </div>
                                <Card className="border-primary/10 bg-primary/5 shadow-none overflow-hidden">
                                    <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-5">
                                        <div className="w-44 h-32 rounded-xl bg-background flex items-center justify-center shrink-0 border-2 border-primary/5 shadow-sm overflow-hidden">
                                            {selectedInquiry.vehicle?.image ? (
                                                <img 
                                                    src={selectedInquiry.vehicle.image} 
                                                    alt={selectedInquiry.vehicle.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Car className="h-14 w-14 text-muted-foreground/30" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
                                            <Badge variant="outline" className="bg-background border-primary/20 text-primary font-bold text-[10px] uppercase tracking-wider px-3 py-1">
                                                {selectedInquiry.vehicle?.type || "Vehicle Choice"}
                                            </Badge>
                                            <div>
                                                <p className="font-bold text-base text-foreground leading-none">{selectedInquiry.vehicle?.name || "Standard Vehicle"}</p>
                                                <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center sm:justify-start gap-1.5">
                                                    <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">ID: #{selectedInquiry.vehicleId}</span>
                                                    {selectedInquiry.vehicle?.model && <span>• {selectedInquiry.vehicle.model}</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Client Message */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                                    <MessageSquare className="h-4 w-4" />
                                    Message from Client
                                </div>
                                <div className="bg-card border border-dashed border-border rounded-2xl p-6 text-sm whitespace-pre-wrap break-words italic text-foreground/80 leading-relaxed shadow-sm">
                                    {selectedInquiry.clientMessage || "The client did not provide a message."}
                                </div>
                            </div>

                            {/* Main Contact Button */}
                            <Button
                                className="w-full h-14 bg-[#25D366] hover:bg-[#128C7E] text-white gap-3 rounded-2xl shadow-lg shadow-green-500/20 text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                                onClick={handleWhatsAppContact}
                            >
                                <MessageSquare className="h-6 w-6 fill-current" />
                                Chat with {selectedInquiry.name.split(' ')[0]}
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
                                    placeholder="Add internal notes about your conversation with this client..." 
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
                title="Delete Booking Inquiry"
                description="Are you sure you want to delete this inquiry? This action cannot be undone."
            />
        </div>
    );
}