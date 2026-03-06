import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Trash2, Plus, Image, Save, Eye, Upload, ArrowLeft, MapPin, X
} from 'lucide-react';
import { Loader, ButtonLoader } from '@/admin/components/ui/Loader';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDestinationById, useDestinationMutations } from '@/hooks/useAdminData';
import { uploadImage } from '@/api/services/storage';
import { toast } from 'sonner';
import type { DestinationCreatePayload } from '@/admin/services/destinationService';

// Tag Input Component
const TagInput = ({
  value = [],
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-border bg-background min-h-[100px]">
        {value.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="px-3 py-1.5 text-sm flex items-center gap-2 hover:bg-secondary/80"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:text-destructive transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={value.length === 0 ? "Type a tag and press Enter or comma..." : "Add more..."}
          className="flex-1 min-w-[200px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 px-2"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground border">Enter</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground border">,</kbd> to add tags
      </p>
    </div>
  );
};

// Image upload that stores URL (uses uploadImage API)
const ImageUpload = ({
  value,
  onChange,
  label = '',
  className = '',
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}) => {
  const [preview, setPreview] = useState(value || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value || '');
  }, [value]);

  const processFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setPreview(url);
      onChange(url);
    } catch (error: any) {
      // Extract backend error message if available
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        'Image upload failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) await processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label className="text-sm font-semibold text-foreground">{label}</Label>}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !preview && !isUploading && fileInputRef.current?.click()}
        className={`relative rounded-lg overflow-hidden transition-all border-2 border-dashed p-6 cursor-pointer ${
          preview ? 'border-0' : 'border-border bg-muted/20 hover:border-primary/50'
        }`}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="p-2.5 bg-white rounded-lg shadow-lg"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setPreview(''); onChange(''); }}
                className="p-2.5 bg-destructive text-white rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            {isUploading ? (
              <>
                <Loader size="lg" className="mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">Uploading image...</p>
                <p className="text-xs text-muted-foreground">Please wait</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Image className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Click to upload or drag & drop
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG or GIF (max 10MB)</p>
              </>
            )}
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>
    </div>
  );
};

type KeyHighlightInput = {
  title: string;
  description: string;
};

type FormValues = {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  specificName: string;
  bestTime: string;
  tourCount: number;
  explorerNote: string;
  location: string;
  images: string[];
  tags: string[];
  keyHighlights: KeyHighlightInput[];
};

const defaultValues: FormValues = {
  title: '',
  content: '',
  excerpt: '',
  coverImage: '',
  specificName: '',
  bestTime: '',
  tourCount: 0,
  explorerNote: '',
  location: '',
  images: [],
  tags: [],
  keyHighlights: [],
};

