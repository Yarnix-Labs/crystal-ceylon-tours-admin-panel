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
    MapPin,
    Clock,
    Car,
    MessageSquare,
    StickyNote,
    Check,
    TrendingUp,
    Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    quickBookingService,
    type QuickBookingItem,
    type QuickBookingStatus,
    type QuickBookingMeta,
} from "@/admin/services/quickBookingService";

export default function QuickBookings() {
    const [bookings, setBookings] = useState<QuickBookingItem[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<QuickBookingItem | null>(null);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [noteText, setNoteText] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [meta, setMeta] = useState<QuickBookingMeta | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState<number | null>(null);

    const [isFetchingDetails, setIsFetchingDetails] = useState(false);

    const loadBookings = async (page: number, showLoading: boolean = true) => {
        try {
            if (showLoading) {
                setIsLoading(true);
            }
            
            let response;
            if (filter === "all") {
                response = await quickBookingService.getAll(page);
            } else {
                response = await quickBookingService.filterByStatus(filter as QuickBookingStatus, page);
            }

            if (response.success) {
                setBookings(response.data.items);
                setMeta(response.data.meta);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load quick bookings");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadBookings(currentPage, true);
    }, [currentPage, filter]);

    // Filter & Search Logic (Status is now handled by API)
    const filteredBookings = bookings.filter(booking => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
            booking.name.toLowerCase().includes(searchLower) ||
            booking.email.toLowerCase().includes(searchLower) ||
            booking.pickupLocation.toLowerCase().includes(searchLower) ||
            booking.dropLocation.toLowerCase().includes(searchLower) ||
            (booking.mobileNo && booking.mobileNo.includes(searchQuery));
        return matchesSearch;
    });

    const handleViewBooking = async (booking: QuickBookingItem) => {
        setSelectedBooking(booking);
        setIsSheetOpen(true);
        setNoteText(booking.adminNote || "");
        setIsFetchingDetails(true);
        
        try {
            const response = await quickBookingService.getById(booking.id);
            if (response.success) {
                setSelectedBooking(response.data);
                setNoteText(response.data.adminNote || "");
            }
        } catch (error) {
            console.error("Error fetching booking details:", error);
            toast.error("Failed to load booking details");
        } finally {
            setIsFetchingDetails(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setBookingToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!bookingToDelete) return;

        try {
            setIsDeleting(true);
            await quickBookingService.delete(bookingToDelete);
            toast.success("Booking deleted successfully");
            if (selectedBooking?.id === bookingToDelete) setIsSheetOpen(false);
            await loadBookings(currentPage);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete booking");
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setBookingToDelete(null);
        }
    };

    const handleStatusChange = async (newStatus: QuickBookingStatus) => {
        if (!selectedBooking) return;

        try {
            setIsUpdatingStatus(true);
            await quickBookingService.updateStatus(selectedBooking.id, { 
                status: newStatus,
            });

            updateBookingState(selectedBooking.id, { 
                status: newStatus,
                updatedAt: new Date().toISOString()
            });
            
            toast.success(`Status updated to ${newStatus}`);
            await loadBookings(currentPage, false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleSaveNote = async () => {
        if (!selectedBooking) return;

        try {
            setIsSavingNote(true);
            await quickBookingService.updateAdminNote(selectedBooking.id, {
                adminNote: noteText,
            });

            updateBookingState(selectedBooking.id, {
                adminNote: noteText,
                updatedAt: new Date().toISOString()
            });

            toast.success("Admin note saved");
            await loadBookings(currentPage, false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save admin note");
        } finally {
            setIsSavingNote(false);
        }
    };

    const updateBookingState = (id: number, updates: Partial<QuickBookingItem>) => {
        setBookings(prev => prev.map(b => 
            b.id === id ? { ...b, ...updates } : b
        ));
        if (selectedBooking?.id === id) {
            setSelectedBooking(prev => prev ? { ...prev, ...updates } : null);
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

    const handleWhatsAppContact = () => {
        if (!selectedBooking || !selectedBooking.mobileNo) {
            toast.error("Mobile number not available");
            return;
        }
        const message = encodeURIComponent(`Hello ${selectedBooking.name}, regarding your quick booking for ${selectedBooking.transferType}...`);
        const whatsappUrl = `https://wa.me/${selectedBooking.mobileNo.replace(/[^0-9]/g, '')}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleEmailContact = () => {
        if (!selectedBooking) return;
        const subject = encodeURIComponent(`Regarding your booking with Crystal Ceylon Tours - ID: #${selectedBooking.id}`);
        const body = encodeURIComponent(`Hello ${selectedBooking.name},\n\nThank you for choosing Crystal Ceylon Tours for your ${selectedBooking.transferType} from ${selectedBooking.pickupLocation} to ${selectedBooking.dropLocation}.\n\n...`);
        window.location.href = `mailto:${selectedBooking.email}?subject=${subject}&body=${body}`;
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return "N/A";
        // If it already has AM/PM, return as is
        if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
            return timeStr;
        }
        
        // Try to parse 24h format (HH:mm)
        const parts = timeStr.split(':');
        if (parts.length >= 2) {
            let hours = parseInt(parts[0]);
            const minutes = parts[1];
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            return `${hours}:${minutes} ${ampm}`;
        }
        
        return timeStr;
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                heading="Quick Bookings"
                description="Manage one-way transfers and city trips"
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search bookings..."
                            className="pl-9 w-[200px] lg:w-[300px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={filter} onValueChange={(val) => {
                        setFilter(val);
                        setCurrentPage(1); // Reset to first page on filter change
                    }}>
                        <SelectTrigger className="w-[140px]">
                            <div className="flex items-center gap-2">
                                <Archive className="w-3 h-3 text-muted-foreground" />
                                <SelectValue placeholder="Filter" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="NEW">New</SelectItem>
                            <SelectItem value="CONTACTED">Contacted</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => {
                            loadBookings(currentPage);
                            toast.success("Refreshed");
                        }}
                        disabled={isLoading}
                    >
                        <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </Button>
                </div>
            </AdminPageHeader>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6 flex items-center justify-between space-y-0">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                            <p className="text-2xl font-bold">{meta?.total || 0}</p>
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
                                {bookings.filter(i => i.status === 'NEW').length}
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
                                {bookings.filter(i => i.status === 'CONFIRMED').length}
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
                            <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                            <p className="text-2xl font-bold">
                                {meta?.total ? Math.round((bookings.filter(i => i.status === 'CONFIRMED').length / bookings.length) * 100) : 0}%
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bookings Table */}
            <Card className="border-none shadow-sm bg-card relative">
                <div className="rounded-md border overflow-x-auto">
                    <Table className="min-w-[800px]">
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[100px]">Status</TableHead>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Guest</TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead>Vehicle</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center">
                                        <Loader size="lg" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No quick bookings found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <TableRow 
                                        key={booking.id}
                                        className={cn(
                                            "cursor-pointer transition-colors group",
                                            booking.status === 'NEW' ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                                        )}
                                        onClick={() => handleViewBooking(booking)}
                                    >
                                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium whitespace-nowrap">
                                                    {new Date(booking.date).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {formatTime(booking.pickupTime)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col max-w-[200px]">
                                                <span className="font-medium truncate">{booking.name}</span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Mail className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">{booking.email}</span>
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm max-w-[250px]">
                                                <div className="flex items-center gap-1 text-primary font-medium truncate">
                                                    <MapPin className="w-3 h-3 shrink-0" /> {booking.pickupLocation}
                                                </div>
                                                <div className="flex items-center gap-1 text-muted-foreground truncate">
                                                    <MapPin className="w-3 h-3 shrink-0" /> {booking.dropLocation}
                                                </div>
                                                <div className="text-[10px] uppercase font-bold text-muted-foreground/60 mt-0.5">
                                                    {booking.transferType}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{booking.vehicle.name}</span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Users className="w-3 h-3" /> {booking.passengersCount} Passengers
                                                </span>
                                            </div>
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

                {/* Pagination */}
                {meta && bookings.length > 0 && (
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

            {/* Detail Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-xl overflow-y-auto w-full">
                    {isFetchingDetails ? (
                        <div className="flex flex-col items-center justify-center h-full py-12">
                            <Loader size="lg" />
                            <p className="mt-4 text-sm text-muted-foreground">Loading details...</p>
                        </div>
                    ) : selectedBooking && (
                        <div className="space-y-6 pb-8">
                            <SheetHeader className="text-left pr-10">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <SheetTitle className="text-2xl font-bold break-words">{selectedBooking.name}</SheetTitle>
                                        <SheetDescription>
                                            {selectedBooking.transferType} • Booking ID: #{selectedBooking.id}
                                        </SheetDescription>
                                    </div>
                                    <div className="shrink-0 mt-1">
                                        <Select 
                                            value={selectedBooking.status} 
                                            onValueChange={(val: QuickBookingStatus) => handleStatusChange(val)}
                                            disabled={isUpdatingStatus}
                                        >
                                            <SelectTrigger className="w-[130px] h-9">
                                                {isUpdatingStatus ? (
                                                    <Loader size="sm" />
                                                ) : (
                                                    <SelectValue />
                                                )}
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="NEW">New</SelectItem>
                                                <SelectItem value="CONTACTED">Contacted</SelectItem>
                                                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                                <SelectItem value="CLOSED">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </SheetHeader>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <a href={`mailto:${selectedBooking.email}`} className="hover:underline truncate">
                                        {selectedBooking.email}
                                    </a>
                                </div>
                                <div className="flex items-center gap-2 min-w-0">
                                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <a href={`tel:${selectedBooking.mobileNo}`} className="hover:underline truncate">
                                        {selectedBooking.mobileNo || "N/A"}
                                    </a>
                                </div>
                            </div>

                            <Separator />

                            {/* Trip Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary" /> Trip Details
                                </h3>
                                <div className="bg-muted/30 rounded-xl p-4 space-y-4 border">
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                                            <div className="w-0.5 flex-1 bg-border my-1" />
                                            <div className="w-2 h-2 rounded-full bg-destructive mb-1.5" />
                                        </div>
                                        <div className="space-y-4 flex-1">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Pickup</span>
                                                <span className="text-sm font-medium">{selectedBooking.pickupLocation}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Drop-off</span>
                                                <span className="text-sm font-medium">{selectedBooking.dropLocation}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Date</span>
                                            <span className="text-sm font-medium">{new Date(selectedBooking.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Time</span>
                                            <span className="text-sm font-medium">{formatTime(selectedBooking.pickupTime)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <Car className="h-4 w-4 text-primary" /> Vehicle & Passengers
                                </h3>
                                <Card className="border-primary/20 bg-primary/5">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-lg bg-background flex items-center justify-center shrink-0 border">
                                            <Car className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-lg">{selectedBooking.vehicle.name}</p>
                                            <p className="text-sm text-muted-foreground">{selectedBooking.vehicle.type} • {selectedBooking.vehicle.model}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <Badge variant="outline" className="bg-background">
                                                    <Users className="w-3 h-3 mr-1" /> {selectedBooking.passengersCount} PAX
                                                </Badge>
                                                {selectedBooking.vehicle.features.slice(0, 2).map((f, i) => (
                                                    <Badge key={i} variant="outline" className="bg-background">{f}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Message */}
                            {selectedBooking.message && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-primary" /> Client Message
                                    </h3>
                                    <div className="bg-muted/30 border rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed">
                                        {selectedBooking.message}
                                    </div>
                                </div>
                            )}

                            {/* Contact Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white gap-2"
                                    size="lg"
                                    onClick={handleWhatsAppContact}
                                >
                                    <MessageSquare className="h-5 w-5" />
                                    WhatsApp
                                </Button>
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                    size="lg"
                                    onClick={handleEmailContact}
                                >
                                    <Mail className="h-5 w-5" />
                                    Send Email
                                </Button>
                            </div>

                            <Separator />

                            {/* Admin Note Section */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <StickyNote className="h-4 w-4 text-muted-foreground" /> Admin Note
                                </h3>
                                <Textarea 
                                    placeholder="Add internal notes..." 
                                    className="min-h-[120px] resize-none border-yellow-200 focus:border-yellow-300 bg-yellow-50/50"
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSaveNote}
                                        disabled={isSavingNote}
                                        className="gap-2"
                                    >
                                        <ButtonLoader loading={isSavingNote}>
                                            <StickyNote className="h-4 w-4" /> Save Note
                                        </ButtonLoader>
                                    </Button>
                                </div>
                            </div>

                            <Separator className="my-8" />

                            {/* Delete Button */}
                            <div className="flex justify-center">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(selectedBooking.id)}
                                    disabled={isDeleting}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                                >
                                    <ButtonLoader loading={isDeleting}>
                                        <Trash2 className="h-4 w-4" /> Delete Booking Record
                                    </ButtonLoader>
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                title="Delete Quick Booking"
                description="Are you sure you want to delete this booking record? This action cannot be undone."
            />
        </div>
    );
}
