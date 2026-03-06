import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Trash2, Plus, Image, GripVertical,
  Save, Eye, Upload, ArrowLeft, Compass, FileText, X, Tag
} from 'lucide-react';
import { Loader, ButtonLoader } from '@/admin/components/ui/Loader';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { TiptapEditor } from '@/admin/components/ui/TiptapEditor';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useThingToDoById, useThingsToDoMutations } from '@/hooks/useAdminData';
import { uploadImage } from '@/api/services/storage';
import { toast } from 'sonner';
import type { ThingsToDoCreatePayload } from '@/admin/services/thingsToDoService';

// Image Upload Component (uses uploadImage API)
const ImageUpload = ({ value, onChange, label = '', className = '' }) => {
  const [preview, setPreview] = useState(value || '');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    setPreview(value || '');
  }, [value]);

  const processFile = async (file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setPreview(url);
      onChange?.(url);
    } catch {
      toast.error('Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await processFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPreview(''); onChange?.(''); }}
                  className="p-2.5 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
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
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <Image className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {isDragging ? 'Drop your image here' : 'Click to upload or drag & drop'}
                </p>
                <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 10MB)</p>
              </>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

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

export default function ThingsToDoForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = Boolean(id && id !== 'new');

  const [activeSection, setActiveSection] = useState('basic');
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Use draft API unless status=published (avoids 404 when editing draft in hosted)
  const statusParam = searchParams.get('status');
  const isPublished = statusParam === 'published';
  
  const { data: thing, isLoading: loading, error: thingError } = useThingToDoById(id, isPublished);
  const { createMutation, updateMutation, updateStatusMutation } = useThingsToDoMutations();
  const saving = createMutation.isPending || updateMutation.isPending || updateStatusMutation.isPending;

  const form = useForm<any>({
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      coverImage: '',
      purpose: '',
      duration: '',
      overview: '',
      location: '',
      images: [''],
      tags: [],
      experienceHighlight: [],
      vision: {
        image: '',
        title: '',
        description: ''
      }
    }
  });

  const { fields: imagesFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: 'images'
  });

  const { fields: highlightFields, append: appendHighlight, remove: removeHighlight } = useFieldArray({
    control: form.control,
    name: 'experienceHighlight'
  });

  // Reset form when data is loaded
  useEffect(() => {
    if (thing && isEditMode) {
      console.log('Loading thing data:', thing);
      const t = thing as unknown as {
        title?: string;
        name?: string;
        excerpt?: string;
        description?: string;
        content?: string;
        coverImage?: string;
        heroImage?: string;
        image?: string;
        purpose?: string;
        duration?: string;
        overview?: string;
        location?: string;
        images?: string[];
        gallery?: string[];
        tags?: string[];
        experienceHighlight?: Array<{ image: string; title: string; description: string }>;
        vision?: { image: string; title: string; description: string } | Array<{ image: string; title: string; description: string }>;
      };

      // Handle vision which might be array in legacy data or object in new data
      const visionData = Array.isArray(t.vision) ? t.vision[0] : t.vision;

      const formData = {
        title: t.title || t.name || '',
        excerpt: t.excerpt || t.description || '',
        content: t.content || '',
        coverImage: t.coverImage || t.heroImage || t.image || '',
        purpose: t.purpose || '',
        duration: t.duration || '',
        overview: t.overview || '',
        location: t.location || '',
        images: t.images || t.gallery || [''],
        tags: t.tags || [],
        experienceHighlight: t.experienceHighlight || [],
        vision: visionData || { image: '', title: '', description: '' }
      };
      
      console.log('Form data being set:', formData);
      form.reset(formData);
    }
  }, [thing, isEditMode, form]);

  const sections = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'details', label: 'Details' },
    { id: 'gallery', label: 'Image Gallery' },
    { id: 'experience', label: 'Experience Highlights' },
    { id: 'vision', label: 'Vision Section' }
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
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const addExperienceHighlight = () => {
    appendHighlight({ image: '', title: '', description: '' });
  };

  const onSubmit = async (data: any, status: "PUBLISHED" | "DRAFT" = "PUBLISHED") => {
    // Validation matching backend DTO
    if (!data.title?.trim()) {
      toast.error('Title is required.');
      return;
    }
    // Content section is commented out; content is optional and defaults to empty HTML

    // Filter out empty image URLs
    const filteredImages = data.images?.filter((img: string) => img && img.trim() !== '') || [];

    // Build payload matching API DTO structure
    const payload: ThingsToDoCreatePayload = {
      title: data.title.trim(),
      content: data.content || '<p></p>',
      // Optional scalars: send null when cleared so backend can set column to NULL
      excerpt: data.excerpt?.trim() ? data.excerpt.trim() : null,
      coverImage: data.coverImage?.trim() ? data.coverImage.trim() : null,
      purpose: data.purpose?.trim() ? data.purpose.trim() : null,
      duration: data.duration?.trim() ? data.duration.trim() : null,
      overview: data.overview?.trim() ? data.overview.trim() : null,
      location: data.location?.trim() ? data.location.trim() : null,
      // Lists: always send arrays; [] means "clear"
      images: filteredImages,
      tags: (data.tags || []).filter((tag: string) => tag?.trim()),
    };

    // Experience highlights: only include items with at least title or image
    const experienceHighlight = (data.experienceHighlight || [])
      .filter((h: { image?: string; title?: string; description?: string }) => (h?.image?.trim() || h?.title?.trim()))
      .map((h: { image?: string; title?: string; description?: string }) => ({
        image: (h.image || '').trim(),
        title: (h.title || '').trim(),
        description: (h.description || '').trim(),
      }));
    if (experienceHighlight.length > 0) payload.experienceHighlight = experienceHighlight;

    // Vision: include if at least one field has a value
    const vision = data.vision;
    if (vision && (vision.image?.trim() || vision.title?.trim() || vision.description?.trim())) {
      payload.vision = {
        image: (vision.image || '').trim(),
        title: (vision.title || '').trim(),
        description: (vision.description || '').trim(),
      };
    }

    const handleError = (error: any) => {
      if (error.isHandled) return;
      let message = 'Failed to save activity';
      const responseData = error.response?.data;
      const err = responseData?.error;
      const fields = Array.isArray(err?.fields) ? err.fields : [];
      if (responseData) {
        if (fields.length > 0) {
          const messages = fields.map((f: any) => f.message || f).filter(Boolean);
          message = responseData.message && responseData.message !== 'Validation failed'
            ? responseData.message
            : messages.slice(0, 5).join(' • ').concat(messages.length > 5 ? ` (+${messages.length - 5} more)` : '');
          const known = ['title', 'excerpt', 'content', 'purpose', 'duration', 'location', 'overview', 'tags', 'images'];
          fields.forEach((f: any) => {
            const msg = f.message || '';
            let path: string | null = null;
            if (f.field && f.field !== 'unknown' && known.includes(f.field)) path = f.field;
            if (!path && typeof msg === 'string') {
              const m = msg.match(/^experienceHighlight\.(\d+)\.(\w+)/);
              if (m) path = `experienceHighlight.${m[1]}.${m[2]}`;
              else {
                const visionMatch = msg.match(/^(vision\.\w+)/);
                if (visionMatch) path = visionMatch[1];
              }
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
      updateMutation.mutate({ id, data: payload }, {
        onSuccess: () => {
          updateStatusMutation.mutate(
            { id, status },
            {
              onSuccess: () => {
                toast.success(`Activity ${status === "DRAFT" ? "saved as draft" : "updated and published"}.`);
              },
              onError: () => {
                toast.success('Activity updated, but failed to update status.');
              },
            }
          );
        },
        onError: handleError,
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: (response) => {
          const activityId = 
            (response as { id?: string | number })?.id || 
            (response as unknown as { data?: { id?: string | number } })?.data?.id ||
            (response as unknown as { data?: { data?: { id?: string | number } } })?.data?.data?.id;
          
          if (activityId && status === "DRAFT") {
            updateStatusMutation.mutate(
              { id: String(activityId), status: "DRAFT" },
              {
                onSuccess: () => {
                  toast.success('Activity saved as draft.');
                  navigate('/admin/things-to-do');
                },
                onError: (error: any) => {
                  if (!error.isHandled) toast.success('Activity created, but failed to set as draft.');
                  navigate('/admin/things-to-do');
                },
              }
            );
          } else if (status === "PUBLISHED") {
            toast.success('Activity created and published.');
            navigate('/admin/things-to-do');
          } else {
            toast.success('Activity created.');
            navigate('/admin/things-to-do');
          }
        },
        onError: handleError,
      });
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader />
          <span>Loading activity...</span>
        </div>
      </div>
    );
  }

  // Show error if failed to load (backend shape: message + error.fields)
  if (isEditMode && !loading && !thing && thingError) {
    const err: any = thingError;
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
      `${isPublished ? 'Published' : 'Draft'} activity not found. Make sure you're accessing it from the correct tab.`;
    if (status === 404) {
      toast.error(errorMessage);
      navigate('/admin/things-to-do', { replace: true });
      return null;
    }
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">Failed to load activity</p>
          <p className="text-sm text-muted-foreground">
            {errorMessage}
          </p>
          <Button onClick={() => navigate('/admin/things-to-do')} variant="outline">
            Back to Activities
          </Button>
        </div>
      </div>
    );
  }

  const activityTitle = form.watch('title');

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Main Form */}
        <div className="flex-1 space-y-6 pb-48">
          {/* Page Header with Buttons (shown when not scrolled) */}
          <div className={`mb-6 transition-opacity duration-300 ${isScrolled ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : 'opacity-100'}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate('/admin/things-to-do')}
                  className="h-10 w-10 rounded-lg border-border bg-card hover:bg-muted shrink-0"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold text-foreground break-all">
                    {isEditMode ? `Edit ${activityTitle || 'Activity'}` : 'Create New Activity'}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isEditMode ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                    {isEditMode ? 'Editing existing activity' : 'Fill in the details below'}
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
                {isEditMode ? `Edit ${activityTitle || 'Activity'}` : 'Create New Activity'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isEditMode ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                {isEditMode ? 'Editing existing activity' : 'Fill in the details below'}
              </p>
            </div>
          </div>

          {/* Section 1: Basic Information */}
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
                  <Label className="text-sm font-semibold text-foreground">Title <span className="text-destructive">*</span></Label>
                  <span className="text-xs text-muted-foreground">
                    {form.watch('title')?.length || 0}/25
                  </span>
                </div>
                <Textarea
                  {...form.register('title', { 
                    required: 'Title is required',
                    maxLength: {
                      value: 25,
                      message: 'Title cannot exceed 25 characters'
                    }
                  })}
                  placeholder="e.g., Sigiriya Rock Climbing Adventure"
                  maxLength={25}
                  className={`min-h-[60px] resize-y bg-background border-2 focus:ring-1 focus:ring-primary break-words ${
                    form.formState.errors.title 
                      ? 'border-destructive focus:border-destructive' 
                      : 'border-border focus:border-primary'
                  }`}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span className="text-xs">●</span> {String(form.formState.errors.title.message)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-foreground">Excerpt <span className="text-destructive">*</span></Label>
                  <span className="text-xs text-muted-foreground">
                    {form.watch('excerpt')?.length || 0}/160
                  </span>
                </div>
                <Textarea
                  {...form.register('excerpt', { 
                    required: 'Excerpt is required',
                    maxLength: {
                      value: 160,
                      message: 'Excerpt cannot exceed 160 characters'
                    }
                  })}
                  placeholder="A brief summary of the activity (1-2 sentences)"
                  maxLength={160}
                  className={`min-h-[80px] bg-background border-2 focus:ring-1 focus:ring-primary resize-none ${
                    form.formState.errors.excerpt 
                      ? 'border-destructive focus:border-destructive' 
                      : 'border-border focus:border-primary'
                  }`}
                />
                {form.formState.errors.excerpt && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span className="text-xs">●</span> {String(form.formState.errors.excerpt.message)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Short description shown in preview cards</p>
              </div>

                {/* Content section - commented out */}
                {false && (
                <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Content <span className="text-destructive">*</span></Label>
                <div className={`rounded-lg overflow-hidden bg-background ${
                  form.formState.errors.content 
                    ? 'border-destructive' 
                    : 'border-border'
                }`}>
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
                        placeholder="Write detailed content about this activity..."
                        className="min-h-[300px] text-base bg-background border-2 focus:ring-1 focus:ring-primary resize-y"
                      />
                    )}
                  />
                </div>
                {form.formState.errors.content && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span className="text-xs">●</span> {String(form.formState.errors.content.message)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Full description and details about the activity</p>
              </div>
                )}

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
                    onChange={(val) => {
                      form.setValue('coverImage', val, { shouldValidate: true });
                      if (val?.trim()) {
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

          {/* Section 2: Details */}
          <Card id="details" className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                Activity Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-foreground">Purpose</Label>
                  <span className="text-xs text-muted-foreground">
                    {form.watch('purpose')?.length || 0}/15
                  </span>
                </div>
                <Textarea
                  {...form.register('purpose', {
                    maxLength: {
                      value: 15,
                      message: 'Purpose cannot exceed 15 characters',
                    },
                  })}
                  placeholder="What is the purpose of this activity?"
                  maxLength={15}
                  className="min-h-[60px] bg-background border-border focus:border-primary resize-none"
                />
                {form.formState.errors.purpose && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span className="text-xs">●</span> {String(form.formState.errors.purpose.message)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Duration</Label>
                  <Input
                    {...form.register('duration')}
                    placeholder="e.g., 3-4 hours"
                    className="h-11 bg-background border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Location</Label>
                  <Input
                    {...form.register('location')}
                    placeholder="e.g., Dambulla, Sri Lanka"
                    className="h-11 bg-background border-border focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Overview</Label>
                <Textarea
                  {...form.register('overview')}
                  placeholder="Provide an overview of the activity experience"
                  className="min-h-[120px] bg-background border-border focus:border-primary resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Image Gallery */}
          <Card id="gallery" className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                Image Gallery
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendImage('')}
                className="gap-2 border-border hover:bg-muted"
              >
                <Plus className="w-4 h-4" /> Add Image
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {imagesFields.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-muted/20">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                    <Image className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">No gallery images yet. Add images to showcase this activity.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendImage('')}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add First Image
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {imagesFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border border-border rounded-lg bg-card shadow-sm p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Image {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <ImageUpload
                        value={form.watch(`images.${index}`)}
                        onChange={(val) => form.setValue(`images.${index}`, val)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 4: Experience Highlights */}
          <Card id="experience" className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</span>
                Experience Highlights
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExperienceHighlight}
                className="gap-2 border-border hover:bg-muted"
              >
                <Plus className="w-4 h-4" /> Add Highlight
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {highlightFields.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-muted/20">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                    <Compass className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">No experience highlights yet. Add highlights to showcase key features.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addExperienceHighlight}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add First Highlight
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {highlightFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border border-border rounded-lg bg-card shadow-sm overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-3 bg-muted/30 border-b border-border">
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                          <span className="text-sm font-medium text-muted-foreground">
                            Highlight {index + 1}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHighlight(index)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="p-4 space-y-4">
                        <ImageUpload
                          label="Highlight Image"
                          value={form.watch(`experienceHighlight.${index}.image`)}
                          onChange={(val) => form.setValue(`experienceHighlight.${index}.image`, val)}
                        />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold text-foreground">Title</Label>
                            <span className="text-xs text-muted-foreground">
                              {form.watch(`experienceHighlight.${index}.title`)?.length || 0}/50
                            </span>
                          </div>
                          <Input
                            {...form.register(`experienceHighlight.${index}.title`, {
                              maxLength: { value: 50, message: 'Title cannot exceed 50 characters' },
                            })}
                            placeholder="e.g., Witness the Shadow"
                            maxLength={50}
                            className="h-11 bg-background border-border"
                          />
                          {form.formState.errors?.experienceHighlight?.[index]?.title && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <span className="text-xs">●</span> {String(form.formState.errors.experienceHighlight[index].title?.message)}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold text-foreground">Description</Label>
                            <span className="text-xs text-muted-foreground">
                              {form.watch(`experienceHighlight.${index}.description`)?.length || 0}/530
                            </span>
                          </div>
                          <Textarea
                            {...form.register(`experienceHighlight.${index}.description`, {
                              maxLength: { value: 530, message: 'Description cannot exceed 530 characters' },
                            })}
                            placeholder="Describe this highlight..."
                            maxLength={530}
                            className="min-h-[80px] bg-background border-border resize-none"
                          />
                          {form.formState.errors?.experienceHighlight?.[index]?.description && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <span className="text-xs">●</span> {String(form.formState.errors.experienceHighlight[index].description?.message)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-center pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addExperienceHighlight}
                      className="gap-2 border-dashed"
                    >
                      <Plus className="w-4 h-4" /> Add Highlight
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 5: Vision Section - commented out */}
          {false && (
          <Card id="vision" className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">5</span>
                Vision Section
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <ImageUpload
                label="Vision Image"
                value={form.watch('vision.image')}
                onChange={(val) => form.setValue('vision.image', val)}
              />
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Vision Title</Label>
                <Input
                  {...form.register('vision.title')}
                  placeholder="e.g., Our Vision for Adventure"
                  className="h-11 bg-background border-border focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Vision Description</Label>
                <Textarea
                  {...form.register('vision.description')}
                  placeholder="Describe your vision..."
                  className="min-h-[120px] bg-background border-border focus:border-primary resize-none"
                />
              </div>
            </CardContent>
          </Card>
          )}

          {/* Floating Action Buttons at Bottom (shown when scrolled) */}
          <div className={`sticky bottom-0 z-40 bg-muted/95 backdrop-blur-md border-t border-border py-4 -mx-6 px-6 mt-8 shadow-lg transition-all duration-300 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}>
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/things-to-do')}
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
                    Add multiple experience highlights and gallery images to make your activity pages engaging and informative for travelers.
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