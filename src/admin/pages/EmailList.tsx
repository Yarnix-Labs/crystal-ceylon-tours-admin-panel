import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/admin/components/ui/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw, Mail, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { newsletterService, Subscriber } from "@/admin/services/newsletterService";
import { format } from "date-fns";
import { toast } from "sonner";

export default function EmailList() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 30,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchSubscribers = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await newsletterService.getSubscribers(page, meta.limit);
      if (response.success) {
        setSubscribers(response.data.items);
        setMeta(response.data.meta);
      } else {
        toast.error(response.message || "Failed to fetch subscribers");
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      toast.error("An error occurred while fetching subscribers");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSubscribers(meta.page);
  };

  const handlePageChange = (newPage: number) => {
    fetchSubscribers(newPage);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminPageHeader
        heading="Newsletter Subscribers"
        description="Manage your email newsletter subscription list."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          className="gap-2"
        >
          <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </AdminPageHeader>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="rounded-md border bg-card overflow-x-auto">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Subscribed Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && !isRefreshing ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex justify-center items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading subscribers...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : subscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No subscribers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  subscribers.map((subscriber, index) => (
                    <TableRow key={subscriber.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {(meta.page - 1) * meta.limit + index + 1}
                      </TableCell>
                      <TableCell className="max-w-[260px]">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-1.5 bg-primary/10 rounded-full text-primary shrink-0">
                            <Mail className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm truncate" title={subscriber.email}>{subscriber.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {subscriber.isActive ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 gap-1 hover:bg-green-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200 gap-1 hover:bg-red-500/20">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm whitespace-nowrap">
                         <div className="flex items-center justify-end gap-2">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                            {format(new Date(subscriber.createdAt), "MMM d, yyyy HH:mm")}
                         </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 border-t bg-muted/20">
            <div className="text-xs text-muted-foreground">
              Showing {subscribers.length} of {meta.total} subscribers
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(meta.page - 1)}
                disabled={!meta.hasPreviousPage || isLoading}
                className="h-8 text-xs"
              >
                Previous
              </Button>
              <div className="text-xs font-medium">
                Page {meta.page} of {meta.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(meta.page + 1)}
                disabled={!meta.hasNextPage || isLoading}
                className="h-8 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
