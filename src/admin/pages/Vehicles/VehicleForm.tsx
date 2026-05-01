import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Trash2, Plus, Image as ImageIcon,
  Save, Eye, Upload, X, ArrowLeft,
  Check, Car, Users, Package, Settings, Info
} from 'lucide-react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useVehicle, useVehicleMutations } from '@/hooks/useAdminData';
import { storageService } from '@/admin/services/storageService';
import { toast } from 'sonner';
import { Loader, ButtonLoader } from '@/admin/components/ui/Loader';
import { cn } from '@/lib/utils';

// Image Upload Component
const ImageUploadGrid = ({ value = [], onChange }: { value: string[]; onChange: (val: string[]) => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const urls = await storageService.uploadMultipleAssets(files);
      onChange([...value, ...urls]);
      toast.success("Images uploaded successfully");
    } catch (error: any) {
      toast.error(error?.message || "Upload failed");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {value.map((url, idx) => (
        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-border group">
          <img src={url} alt={`Vehicle ${idx + 1}`} className="w-full h-full object-cover" />
          <button 
            type="button"
            onClick={() => removeImage(idx)}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      
      <label className={cn(
        "aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-all",
        isUploading && "opacity-50 pointer-events-none"
      )}>
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        {isUploading ? (
          <Loader size="sm" />
        ) : (
          <>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Upload Image</span>
          </>
        )}
      </label>
    </div>
  );
};

// Features Input Component
const FeaturesInput = ({ value = [], onChange }: { value: string[]; onChange: (val: string[]) => void }) => {
  const [inputValue, setInputValue] = useState('');

  const addFeature = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  };

  const removeFeature = (feature: string) => {
    onChange(value.filter(f => f !== feature));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addFeature();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input 
          placeholder="e.g. A/C, WiFi, Leather Seats" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button type="button" onClick={addFeature} variant="secondary">Add</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {value.map((feature, idx) => (
          <Badge key={idx} variant="secondary" className="gap-1 px-3 py-1 bg-primary/10 text-primary border-none">
            {feature}
            <button type="button" onClick={() => removeFeature(feature)} className="hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {value.length === 0 && <span className="text-xs text-muted-foreground italic">No features added yet.</span>}
      </div>
    </div>
  );
};

export default function VehicleForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id && id !== 'new');
  
  const { data: vehicle, isLoading: loading } = useVehicle(id);
  const { createMutation, updateMutation } = useVehicleMutations();
  const saving = createMutation.isPending || updateMutation.isPending;

  const form = useForm({
    defaultValues: {
      name: '',
      type: '',
      model: '',
      passengers: 1,
      price: 0,
      description: '',
      features: [] as string[],
      images: [] as string[],
    }
  });

  useEffect(() => {
    if (vehicle?.data && isEditMode) {
      const v = vehicle.data;
      form.reset({
        name: v.name || '',
        type: v.type || '',
        model: v.model || '',
        passengers: v.passengers || 1,
        price: v.price || 0,
        description: v.description || '',
        features: v.features || [],
        images: v.images || [],
      });
    }
  }, [vehicle, isEditMode, form]);

  const onSubmit = async (data: any) => {
    // Sanitize data before submission
    const sanitizedData = {
      ...data,
      name: data.name?.trim(),
      type: data.type?.trim(),
      model: data.model?.trim(),
      description: data.description?.trim(),
      passengers: parseInt(data.passengers.toString(), 10),
      price: data.price ? parseFloat(data.price.toString()) : undefined,
    };
    
    // Explicitly remove status if it exists in data
    delete (sanitizedData as any).status;

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: id!, data: sanitizedData });
      } else {
        await createMutation.mutateAsync(sanitizedData);
      }
      navigate('/dashboard/vehicles');
    } catch (error) {
      // Error handled by mutation toast
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-center">
        <Loader size="lg" className="text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Loading vehicle details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/dashboard/vehicles')}
            className="rounded-full h-10 w-10 border"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {isEditMode ? 'Edit Vehicle' : 'New Vehicle'}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode ? `Updating ${vehicle?.data?.name}` : 'Configure a new vehicle for your fleet.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/dashboard/vehicles')} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            className="bg-[#fbb03b] hover:bg-[#d98d1a] text-white min-w-[140px] shadow-lg shadow-orange-500/20"
            disabled={saving}
          >
            <ButtonLoader loading={saving}>
              <Save className="h-4 w-4 mr-2" />
              {isEditMode ? 'Update Vehicle' : 'Create Vehicle'}
            </ButtonLoader>
          </Button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Vehicle Name *</Label>
                  <Controller
                    name="name"
                    control={form.control}
                    rules={{ 
                      required: 'Name is required',
                      validate: value => value.trim() !== '' || 'Name cannot be only whitespace'
                    }}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <Input {...field} placeholder="e.g. Toyota Commuter High" className={cn(fieldState.error && "border-destructive")} />
                        {fieldState.error && <p className="text-[10px] text-destructive font-medium">{fieldState.error.message}</p>}
                      </div>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Vehicle Type *</Label>
                  <Controller
                    name="type"
                    control={form.control}
                    rules={{ 
                      required: 'Type is required',
                      validate: value => value.trim() !== '' || 'Type cannot be only whitespace'
                    }}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <Input {...field} placeholder="e.g. Van, Car, Mini-Bus" className={cn(fieldState.error && "border-destructive")} />
                        {fieldState.error && <p className="text-[10px] text-destructive font-medium">{fieldState.error.message}</p>}
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="model">Model / Version *</Label>
                  <Controller
                    name="model"
                    control={form.control}
                    rules={{ 
                      required: 'Model is required',
                      validate: value => value.trim() !== '' || 'Model cannot be only whitespace'
                    }}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <Input {...field} placeholder="e.g. KDH-2015" className={cn(fieldState.error && "border-destructive")} />
                        {fieldState.error && <p className="text-[10px] text-destructive font-medium">{fieldState.error.message}</p>}
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field }) => (
                    <Textarea 
                      {...field} 
                      placeholder="Describe the vehicle's condition, features, and suitability for different tours." 
                      className="min-h-[120px] resize-none"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Features & Amenities</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Controller
                name="features"
                control={form.control}
                render={({ field }) => (
                  <FeaturesInput value={field.value} onChange={field.onChange} />
                )}
              />
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ImageIcon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Vehicle Images</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Controller
                name="images"
                control={form.control}
                render={({ field }) => (
                  <ImageUploadGrid value={field.value} onChange={field.onChange} />
                )}
              />
              <p className="mt-4 text-xs text-muted-foreground italic">
                Upload clear photos of the vehicle exterior and interior. These will be shown to customers during booking.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Capacity & Pricing */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm overflow-hidden bg-primary/5 border border-primary/10 sticky top-20">
            <CardHeader className="bg-primary/10 border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Capacity & Pricing</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="passengers" className="font-bold">Passenger Capacity *</Label>
                </div>
                <Controller
                  name="passengers"
                  control={form.control}
                  rules={{ required: 'Capacity is required', min: { value: 1, message: 'Minimum 1 person' } }}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1">
                      <div className="relative">
                        <Input 
                          {...field} 
                          type="number" 
                          className={cn("pl-4 h-12 text-lg font-bold", fieldState.error && "border-destructive")} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          Seats
                        </div>
                      </div>
                      {fieldState.error && <p className="text-[10px] text-destructive font-medium">{fieldState.error.message}</p>}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="price" className="font-bold">Daily Rate (USD)</Label>
                </div>
                <Controller
                  name="price"
                  control={form.control}
                  rules={{ min: { value: 0, message: 'Price cannot be negative' } }}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1">
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-primary">
                          $
                        </div>
                        <Input 
                          {...field} 
                          type="number" 
                          className={cn("pl-10 h-12 text-xl font-extrabold text-primary", fieldState.error && "border-destructive")} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          / Day
                        </div>
                      </div>
                      {fieldState.error && <p className="text-[10px] text-destructive font-medium">{fieldState.error.message}</p>}
                    </div>
                  )}
                />
              </div>

              <Separator className="bg-primary/10" />

              <div className="bg-white/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <Info className="h-3 w-3" />
                  Quick Summary
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-bold">{form.watch('type') || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capacity:</span>
                    <span className="font-bold">{form.watch('passengers')} People</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      {/* Action Bar (Sticky Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-50 flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => navigate('/dashboard/vehicles')} disabled={saving}>
          Cancel
        </Button>
        <Button 
          className="flex-1 bg-[#fbb03b] hover:bg-[#d98d1a] text-white shadow-lg"
          onClick={form.handleSubmit(onSubmit)}
          disabled={saving}
        >
          <ButtonLoader loading={saving}>
            <Save className="h-4 w-4 mr-2" />
            {isEditMode ? 'Update' : 'Create'}
          </ButtonLoader>
        </Button>
      </div>
    </div>
  );
}
