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
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Trash2, Plus, Image, GripVertical,
  Save, Eye, Upload, X, ArrowLeft, ChevronDown,
  Search, Check
} from 'lucide-react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { TiptapEditor } from '@/admin/components/ui/TiptapEditor';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTourById, useTourMutations } from '@/hooks/useAdminData';
import { uploadImage } from '@/api/services/storage';
import { toast } from 'sonner';
import type { CreateTourPackagePayload } from '@/admin/services/tourService';
import { Loader, ButtonLoader } from '@/admin/components/ui/Loader';

// Image Upload Component
const ImageUpload = ({ value, onChange, label, className = '' }: { value: string; onChange: (val: string) => void; label?: string; className?: string }) => {
  const [preview, setPreview] = useState(value || '');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  // Sync internal preview when external value changes (e.g. when editing an existing tour)
  useEffect(() => {
    setPreview(value || '');
  }, [value]);

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await processFile(file);
    }
  };

  const processFile = async (file) => {
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setPreview(url);
      onChange?.(url);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Image upload failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label className="text-sm font-semibold text-foreground">{label}</Label>}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !preview && !isUploading && fileInputRef.current?.click()}
        className={`relative group rounded-lg overflow-hidden transition-all duration-300 cursor-pointer ${preview
          ? 'border-0'
          : `border-2 border-dashed p-6 ${isDragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40'
          }`
          }`}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 rounded-lg flex items-center justify-center">
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="p-2.5 bg-white text-foreground rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPreview(''); onChange?.(''); }}
                  className="p-2.5 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors shadow-lg"
                  disabled={isUploading}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
              {isUploading ? (
                <Loader size="lg" />
              ) : (
                <Image className="w-6 h-6 text-primary" />
              )}
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {isUploading ? 'Uploading image...' : isDragging ? 'Drop your image here' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 10MB)</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
        />
      </div>
    </div>
  );
};

// Import necessary services
import { tourService } from '@/admin/services/tourService';

// Tags Input Component
const TagsInput = ({ value = [], onChange }) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-background min-h-[46px]">
        {value.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="gap-1 pl-2 pr-1 py-1 bg-primary/10 text-primary hover:bg-primary/20"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:bg-primary/30 rounded-sm p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => inputValue && addTag(inputValue)}
          placeholder={value.length === 0 ? "Type and press Enter to add tags..." : ""}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
        />
      </div>
      <p className="text-xs text-muted-foreground">Press Enter or comma to add tags</p>
    </div>
  );
};

