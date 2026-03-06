import { useState, useEffect } from "react";
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
    Check,
    Mail,
    Phone,
    User,
    Calendar,
    Send,
    Archive,
    MessageSquare,
    FileText,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { messageService, MessageItem, MessageStatus } from "@/admin/services/messageService";

export default function ContactMessages() {
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null);
    const [filter, setFilter] = useState<"all" | MessageStatus>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [adminNote, setAdminNote] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isFetchingMessage, setIsFetchingMessage] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [meta, setMeta] = useState<any>(null);

    // Statistics
    const [stats, setStats] = useState({
        total: 0,
        unread: 0,
        replied: 0
    });

    const [isFetching, setIsFetching] = useState(false);

    // Fetch messages
    const fetchMessages = async (page: number = 1, showLoading: boolean = true) => {
        if (showLoading) {
            setIsLoading(true);
        } else {
            setIsFetching(true);
        }
        try {
            let response;
            
            if (filter === "all") {
                response = await messageService.getAll(page);
            } else {
                response = await messageService.filterByStatus(filter, page);
            }

            if (response.success) {
                setMessages(response.data.data);
                setCurrentPage(response.data.meta.page);
                setMeta(response.data.meta);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Failed to load messages");
        } finally {
            setIsLoading(false);
            setIsFetching(false);
        }
    };

    // Fetch all messages for statistics
    const fetchStats = async () => {
        try {
            const allResponse = await messageService.getAll(1);
            if (allResponse.success) {
                const total = allResponse.data.meta.total;
                
                // Fetch unread count
                const unreadResponse = await messageService.filterByStatus("UNREAD", 1);
                const unread = unreadResponse.success ? unreadResponse.data.meta.total : 0;
                
                // Fetch replied count
                const repliedResponse = await messageService.filterByStatus("REPLIED", 1);
                const replied = repliedResponse.success ? repliedResponse.data.meta.total : 0;
                
                setStats({ total, unread, replied });
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    // Initial load
    useEffect(() => {
        fetchMessages(1);
        fetchStats();
    }, []);

    // Reload when filter changes
    useEffect(() => {
        setCurrentPage(1);
        fetchMessages(1, true);
    }, [filter]);

    // Filter messages by search query (client-side)
    const filteredMessages = messages.filter(msg => {
        const matchesSearch = 
            msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.subject.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const handleViewMessage = async (msg: MessageItem) => {
        // Open sheet immediately with available data
        setSelectedMessage(msg);
        setAdminNote(msg.adminNote || "");
        setIsSheetOpen(true);
        setIsFetchingMessage(true);
        
        try {
            // Fetch the full message details
            const response = await messageService.getById(msg.id);
            if (response.success && response.data) {
                // Ensure we preserve the message field even if API response structure differs
                const updatedMessage: MessageItem = {
                    ...response.data,
                    // Fallback to original message if API response doesn't have it
                    message: response.data.message || msg.message || "",
                };
                setSelectedMessage(updatedMessage);
                setAdminNote(response.data.adminNote || "");
            } else {
                console.error("API response indicates failure:", response);
                // Keep the initial message data so modal still shows something
            }
        } catch (error) {
            console.error("Error fetching message details:", error);
            toast.error("Failed to load message details");
            // Keep the initial message data so modal still shows something
        } finally {
            setIsFetchingMessage(false);
        }
    };

    const handleDeleteClick = () => {
        if (!selectedMessage) return;
        setMessageToDelete(selectedMessage.id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!messageToDelete) return;
        
        setIsDeleting(true);
        try {
            const response = await messageService.delete(messageToDelete);
            
            if (response.success) {
                setMessages(messages.filter(m => m.id !== messageToDelete));
                setIsSheetOpen(false);
                toast.success("Message deleted successfully");
                fetchStats();
                
                // Refresh if current page becomes empty
                if (filteredMessages.length === 1 && currentPage > 1) {
                    fetchMessages(currentPage - 1);
                } else {
                    fetchMessages(currentPage);
                }
            }
        } catch (error) {
            console.error("Error deleting message:", error);
            toast.error("Failed to delete message");
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setMessageToDelete(null);
        }
    };

    const handleSaveAdminNote = async () => {
        if (!selectedMessage) return;
        
        setIsSavingNote(true);
        try {
            const response = await messageService.updateAdminNote(
                selectedMessage.id, 
                { note: adminNote.trim() }
            );
            
            if (response.success) {
                setSelectedMessage({
                    ...selectedMessage,
                    adminNote: adminNote.trim()
                });
                
                setMessages(messages.map(m => 
                    m.id === selectedMessage.id 
                        ? { ...m, adminNote: adminNote.trim() } 
                        : m
                ));
                
                toast.success("Admin note saved successfully");
            }
        } catch (error) {
            console.error("Error saving admin note:", error);
            toast.error("Failed to save admin note");
        } finally {
            setIsSavingNote(false);
        }
    };

    const handleSendEmail = () => {
        if (!selectedMessage) return;
        
        const subject = encodeURIComponent(`Re: ${selectedMessage.subject}`);
        const body = encodeURIComponent(`\n\n---\nOriginal message from ${selectedMessage.name}:\n${selectedMessage.message}`);
        const mailtoLink = `mailto:${selectedMessage.email}?subject=${subject}&body=${body}`;
        
        window.location.href = mailtoLink;
    };

    const handleRefresh = async () => {
        await fetchMessages(currentPage, false);
        await fetchStats();
        toast.success("Refreshed");
    };

    const handlePreviousPage = () => {
        if (meta?.hasPreviousPage) {
            fetchMessages(currentPage - 1, false);
        }
    };

    const handleNextPage = () => {
        if (meta?.hasNextPage) {
            fetchMessages(currentPage + 1, false);
        }
    };

    const getStatusBadge = (status: MessageStatus) => {
        switch (status) {
            case "UNREAD":
                return <Badge className="bg-blue-500 hover:bg-blue-600">Unread</Badge>;
            case "REPLIED":
                return <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">Replied</Badge>;
            case "CLOSED":
                return <Badge variant="outline" className="text-gray-600 border-gray-600 bg-gray-50">Closed</Badge>;
            case "READ":
            default:
                return <Badge variant="secondary">Read</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                heading="Contact Messages"
                description="Manage and reply to customer enquiries"
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search messages..."
                            className="pl-9 w-[200px] lg:w-[300px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select 
                        value={filter} 
                        onValueChange={(value) => setFilter(value as "all" | MessageStatus)}
                    >
                        <SelectTrigger className="w-[140px]">
                            <div className="flex items-center gap-2">
                                <div className="p-0.5 rounded-full bg-primary/10">
                                    <Archive className="w-3 h-3 text-primary" />
                                </div>
                                <SelectValue placeholder="Filter" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Messages</SelectItem>
                            <SelectItem value="UNREAD">Unread</SelectItem>
                            <SelectItem value="READ">Read</SelectItem>
                            <SelectItem value="REPLIED">Replied</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button 
                        variant="outline" 
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isLoading || isFetching}
                    >
                        <RefreshCcw className={cn("h-4 w-4", (isLoading || isFetching) && "animate-spin")} />
                    </Button>
                </div>
            </AdminPageHeader>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6 flex items-center justify-between space-y-0">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                            <p className="text-2xl font-bold">{messages.length}</p>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center justify-between space-y-0">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Unread</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {messages.filter(m => m.status === "UNREAD").length}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                            <Mail className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center justify-between space-y-0">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Replied</p>
                            <p className="text-2xl font-bold text-green-600">
                                {messages.filter(m => m.status === "REPLIED").length}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                            <FileText className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center justify-between space-y-0">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Closed</p>
                            <p className="text-2xl font-bold">
                                {messages.filter(m => m.status === "CLOSED").length}
                            </p>
                        </div>
                        <div className="p-3 bg-gray-100 dark:bg-gray-900/30 rounded-full text-gray-600 dark:text-gray-400">
                            <Archive className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm bg-card relative">
                {/* Inline loader for subsequent data fetching */}
                {isFetching && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader size="lg" />
                            <p className="text-sm text-muted-foreground">Updating...</p>
                        </div>
                    </div>
                )}
                <div className="rounded-md border overflow-x-auto">
                    <Table className="min-w-[600px]">
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[100px]">Status</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="hidden md:table-cell">Subject</TableHead>
                                <TableHead className="hidden lg:table-cell">Preview</TableHead>
                                <TableHead className="hidden xl:table-cell">Date</TableHead>
                                                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48">
                                        <div className="flex justify-center">
                                            <Loader size="lg" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredMessages.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No messages found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredMessages.map((msg) => (
                                    <TableRow 
                                        key={msg.id}
                                        className={cn(
                                            "cursor-pointer transition-colors hover:bg-muted/50",
                                            msg.status === "UNREAD" ? "bg-blue-50/30 font-medium" : ""
                                        )}
                                        onClick={() => handleViewMessage(msg)}
                                    >
                                        <TableCell>{getStatusBadge(msg.status)}</TableCell>
                                        <TableCell className="max-w-[180px]">
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-medium truncate" title={msg.name}>{msg.name}</span>
                                                <span className="text-xs text-muted-foreground truncate" title={msg.email}>{msg.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell font-medium max-w-[200px] truncate">
                                            {msg.subject}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell max-w-[300px] truncate text-muted-foreground">
                                            {msg.message}
                                        </TableCell>
                                        <TableCell className="hidden xl:table-cell text-muted-foreground text-sm">
                                            {new Date(msg.createdAt).toLocaleDateString()}
                                            <span className="block text-xs opacity-70">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
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
                {meta && messages.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t bg-muted/10">
                        <div className="text-sm text-muted-foreground">
                            Showing {Math.min((currentPage - 1) * 10 + 1, meta.total)} to{" "}
                            {Math.min(currentPage * 10, meta.total)} of {meta.total} records
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
                                    onClick={() => fetchMessages(1, false)}
                                    disabled={!meta.hasPreviousPage || isLoading}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handlePreviousPage()}
                                    disabled={!meta.hasPreviousPage || isLoading}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleNextPage()}
                                    disabled={!meta.hasNextPage || isLoading}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => fetchMessages(meta.totalPages, false)}
                                    disabled={!meta.hasNextPage || isLoading}
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Message Detail Drawer */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-xl overflow-y-auto w-full">
                    {isFetchingMessage ? (
                        <div className="flex flex-col items-center justify-center h-full py-12">
                            <Loader size="lg" />
                            <p className="mt-4 text-sm text-muted-foreground">Loading message details...</p>
                        </div>
                    ) : selectedMessage && (
                        <div className="space-y-6 pb-8">
                            {/* Hidden title and description for accessibility */}
                            <SheetTitle className="sr-only">Message from {selectedMessage.name}</SheetTitle>
                            <SheetDescription className="sr-only">
                                Contact message details and management options
                            </SheetDescription>
                            {/* Header with Name and Status */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1 overflow-hidden">
                                    <h2 className="text-2xl font-bold break-words">{selectedMessage.name}</h2>
                                    <p className="text-sm text-muted-foreground mt-1 break-words">
                                        {selectedMessage.subject}
                                    </p>
                                </div>
                                <Select 
                                    value={selectedMessage.status} 
                                    onValueChange={async (value: MessageStatus) => {
                                        // Only allow manual changes to REPLIED or CLOSED
                                        if (value !== "REPLIED" && value !== "CLOSED") {
                                            toast.error("Only REPLIED and CLOSED statuses can be set manually");
                                            return;
                                        }
                                        
                                        try {
                                            setIsUpdatingStatus(true);
                                            const response = await messageService.updateStatus(
                                                selectedMessage.id, 
                                                { status: value }
                                            );
                                            
                                            if (response.success) {
                                                setSelectedMessage({
                                                    ...selectedMessage,
                                                    status: value
                                                });
                                                
                                                setMessages(messages.map(m => 
                                                    m.id === selectedMessage.id 
                                                        ? { ...m, status: value } 
                                                        : m
                                                ));
                                                
                                                toast.success("Status updated successfully");
                                                fetchStats();
                                            }
                                        } catch (error) {
                                            console.error("Error updating status:", error);
                                            toast.error("Failed to update status");
                                        } finally {
                                            setIsUpdatingStatus(false);
                                        }
                                    }}
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
                                        <SelectItem value="UNREAD" disabled>Unread</SelectItem>
                                        <SelectItem value="READ" disabled>Read</SelectItem>
                                        <SelectItem value="REPLIED">Replied</SelectItem>
                                        <SelectItem value="CLOSED">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <a href={`mailto:${selectedMessage.email}`} className="hover:underline break-all min-w-0">
                                        {selectedMessage.email}
                                    </a>
                                </div>
                                <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <a href={`tel:${selectedMessage.phoneNumber}`} className="hover:underline break-all">
                                        {selectedMessage.phoneNumber}
                                    </a>
                                </div>
                                <div className="flex items-center gap-2 col-span-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>
                                        Arrival: {new Date(selectedMessage.createdAt).toLocaleDateString(undefined, {
                                            month: '2-digit',
                                            day: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <span className="text-xs">ID: {selectedMessage.id}</span>
                                </div>
                            </div>

                            <Separator />

                            {/* Client Message */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-primary" />
                                    <h3 className="text-sm font-semibold">Client Message</h3>
                                </div>
                                <div className="bg-muted/30 border border-border rounded-xl p-4 text-sm whitespace-pre-wrap break-words max-h-72 overflow-y-auto leading-relaxed">
                                    {selectedMessage.message || "No message content available."}
                                </div>
                            </div>

                            {/* Send Email Button */}
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                                size="lg"
                                onClick={handleSendEmail}
                            >
                                <Mail className="h-5 w-5" />
                                Contact via Email
                            </Button>

                            <Separator />

                            {/* Admin Note Section */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <h3 className="text-sm font-semibold">Admin Note</h3>
                                </div>
                                <Textarea 
                                    placeholder="Add internal notes..." 
                                    className="min-h-[150px] resize-none border-yellow-200 focus:border-yellow-300 bg-yellow-50/50"
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSaveAdminNote}
                                        disabled={isSavingNote}
                                        className="gap-2"
                                    >
                                        <ButtonLoader loading={isSavingNote}>
                                    <FileText className="h-4 w-4" /> Save Note
                                </ButtonLoader>
                                    </Button>
                                </div>
                            </div>

                            <Separator className="my-8" />

                            {/* Delete Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDeleteClick}
                                disabled={isDeleting}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                            >
                                <ButtonLoader loading={isDeleting}>
                                    <Trash2 className="h-4 w-4" /> Delete Message
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
                title="Delete Message"
                description="Are you sure you want to delete this message? This action cannot be undone."
            />
        </div>
    );
}