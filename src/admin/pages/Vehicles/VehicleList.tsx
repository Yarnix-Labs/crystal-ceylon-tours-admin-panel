import { useState, useEffect } from "react";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription 
} from "@/components/ui/card";
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetDescription,
    SheetFooter
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    Car, 
    Users, 
    Trash2, 
    Eye, 
    Search,
    RefreshCw,
    Plus,
    CheckCircle2,
    XCircle,
    Package,
    Info,
    Calendar,
    Settings,
    Image as ImageIcon,
    Pencil,
    X
} from "lucide-react";
import { vehicleService, VehicleItem, VehicleStatus } from "@/admin/services/vehicleService";
import { Loader } from "@/admin/components/ui/Loader";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function VehicleList() {
    const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleItem | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Partial<VehicleItem> | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<VehicleItem>>({
        name: "",
        type: "",
        model: "",
        passengers: 1,
        price: 0,
        description: "",
        features: [],
        images: [],
        status: "ACTIVE"
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        setIsLoading(true);
        try {
            const response = await vehicleService.getAll();
            if (response.success) {
                setVehicles(response.data);
            }
        } catch (error) {
            console.error("Error fetching vehicles:", error);
            toast.error("Failed to load vehicles");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this vehicle?")) return;
        
        setIsDeleting(true);
        try {
            await vehicleService.delete(id);
            toast.success("Vehicle deleted successfully");
            setVehicles(prev => prev.filter(v => v.id !== id));
            setIsSheetOpen(false);
        } catch (error) {
            toast.error("Failed to delete vehicle");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenAddModal = () => {
        setEditingVehicle(null);
        setFormData({
            name: "",
            type: "",
            model: "",
            passengers: 1,
            price: 0,
            description: "",
            features: [],
            images: [],
            status: "ACTIVE"
        });
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (vehicle: VehicleItem) => {
        setEditingVehicle(vehicle);
        setFormData(vehicle);
        setIsFormModalOpen(true);
        setIsSheetOpen(false); // Close detail sheet if open
    };

    const handleSaveVehicle = async () => {
        if (!formData.name || !formData.type || !formData.price) {
            toast.error("Please fill in all required fields (Name, Type, Price)");
            return;
        }

        setIsSaving(true);
        try {
            if (editingVehicle) {
                const response = await vehicleService.update(editingVehicle.id!, formData);
                if (response.success) {
                    toast.success("Vehicle updated successfully");
                    setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? response.data : v));
                }
            } else {
                const response = await vehicleService.create(formData);
                if (response.success) {
                    toast.success("Vehicle created successfully");
                    setVehicles(prev => [response.data, ...prev]);
                }
            }
            setIsFormModalOpen(false);
        } catch (error) {
            console.error("Error saving vehicle:", error);
            toast.error("Failed to save vehicle");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredVehicles = vehicles.filter(v => 
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
                    <p className="text-muted-foreground">Manage your tour fleet and vehicle details.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchVehicles} disabled={isLoading}>
                        <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                        Refresh
                    </Button>
                    <Button className="bg-[#fbb03b] hover:bg-[#d98d1a] text-white" onClick={handleOpenAddModal}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Vehicle
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-card px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Car className="h-5 w-5 text-[#02aad7]" />
                            <CardTitle className="text-lg">Fleet Inventory</CardTitle>
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search vehicles..." 
                                className="pl-9 bg-muted/50 border-none h-9 text-sm focus-visible:ring-1 focus-visible:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader size="lg" />
                            <p className="mt-4 text-sm text-muted-foreground">Fetching vehicle data...</p>
                        </div>
                    ) : filteredVehicles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Car className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No vehicles found</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                                {searchTerm ? "No vehicles match your search criteria." : "You haven't added any vehicles to your fleet yet."}
                            </p>
                            {searchTerm && (
                                <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2 text-primary">
                                    Clear Search
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead className="w-[80px]">Status</TableHead>
                                    <TableHead>Vehicle Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Model</TableHead>
                                    <TableHead className="text-center">Capacity</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredVehicles.map((vehicle) => (
                                    <TableRow key={vehicle.id} className="hover:bg-muted/10 transition-colors group">
                                        <TableCell>
                                            {vehicle.status === 'ACTIVE' ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1.5 px-2">
                                                    <CheckCircle2 className="h-3 w-3" /> Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 gap-1.5 px-2">
                                                    <XCircle className="h-3 w-3" /> Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border/50">
                                                    {vehicle.images?.[0] ? (
                                                        <img src={vehicle.images[0]} alt={vehicle.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Car className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <span className="font-bold text-foreground truncate max-w-[200px]">{vehicle.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-[#02aad7]/10 text-[#02aad7] border-none font-semibold">
                                                {vehicle.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground font-medium">{vehicle.model}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1.5 font-semibold text-foreground">
                                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                {vehicle.passengers}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-primary">
                                            USD {vehicle.price?.toLocaleString() ?? "0"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 rounded-full hover:bg-primary hover:text-white transition-all"
                                                onClick={() => {
                                                    setSelectedVehicle(vehicle);
                                                    setIsSheetOpen(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Detail Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto">
                    {selectedVehicle && (
                        <div className="space-y-8 pb-8">
                            <SheetHeader className="relative pr-10">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge className={cn(
                                            "uppercase text-[10px] tracking-widest px-2 py-0.5",
                                            selectedVehicle.status === 'ACTIVE' ? "bg-green-500" : "bg-slate-500"
                                        )}>
                                            {selectedVehicle.status}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground font-mono">ID: #{selectedVehicle.id}</span>
                                    </div>
                                    <SheetTitle className="text-3xl font-extrabold tracking-tight">
                                        {selectedVehicle.name}
                                    </SheetTitle>
                                    <SheetDescription className="text-base font-medium text-[#02aad7]">
                                        {selectedVehicle.type} • {selectedVehicle.model}
                                    </SheetDescription>
                                </div>
                            </SheetHeader>

                            {/* Image Gallery */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedVehicle.images.map((img, idx) => (
                                    <div key={idx} className="aspect-video rounded-2xl overflow-hidden border border-border/50 bg-muted group relative">
                                        <img src={img} alt={`${selectedVehicle.name} ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 shadow-lg">
                                                <ImageIcon className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {selectedVehicle.images.length === 0 && (
                                    <div className="col-span-full h-40 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-muted/30 text-muted-foreground gap-2">
                                        <ImageIcon className="h-8 w-8 opacity-20" />
                                        <span className="text-xs font-medium">No images available</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="border-none bg-muted/20 shadow-none">
                                    <CardContent className="p-5 space-y-3">
                                        <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                                            <Users className="h-4 w-4" />
                                            Capacity
                                        </div>
                                        <div className="font-bold text-2xl text-foreground">
                                            {selectedVehicle.passengers} <span className="text-xs text-muted-foreground font-normal">Passengers</span>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-none bg-primary/5 shadow-none overflow-hidden relative">
                                    <CardContent className="p-5 space-y-3 relative z-10">
                                        <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                                            <Package className="h-4 w-4" />
                                            Rate
                                        </div>
                                        <div className="font-bold text-2xl text-foreground">
                                            USD {selectedVehicle.price?.toLocaleString() ?? "0"}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-none bg-muted/20 shadow-none">
                                    <CardContent className="p-5 space-y-3">
                                        <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                                            <Calendar className="h-4 w-4" />
                                            Added
                                        </div>
                                        <div className="font-bold text-lg text-foreground truncate">
                                            {new Date(selectedVehicle.createdAt).toLocaleDateString()}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                                    <Info className="h-4 w-4" />
                                    Description
                                </div>
                                <div className="bg-card border border-border/50 rounded-2xl p-6 text-sm leading-relaxed text-foreground/80 shadow-sm italic">
                                    {selectedVehicle.description}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                                    <Settings className="h-4 w-4" />
                                    Features & Amenities
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedVehicle.features.map((feature, idx) => (
                                        <Badge key={idx} variant="outline" className="px-3 py-1 text-xs bg-primary/5 border-primary/20 text-primary font-semibold">
                                            {feature}
                                        </Badge>
                                    ))}
                                    {selectedVehicle.features.length === 0 && (
                                        <span className="text-xs text-muted-foreground italic">No features listed</span>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between gap-4 pt-2">
                                <Button
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl px-6"
                                    onClick={() => handleDelete(selectedVehicle.id)}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Vehicle
                                </Button>
                                <Button 
                                    className="bg-[#fbb03b] hover:bg-[#d98d1a] text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-orange-500/20"
                                    onClick={() => handleOpenEditModal(selectedVehicle)}
                                >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit Vehicle Details
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Form Dialog */}
            <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                        </DialogTitle>
                        <DialogDescription>
                            Enter the details for your tour vehicle. All fields with * are required.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Vehicle Name *</Label>
                                <Input 
                                    id="name" 
                                    placeholder="e.g. Toyota Commuter High" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Vehicle Type *</Label>
                                <Input 
                                    id="type" 
                                    placeholder="e.g. Van, Car, Mini-Bus" 
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="model">Model</Label>
                                <Input 
                                    id="model" 
                                    placeholder="e.g. KDH-2015" 
                                    value={formData.model}
                                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="passengers">Capacity *</Label>
                                <Input 
                                    id="passengers" 
                                    type="number"
                                    min={1}
                                    value={formData.passengers}
                                    onChange={(e) => setFormData({...formData, passengers: parseInt(e.target.value)})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Rate (USD) *</Label>
                                <Input 
                                    id="price" 
                                    type="number"
                                    min={0}
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Vehicle Status</Label>
                            <Select 
                                value={formData.status} 
                                onValueChange={(val: VehicleStatus) => setFormData({...formData, status: val})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea 
                                id="description" 
                                placeholder="Describe the vehicle's condition, best use case, etc." 
                                className="min-h-[100px]"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Features (Comma separated)</Label>
                            <Input 
                                placeholder="A/C, WIFI, Adjustable Seats, USB Charger" 
                                value={formData.features?.join(", ")}
                                onChange={(e) => setFormData({...formData, features: e.target.value.split(",").map(f => f.trim()).filter(f => f !== "")})}
                            />
                        </div>

                        <div className="space-y-4">
                            <Label>Vehicle Images (URLs)</Label>
                            {formData.images?.map((url, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <Input 
                                        value={url} 
                                        onChange={(e) => {
                                            const newImages = [...formData.images!];
                                            newImages[idx] = e.target.value;
                                            setFormData({...formData, images: newImages});
                                        }}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => {
                                            const newImages = formData.images!.filter((_, i) => i !== idx);
                                            setFormData({...formData, images: newImages});
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full border-dashed"
                                onClick={() => setFormData({...formData, images: [...(formData.images || []), ""]})}
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add Image URL
                            </Button>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setIsFormModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            className="bg-primary text-white hover:bg-primary/90 min-w-[120px]" 
                            onClick={handleSaveVehicle}
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving..." : editingVehicle ? "Save Changes" : "Create Vehicle"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
