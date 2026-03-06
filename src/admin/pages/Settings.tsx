
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AdminPageHeader } from "@/admin/components/ui/PageHeader";
import { 
    Globe, Save, Camera, Upload, 
    LayoutGrid, Plus,
    MapPin, Phone, Mail,
    ChevronRight
} from "lucide-react";
import { Loader, ButtonLoader } from "@/admin/components/ui/Loader";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { companyService, CompanyDetails } from "@/admin/services/companyService";
import { companySocialMediaService, CompanySocialMedia } from "@/admin/services/companySocialMediaService";

interface SettingsTab {
    id: string;
    label: string;
    icon: React.ReactNode;
    description: string;
}

const tabs: SettingsTab[] = [
    { id: "general", label: "General", icon: <LayoutGrid className="w-4 h-4" />, description: "Manage basic site information and preferences." },
    { id: "social", label: "Social", icon: <Globe className="w-4 h-4" />, description: "Connect your social media accounts." },
];



export default function Settings() {
    const [activeTab, setActiveTab] = useState("general");
    const [loading, setLoading] = useState(false);
    const [isNewCompany, setIsNewCompany] = useState(false);

    // Company Details State
    const [companyData, setCompanyData] = useState<CompanyDetails>({
        companyName: "",
        logoUrl: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
    });

    // Image Upload State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState<string>("");

    // Social Media State
    const [socialLinks, setSocialLinks] = useState<CompanySocialMedia[]>([]);
    const [socialLoading, setSocialLoading] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);
    const [savingSocialId, setSavingSocialId] = useState<number | null>(null);

    const [addingSocial, setAddingSocial] = useState(false);
    const [uploadingNewIcon, setUploadingNewIcon] = useState(false);
    const iconInputRef = useRef<HTMLInputElement>(null);
    const newIconInputRef = useRef<HTMLInputElement>(null);
    const [uploadingIconForId, setUploadingIconForId] = useState<number | null>(null);

    // New Social Link Form State
    const [showNewSocialForm, setShowNewSocialForm] = useState(false);
    const [newSocialLink, setNewSocialLink] = useState({
        type: "",
        iconUrl: "",
        pageUrl: "",
    });
    const [newIconPreview, setNewIconPreview] = useState<string | null>(null);
    const [newSocialErrors, setNewSocialErrors] = useState({
        type: "",
        iconUrl: "",
        pageUrl: "",
    });

    // Fetch company details on mount
    useEffect(() => {
        fetchCompanyDetails();
        fetchSocialMedia();
    }, []);

    const fetchSocialMedia = async () => {
        try {
            console.log("[Social Media] Fetching...");
            const response = await companySocialMediaService.getAll();
            console.log("[Social Media] Raw response:", response);
            console.log("[Social Media] Response type:", typeof response);
            console.log("[Social Media] Is array:", Array.isArray(response));
            console.log("[Social Media] Response.data:", response?.data);
            console.log("[Social Media] Response.success:", response?.success);

            // Try different response structures
            let links: CompanySocialMedia[] = [];
            if (Array.isArray(response)) {
                console.log("[Social Media] Using direct response array");
                links = response;
            } else if (response.data && Array.isArray(response.data.links)) {
                console.log("[Social Media] Using response.data.links array");
                links = response.data.links;
            } else if (response.success && Array.isArray(response.data)) {
                console.log("[Social Media] Using response.data array");
                links = response.data;
            } else if (response.success && response.data && Array.isArray(response.data.data)) {
                console.log("[Social Media] Using nested response.data.data array");
                links = response.data.data;
            } else if (response.data && Array.isArray(response.data)) {
                console.log("[Social Media] Using response.data without success check");
                links = response.data;
            } else {
                console.log("[Social Media] No valid data structure found");
            }

            console.log("[Social Media] Extracted links:", links);
            console.log("[Social Media] Links count:", links.length);
            setSocialLinks(links);
        } catch (error: any) {
            console.error("[Social Media] Error fetching:", error);
            console.error("[Social Media] Error response:", error.response);
            setSocialLinks([]);
            // Don't show error for 404 (no social media yet)
            if (error.response?.status !== 404) {
                toast.error("Failed to load social media links");
            }
        }
    };

    const fetchCompanyDetails = async () => {
        try {
            const response = await companyService.getDetails();
            if (response.success && response.data) {
                setCompanyData(response.data);
                setLogoPreview(response.data.logoUrl || null);
                setIsNewCompany(false);
            }
        } catch (error: any) {
            // If 404, company doesn't exist yet
            if (error.response?.status === 404) {
                setIsNewCompany(true);
            } else {
                toast.error("Failed to load company details");
            }
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                companyName: companyData.companyName,
                contactEmail: companyData.contactEmail,
                contactPhone: companyData.contactPhone,
                address: companyData.address,
                logoUrl: companyData.logoUrl,
            };

            if (isNewCompany) {
                await companyService.createDetails(payload);
                toast.success("Company details created successfully");
                setIsNewCompany(false);
            } else {
                // Include id for update
                await companyService.updateDetails({
                    id: companyData.id,
                    ...payload,
                });
                toast.success("Company details updated successfully");
            }
        } catch (error) {
            toast.error("Failed to save company details");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview for UI
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to storage
        setLogoUploading(true);
        try {
            const response = await companyService.uploadLogo(file);
            if (response.success) {
                const uploadedUrl = response.data.url;
                setLogoUrl(uploadedUrl);
                // Update both preview and companyData with the actual URL
                setLogoPreview(uploadedUrl);
                setCompanyData(prev => ({ ...prev, logoUrl: uploadedUrl }));
                toast.success("Logo uploaded successfully");
            }
        } catch (error) {
            toast.error("Logo upload failed");
        } finally {
            setLogoUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const addSocialLink = () => {
        setShowNewSocialForm(true);
        setNewSocialLink({ type: "", iconUrl: "", pageUrl: "" });
        setNewIconPreview(null);
        setNewSocialErrors({ type: "", iconUrl: "", pageUrl: "" });
    };

    const validateNewSocialLink = () => {
        const errors = {
            type: "",
            iconUrl: "",
            pageUrl: "",
        };
        let isValid = true;

        if (!newSocialLink.type) {
            errors.type = "Platform is required";
            isValid = false;
        }

        if (!newSocialLink.iconUrl) {
            errors.iconUrl = "Icon is required";
            isValid = false;
        }

        if (!newSocialLink.pageUrl) {
            errors.pageUrl = "Page URL is required";
            isValid = false;
        } else if (!/^https?:\/\/.+/.test(newSocialLink.pageUrl)) {
            errors.pageUrl = "Please enter a valid URL starting with http:// or https://";
            isValid = false;
        }

        setNewSocialErrors(errors);
        return isValid;
    };

    const saveNewSocialLink = async () => {
        console.log("[Social Media] Saving new link:", newSocialLink);
        
        // Frontend validation
        if (!validateNewSocialLink()) {
            return;
        }
        
        // Check if type is already used
        const isTypeAlreadyUsed = socialLinks.some(link => link.type.toLowerCase() === newSocialLink.type.toLowerCase());
        if (isTypeAlreadyUsed) {
            toast.error(`A "${newSocialLink.type}" profile already exists. Please use a different name.`);
            return;
        }
        
        setAddingSocial(true);
        try {
            const response = await companySocialMediaService.create(newSocialLink);
            console.log("[Social Media] Create response:", response);
            
            // Check for success - handle different response structures
            const isSuccess = response?.success === true || response?.data || response?.id;
            
            if (isSuccess) {
                toast.success("Social link added successfully");
                // Refresh social media list from server
                await fetchSocialMedia();
                // Close form and reset
                setShowNewSocialForm(false);
                setNewSocialLink({ type: "", iconUrl: "", pageUrl: "" });
                setNewIconPreview(null);
                setNewSocialErrors({ type: "", iconUrl: "", pageUrl: "" });
            } else {
                toast.error("Failed to add social link - unexpected response");
            }
        } catch (error: any) {
            console.error("[Social Media] Error creating:", error);
            console.error("[Social Media] Error response:", error.response);
            
            // Handle specific error cases
            if (error.response?.status === 409) {
                toast.error("This social media platform is already added. Each platform can only be added once.");
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to add social link");
            }
        } finally {
            setAddingSocial(false);
        }
    };

    const cancelNewSocialLink = () => {
        setShowNewSocialForm(false);
        setNewSocialLink({ type: "", iconUrl: "", pageUrl: "" });
        setNewIconPreview(null);
        setNewSocialErrors({ type: "", iconUrl: "", pageUrl: "" });
    };

    const handleNewIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewIconPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        setUploadingNewIcon(true);
        try {
            const response = await companySocialMediaService.uploadIcon(file);
            if (response.success) {
                setNewSocialLink(prev => ({ ...prev, iconUrl: response.data.url }));
                toast.success("Icon uploaded");
            }
        } catch (error) {
            toast.error("Icon upload failed");
        } finally {
            setUploadingNewIcon(false);
        }
    };



    const updateSocialLink = (id: number, field: "type" | "pageUrl", value: string) => {
        const updatedLinks = socialLinks.map(link =>
            link.id === id ? { ...link, [field]: value } : link
        );
        setSocialLinks(updatedLinks);
    };

    const saveSocialLinkUpdate = async (id: number) => {
        const link = socialLinks.find(l => l.id === id);
        if (!link || !link.id) return;

        setSavingSocialId(id);
        try {
            // Send all fields: type, iconUrl, and pageUrl
            const payload = {
                type: link.type,
                iconUrl: link.iconUrl,
                pageUrl: link.pageUrl,
            };
            console.log("[Social Media] Updating link:", id, payload);
            const response = await companySocialMediaService.update(link.id, payload);
            console.log("[Social Media] Update response:", response);
            toast.success("Social link updated successfully");
        } catch (error: any) {
            console.error("[Social Media] Error updating:", error);
            console.error("[Social Media] Error response:", error.response);
            toast.error("Failed to update social link");
        } finally {
            setSavingSocialId(null);
        }
    };

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingIconForId(id);
        try {
            // Step 1: Upload icon to storage
            const uploadResponse = await companySocialMediaService.uploadIcon(file);
            if (!uploadResponse.success) {
                toast.error("Icon upload failed");
                return;
            }
            
            const iconUrl = uploadResponse.data.url;
            
            // Step 2: Get current link data
            const currentLink = socialLinks.find(l => l.id === id);
            if (!currentLink || !currentLink.id) {
                toast.error("Social link not found");
                return;
            }
            
            // Step 3: Update local state with new icon URL
            const updatedLinks = socialLinks.map(link =>
                link.id === id ? { ...link, iconUrl } : link
            );
            setSocialLinks(updatedLinks);
            
            // Step 4: Update on server via PUT API with all fields
            const payload = {
                type: currentLink.type,
                iconUrl: iconUrl,
                pageUrl: currentLink.pageUrl,
            };
            
            const updateResponse = await companySocialMediaService.update(currentLink.id, payload);
            if (updateResponse.success) {
                toast.success("Icon uploaded and saved successfully");
            } else {
                toast.error("Icon uploaded but failed to save changes");
            }
        } catch (error) {
            console.error("[Social Media] Icon upload error:", error);
            toast.error("Icon upload failed");
        } finally {
            setUploadingIconForId(null);
        }
    };

    const triggerIconInput = (id: number) => {
        setUploadingIconForId(id);
        iconInputRef.current?.click();
    };

    return (
        <div className="min-h-screen bg-muted/40 pb-20">
            <div className="p-4 pt-2 max-w-7xl mx-auto space-y-4 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <AdminPageHeader
                        heading="Settings"
                        description="Manage your platform settings and preferences."
                        className="pb-0 border-none"
                    />
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-64 shrink-0 space-y-1 sticky top-6">
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                                        activeTab === tab.id 
                                            ? "bg-primary/10 text-primary" 
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className={cn(
                                            "p-1.5 rounded-lg transition-colors",
                                            activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-transparent group-hover:bg-muted-foreground/10"
                                        )}>
                                            {tab.icon}
                                        </div>
                                        {tab.label}
                                    </div>
                                    {activeTab === tab.id && (
                                        <ChevronRight className="w-4 h-4 opacity-50 relative z-10" />
                                    )}
                                    {activeTab === tab.id && (
                                        <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-full my-3 ml-1" />
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 space-y-6 w-full">
                        <div className="space-y-6">
                             {/* Tab Content Render */}
                             <div className="animate-in slide-in-from-right-4 duration-500">
                                {activeTab === "general" && (
                                    <div className="space-y-6">
                                        <Card className="border-border/60 shadow-sm overflow-hidden">
                                            <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b" />
                                            <CardHeader className="-mt-16 relative z-10">
                                                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                                                    <div className="relative group">
                                                        <div className="w-32 h-32 rounded-2xl border-4 border-background bg-muted flex items-center justify-center overflow-hidden shadow-xl relative">
                                                            {logoPreview ? (
                                                                <img src={logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Camera className="w-10 h-10 text-muted-foreground/50 group-hover:text-primary transition-colors duration-300" />
                                                            )}
                                                            {/* Logo Upload Loader Overlay */}
                                                            {logoUploading && (
                                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                                                                    <div className="flex flex-col items-center gap-2">
                                                                        <Loader size="lg" className="text-white" />
                                                                        <span className="text-white text-xs font-medium">Uploading...</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button 
                                                            onClick={triggerFileInput}
                                                            disabled={logoUploading}
                                                            className="absolute bottom-2 right-2 p-2 rounded-lg bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {logoUploading ? <Loader size="sm" className="text-white" /> : <Upload className="w-4 h-4" />}
                                                        </button>
                                                        <input 
                                                            type="file" 
                                                            ref={fileInputRef} 
                                                            className="hidden" 
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                            disabled={logoUploading}
                                                        />
                                                    </div>
                                                    <div className="text-center sm:text-left pb-2 space-y-1">
                                                        <CardTitle className="text-2xl">Brand Assets</CardTitle>
                                                        <CardDescription>Upload your logo and update site details.</CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-8 pt-6">
                                                <div className="grid gap-6">
                                                    <div className="grid gap-2">
                                                        <Label className="text-base">Company Name</Label>
                                                        <Input
                                                            value={companyData.companyName}
                                                            onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                                                            placeholder="Enter company name"
                                                            className="max-w-md h-11"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                                                        <div className="grid gap-2">
                                                            <Label>Support Email</Label>
                                                            <div className="relative">
                                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                                <Input
                                                                    value={companyData.contactEmail}
                                                                    onChange={(e) => setCompanyData({ ...companyData, contactEmail: e.target.value })}
                                                                    placeholder="Enter support email"
                                                                    className="pl-10 h-11"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <Label>Contact Phone</Label>
                                                            <div className="relative">
                                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                                <Input
                                                                    value={companyData.contactPhone}
                                                                    onChange={(e) => setCompanyData({ ...companyData, contactPhone: e.target.value })}
                                                                    placeholder="Enter contact phone"
                                                                    className="pl-10 h-11"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label>Physical Address</Label>
                                                        <div className="relative max-w-2xl">
                                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Textarea
                                                                value={companyData.address}
                                                                onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                                                                placeholder="Enter physical address"
                                                                className="pl-10 min-h-[100px] resize-none pt-2.5"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <div className="px-6 pb-6">
                                                <Button onClick={handleSave} disabled={loading} className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                                                    <ButtonLoader loading={loading}>
                                                        <Save className="h-4 w-4" />
                                                        Save Changes
                                                    </ButtonLoader>
                                                </Button>
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {activeTab === "social" && (
                                    <div className="space-y-6">
                                        <Card className="border-border/60 shadow-sm">
                                             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <div className="space-y-1">
                                                    <CardTitle>Social Profiles</CardTitle>
                                                    <CardDescription>These links will be displayed in your site footer.</CardDescription>
                                                </div>
                                                <Button onClick={addSocialLink} variant="outline" size="sm" className="gap-2" disabled={socialLoading || addingSocial}>
                                                    {addingSocial ? <Loader size="sm" /> : <Plus className="h-4 w-4" />}
                                                    Add Profile
                                                </Button>
                                            </CardHeader>
                                            <CardContent className="space-y-6 pt-6">
                                                <input
                                                    type="file"
                                                    ref={iconInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => uploadingIconForId && handleIconUpload(e, uploadingIconForId)}
                                                />
                                                <input
                                                    type="file"
                                                    ref={newIconInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleNewIconUpload}
                                                />

                                                {/* New Social Link Form */}
                                                {showNewSocialForm && (
                                                    <div className="p-4 rounded-xl border-2 border-primary/20 bg-primary/5">
                                                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                                                            {/* Icon Upload */}
                                                            <div className="shrink-0 space-y-1">
                                                                <button
                                                                    onClick={() => newIconInputRef.current?.click()}
                                                                    disabled={uploadingNewIcon}
                                                                    className={`w-14 h-14 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-background transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed ${
                                                                        newSocialErrors.iconUrl ? 'border-destructive hover:border-destructive' : 'border-primary/30 hover:border-primary'
                                                                    }`}
                                                                >
                                                                    {newIconPreview || newSocialLink.iconUrl ? (
                                                                        <img
                                                                            src={newIconPreview || newSocialLink.iconUrl}
                                                                            alt="Icon"
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <Camera className="w-6 h-6 text-muted-foreground" />
                                                                    )}
                                                                    {/* New Icon Upload Loader */}
                                                                    {uploadingNewIcon && (
                                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                                            <Loader size="sm" className="text-white" />
                                                                        </div>
                                                                    )}
                                                                </button>
                                                                {newSocialErrors.iconUrl && (
                                                                    <p className="text-xs text-destructive">{newSocialErrors.iconUrl}</p>
                                                                )}
                                                            </div>
                                                            <div className="grid gap-2 flex-1 w-full">
                                                                <div className="space-y-1">
                                                                    <Input
                                                                        placeholder="Platform name (e.g., Facebook, MyWebsite)"
                                                                        value={newSocialLink.type}
                                                                        onChange={(e) => {
                                                                            setNewSocialLink(prev => ({ ...prev, type: e.target.value }));
                                                                            if (newSocialErrors.type) {
                                                                                setNewSocialErrors(prev => ({ ...prev, type: "" }));
                                                                            }
                                                                        }}
                                                                        className={`h-11 ${newSocialErrors.type ? 'border-destructive focus:border-destructive' : ''}`}
                                                                    />
                                                                    {newSocialErrors.type && (
                                                                        <p className="text-xs text-destructive">{newSocialErrors.type}</p>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Input
                                                                        placeholder="Page URL (e.g., https://facebook.com/mytourism)"
                                                                        value={newSocialLink.pageUrl}
                                                                        onChange={(e) => {
                                                                            setNewSocialLink(prev => ({ ...prev, pageUrl: e.target.value }));
                                                                            if (newSocialErrors.pageUrl) {
                                                                                setNewSocialErrors(prev => ({ ...prev, pageUrl: "" }));
                                                                            }
                                                                        }}
                                                                        className={`h-11 ${newSocialErrors.pageUrl ? 'border-destructive focus:border-destructive' : ''}`}
                                                                    />
                                                                    {newSocialErrors.pageUrl && (
                                                                        <p className="text-xs text-destructive">{newSocialErrors.pageUrl}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 mt-4 justify-end">
                                                            <Button variant="outline" size="sm" onClick={cancelNewSocialLink} disabled={addingSocial}>
                                                                Cancel
                                                            </Button>
                                                            <Button size="sm" onClick={saveNewSocialLink} disabled={addingSocial}>
                                                                <ButtonLoader loading={addingSocial}>
                                                                    Save
                                                                </ButtonLoader>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="grid gap-4">
                                                    {socialLinks.map((link) => (
                                                        <div key={link.id} className="group flex flex-col sm:flex-row gap-4 items-start p-4 rounded-xl border border-muted hover:border-primary/20 hover:bg-muted/30 transition-all duration-300">
                                                            {/* Icon Upload */}
                                                            <div className="shrink-0">
                                                                <button
                                                                    onClick={() => link.id && triggerIconInput(link.id)}
                                                                    disabled={uploadingIconForId === link.id}
                                                                    className="w-12 h-12 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex items-center justify-center overflow-hidden bg-background/50 transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {link.iconUrl ? (
                                                                        <img src={link.iconUrl} alt={link.type} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <Camera className="w-5 h-5 text-muted-foreground" />
                                                                    )}
                                                                    {/* Icon Upload Loader Overlay */}
                                                                    {uploadingIconForId === link.id && (
                                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                                            <Loader size="sm" className="text-white" />
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <div className="grid gap-4 flex-1 sm:grid-cols-2 w-full">
                                                                <Input
                                                                    placeholder="Platform name"
                                                                    value={link.type || ""}
                                                                    onChange={(e) => link.id && updateSocialLink(link.id, "type", e.target.value)}
                                                                    className="h-11 bg-background/50"
                                                                />
                                                                <Input
                                                                    placeholder="Profile URL"
                                                                    value={link.pageUrl}
                                                                    onChange={(e) => link.id && updateSocialLink(link.id, "pageUrl", e.target.value)}
                                                                    className="h-11 bg-background/50"
                                                                />
                                                            </div>
                                                            <div className="flex self-end sm:self-center">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => link.id && saveSocialLinkUpdate(link.id)}
                                                                    disabled={savingSocialId === link.id}
                                                                    className="gap-1"
                                                                >
                                                                    {savingSocialId === link.id ? (
                                                                        <Loader size="sm" />
                                                                    ) : (
                                                                        <>
                                                                            <Save className="h-3 w-3" />
                                                                            Update
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {socialLinks.length === 0 && (
                                                        <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                                            <Globe className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                                            <h3 className="text-lg font-medium text-foreground">No social profiles added</h3>
                                                            <p className="text-muted-foreground text-sm mt-1 mb-4">Add your social media links to connect with your audience.</p>
                                                            <Button onClick={addSocialLink} variant="outline" className="mx-auto">
                                                                Add First Profile
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
