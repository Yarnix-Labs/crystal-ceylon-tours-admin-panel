import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2, Plus, Image, GripVertical,
  Save, Eye, Upload, ArrowLeft, FileText, Calendar, User, Tag, X, Clock
} from 'lucide-react';
import { Loader, ButtonLoader } from '@/admin/components/ui/Loader';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useBlogById, useBlogMutations } from '@/hooks/useAdminData';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { uploadImage } from '@/api/services/storage';

// Image Upload Component (stores URL via uploadImage API)
const ImageUpload = ({ value, onChange, label = '', className = '' }: { value: string; onChange: (url: string) => void; label?: string; className?: string }) => {
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) processFile(file);
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
        className={`relative group rounded-lg overflow-hidden transition-all duration-300 cursor-pointer ${preview ? 'border-0' : 'border-2 border-dashed p-6 border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40'}`}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg transition-transform duration-300 group-hover:scale-[1.02]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 rounded-lg flex items-center justify-center">
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="p-2.5 bg-white text-foreground rounded-lg hover:bg-gray-100 transition-colors shadow-lg">
                  <Upload className="w-4 h-4" />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); setPreview(''); onChange(''); }} className="p-2.5 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors shadow-lg">
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
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Image className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Click to upload or drag & drop</p>
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

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, index) => (
          <Badge key={index} variant="secondary" className="px-3 py-1.5 text-sm">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-2 hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleAddTag}
        placeholder="Type a tag and press Enter"
        className="h-11 bg-background border-border focus:border-primary"
      />
      <p className="text-xs text-muted-foreground">Press Enter to add tags</p>
    </div>
  );
};

