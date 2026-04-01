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

    const loadInquiries = async (page: number, showLoading: boolean = true) => {
        try {
            if (showLoading) {
                setIsLoading(true);
            } else {
                setIsFetchingInquiry(true);
            }
            const response = await customBookingService.getAll(page);
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
            inq.fullName.toLowerCase().includes(searchLower) ||
            inq.email.toLowerCase().includes(searchLower) ||
            inq.phoneNumber.includes(searchQuery);
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
            await customBookingService.updateStatus(selectedInquiry.id, { 
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
            await customBookingService.updateAdminNote(selectedInquiry.id, {
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
                                <TableHead>Start Date</TableHead>
                                <TableHead>Guest Info</TableHead>
                                <TableHead className="hidden md:table-cell">Travelers</TableHead>
                                <TableHead className="hidden lg:table-cell">Destinations</TableHead>
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
                                            <Badge variant="outline" className="font-mono">{inq.travelers}</Badge>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell max-w-[150px]">
                                            <div className="flex items-center gap-2 text-sm truncate" title={inq.destinations?.map(d => d.title).join(", ")}>
                                                <Compass className="w-3 h-3 shrink-0 text-muted-foreground" />
                                                <span className="truncate">{inq.destinations?.map(d => d.title).join(", ")}</span>
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
                <SheetContent className="sm:max-w-xl overflow-y-auto w-full">
                    {isFetchingInquiry ? (
                        <div className="flex flex-col items-center justify-center h-full py-12">
                            <Loader size="lg" />
                            <p className="mt-4 text-sm text-muted-foreground">Loading inquiry details...</p>
                        </div>
                    ) : selectedInquiry && (
                        <div className="space-y-6 pb-8">
                            <SheetTitle className="sr-only">Custom Booking Inquiry from {selectedInquiry.fullName}</SheetTitle>
                            <SheetDescription className="sr-only">
                                Custom booking inquiry details and management options
                            </SheetDescription>
                            {/* Header with Name and Status */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1 overflow-hidden">
                                    <h2 className="text-2xl font-bold break-words">{selectedInquiry.fullName}</h2>
                                    <p className="text-sm text-muted-foreground mt-1 break-words">
                                        {selectedInquiry.travelers} Travelers • Start Date: {new Date(selectedInquiry.startDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <Select 
                                    value={selectedInquiry.status} 
                                    onValueChange={(val: InquiryStatus) => handleStatusChange(val)}
                                    disabled={isUpdatingStatus}
                                >
                                    <SelectTrigger className="w-[140px]">
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

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <a href={`mailto:${selectedInquiry.email}`} className="hover:underline break-all min-w-0">
                                        {selectedInquiry.email}
                                    </a>
                                </div>
                                <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <a href={`tel:${selectedInquiry.phoneNumber}`} className="hover:underline break-all">
                                        {selectedInquiry.phoneNumber}
                                    </a>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <span className="text-xs">ID: {selectedInquiry.id}</span>
                                </div>
                            </div>

                            <Separator />

                            {/* Destinations and Activities */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="flex items-center gap-2 text-sm font-semibold">
                                        <Compass className="h-4 w-4 text-primary" />
                                        Destinations
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedInquiry.destinations?.length > 0 ? (
                                            selectedInquiry.destinations.map(d => (
                                                <Badge key={d.id} variant="secondary">{d.title}</Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-muted-foreground">None specified</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="flex items-center gap-2 text-sm font-semibold">
                                        <Activity className="h-4 w-4 text-primary" />
                                        Activities
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedInquiry.activities?.length > 0 ? (
                                            selectedInquiry.activities.map(a => (
                                                <Badge key={a.id} variant="secondary">{a.title}</Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-muted-foreground">None specified</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Special Requests */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-primary" />
                                    <h3 className="text-sm font-semibold">Special Requests</h3>
                                </div>
                                <div className="bg-muted/30 border border-border rounded-xl p-4 text-sm whitespace-pre-wrap break-words max-h-72 overflow-y-auto leading-relaxed">
                                    {selectedInquiry.specialRequests || "No special requests provided."}
                                </div>
                            </div>

                            {/* Contact via WhatsApp Button */}
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                                size="lg"
                                onClick={handleWhatsAppContact}
                            >
                                <MessageSquare className="h-5 w-5" />
                                Contact via WhatsApp
                            </Button>

                            <Separator />

                            {/* Admin Note Section */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <StickyNote className="h-4 w-4 text-muted-foreground" />
                                    <h3 className="text-sm font-semibold">Admin Note</h3>
                                </div>
                                <Textarea 
                                    placeholder="Add internal notes..." 
                                    className="min-h-[150px] resize-none border-yellow-200 focus:border-yellow-300 bg-yellow-50/50"
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
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(selectedInquiry.id)}
                                disabled={isDeleting}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                            >
                                <ButtonLoader loading={isDeleting}>
                                    <Trash2 className="h-4 w-4" /> Delete Inquiry
                                </ButtonLoader>
                            </Button>
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
