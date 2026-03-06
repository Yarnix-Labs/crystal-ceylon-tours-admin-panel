
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    width?: string;
    sortable?: boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    searchKey?: string;
    onSearch?: (query: string) => void;
    actions?: (item: T) => React.ReactNode;
}

export function DataTable<T extends { id: string | number;[key: string]: any }>({
    data,
    columns,
    searchKey,
    actions
}: DataTableProps<T>) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Filter, Sort, and Pagination Logic
    const processedData = useMemo(() => {
        let result = [...data];

        // 1. Filter
        if (searchKey && searchQuery) {
            result = result.filter(item => {
                const value = item[searchKey];
                return String(value).toLowerCase().includes(searchQuery.toLowerCase());
            });
        }

        // 2. Sort
        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return result;
    }, [data, searchKey, searchQuery, sortConfig]);

    const totalPages = Math.ceil(processedData.length / pageSize);
    const paginatedData = processedData.slice((page - 1) * pageSize, page * pageSize);

    // Reset page when search changes
    useMemo(() => {
        if (searchQuery) setPage(1);
    }, [searchQuery]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Toolbar */}
            {searchKey && (
                <div className="flex items-center justify-between p-1">
                    <div className="flex flex-1 items-center space-x-2">
                        <div className="relative w-full max-w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={`Search ...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 w-[200px] lg:w-[300px] bg-background"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            {columns.map((col) => (
                                <TableHead
                                    key={col.key}
                                    className={cn(col.width, "h-10 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground")}
                                >
                                    {col.sortable !== false ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="-ml-3 h-8 data-[state=open]:bg-accent text-xs font-semibold uppercase tracking-wider hover:bg-transparent"
                                            onClick={() => requestSort(col.key)}
                                        >
                                            {col.header}
                                            <ArrowUpDown className="ml-2 h-3 w-3" />
                                        </Button>
                                    ) : (
                                        col.header
                                    )}
                                </TableHead>
                            ))}
                            {actions && <TableHead className="w-[100px] text-right text-xs font-semibold uppercase tracking-wider">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row) => (
                                <TableRow key={row.id} className="hover:bg-muted/50 transition-colors">
                                    {columns.map((col) => (
                                        <TableCell key={`${row.id}-${col.key}`} className="px-4 py-3">
                                            {col.render ? col.render(row) : row[col.key]}
                                        </TableCell>
                                    ))}
                                    {actions && (
                                        <TableCell className="text-right px-4 py-3">
                                            {actions(row)}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + (actions ? 1 : 0)}
                                    className="h-24 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                                        <p>No results found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2">
                <div className="flex-1 text-sm text-muted-foreground">
                    {processedData.length} records.
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Rows</p>
                        <Select
                            value={`${pageSize}`}
                            onValueChange={(value) => {
                                setPageSize(Number(value));
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[5, 10, 20, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Page {page} of {totalPages || 1}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages || totalPages === 0}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => setPage(totalPages)}
                            disabled={page === totalPages || totalPages === 0}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