export default function DestinationForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = Boolean(id && id !== 'new');

  const [activeSection, setActiveSection] = useState('basic');
  const [isScrolled, setIsScrolled] = useState(false);
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);

  // Use draft API only when status=draft; use published API only when status=published (avoids 404 when editing draft in hosted)
  const statusParam = searchParams.get('status');
  const isPublished = statusParam === 'published';
  
  const { data: destination, isLoading: loading, error: destinationError } = useDestinationById(id, isPublished);
  
  const { createMutation, updateMutation, updateStatusMutation } = useDestinationMutations();
  const saving = createMutation.isPending || updateMutation.isPending || updateStatusMutation.isPending;

  const form = useForm<FormValues>({ defaultValues });

  const { fields: highlightFields, append: appendHighlight, remove: removeHighlight } = useFieldArray({
    control: form.control,
    name: 'keyHighlights',
  });

  useEffect(() => {
    if (destination && isEditMode) {
      console.log('Loading destination data:', destination);
      const dest = destination as unknown as {
        title?: string;
        name?: string;
        content?: string;
        excerpt?: string;
        description?: string;
        coverImage?: string;
        image?: string;
        specificName?: string;
        bestTimeToVisit?: string;
        bestTime?: string;
        tours?: number | string;
        tourCount?: number | string;
        explorerNote?: string;
        location?: string | { lat?: number; lng?: number };
        gallery?: string[];
        images?: string[];
        highlights?: string[];
        tags?: string[];
        keyHighlights?: Array<{ title: string; description: string }>;
      };
      
      const rawLocation = dest.location;
      const locationValue = typeof rawLocation === 'string' ? rawLocation : '';

      const formData = {
        title: dest.title || dest.name || '',
        content: dest.content || '',
        excerpt: dest.excerpt || dest.description || '',
        coverImage: dest.coverImage || dest.image || '',
        specificName: dest.specificName || '',
        bestTime: dest.bestTime || dest.bestTimeToVisit || '',
        tourCount: Number(dest.tourCount) || Number(dest.tours) || 0,
        explorerNote: dest.explorerNote || '',
        location: locationValue,
        images: dest.images || dest.gallery || [],
        tags: dest.tags || dest.highlights || [],
        keyHighlights: dest.keyHighlights || [],
      };
      
      console.log('Form data being set:', formData);
      form.reset(formData);
    }
  }, [destination, isEditMode, form]);

  const sections = [
    { id: 'basic', label: 'Basic & location' },
    { id: 'content', label: 'Content' },
    { id: 'media', label: 'Cover & gallery' },
    { id: 'tags', label: 'Tags' },
    { id: 'highlights', label: 'Key highlights' },
  ];

  // Scroll-based navigation detection and button position
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
      
      // Detect if scrolled past header (show bottom buttons)
      setIsScrolled(window.scrollY > 100);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    const container = document.querySelector('.max-w-7xl.mx-auto.px-6.py-8');
    
    if (element && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollTop = elementRect.top - containerRect.top + container.scrollTop - 100; // 100px offset for header
      
      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  const buildPayload = (data: FormValues): DestinationCreatePayload => {
    const payload: DestinationCreatePayload = {
      title: data.title.trim(),
      content: data.content || '<p></p>',
    };

    if (data.excerpt?.trim()) payload.excerpt = data.excerpt.trim();
    if (data.coverImage?.trim()) payload.coverImage = data.coverImage.trim();
    if (data.specificName?.trim()) payload.specificName = data.specificName.trim();
    if (data.bestTime?.trim()) payload.bestTime = data.bestTime.trim();
    if (typeof data.tourCount === 'number' && data.tourCount >= 0) payload.tourCount = data.tourCount;
    if (data.explorerNote?.trim()) payload.explorerNote = data.explorerNote.trim();
    if (data.location?.trim()) payload.location = data.location.trim();

    const images = (data.images || []).filter(Boolean);
    if (images.length > 0) payload.images = images;

    const tags = (data.tags || []).filter(Boolean);
    if (tags.length > 0) payload.tags = tags;

    const keyHighlights = (data.keyHighlights || [])
      .filter((h) => h?.title?.trim())
      .map((h) => ({ title: h.title.trim(), description: (h.description || '').trim() }));
    if (keyHighlights.length > 0) payload.keyHighlights = keyHighlights;

    return payload;
  };

  const onSubmit = async (data: FormValues, status: "PUBLISHED" | "DRAFT" = "PUBLISHED") => {
    // Use form validation instead of toast errors
    if (!data.title.trim()) {
      form.setError('title', { type: 'required', message: 'Title is required' });
      return;
    }
    if (data.title.trim().length < 3) {
      form.setError('title', { type: 'minLength', message: 'Title must be at least 3 characters' });
      return;
    }
    if (!data.content || data.content.trim().length < 10) {
      form.setError('content', { type: 'minLength', message: 'Content is required and must be at least 10 characters' });
      return;
    }
    const payload = buildPayload(data);

    const handleError = (error: any) => {
      if (error.isHandled) return;
      let message = 'Failed to save destination';
      const responseData = error.response?.data;
      const err = responseData?.error;
      const fields = Array.isArray(err?.fields) ? err.fields : [];
      if (responseData) {
        if (fields.length > 0) {
          const messages = fields.map((f: any) => f.message || f).filter(Boolean);
          message = responseData.message && responseData.message !== 'Validation failed'
            ? responseData.message
            : messages.slice(0, 5).join(' • ').concat(messages.length > 5 ? ` (+${messages.length - 5} more)` : '');
          const known = ['title', 'excerpt', 'slug', 'content', 'coverImage', 'specificName', 'bestTime', 'tourCount', 'location', 'explorerNote', 'images', 'tags'];
          fields.forEach((f: any) => {
            const msg = f.message || '';
            let path: string | null = null;
            if (f.field && f.field !== 'unknown' && known.includes(f.field)) path = f.field;
            if (!path && typeof msg === 'string') {
              const m = msg.match(/^keyHighlights\.(\d+)\.(\w+)/);
              if (m) path = `keyHighlights.${m[1]}.${m[2]}`;
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

    if (isEditMode && id) {
      updateMutation.mutate(
        { id, data: payload as unknown as Record<string, unknown> },
        {
          onSuccess: () => {
            updateStatusMutation.mutate(
              { id, status },
              {
                onSuccess: () => {
                  toast.success(`Destination ${status === "DRAFT" ? "saved as draft" : "updated and published"}.`);
                },
                onError: () => {},
              }
            );
          },
          onError: handleError,
        }
      );
    } else {
      createMutation.mutate(payload as unknown as Parameters<typeof createMutation.mutate>[0], {
        onSuccess: (response) => {
          const destinationId = 
            (response as { id?: string | number })?.id || 
            (response as unknown as { data?: { id?: string | number } })?.data?.id ||
            (response as unknown as { data?: { data?: { id?: string | number } } })?.data?.data?.id;
          
          if (destinationId && status === "DRAFT") {
            updateStatusMutation.mutate(
              { id: String(destinationId), status: "DRAFT" },
              {
                onSuccess: () => {
                  toast.success('Destination saved as draft.');
                  navigate('/admin/destinations');
                },
                onError: () => {
                  navigate('/admin/destinations');
                },
              }
            );
          } else if (status === "PUBLISHED") {
            toast.success('Destination created and published.');
            navigate('/admin/destinations');
          } else {
            toast.success('Destination created.');
            navigate('/admin/destinations');
          }
        },
        onError: handleError,
      });
    }
  };

  const addGalleryImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setUploadingGalleryImage(true);
      try {
        const url = await uploadImage(file);
        form.setValue('images', [...form.getValues('images'), url]);
        toast.success('Image uploaded successfully');
      } catch (error: any) {
        // Extract backend error message if available
        const errorMessage = 
          error?.response?.data?.message || 
          error?.message || 
          'Image upload failed. Please try again.';
        toast.error(errorMessage);
      } finally {
        setUploadingGalleryImage(false);
      }
    };
    input.click();
  };

  const removeGalleryImage = (index: number) => {
    const list = form.getValues('images').filter((_, i) => i !== index);
    form.setValue('images', list);
  };

  const tagsValue = form.watch('tags') || [];

  if (loading && isEditMode) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader />
          <span>Loading destination...</span>
        </div>
      </div>
    );
  }

  // Show error if failed to load (backend shape: message + error.fields)
  if (isEditMode && !loading && !destination && destinationError) {
    const err: any = destinationError;
    const status = err?.response?.status;
    const data = err?.response?.data;
    const errorObj = data?.error;
    const fields = Array.isArray(errorObj?.fields) ? errorObj.fields : [];
    const errorMessage =
      data?.message ||
      (fields.length > 0
        ? fields.map((f: any) => f.message || f).filter(Boolean).slice(0, 3).join(' • ')
        : null) ||
      err?.message ||
      `${isPublished ? 'Published' : 'Draft'} destination not found. Make sure you're accessing it from the correct tab.`;
    if (status === 404) {
      toast.error(errorMessage);
      navigate('/admin/destinations', { replace: true });
      return null;
    }
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">Failed to load destination</p>
          <p className="text-sm text-muted-foreground">
            {errorMessage}
          </p>
          <Button onClick={() => navigate('/admin/destinations')} variant="outline">
            Back to Destinations
          </Button>
        </div>
      </div>
    );
  }

  const destinationTitle = form.watch('title');

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        <div className="flex-1 space-y-6 pb-48">
          {/* Page Header with Buttons (shown when not scrolled) */}
          <div className={`mb-6 transition-opacity duration-300 ${isScrolled ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : 'opacity-100'}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate('/admin/destinations')}
                  className="h-10 w-10 rounded-lg border-border bg-card hover:bg-muted shrink-0"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold text-foreground break-all">
                    {isEditMode ? `Edit ${destinationTitle || 'Destination'}` : 'Create New Destination'}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isEditMode ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                    {isEditMode ? 'Editing existing destination' : 'Fill in the details below'}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => form.handleSubmit((data) => onSubmit(data, isPublished ? "PUBLISHED" : "DRAFT"))()}
                className="gap-2 h-10 px-5 bg-primary hover:bg-primary/90 shadow-md shrink-0"
                disabled={saving}
              >
                <ButtonLoader loading={saving}>
                  <Save className="w-4 h-4" /> Save Changes
                </ButtonLoader>
              </Button>
            </div>
          </div>
          
          {/* Title only (shown when scrolled) */}
          <div className={`mb-6 transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 overflow-hidden'}`}>
            <div>
              <h1 className="text-2xl font-bold text-foreground break-all">
                {isEditMode ? `Edit ${destinationTitle || 'Destination'}` : 'Create New Destination'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isEditMode ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                {isEditMode ? 'Editing existing destination' : 'Fill in the details below'}
              </p>
            </div>
          </div>

          {/* Basic & location */}
          <Card id="basic" className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 py-4">
              <CardTitle className="text-lg font-bold">Basic & location</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-foreground">Title <span className="text-destructive">*</span></Label>
                  <span className="text-xs text-muted-foreground">
                    {form.watch('title')?.length || 0}/100
                  </span>
                </div>
                <Textarea 
                  {...form.register('title', { 
                    required: 'Title is required',
                    maxLength: { value: 100, message: 'Title must be 100 characters or less' }
                  })} 
                  placeholder="e.g. Anuradhapura"
                  maxLength={100}
                  className={`min-h-[60px] resize-y bg-background border-2 focus:ring-1 focus:ring-primary break-words ${
                    form.formState.errors.title 
                      ? 'border-destructive focus:border-destructive' 
                      : 'border-border focus:border-primary'
                  }`}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span className="text-xs">●</span> {form.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-foreground">Short description (excerpt) <span className="text-destructive">*</span></Label>
                  <span className="text-xs text-muted-foreground">
                    {form.watch('excerpt')?.length || 0}/100
                  </span>
                </div>
                <Textarea 
                  {...form.register('excerpt', { 
                    required: 'Excerpt is required',
                    maxLength: { value: 100, message: 'Excerpt cannot exceed 100 characters' }
                  })} 
                  placeholder="Short description"
                  maxLength={100}
                  className={`min-h-[80px] resize-y bg-background border-2 focus:ring-1 focus:ring-primary ${
                    form.formState.errors.excerpt 
                      ? 'border-destructive focus:border-destructive' 
                      : 'border-border focus:border-primary'
                  }`}
                />
                {form.formState.errors.excerpt && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span className="text-xs">●</span> {form.formState.errors.excerpt.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Specific name</Label>
                  <Input {...form.register('specificName')} placeholder="specificName" className="h-11 overflow-hidden text-ellipsis whitespace-nowrap" />
                </div>
                <div className="space-y-2">
                  <Label>Best time to visit</Label>
                  <Input {...form.register('bestTime')} placeholder="e.g. Dec–Mar" className="h-11 overflow-hidden text-ellipsis whitespace-nowrap" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tour count</Label>
                  <Input
                    type="number"
                    min={0}
                    {...form.register('tourCount', { valueAsNumber: true })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input {...form.register('location')} placeholder="e.g. Central Province" className="h-11 overflow-hidden text-ellipsis whitespace-nowrap" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Explorer note</Label>
                <Textarea 
                  {...form.register('explorerNote')} 
                  placeholder="Explorer note" 
                  className="min-h-[80px] resize-y"
                />
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card id="content" className={`border-2 bg-card shadow-sm ${
            form.formState.errors.content 
              ? 'border-destructive' 
              : 'border-border'
          }`}>
            <CardHeader className="border-b border-border bg-muted/30 py-4">
              <CardTitle className="text-lg font-bold">Content</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Content <span className="text-destructive">*</span></Label>
                <Controller
                  control={form.control}
                  name="content"
                  rules={{ 
                    required: 'Content is required',
                    minLength: { value: 10, message: 'Content must be at least 10 characters' }
                  }}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder="Enter detailed content here..."
                      className={`min-h-[300px] text-base bg-background border-2 focus:ring-1 focus:ring-primary resize-y ${
                        form.formState.errors.content 
                          ? 'border-destructive focus:border-destructive' 
                          : 'border-border focus:border-primary'
                      }`}
                      onChange={(e) => {
                        field.onChange(e);
                        if (e.target.value?.trim() && e.target.value.trim().length >= 10) {
                          form.clearErrors('content');
                        }
                      }}
                    />
                  )}
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span className="text-xs">●</span> {String(form.formState.errors.content.message)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">The main content of your destination</p>
              </div>
            </CardContent>
          </Card>

          {/* Cover & gallery */}
          <Card id="media" className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 py-4">
              <CardTitle className="text-lg font-bold">Cover & gallery</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Cover Image <span className="text-destructive">*</span></Label>
                <div className={`border-2 rounded-lg overflow-hidden ${
                  form.formState.errors.coverImage 
                    ? 'border-destructive' 
                    : 'border-border'
                }`}>
                  <ImageUpload
                    label=""
                    value={form.watch('coverImage')}
                    onChange={(url) => {
                      form.setValue('coverImage', url, { shouldValidate: true });
                      if (url?.trim()) {
                        form.clearErrors('coverImage');
                      }
                    }}
                  />
                </div>
                {form.formState.errors.coverImage && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span className="text-xs">●</span> Cover image is required
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Gallery images</Label>
                <div className="flex flex-wrap gap-3">
                  {(form.watch('images') || []).map((url, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addGalleryImage}
                    disabled={uploadingGalleryImage}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-border bg-muted/20 flex items-center justify-center hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingGalleryImage ? (
                      <Loader size="default" />
                    ) : (
                      <Plus className="w-6 h-6 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card id="tags" className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 py-4">
              <CardTitle className="text-lg font-bold">Tags</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Controller
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <TagInput
                    value={field.value || []}
                    onChange={field.onChange}
                  />
                )}
              />
            </CardContent>
          </Card>

          {/* Key highlights */}
          <Card id="highlights" className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold">Key highlights</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => appendHighlight({ title: '', description: '' })} className="gap-2">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {highlightFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">No highlights yet. Click Add to add one.</p>
              ) : (
                <>
                  {highlightFields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-start p-4 rounded-lg border border-border bg-muted/10">
                      <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-foreground">Title</Label>
                            <span className="text-xs text-muted-foreground">
                              {form.watch(`keyHighlights.${index}.title`)?.length || 0}/20
                            </span>
                          </div>
                          <Input
                            {...form.register(`keyHighlights.${index}.title`, {
                              maxLength: { value: 20, message: 'Title cannot exceed 20 characters' },
                            })}
                            placeholder="Title"
                            maxLength={20}
                            className="h-10 overflow-hidden text-ellipsis whitespace-nowrap"
                          />
                          {form.formState.errors?.keyHighlights?.[index]?.title && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <span className="text-xs">●</span> {String(form.formState.errors.keyHighlights[index].title?.message)}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-foreground">Description</Label>
                            <span className="text-xs text-muted-foreground">
                              {form.watch(`keyHighlights.${index}.description`)?.length || 0}/100
                            </span>
                          </div>
                          <Textarea 
                            {...form.register(`keyHighlights.${index}.description`, {
                              maxLength: { value: 100, message: 'Description cannot exceed 100 characters' },
                            })} 
                            placeholder="Description" 
                            maxLength={100}
                            className="min-h-[60px] resize-y"
                          />
                          {form.formState.errors?.keyHighlights?.[index]?.description && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <span className="text-xs">●</span> {String(form.formState.errors.keyHighlights[index].description?.message)}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeHighlight(index)} className="text-destructive shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-center pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendHighlight({ title: '', description: '' })}
                      className="gap-2 border-dashed"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Floating Action Buttons at Bottom (shown when scrolled) */}
          <div className={`sticky bottom-0 z-40 bg-muted/95 backdrop-blur-md border-t border-border py-4 -mx-6 px-6 mt-8 shadow-lg transition-all duration-300 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}>
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/destinations')}
                className="gap-2 h-10 px-5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                onClick={() => form.handleSubmit((data) => onSubmit(data, isPublished ? "PUBLISHED" : "DRAFT"))()}
                className="gap-2 h-10 px-5 bg-primary hover:bg-primary/90 shadow-md"
                disabled={saving}
              >
                <ButtonLoader loading={saving}>
                  <Save className="w-4 h-4" /> Save Changes
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
                    Add detailed content and key highlights to make your destination pages engaging and informative for travelers.
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