import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Edit,
  Trash2,
  Eye,
  RefreshCcw,
  Plus,
  Search,
  Package,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Globe,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { DeleteDialog } from "@/admin/components/ui/DeleteDialog";
import { Loader, ButtonLoader } from "@/admin/components/ui/Loader";
import {
  usePublishedTours,
  useDraftTours,
  useTourMutations,
} from "@/hooks/useAdminData";
import { AdminTourPackage } from "@/admin/services/tourService";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function TourList() {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"published" | "drafts">("published");
  const [currentPage, setCurrentPage] = useState(1);

  // Always fetch both lists so tab counts load immediately on page load
  const {
    data: publishedData,
    isLoading: loadingPublished,
    isFetching: fetchingPublished,
    error: publishedError,
  } = usePublishedTours(currentPage);
  const {
    data: draftsData,
    isLoading: loadingDrafts,
    isFetching: fetchingDrafts,
    error: draftsError,
  } = useDraftTours(currentPage);

  // For counts - also fetch page 1 of each to always have totals in cache
  const { data: publishedPage1 } = usePublishedTours(1);
  const { data: draftsPage1 } = useDraftTours(1);

  const isLoading = viewMode === "published" ? loadingPublished : loadingDrafts;
  const isFetching =
    viewMode === "published" ? fetchingPublished : fetchingDrafts;
  const currentData = viewMode === "published" ? publishedData : draftsData;

  // Debug logging
  useEffect(() => {
    if (currentData) {
      console.log("TourList currentData:", currentData);
      console.log("TourList items:", currentData?.items);
      console.log("TourList meta:", currentData?.meta);
    }
    if (publishedError) {
      console.error("TourList publishedError:", publishedError);
    }
    if (draftsError) {
      console.error("TourList draftsError:", draftsError);
    }
  }, [currentData, publishedError, draftsError]);

  const tours =
    currentData?.items?.map((item) => {
      // Normalize API response to AdminTourPackage format
      const itinerary = (item.days ?? []).map((day: any, index: number) => ({
        day: day.dayNumber ?? index + 1,
        title: day.topic || day.subTopic || `Day ${index + 1}`,
        location: day.location || "",
        description: day.description || "",
        accommodation: day.accommodation
          ? day.hotelName || "Included"
          : undefined,
      }));

      // Create a compatible object that matches both AdminTourPackage and UI expectations
      const tour: AdminTourPackage = {
        id: Number(item.id) || 0,
        slug: item.slug || String(item.id),
        name: item.name,
        tourRefNumber: item.tourRefNumber || item.slug || String(item.id),
        heroImage: item.heroImage,
        shortDescription: item.shortDescription || "",
        description: item.description || "",
        price: item.price ?? 0,
        packageType: item.packageType || "",
        minPeople: item.minPeople ?? 1,
        totalDays: item.totalDays ?? 0,
        packageDuration: item.packageDuration || "",
        status: viewMode === "published" ? "PUBLISHED" : "DRAFT",
        days: (item.days ?? []).map((day: any, index: number) => ({
          id: day.id ?? index,
          dayNumber: day.dayNumber ?? index + 1,
          location: day.location || "",
          topic: day.topic || "",
          subTopic: day.subTopic,
          image: day.image,
          description: day.description || "",
          mealPlan: day.mealPlan,
          accommodation: day.accommodation ?? false,
          hotelName: day.hotelName,
          hotelLocation: day.hotelLocation,
          roomType: day.roomType,
          destinations: day.destinations,
          thingsToDo: day.thingsToDo,
        })),
        // Legacy fields for backward compatibility
        packageDescription: item.description || item.shortDescription || "",
        vision: {
          title: "",
          description: "",
          image: "",
        },
        // Additional UI-specific fields (not part of TourPackage interface)
        duration: item.duration ? String(item.duration) : "",
        type: item.packageType || "",
        refNo: item.slug || String(item.id),
        category: item.packageType || "",
        published: viewMode === "published",
        includes: item.includes || [],
        excludes: item.excludes || [],
        itinerary,
        extraDetails: item.extraDetails || "",
        tags: item.tags || [],
      } as AdminTourPackage;

      return tour;
    }) ?? [];
  const paginationMeta = currentData?.meta;

  const { deleteMutation, updateStatusMutation } = useTourMutations();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = async () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSettled: () => setDeleteId(null),
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    setStatusUpdatingId(id);
    const newStatus = currentStatus ? "DRAFT" : "PUBLISHED";
    updateStatusMutation.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          setStatusUpdatingId(null);
        },
        onError: () => {
          setStatusUpdatingId(null);
          toast.error("Failed to update status");
        },
      }
    );
  };

  // Stats calculation - always available since both queries run on load
  const stats = useMemo(() => {
    const publishedCount = publishedPage1?.meta?.total ?? publishedData?.meta?.total ?? 0;
    const draftsCount = draftsPage1?.meta?.total ?? draftsData?.meta?.total ?? 0;
    return {
      total: publishedCount + draftsCount,
      published: publishedCount,
      drafts: draftsCount,
    };
  }, [publishedPage1?.meta?.total, draftsPage1?.meta?.total, publishedData?.meta?.total, draftsData?.meta?.total]);

  // Filtered data (client-side search only)
  const filteredData = useMemo(() => {
    return tours.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itinerary.some((day) =>
          day.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesSearch;
    });
  }, [tours, searchQuery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, viewMode]);

  // First load - show skeleton
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
          {[1, 2, 3].map((i) => (
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
            <p className="text-lg font-semibold text-foreground">
              Deleting tour package...
            </p>
            <p className="text-sm text-muted-foreground">Please wait</p>
          </div>
        </div>
      )}
      <div className="p-6 space-y-6 animate-in fade-in duration-500">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Tour Packages
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your travel packages and itineraries
            </p>
          </div>
          <Button
            onClick={() => navigate("/admin/tours/new")}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add New Package
          </Button>
        </div>

        {/* Tabs for Published/Drafts */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setViewMode("published")}
            className={`px-4 py-2 font-medium transition-colors ${
              viewMode === "published"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Published ({stats.published})
          </button>
          <button
            onClick={() => setViewMode("drafts")}
            className={`px-4 py-2 font-medium transition-colors ${
              viewMode === "drafts"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Drafts ({stats.drafts})
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
          <Card className="border border-border bg-white dark:bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.total}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total Packages
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border bg-white dark:bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-green-500/10">
                  <Globe className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.published}
                  </p>
                  <p className="text-xs text-muted-foreground">Published</p>
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
                  <p className="text-2xl font-bold text-foreground">
                    {stats.drafts}
                  </p>
                  <p className="text-xs text-muted-foreground">Draft Count</p>
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
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by package name, ref, or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-background border-border focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {searchQuery && (
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

              {/* Results count */}
              <div className="text-sm text-muted-foreground ml-auto">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {filteredData.length}
                </span>{" "}
                of {paginationMeta?.total ?? tours.length}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[350px]">
                    Package
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[180px]">
                    Duration
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[140px]">
                    Price
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[180px]">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[120px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    {/* Package Column */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                          {item.heroImage ? (
                            <img
                              src={item.heroImage}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="font-semibold text-foreground break-all">
                            {item.name}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            REF: {item.tourRefNumber}
                          </span>
                        </div>
                      </div>
                    </td>
                    {/* Duration Column */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="text-sm font-medium text-foreground">
                          {(item as any).packageDuration ||
                            item.duration ||
                            "-"}
                        </div>
                        {(item as any).totalDays && (
                          <span className="text-xs text-muted-foreground">
                            {(item as any).totalDays}{" "}
                            {(item as any).totalDays === 1 ? "Day" : "Days"}
                          </span>
                        )}
                        {item.type && (
                          <Badge
                            variant="secondary"
                            className="w-fit text-[10px] px-2 py-0.5 font-medium bg-primary/10 text-primary border-0"
                          >
                            {item.type}
                          </Badge>
                        )}
                      </div>
                    </td>
                    {/* Price Column */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-foreground">
                          USD {Number(item.price || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    {/* Status Column */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Switch
                            checked={viewMode === "published"}
                            onCheckedChange={() =>
                              handleTogglePublish(
                                String(item.id),
                                viewMode === "published"
                              )
                            }
                            className="data-[state=checked]:bg-green-500"
                            disabled={statusUpdatingId === String(item.id)}
                          />
                          {statusUpdatingId === String(item.id) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                              <Loader size="sm" />
                            </div>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-xs font-medium ${
                            viewMode === "published"
                              ? "bg-green-500/10 text-green-600 border border-green-500/20"
                              : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          }`}
                        >
                          {viewMode === "published" ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </td>
                    {/* Actions Column */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() =>
                                  window.open(
                                    `https://www.ravlankatravels.com/tour-packages/${item.slug}`,
                                    "_blank"
                                  )
                                }
                                disabled={viewMode === "drafts"}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {viewMode === "drafts" ? "Cannot view draft" : "View"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                onClick={() =>
                                  navigate(
                                    `/admin/tours/${item.id}?status=${
                                      viewMode === "published"
                                        ? "published"
                                        : "draft"
                                    }`
                                  )
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteId(String(item.id))}
                                disabled={
                                  deleteMutation.isPending &&
                                  deleteId === String(item.id)
                                }
                              >
                                <ButtonLoader
                                  loading={
                                    deleteMutation.isPending &&
                                    deleteId === String(item.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </ButtonLoader>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {paginationMeta && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                {Math.min(
                  (currentPage - 1) * paginationMeta.limit + 1,
                  paginationMeta.total
                )}{" "}
                to{" "}
                {Math.min(
                  currentPage * paginationMeta.limit,
                  paginationMeta.total
                )}{" "}
                of {paginationMeta.total} records
              </div>
              <div className="flex items-center gap-4">
                {/* Page Info */}
                <div className="text-sm font-medium">
                  Page {currentPage} of {paginationMeta.totalPages || 1}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(1)}
                    disabled={!paginationMeta.hasPreviousPage}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={!paginationMeta.hasPreviousPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={!paginationMeta.hasNextPage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(paginationMeta.totalPages)}
                    disabled={!paginationMeta.hasNextPage}
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
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No packages found
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                {searchQuery
                  ? "Try adjusting your search to find what you're looking for."
                  : "Get started by creating your first tour package."}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => navigate("/admin/tours/new")}
                  className="mt-4 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Package
                </Button>
              )}
            </div>
          )}
        </div>

        <DeleteDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Tour Package"
          description="Are you sure you want to delete this tour package? This action cannot be undone."
        />
      </div>
    </div>
  );
}
