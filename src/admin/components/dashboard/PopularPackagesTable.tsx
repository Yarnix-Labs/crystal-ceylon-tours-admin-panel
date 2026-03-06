import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, TrendingUp } from "lucide-react";

interface PackageData {
    id: string;
    name: string;
    views: number;
    bookings: number;
    conversion: number;
    status: "trend" | "stable";
    image: string;
}

const data: PackageData[] = [
    {
        id: "PKG-001",
        name: "Sri Lanka Cultural Triangle 7-Day Tour",
        views: 1240,
        bookings: 45,
        conversion: 3.6,
        status: "trend",
        image: "https://images.unsplash.com/photo-1546708773-e575a5d625d6?q=80&w=2600&auto=format&fit=crop"
    },
    {
        id: "PKG-002",
        name: "Honeymoon Paradise: Beach & Hill Country",
        views: 980,
        bookings: 28,
        conversion: 2.8,
        status: "trend",
        image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=2000&auto=format&fit=crop"
    },
    {
        id: "PKG-003",
        name: "Wildlife Safari & Nature Adventure",
        views: 850,
        bookings: 32,
        conversion: 3.7,
        status: "stable",
        image: "https://images.unsplash.com/photo-1534068590799-09895a701e3e?q=80&w=2000&auto=format&fit=crop"
    },
    {
        id: "PKG-004",
        name: "Historical Heritage Tour",
        views: 740,
        bookings: 18,
        conversion: 2.4,
        status: "stable",
        image: "https://images.unsplash.com/photo-1580661298539-7cb760f38c64?q=80&w=2000&auto=format&fit=crop"
    },
    {
        id: "PKG-005",
        name: "Luxury Beach Escape (Galle & Mirissa)",
        views: 690,
        bookings: 24,
        conversion: 3.5,
        status: "trend",
        image: "https://images.unsplash.com/photo-1516815231560-8f41ec531527?q=80&w=2000&auto=format&fit=crop"
    }
];

export function PopularPackagesTable() {
    return (
        <div className="space-y-4">
            {data.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    {/* Image */}
                    <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                        <img 
                            src={item.image} 
                            alt={item.name} 
                            className="h-full w-full object-cover"
                        />
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{item.name}</h4>
                            {item.status === "trend" && (
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-600 border-0 h-5 px-1.5 text-[10px]">
                                    <TrendingUp className="w-3 h-3 mr-1" /> Trending
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" /> {item.views.toLocaleString()} views
                            </span>
                            <span>•</span>
                            <span className="font-medium text-foreground">{item.bookings} bookings</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">{item.conversion}% conv.</span>
                        </div>
                    </div>

                    {/* Action */}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Eye className="w-4 h-4" />
                    </Button>
                </div>
            ))}
        </div>
    );
}