// Multi-Select Component for IDs
const MultiSelectInput = ({ value = [], onChange, label, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const addId = (id) => {
    const parsedId = parseInt(id, 10);
    if (!isNaN(parsedId) && !value.includes(parsedId)) {
      onChange([...value, parsedId]);
      setInputValue('');
    }
  };

  const removeId = (idToRemove) => {
    onChange(value.filter(id => id !== idToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addId(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeId(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-background min-h-[46px]">
        {value.map((id, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="gap-1 pl-2 pr-1 py-1 bg-primary/10 text-primary hover:bg-primary/20"
          >
            {id}
            <button
              type="button"
              onClick={() => removeId(id)}
              className="ml-1 hover:bg-primary/30 rounded-sm p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => inputValue && addId(inputValue)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
        />
      </div>
      <p className="text-xs text-muted-foreground">Press Enter or comma to add IDs</p>
    </div>
  );
};

// Modal Component for Entity Selection with Search and Scrollable Grid
const EntityModalSelector = ({ value = [], onChange, label, placeholder, entities, entityName, isOpen, onOpenChange, loading, onLoadMore, hasMore = false, loadingMore = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter entities (client-side filter over all loaded entities)
  const filteredEntities = Array.isArray(entities) ? entities.filter(entity =>
    entity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.specificName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(entity.id).includes(searchTerm)
  ) : [];

  const toggleEntity = (entityId) => {
    if (value.includes(entityId)) {
      onChange(value.filter(id => id !== entityId));
    } else {
      onChange([...value, entityId]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="outline" 
          className="w-full justify-between h-12 px-3 bg-background border-input hover:bg-accent hover:text-accent-foreground"
        >
          <span className="text-left truncate mr-2">
            {value.length > 0 
              ? `${value.length} ${entityName} selected` 
              : <span className="text-muted-foreground">{placeholder}</span>
            }
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-border/10">
          <DialogTitle className="text-xl font-semibold tracking-tight">Select {label}</DialogTitle>
        </DialogHeader>
        
        {/* Search Bar */}
        <div className="p-4 border-b border-border/10 bg-muted/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/70 w-4 h-4" />
            <Input
              placeholder={`Search ${entityName}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-background/50 border-input/50 focus:bg-background transition-all"
            />
          </div>
          
          {/* Selected Items Preview */}
          {value.length > 0 && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Selected ({value.length})</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onChange([])}
                  className="h-6 text-xs text-muted-foreground hover:text-destructive px-2"
                >
                  Clear all
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-[80px] overflow-y-auto pr-1">
                {value.map((id) => {
                  const entity = Array.isArray(entities) ? entities.find(e => e.id === id) : undefined;
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="gap-1 pl-2 pr-1 py-1 bg-primary/10 text-primary hover:bg-primary/15 border-transparent transition-colors"
                    >
                      <span className="max-w-[150px] truncate">
                        {entity ? entity.title || entity.name || id : id}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleEntity(id)}
                        className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* Entities Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/5">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <Loader size="lg" className="text-primary mb-4" />
              <p className="text-muted-foreground font-medium">Loading {entityName}...</p>
            </div>
          ) : filteredEntities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEntities.map((entity) => {
                const isSelected = value.includes(entity.id);
                // Try to find an image, fallback to placeholder
                const image = entity.image || entity.heroImage || entity.coverImage;
                
                return (
                  <div
                    key={entity.id}
                    onClick={() => toggleEntity(entity.id)}
                    className={`
                      group relative flex flex-col rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden
                      ${isSelected 
                        ? 'border-primary ring-1 ring-primary shadow-sm bg-primary/5' 
                        : 'border-border/60 bg-card hover:border-primary/50 hover:shadow-md'
                      }
                    `}
                  >
                    {/* Image Area */}
                    <div className="aspect-[16/9] w-full bg-muted relative overflow-hidden">
                      {image ? (
                        <img 
                          src={image} 
                          alt={entity.title || entity.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground/30">
                          <Image className="w-8 h-8" />
                        </div>
                      )}
                      
                      {/* Selection Overlay */}
                      <div className={`
                        absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200
                        ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                      `}>
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center transform transition-transform duration-200
                          ${isSelected 
                            ? 'bg-primary text-primary-foreground scale-100' 
                            : 'bg-white/20 backdrop-blur-sm text-white scale-90 hover:scale-100'
                          }
                        `}>
                          {isSelected ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-3">
                      <h4 className="font-semibold text-sm leading-tight text-foreground line-clamp-1 mb-1" title={entity.title || entity.name}>
                        {entity.title || entity.name || entity.specificName || entity.id}
                      </h4>
                      
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {entity.location && (
                          <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-sm">
                            📍 <span className="truncate max-w-[80px]">{entity.location}</span>
                          </span>
                        )}
                        {entity.duration && (
                          <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-sm">
                            ⏱️ {entity.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="font-medium text-foreground mb-1">No results found</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {searchTerm 
                  ? `No ${entityName} found matching "${searchTerm}"`
                  : `No ${entityName} available to select`
                }
              </p>
            </div>
          )}

          {/* Load more pagination */}
          {!loading && hasMore && (
            <div className="flex justify-center pt-4 pb-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onLoadMore?.()}
                disabled={loadingMore}
                className="gap-2"
              >
                {loadingMore ? (
                  <>
                    <Loader className="w-4 h-4" />
                    Loading...
                  </>
                ) : (
                  'Load more'
                )}
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center p-4 border-t border-border/10 bg-background/50 backdrop-blur-sm">
          <span className="text-sm text-muted-foreground">
            {value.length} selected
          </span>
          <Button onClick={() => onOpenChange(false)} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Dropdown Component for Destinations and Things to Do




export default function TourForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = Boolean(id && id !== 'new');

  const [activeSection, setActiveSection] = useState('basic');

  // State for destinations and things to do data (paginated: we load page 1 then "Load more")
  const [destinations, setDestinations] = useState([]);
  const [thingsToDo, setThingsToDo] = useState([]);
  const [loadingEntities, setLoadingEntities] = useState({ destinations: false, thingsToDo: false });
  const [loadingMoreEntities, setLoadingMoreEntities] = useState({ destinations: false, thingsToDo: false });
  const [destinationsPage, setDestinationsPage] = useState(1);
  const [thingsToDoPage, setThingsToDoPage] = useState(1);
  const [destinationsHasMore, setDestinationsHasMore] = useState(true);
  const [thingsToDoHasMore, setThingsToDoHasMore] = useState(true);
  const PAGE_SIZE = 6;

  // Modal states: which day's selector is open (null = closed). Ensures each day has its own Destinations/Things To Do.
  const [destinationsModalDayIndex, setDestinationsModalDayIndex] = useState<number | null>(null);
  const [thingsToDoModalDayIndex, setThingsToDoModalDayIndex] = useState<number | null>(null);
  
  // Scroll state
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Track scroll for sticky bottom bar visibility (same threshold as BlogPostForm)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    handleScroll(); // run once on mount
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper to parse list API response (items + optional totalPages)
  const parseListResponse = (data: any) => {
    let items: any[] = [];
    let totalPages: number | undefined;
    if (Array.isArray(data)) {
      items = data;
    } else if (data && typeof data === 'object') {
      const inner = data.data && typeof data.data === 'object' ? data.data : data;
      if (Array.isArray(inner.items)) {
        items = inner.items;
        totalPages = inner.totalPages;
      } else if (Array.isArray(inner)) {
        items = inner;
      } else {
        items = inner.data || inner.results || [];
      }
    }
    return { items, totalPages };
  };

  // Fetch destinations (page 1 replaces list; page > 1 appends)
  const fetchDestinations = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoadingEntities(prev => ({ ...prev, destinations: true }));
      } else {
        setLoadingMoreEntities(prev => ({ ...prev, destinations: true }));
      }
      const destData = await tourService.getDestinationsList(page);
      const { items: destItems, totalPages } = parseListResponse(destData);
      if (append) {
        setDestinations(prev => [...prev, ...destItems]);
      } else {
        setDestinations(destItems);
      }
      setDestinationsHasMore(totalPages != null ? page < totalPages : destItems.length >= PAGE_SIZE);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load destinations";
      toast.error(errorMessage);
      setDestinationsHasMore(false);
    } finally {
      setLoadingEntities(prev => ({ ...prev, destinations: false }));
      setLoadingMoreEntities(prev => ({ ...prev, destinations: false }));
    }
  };

  // Fetch things to do (page 1 replaces list; page > 1 appends)
  const fetchThingsToDo = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoadingEntities(prev => ({ ...prev, thingsToDo: true }));
      } else {
        setLoadingMoreEntities(prev => ({ ...prev, thingsToDo: true }));
      }
      const thingsData = await tourService.getThingsToDoList(page);
      const { items: thingsItems, totalPages } = parseListResponse(thingsData);
      if (append) {
        setThingsToDo(prev => [...prev, ...thingsItems]);
      } else {
        setThingsToDo(thingsItems);
      }
      setThingsToDoHasMore(totalPages != null ? page < totalPages : thingsItems.length >= PAGE_SIZE);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load things to do";
      toast.error(errorMessage);
      setThingsToDoHasMore(false);
    } finally {
      setLoadingEntities(prev => ({ ...prev, thingsToDo: false }));
      setLoadingMoreEntities(prev => ({ ...prev, thingsToDo: false }));
    }
  };

  const loadMoreDestinations = async () => {
    const nextPage = destinationsPage + 1;
    await fetchDestinations(nextPage, true);
    setDestinationsPage(nextPage);
  };

  const loadMoreThingsToDo = async () => {
    const nextPage = thingsToDoPage + 1;
    await fetchThingsToDo(nextPage, true);
    setThingsToDoPage(nextPage);
  };

  // Per-day modal handlers: open sets which day's selector is active so selections apply to that day only
  const handleDestinationsModalChangeForDay = (dayIndex: number) => async (open: boolean) => {
    if (open) {
      setDestinationsModalDayIndex(dayIndex);
      setDestinationsPage(1);
      await fetchDestinations(1, false);
    } else {
      setDestinationsModalDayIndex(null);
    }
  };

  const handleThingsToDoModalChangeForDay = (dayIndex: number) => async (open: boolean) => {
    if (open) {
      setThingsToDoModalDayIndex(dayIndex);
      setThingsToDoPage(1);
      await fetchThingsToDo(1, false);
    } else {
      setThingsToDoModalDayIndex(null);
    }
  };



  // Use draft API only when status=draft; use published API only when status=published (avoids 404 when editing draft in hosted)
  const statusParam = searchParams.get('status');
  const isPublished = statusParam === 'published';
  
  const { data: tour, isLoading: loading, error: tourError } = useTourById(id, isPublished);
  const { createMutation, updateMutation } = useTourMutations();
  const saving = createMutation.isPending || updateMutation.isPending;

  const form = useForm({
    defaultValues: {
      name: '',
      heroImage: '',
      shortDescription: '',
      description: '',
      price: '',
      packageType: '',
      minPeople: '',
      totalDays: '',
      packageDuration: '',
      tourRefNumber: '',
      extraDetails: '',
      includes: [],
      excludes: [],
      tags: [],
      days: []
    },
    mode: 'onBlur'
  });

  // Register heroImage with validation rules (required; optional URL format)
  const heroUrlPattern = /^https?:\/\/.+/i;
  useEffect(() => {
    form.register('heroImage', {
      required: 'Hero image is required',
      validate: (v) => !v || heroUrlPattern.test(v) ? true : 'Hero image should be a valid URL'
    });
  }, [form]);

  const { fields: includesFields, append: appendInclude, remove: removeInclude } = useFieldArray({
    control: form.control,
    name: 'includes'
  });

  const { fields: excludesFields, append: appendExclude, remove: removeExclude } = useFieldArray({
    control: form.control,
    name: 'excludes'
  });

  const { fields: daysFields, append: appendDay, remove: removeDay } = useFieldArray({
    control: form.control,
    name: 'days'
  });

  // Reset form when data is loaded
  useEffect(() => {
    if (tour && isEditMode) {
      console.log('Loading tour data:', tour);
      const t = tour as any;
      
      // Map API response to form structure
      // Price can be either a number or an object with amount property
      const priceValue = typeof t.price === 'object' && t.price !== null 
        ? t.price.amount 
        : t.price;
      
      // Normalize days data to ensure destinationIds and thingToDoIds are arrays of numbers
      const normalizedDays = (t.days || []).map((day: any) => ({
        ...day,
        dayNumber: day.dayNumber || day.day || 1,
        location: day.location || '',
        topic: day.topic || '',
        subTopic: day.subTopic || '',
        image: day.image || '',
        description: day.description || '',
        mealPlan: day.mealPlan || '',
        accommodation: day.accommodation || false,
        hotelName: day.hotelName || '',
        hotelLocation: day.hotelLocation || '',
        roomType: day.roomType || '',
        // Ensure destinationIds and thingToDoIds are arrays of numbers
        destinationIds: Array.isArray(day.destinationIds) 
          ? day.destinationIds.map((id: any) => typeof id === 'number' ? id : parseInt(String(id), 10)).filter((id: number) => !isNaN(id))
          : Array.isArray(day.destinations)
            ? day.destinations.map((id: any) => typeof id === 'number' ? id : parseInt(String(id), 10)).filter((id: number) => !isNaN(id))
            : [],
        thingToDoIds: Array.isArray(day.thingToDoIds)
          ? day.thingToDoIds.map((id: any) => typeof id === 'number' ? id : parseInt(String(id), 10)).filter((id: number) => !isNaN(id))
          : Array.isArray(day.thingsToDo)
            ? day.thingsToDo.map((id: any) => typeof id === 'number' ? id : parseInt(String(id), 10)).filter((id: number) => !isNaN(id))
            : []
      }));

      const formData = {
        name: t.name || '',
        heroImage: t.heroImage || '',
        shortDescription: t.shortDescription || '',
        description: t.description || '',
        price: priceValue !== undefined && priceValue !== null ? String(priceValue) : '',
        packageType: t.packageType || '',
        minPeople: t.minPeople ?? '',
        totalDays: t.totalDays ?? '',
        packageDuration: t.packageDuration || '',
        tourRefNumber: t.tourRefNumber || '',
        extraDetails: t.extraDetails || '',
        includes: t.includes || [],
        excludes: t.excludes || [],
        tags: t.tags || [],
        days: normalizedDays
      };
      
      console.log('Form data being set:', formData);
      form.reset(formData);
    }
  }, [tour, isEditMode, form]);

  const sections = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'details', label: 'Tour Details' },
    { id: 'description', label: 'Description' },
    { id: 'inclusions', label: 'Includes/Excludes' },
    { id: 'days', label: 'Daily Itinerary' }
  ];

  // Scroll-based navigation detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      let currentSection = sections[0].id;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop } = element;
          if (scrollPosition >= offsetTop) {
            currentSection = section.id;
          }
        }
      }

      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const addDay = () => {
    appendDay({
      dayNumber: daysFields.length + 1,
      location: '',
      topic: '',
      subTopic: '',
      image: '',
      description: '',
      mealPlan: '',
      accommodation: false,
      hotelName: '',
      hotelLocation: '',
      roomType: '',
      destinationIds: [],
      thingToDoIds: []
    });
  };

  const onSubmit = async (data, status: 'PUBLISHED' | 'DRAFT' = 'PUBLISHED') => {
    console.log('onSubmit called with status:', status, 'data:', data);

    const days = data.days || [];
    if (days.length === 0) {
      toast.error('At least one day is required in the itinerary.');
      return;
    }

    const totalDaysNum = Number(data.totalDays);
    if (totalDaysNum !== days.length) {
      toast.error(`Total days (${totalDaysNum}) must match the number of itinerary days (${days.length}).`);
      return;
    }

    const dayNumbers = days.map((d: any) => Number(d.dayNumber));
    const uniqueDayNumbers = new Set(dayNumbers);
    if (uniqueDayNumbers.size !== dayNumbers.length) {
      toast.error('Day numbers must be unique.');
      return;
    }

    const sorted = [...dayNumbers].sort((a, b) => a - b);
    const expected = Array.from({ length: days.length }, (_, i) => i + 1);
    if (JSON.stringify(sorted) !== JSON.stringify(expected)) {
      toast.error('Day numbers must be sequential (1, 2, 3, ...).');
      return;
    }

    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      if (day.accommodation && !(day.hotelName || '').trim()) {
        toast.error(`Day ${i + 1}: Hotel name is required when accommodation is enabled.`);
        return;
      }
    }

    // Helpers: @IsOptional() means undefined or valid value — never send empty string
    const stripHtml = (html: string) => {
      if (!html) return '';
      return html.replace(/<[^>]*>?/gm, '');
    };
    const optionalStr = (v: any): string | null => {
      if (v == null) return null;
      const s = typeof v === 'string' ? v.trim() : '';
      return s === '' ? null : s;
    };
    const optionalStringArray = (arr: string[] | undefined): string[] => {
      const filtered = Array.isArray(arr)
        ? arr.filter((s) => typeof s === 'string' && s.trim() !== '').map((s) => s.trim())
        : [];
      // For Prisma list fields, clearing means an empty array, not null
      return filtered;
    };

    // Transform data for API with type safety (optional fields: use null to explicitly clear in DB)
    const payload: CreateTourPackagePayload = {
      name: data.name.trim(),
      heroImage: data.heroImage.trim(),
      // Short description: when cleared in UI, send null so backend can set column to NULL
      shortDescription:
        data.shortDescription == null
          ? null
          : data.shortDescription.trim() === ''
            ? null
            : data.shortDescription.trim(),
      description: stripHtml(data.description),
      // price is optional; only include when user provided a value
      minPeople: Math.min(10000, Math.max(1, Number(data.minPeople) || 1)),
      totalDays: days.length,
      packageType: data.packageType,
      packageDuration: data.packageDuration.trim(),
      tourRefNumber: (data.tourRefNumber || '').trim(),
      extraDetails: optionalStr(data.extraDetails),
      includes: optionalStringArray(data.includes),
      excludes: optionalStringArray(data.excludes),
      tags: optionalStringArray(data.tags),
      days: days.map((day: any) => {
        const destinationIds = Array.isArray(day.destinationIds)
          ? day.destinationIds.map((id: any) => Number(id)).filter((n) => !isNaN(n))
          : undefined;
        const thingToDoIds = Array.isArray(day.thingToDoIds)
          ? day.thingToDoIds.map((id: any) => Number(id)).filter((n) => !isNaN(n))
          : undefined;
        return {
          dayNumber: Number(day.dayNumber),
          topic: (day.topic || '').trim(),
          description: stripHtml(day.description),
          location: optionalStr(day.location),
          subTopic: optionalStr(day.subTopic),
          image: optionalStr(day.image),
          mealPlan: optionalStr(day.mealPlan),
          accommodation: Boolean(day.accommodation),
          hotelName: optionalStr(day.hotelName),
          hotelLocation: optionalStr(day.hotelLocation),
          roomType: optionalStr(day.roomType),
          ...(destinationIds && destinationIds.length > 0 ? { destinationIds } : {}),
          ...(thingToDoIds && thingToDoIds.length > 0 ? { thingToDoIds } : {})
        };
      })
    };

    if (data.price !== '' && data.price != null) {
      const priceNumber = Math.min(
        1000000,
        Math.max(0, Math.round(Number(data.price) * 100) / 100)
      );
      payload.price = priceNumber;
    } else {
      // Explicitly send null so backend clears price (matches Postman behaviour)
      payload.price = null;
    }

    console.log('Submitting payload:', payload);

    const handleError = (error: any) => {
      console.error('Mutation failed:', error);

      if (error.isHandled) return;

      let message = 'Failed to save tour package';
      const responseData = error.response?.data;
      const err = responseData?.error;
      const fields = Array.isArray(err?.fields) ? err.fields : [];

      if (responseData) {
        // Backend shape: { message, error: { code, fields: [{ field, message }] } }
        if (fields.length > 0) {
          const messages = fields.map((f: any) => f.message || f).filter(Boolean);
          message = responseData.message && responseData.message !== 'Validation failed'
            ? responseData.message
            : messages.slice(0, 5).join(' • ').concat(messages.length > 5 ? ` (+${messages.length - 5} more)` : '');
          // Set form errors from error.fields (support field + message with path like "days.0.description")
          fields.forEach((f: any) => {
            const msg = f.message || '';
            let path: string | null = null;
            if (f.field && f.field !== 'unknown') {
              const known = ['name', 'tourRefNumber', 'slug', 'heroImage', 'description', 'price', 'packageType', 'minPeople', 'totalDays', 'packageDuration'];
              if (known.includes(f.field)) path = f.field;
            }
            if (!path && typeof msg === 'string') {
              const match = msg.match(/^days\.(\d+)\.(\w+)/);
              if (match) path = `days.${match[1]}.${match[2]}`;
            }
            if (path) form.setError(path as any, { type: 'server', message: msg || 'Invalid' });
          });
        } else if (responseData.message) {
          message = responseData.message;
        } else if (err) {
          message = typeof err === 'string' ? err : (err.message || JSON.stringify(err));
        }
      } else if (error.message) {
        message = error.message;
      }

      toast.error(message);
    };

    if (isEditMode) {
      updateMutation.mutate({ id: Number(id), data: payload }, {
        onSuccess: () => {
          toast.success('Tour package saved successfully.');
        },
        onError: handleError
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Tour package created successfully.');
          navigate('/admin/tours');
        },
        onError: handleError
      });
    }
  };


  if (loading && isEditMode) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader size="lg" />
          <span>Loading tour package...</span>
        </div>
      </div>
    );
  }

  // Show error if failed to load (404 → redirect; use backend shape: message + error.fields)
  if (isEditMode && !loading && !tour && tourError) {
    const err: any = tourError;
    const status = err?.response?.status;
    const data = err?.response?.data;
    const errorObj = data?.error;
    const fields = Array.isArray(errorObj?.fields) ? errorObj.fields : [];
    const backendMessage =
      data?.message ||
      (fields.length > 0
        ? fields.map((f: any) => f.message || f).filter(Boolean).slice(0, 3).join(' • ')
        : null) ||
      err?.message;

    if (status === 404) {
      toast.error(backendMessage || 'Tour package not found.');
      navigate('/admin/tours', { replace: true });
      return null;
    }

    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">Failed to load tour package</p>
          <p className="text-sm text-muted-foreground">
            {backendMessage ||
              (isPublished ? 'Published' : 'Draft') + ' tour package not found. Make sure you\'re accessing it from the correct tab.'}
          </p>
          <Button onClick={() => navigate('/admin/tours')} variant="outline">
            Back to Tours
          </Button>
        </div>
      </div>
    );
  }

  const packageTitle = form.watch('name');

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Main Form */}
        <div className="flex-1 space-y-6 pb-48">
          {/* Page Header with Back Button and Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/admin/tours')}
                className="h-10 w-10 rounded-lg border-border bg-card hover:bg-muted"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {isEditMode ? `Edit ${packageTitle || 'Tour Package'}` : 'Create New Tour Package'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isEditMode ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                  {isEditMode ? 'Editing existing package' : 'Draft Mode - Fill in the details below'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => form.handleSubmit((data) => onSubmit(data, 'DRAFT'))()}
                className="gap-2 h-10 px-5 bg-primary hover:bg-primary/90 shadow-md"
                disabled={saving}
              >
                <ButtonLoader loading={saving}>
                  <Save className="w-4 h-4" /> {isEditMode ? 'Save Changes' : 'Save Package'}
                </ButtonLoader>
              </Button>
            </div>
          </div>

          {/* Section 1: Basic Info */}
          <Card id="basic" className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-foreground">Package Name <span className="text-destructive">*</span></Label>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {form.watch('name')?.length || 0}/100
                  </span>
                </div>
                <Input
                  {...form.register('name', { 
                    required: 'Package name is required',
                    maxLength: { value: 100, message: 'Name must be 100 characters or less' }
                  })}
                  placeholder="e.g., Sigiriya & Dambulla Day Tour"
                  className={`h-12 text-base bg-background border-2 focus:ring-1 focus:ring-primary ${
                    form.formState.errors.name 
                      ? 'border-destructive focus:border-destructive' 
                      : 'border-border focus:border-primary'
                  }`}
                  maxLength={100}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span className="text-xs">●</span> {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Hero Image <span className="text-destructive">*</span></Label>
                <ImageUpload
                  value={form.watch('heroImage')}
                  onChange={(val) => {
                    form.setValue('heroImage', val, { shouldValidate: true });
                    form.trigger('heroImage');
                  }}
                />
                {form.formState.errors.heroImage && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span className="text-xs">●</span> {form.formState.errors.heroImage.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-foreground">Short Description</Label>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {form.watch('shortDescription')?.length || 0}/200
                  </span>
                </div>
                <Textarea
                  {...form.register('shortDescription', { 
                    maxLength: { value: 200, message: 'Short description must be 200 characters or less' }
                  })}
                  placeholder="A brief summary of the tour (1-2 sentences)"
                  className={`min-h-[80px] bg-background border-2 resize-none focus:ring-1 focus:ring-primary ${
                    form.formState.errors.shortDescription 
                      ? 'border-destructive focus:border-destructive' 
                      : 'border-border focus:border-primary'
                  }`}
                  maxLength={200}
                />
                {form.formState.errors.shortDescription && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span className="text-xs">●</span> {form.formState.errors.shortDescription.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Tags</Label>
                <Controller
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <TagsInput value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Tour Details */}
          <Card id="details" className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                Tour Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Package Type <span className="text-destructive">*</span></Label>
                  <Controller
                    control={form.control}
                    name="packageType"
                    rules={{ required: 'Package type is required' }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className={`bg-background border-2 focus:ring-1 focus:ring-primary ${
                            form.formState.errors.packageType 
                              ? 'border-destructive focus:border-destructive' 
                              : 'border-border focus:border-primary'
                          }`}
                        >
                          <SelectValue placeholder="Select package type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DAY_TOUR">Day Tour</SelectItem>
                          <SelectItem value="MULTI_DAY">Multi Day</SelectItem>
                          <SelectItem value="ROUND_TOUR">Round Tour</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.packageType && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <span className="text-xs">●</span> {form.formState.errors.packageType.message}
                    </p>
                  )}
                </div>
              <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Price (USD)</Label>
                  <Input
                    type="text"
                    {...form.register('price', { 
                      setValueAs: (v) => (v === '' || v == null ? '' : v),
                      validate: (v) => {
                        if (v === '' || v == null) return true;
                        const n = Number(v);
                        if (isNaN(n) || n < 0) return 'Price must be 0 or greater';
                        if (n > 1000000) return 'Price must not exceed 1,000,000';
                        const decimals = (String(v).split('.')[1] || '').length;
                        if (decimals > 2) return 'Price can have at most 2 decimal places';
                        return true;
                      }
                    })}
                    placeholder="e.g., 150.00"
                    className={`bg-background border-2 focus:ring-1 focus:ring-primary ${
                      form.formState.errors.price 
                        ? 'border-destructive focus:border-destructive' 
                        : 'border-border focus:border-primary'
                    }`}
                  />
                  {form.formState.errors.price && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <span className="text-xs">●</span> {form.formState.errors.price.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Total Days <span className="text-destructive">*</span></Label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    {...form.register('totalDays', { 
                      required: 'Total days is required',
                      min: { value: 1, message: 'Must be at least 1 day' },
                      max: { value: 365, message: 'Total days must not exceed 365' },
                      setValueAs: (v) => (v === '' || v == null ? '' : v),
                      validate: (v) => {
                        if (v === '' || v == null) return 'Total days is required';
                        const n = Number(v);
                        if (isNaN(n) || n < 1) return 'Must be at least 1 day';
                        if (n > 365) return 'Total days must not exceed 365';
                        return true;
                      }
                    })}
                    placeholder="e.g., 5"
                    className={`bg-background border-2 focus:ring-1 focus:ring-primary ${
                      form.formState.errors.totalDays 
                        ? 'border-destructive focus:border-destructive' 
                        : 'border-border focus:border-primary'
                    }`}
                  />
                  {form.formState.errors.totalDays && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <span className="text-xs">●</span> {form.formState.errors.totalDays.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Package Duration <span className="text-destructive">*</span></Label>
                  <Input
                    {...form.register('packageDuration', { required: 'Package duration is required' })}
                    placeholder="e.g., 3 Nights / 4 Days / 4 Days"
                    className={`bg-background border-2 focus:ring-1 focus:ring-primary ${
                      form.formState.errors.packageDuration 
                        ? 'border-destructive focus:border-destructive' 
                        : 'border-border focus:border-primary'
                    }`}
                  />
                  {form.formState.errors.packageDuration && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <span className="text-xs">●</span> {form.formState.errors.packageDuration.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Tour Reference Number <span className="text-destructive">*</span></Label>
                  <Controller
                    control={form.control}
                    name="tourRefNumber"
                    rules={{ required: 'Tour reference number is required' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="e.g., TOUR-3035"
                        onBlur={() => {
                          field.onBlur();
                        }}
                        className={`bg-background border-2 focus:ring-1 focus:ring-primary ${
                          form.formState.errors.tourRefNumber 
                            ? 'border-destructive focus:border-destructive' 
                            : 'border-border focus:border-primary'
                        }`}
                      />
                    )}
                  />
                  {form.formState.errors.tourRefNumber && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <span className="text-xs">●</span> {form.formState.errors.tourRefNumber.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Minimum No. of People <span className="text-destructive">*</span></Label>
                  <Input
                    type="number"
                    min={1}
                    max={10000}
                    {...form.register('minPeople', { 
                      required: 'Minimum people is required',
                      min: { value: 1, message: 'Must be at least 1' },
                      max: { value: 10000, message: 'Must not exceed 10,000' },
                      setValueAs: (v) => (v === '' || v == null ? '' : v),
                      validate: (v) => {
                        if (v === '' || v == null) return 'Minimum people is required';
                        const n = Number(v);
                        if (isNaN(n) || n < 1) return 'Must be at least 1';
                        if (n > 10000) return 'Must not exceed 10,000';
                        return true;
                      }
                    })}
                    placeholder="e.g., 2"
                    className={`bg-background border-2 focus:ring-1 focus:ring-primary ${
                      form.formState.errors.minPeople 
                        ? 'border-destructive focus:border-destructive' 
                        : 'border-border focus:border-primary'
                    }`}
                  />
                  {form.formState.errors.minPeople && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <span className="text-xs">●</span> {form.formState.errors.minPeople.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Extra Details - commented out */}
              {false && (
              <div className="space-y-2 mt-6">
                <Label className="text-sm font-semibold text-foreground">Extra Details</Label>
                <Textarea
                  {...form.register('extraDetails')}
                  placeholder="Any additional details about the tour..."
                  className="min-h-[100px] bg-background border-border focus:border-primary resize-none"
                />
              </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Description */}
          <Card id="description" className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                Full Description
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-foreground">Description <span className="text-destructive">*</span></Label>
                </div>
                <div className={`rounded-lg overflow-hidden bg-background ${
                  form.formState.errors.description 
                    ? 'border-destructive' 
                    : 'border-border'
                }`}>
                  <Textarea
                    {...form.register('description', { 
                      required: 'Description is required'
                    })}
                    placeholder="Write the full tour description here..."
                    className="min-h-[300px] bg-background resize-y border-2 focus:ring-1 focus:ring-primary"
                  />
                </div>
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span className="text-xs">●</span> {form.formState.errors.description.message}
                  </p>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Section 4: Includes & Excludes */}
          <Card id="inclusions" className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</span>
                Includes & Excludes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Includes */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-foreground">Includes</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendInclude('')}
                      className="gap-2 h-8"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {includesFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <Input
                          {...form.register(`includes.${index}`)}
                          placeholder="e.g., Transport"
                          className="bg-background border-border"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeInclude(index)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {includesFields.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                        No items added yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Excludes */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-foreground">Excludes</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendExclude('')}
                      className="gap-2 h-8"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {excludesFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <Input
                          {...form.register(`excludes.${index}`)}
                          placeholder="e.g., Tips"
                          className="bg-background border-border"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExclude(index)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {excludesFields.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                        No items added yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Daily Itinerary */}
          <Card id="days" className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">5</span>
                Daily Itinerary
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDay}
                className="gap-2 border-border hover:bg-muted"
              >
                <Plus className="w-4 h-4" /> Add Day
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {daysFields.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-muted/20">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No days added yet. Click "Add Day" to start building your itinerary.</p>
                </div>
              ) : (
                <>
                {daysFields.map((field, index) => (
                  <div key={field.id} className="border border-border rounded-lg p-6 bg-background hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                        <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-sm font-bold">
                          Day {form.watch(`days.${index}.dayNumber`) || index + 1}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDay(index)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-5">
                      {/* Day Image */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground">Day Image</Label>
                        <div className={`border-2 rounded-lg overflow-hidden ${
                          (form.formState.errors.days as any)?.[index]?.image 
                            ? 'border-destructive' 
                            : 'border-border'
                        }`}>
                          <ImageUpload
                            label=""
                            value={form.watch(`days.${index}.image`)}
                            onChange={(val) => {
                              form.setValue(`days.${index}.image`, val, { shouldValidate: true });
                              // Clear error when image is set
                              if (val?.trim()) {
                                form.clearErrors(`days.${index}.image`);
                              }
                            }}
                          />
                        </div>
                        {(form.formState.errors.days as any)?.[index]?.image && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <span className="text-xs">●</span> Day image is required
                          </p>
                        )}
                      </div>

                      {/* Basic Info Row */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-foreground">Day Number <span className="text-destructive">*</span></Label>
                          <Input
                            type="number"
                            min={1}
                            max={365}
                            {...form.register(`days.${index}.dayNumber`, {
                              required: 'Day number is required',
                              min: { value: 1, message: 'Day number must be at least 1' },
                              max: { value: 365, message: 'Day number must not exceed 365' },
                              valueAsNumber: true,
                              validate: (v) => {
                                if (v == null || v === '') return 'Day number is required';
                                const n = Number(v);
                                if (isNaN(n) || n < 1) return 'Day number must be at least 1';
                                if (n > 365) return 'Day number must not exceed 365';
                                return true;
                              }
                            })}
                            placeholder="e.g., 1"
                            className={`bg-background border-2 focus:ring-1 focus:ring-primary ${
                              (form.formState.errors.days as any)?.[index]?.dayNumber 
                                ? 'border-destructive focus:border-destructive' 
                                : 'border-border focus:border-primary'
                            }`}
                          />
                          {(form.formState.errors.days as any)?.[index]?.dayNumber && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <span className="text-xs">●</span> {(form.formState.errors.days as any)[index].dayNumber.message || 'Day number is required'}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-foreground">Location</Label>
                          <Input
                            {...form.register(`days.${index}.location`)}
                            placeholder="e.g., Sigiriya"
                            className="bg-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-foreground">Topic <span className="text-destructive">*</span></Label>
                          <Input
                            {...form.register(`days.${index}.topic`, { required: 'Topic is required' })}
                            placeholder="e.g., Visit Lion Rock"
                            className={`bg-background border-2 focus:ring-1 focus:ring-primary ${
                              (form.formState.errors.days as any)?.[index]?.topic 
                                ? 'border-destructive focus:border-destructive' 
                                : 'border-border focus:border-primary'
                            }`}
                          />
                          {(form.formState.errors.days as any)?.[index]?.topic && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <span className="text-xs">●</span> {(form.formState.errors.days as any)[index].topic.message || 'Topic is required'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Sub Topic - commented out */}
                      {false && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground">Sub Topic</Label>
                        <Input
                          {...form.register(`days.${index}.subTopic`)}
                          placeholder="e.g., Morning Climb"
                          className="bg-background border-border"
                        />
                      </div>
                      )}

                      {/* Description */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold text-foreground">Description <span className="text-destructive">*</span></Label>
                          <span className="text-xs text-muted-foreground">
                            {form.watch(`days.${index}.description`)?.length || 0}/650
                          </span>
                        </div>
                        <div className={`rounded-lg overflow-hidden bg-background ${
                          (form.formState.errors.days as any)?.[index]?.description 
                            ? 'border-destructive' 
                            : 'border-border'
                        }`}>
                          <Textarea
                            {...form.register(`days.${index}.description`, {
                              required: 'Description is required',
                              maxLength: { value: 650, message: 'Description cannot exceed 650 characters' },
                            })}
                            placeholder="Describe the day's activities..."
                            maxLength={650}
                            className="min-h-[150px] bg-background resize-y border-2 focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        {(form.formState.errors.days as any)?.[index]?.description && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <span className="text-xs">●</span> {(form.formState.errors.days as any)[index].description?.message || 'Description is required'}
                          </p>
                        )}
                      </div>

                      {/* Meal Plan - commented out */}
                      {false && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground">Meal Plan</Label>
                        <Input
                          {...form.register(`days.${index}.mealPlan`)}
                          placeholder="e.g., Lunch at local restaurant"
                          className="bg-background border-border"
                        />
                      </div>
                      )}

                      <Separator />

                      {/* Accommodation Section - commented out */}
                      {false && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <Label className="text-sm font-semibold text-foreground">Accommodation Details</Label>
                          <Controller
                            control={form.control}
                            name={`days.${index}.accommodation`}
                            render={({ field }) => (
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                                <span className="text-sm text-muted-foreground">
                                  {field.value ? 'Enabled' : 'Disabled'}
                                </span>
                              </div>
                            )}
                          />
                        </div>

                        {form.watch(`days.${index}.accommodation`) && (
                          <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg border border-border">
                            <div className="space-y-2">
                              <Label className="text-sm text-foreground">Hotel Name</Label>
                              <Input
                                {...form.register(`days.${index}.hotelName`)}
                                placeholder="Hotel name"
                                className="bg-background border-border"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm text-foreground">Hotel Location</Label>
                              <Input
                                {...form.register(`days.${index}.hotelLocation`)}
                                placeholder="Hotel location"
                                className="bg-background border-border"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm text-foreground">Room Type</Label>
                              <Input
                                {...form.register(`days.${index}.roomType`)}
                                placeholder="e.g., Deluxe"
                                className="bg-background border-border"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      )}

                   
                      <Separator />
                      <div className="grid md:grid-cols-2 gap-4">
                        <Controller
                          control={form.control}
                          name={`days.${index}.destinationIds`}
                          render={({ field }) => (
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-foreground">Destinations (Day {index + 1})</Label>
                              <EntityModalSelector
                                value={field.value}
                                onChange={field.onChange}
                                label="Destinations"
                                placeholder="Select destinations..."
                                entities={destinations}
                                entityName="destinations"
                                isOpen={destinationsModalDayIndex === index}
                                onOpenChange={handleDestinationsModalChangeForDay(index)}
                                loading={loadingEntities.destinations}
                                onLoadMore={loadMoreDestinations}
                                hasMore={destinationsHasMore}
                                loadingMore={loadingMoreEntities.destinations}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          control={form.control}
                          name={`days.${index}.thingToDoIds`}
                          render={({ field }) => (
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-foreground">Things To Do (Day {index + 1})</Label>
                              <EntityModalSelector
                                value={field.value}
                                onChange={field.onChange}
                                label="Things To Do"
                                placeholder="Select activities..."
                                entities={thingsToDo}
                                entityName="activities"
                                isOpen={thingsToDoModalDayIndex === index}
                                onOpenChange={handleThingsToDoModalChangeForDay(index)}
                                loading={loadingEntities.thingsToDo}
                                onLoadMore={loadMoreThingsToDo}
                                hasMore={thingsToDoHasMore}
                                loadingMore={loadingMoreEntities.thingsToDo}
                              />
                            </div>
                          )}
                        />
                      </div>
                     
                    </div>
                  </div>
                ))}
                <div className="flex justify-center pt-2 pb-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDay}
                    className="gap-2 border-border hover:bg-muted border-2 border-dashed"
                  >
                    <Plus className="w-4 h-4" /> Add Day
                  </Button>
                </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Sticky bottom bar: Back + Save (shown when scrolled) */}
          <div
            className={`sticky bottom-0 z-40 bg-muted/95 backdrop-blur-md border-t border-border py-4 -mx-6 px-6 mt-8 shadow-lg transition-all duration-300 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}
            aria-hidden={!isScrolled}
          >
            <div className="flex items-center justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/tours')}
                className="gap-2 h-10 px-5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                type="button"
                onClick={() => form.handleSubmit((data) => onSubmit(data, 'DRAFT'))()}
                className="gap-2 h-10 px-5 bg-primary hover:bg-primary/90 shadow-md"
                disabled={saving}
              >
                <ButtonLoader loading={saving}>
                  <Save className="w-4 h-4" /> {isEditMode ? 'Save Changes' : 'Save Package'}
                </ButtonLoader>
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="hidden lg:block w-64 sticky top-24 h-fit">
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 py-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-1">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                    setActiveSection(section.id);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 ease-out ${activeSection === section.id
                    ? 'bg-primary text-primary-foreground font-medium shadow-sm scale-[1.02] translate-x-1'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-0.5'
                    }`}
                >
                  <span className={`w-6 h-6 rounded-md text-xs flex items-center justify-center font-bold transition-all duration-300 ${activeSection === section.id
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                    }`}>{index + 1}</span>
                  <span className="flex-1">{section.label}</span>
                  {activeSection === section.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
                  )}
                </a>
              ))}
            </CardContent>
          </Card>

          {/* Helper Card */}
          <Card className="mt-4 border border-border bg-white dark:bg-card shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">💡</span>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Pro Tip</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Build detailed day-by-day itineraries with accommodation and activity links for a complete tour experience.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}