// Related Blogs Input Component
const RelatedBlogsInput = ({ value = [], onChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddBlog = () => {
    const blogId = parseInt(inputValue);
    if (!isNaN(blogId) && blogId > 0 && !value.includes(blogId)) {
      onChange([...value, blogId]);
      setInputValue('');
    }
  };

  const removeBlog = (blogId) => {
    onChange(value.filter(id => id !== blogId));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((blogId, index) => (
          <Badge key={index} variant="outline" className="px-3 py-1.5 text-sm">
            Blog #{blogId}
            <button
              type="button"
              onClick={() => removeBlog(blogId)}
              className="ml-2 hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter blog ID"
          className="h-11 bg-background border-border focus:border-primary"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAddBlog}
          className="h-11"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Images Array Input Component (stores URLs via uploadImage API)
const ImagesArrayInput = ({ value = [], onChange }: { value: string[]; onChange: (urls: string[]) => void }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      onChange([...value, url]);
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      if (file.type.startsWith('image/')) await processFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      if (file.type.startsWith('image/')) await processFile(file);
    }
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Uploaded Images Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {value.map((imageUrl, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-border">
              <img 
                src={imageUrl} 
                alt={`Image ${index + 1}`} 
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-destructive text-white rounded-lg hover:bg-destructive/90"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40'
        }`}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            {isDragging ? 'Drop images here' : 'Click to upload or drag & drop'}
          </p>
          <p className="text-xs text-muted-foreground">
            Upload multiple images (PNG, JPG, GIF - max 10MB each)
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default function BlogPostForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = Boolean(id && id !== 'new');

  const statusParam = searchParams.get('status');
  const isPublished = statusParam === 'published';

  const [activeSection, setActiveSection] = useState('basic');
  const [isScrolled, setIsScrolled] = useState(false);

  const { data: post, isLoading: loading } = useBlogById(id, isPublished);
  
  const { createMutation, updateMutation, updateStatusMutation } = useBlogMutations();
  const savingContent = createMutation.isPending || updateMutation.isPending;
  const savingStatus = updateStatusMutation.isPending;
  const saving = savingContent || savingStatus;

  const form = useForm({
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      coverImage: '',
      readingTime: '',
      category: '',
      authorName: '',
      relatedBlogs: [],
      images: [],
      tags: []
    }
  });

  // Reset form when data is loaded
  useEffect(() => {
    if (post) {
      const content = Array.isArray(post.content) ? (post.content as string[]).join('') : (post.content ?? '');
      form.reset({
        title: post.title || '',
        content,
        excerpt: post.excerpt || '',
        coverImage: post.coverImage || post.image || '',
        readingTime: post.readingTime || post.readTime || '',
        category: post.category || '',
        authorName: post.authorName || post.author || '',
        relatedBlogs: post.relatedBlogs || [],
        images: post.images || [],
        tags: post.tags || []
      });
    }
  }, [post, form]);

  const sections = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'content', label: 'Content' },
    { id: 'metadata', label: 'Metadata & SEO' }
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

  const onSubmit = async (data: any, targetStatus: "DRAFT" | "PUBLISHED") => {
    const relatedBlogs = Array.isArray(data.relatedBlogs)
      ? data.relatedBlogs.map((x: unknown) => (typeof x === 'number' ? x : Number(x))).filter((n: number) => !Number.isNaN(n))
      : [];
    const images = Array.isArray(data.images) ? data.images.filter((x: string) => x && x.trim()) : [];
    const tags = Array.isArray(data.tags) ? data.tags.filter((x: string) => x && x.trim()) : [];

    const payload = {
      title: data.title,
      content: data.content,
      // Optional scalars: send null when cleared so backend can set DB NULL
      excerpt: data.excerpt != null && data.excerpt !== '' ? data.excerpt : null,
      coverImage: data.coverImage != null && data.coverImage !== '' ? data.coverImage : null,
      readingTime: data.readingTime != null && data.readingTime !== '' ? data.readingTime : null,
      category: data.category != null && data.category !== '' ? data.category : null,
      authorName: data.authorName != null && data.authorName !== '' ? data.authorName : null,
      // Lists: always send arrays; [] means "clear"
      relatedBlogs,
      images,
      tags,
    };

    const handleError = (error: any) => {
      if (error.isHandled) return;
      let message = 'Failed to save blog post';
      const responseData = error.response?.data;
      const err = responseData?.error;
      const fields = Array.isArray(err?.fields) ? err.fields : [];
      if (responseData) {
        if (fields.length > 0) {
          const messages = fields.map((f: any) => f.message || f).filter(Boolean);
          message = responseData.message && responseData.message !== 'Validation failed'
            ? responseData.message
            : messages.slice(0, 5).join(' • ').concat(messages.length > 5 ? ` (+${messages.length - 5} more)` : '');
          const known = ['title', 'excerpt', 'content', 'coverImage', 'category', 'readingTime', 'authorName', 'tags', 'images', 'relatedBlogs'];
          fields.forEach((f: any) => {
            const msg = f.message || '';
            let path: string | null = null;
            if (f.field && f.field !== 'unknown' && known.includes(f.field)) path = f.field;
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
        { id, data: payload },
        {
          onSuccess: () => {
            toast.success(
              targetStatus === "PUBLISHED"
                ? "Blog post saved & published successfully!"
                : "Blog post saved as draft successfully!"
            );
            updateStatusMutation.mutate(
              { id, status: targetStatus },
              { onError: () => {} }
            );
          },
          onError: handleError,
        }
      );
    } else {
      createMutation.mutate(payload as any, {
        onSuccess: (created) => {
          updateStatusMutation.mutate(
            { id: created.id, status: targetStatus },
            {
              onSuccess: () => {
                toast.success(
                  targetStatus === "PUBLISHED"
                    ? "Blog post created & published successfully!"
                    : "Blog post created as draft successfully!"
                );
                navigate("/admin/blog");
              },
              onError: () => {
                toast.success("Blog post created.");
                navigate("/admin/blog");
              },
            }
          );
        },
        onError: handleError,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader />
          <span>Loading blog post...</span>
        </div>
      </div>
    );
  }

  const blogTitle = form.watch('title');

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Main Form */}
        <div className="flex-1 space-y-6 pb-48">
          {/* Page Header with Buttons (shown when not scrolled) */}
          <div className={`mb-6 transition-opacity duration-300 ${isScrolled ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : 'opacity-100'}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate('/admin/blog')}
                  className="h-10 w-10 rounded-lg border-border bg-card hover:bg-muted"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
              <h1 className="text-2xl font-bold text-foreground break-all">
                    {isEditMode ? `Edit ${blogTitle || 'Blog Post'}` : 'Create New Blog Post'}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isEditMode ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                    {isEditMode ? 'Editing existing post' : 'Draft Mode - Fill in the details below'}
                  </p>
                </div>
              </div>
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
          
          {/* Title only (shown when scrolled) */}
          <div className={`mb-6 transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 overflow-hidden'}`}>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isEditMode ? `Edit ${blogTitle || 'Blog Post'}` : 'Create New Blog Post'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isEditMode ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                {isEditMode ? 'Editing existing post' : 'Draft Mode - Fill in the details below'}
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
                  <Label className="text-sm font-semibold text-foreground">Blog Title <span className="text-destructive">*</span></Label>
                  <span className="text-xs text-muted-foreground">
                    {form.watch('title')?.length || 0}/100
                  </span>
                </div>
                <Input
                  {...form.register('title', { 
                    required: 'Blog title is required',
                    maxLength: { value: 100, message: 'Blog title must be 100 characters or less' }
                  })}
                  placeholder="e.g., Top 10 Things to Do in Sri Lanka"
                  maxLength={100}
                  className={`h-12 text-base bg-background border-2 focus:ring-1 focus:ring-primary overflow-hidden text-ellipsis whitespace-nowrap ${
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
                  <Label className="text-sm font-semibold text-foreground">Excerpt <span className="text-destructive">*</span></Label>
                  <span className="text-xs text-muted-foreground">
                   {form.watch('excerpt')?.length || 0}/160
                  </span>
                </div>
                <Input
                  {...form.register('excerpt', { 
                    required: 'Excerpt is required',
                    maxLength: { value: 160, message: 'Excerpt must be 160 characters or less' }
                  })}
                  placeholder="Short summary of the post"
                  maxLength={160}
                  className={`h-12 text-base bg-background border-2 focus:ring-1 focus:ring-primary overflow-hidden text-ellipsis whitespace-nowrap ${
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
                <p className="text-xs text-muted-foreground">A brief description that appears in previews and search results</p>
              </div>

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

              {/* Category, Reading Time, Author Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Category <span className="text-destructive">*</span></Label>
                  <Controller
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-11 bg-background border-border">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Travel Guide">Travel Guide</SelectItem>
                          <SelectItem value="Tips & Tricks">Tips & Tricks</SelectItem>
                          <SelectItem value="Culture">Culture</SelectItem>
                          <SelectItem value="Food">Food</SelectItem>
                          <SelectItem value="News">News</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-foreground">Reading Time</Label>
                    <span className="text-xs text-muted-foreground">
                      {form.watch('readingTime')?.length || 0}/2
                    </span>
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      {...form.register('readingTime', {
                        maxLength: { value: 2, message: 'Reading time cannot exceed 2 characters (e.g. 5 or 12)' },
                      })}
                      placeholder="e.g., 5"
                      maxLength={2}
                      inputMode="numeric"
                      className="h-11 pl-10 bg-background border-border focus:border-primary overflow-hidden text-ellipsis whitespace-nowrap"
                    />
                  </div>
                  {form.formState.errors.readingTime && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <span className="text-xs">●</span> {String(form.formState.errors.readingTime.message)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Author Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      {...form.register('authorName')}
                      placeholder="e.g., Travel Connection"
                      className="h-11 pl-10 bg-background border-border focus:border-primary overflow-hidden text-ellipsis whitespace-nowrap"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Content */}
          <Card id="content" className={`border-2 bg-card shadow-sm ${
            form.formState.errors.content 
              ? 'border-destructive' 
              : 'border-border'
          }`}>
            <CardHeader className="border-b border-border bg-muted/30 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                Blog Content
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Content <span className="text-destructive">*</span></Label>
                <Controller
                  control={form.control}
                  name="content"
                  rules={{ 
                    required: 'Blog content is required',
                    minLength: { value: 10, message: 'Content must be at least 10 characters' }
                  }}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder="Write your blog content here..."
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
                <p className="text-xs text-muted-foreground">The main content of your blog post</p>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Metadata & SEO */}
          <Card id="metadata" className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                Metadata & SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
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

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Additional Images</Label>
                <Controller
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <ImagesArrayInput value={field.value} onChange={field.onChange} />
                  )}
                />
                <p className="text-xs text-muted-foreground">Upload additional images used in the blog post (supports multiple files)</p>
              </div>

              {/* <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Related Blogs</Label>
                <Controller
                  control={form.control}
                  name="relatedBlogs"
                  render={({ field }) => (
                    <RelatedBlogsInput value={field.value} onChange={field.onChange} />
                  )}
                />
                <p className="text-xs text-muted-foreground">Add blog IDs of related posts to show at the end of this article</p>
              </div> */}
            </CardContent>
          </Card>

          {/* Floating Action Buttons at Bottom (shown when scrolled) */}
          <div className={`sticky bottom-0 z-40 bg-muted/95 backdrop-blur-md border-t border-border py-4 -mx-6 px-6 mt-8 shadow-lg transition-all duration-300 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}>
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/blog')}
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
                    Compelling stories and beautiful images help inspire travelers to visit your destinations.
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