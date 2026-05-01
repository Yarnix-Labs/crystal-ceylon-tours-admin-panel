import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Trash2, Save, Eye, Upload, ArrowLeft, Star, User, Mail, FileText
} from 'lucide-react';
import { Loader, ButtonLoader } from '@/admin/components/ui/Loader';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useReview, useReviewMutations } from '@/hooks/useAdminData';
import { storageService } from '@/admin/services/storageService';
import { cn } from '@/lib/utils';

export default function CustomerReviewForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id && id !== 'new');

  const [activeSection, setActiveSection] = useState('basic');

  const { data: review, isLoading: loading } = useReview(id);
  const { createMutation, updateMutation } = useReviewMutations();
  const saving = createMutation.isPending || updateMutation.isPending;

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      rating: 5,
      title: '',
      comment: '',
      imageUrl: ''
    },
    mode: 'onBlur'
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const TITLE_MAX = 100;
  const COMMENT_MAX = 1000;
  const titleValue = form.watch('title') ?? '';
  const commentValue = form.watch('comment') ?? '';

  useEffect(() => {
    if (review) {
      form.reset({
        name: review.name || review.customerName || '',
        email: review.email || review.customerEmail || '',
        rating: review.rating ?? 5,
        title: review.title || '',
        comment: review.comment || '',
        imageUrl: review.imageUrl || ''
      });
      setImagePreview(review.imageUrl || null);
    }
  }, [review, form]);

  const sections = [
    { id: 'basic', label: 'Customer Details' },
    { id: 'content', label: 'Review Content' }
  ];

  const validateForm = (data: { name: string; email: string; rating: number; title: string; comment: string; imageUrl?: string }) => {
    const errors: string[] = [];
    
    if (!data.name?.trim()) {
      errors.push('Customer name is required');
    }
    
    if (!data.email?.trim()) {
      errors.push('Email address is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      errors.push('Rating must be between 1 and 5 stars');
    }
    
    if (!data.title?.trim()) {
      errors.push('Review title is required');
    } else if (data.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters');
    }
    
    if (!data.comment?.trim()) {
      errors.push('Review comment is required');
    } else if (data.comment.trim().length < 10) {
      errors.push('Comment must be at least 10 characters');
    }
    
    return errors;
  };

  const onSubmit = async (data: { name: string; email: string; rating: number; title: string; comment: string; imageUrl?: string }) => {
    const errors = validateForm(data);
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }
    
    const payload: any = {
      name: data.name.trim(),
      email: data.email.trim(),
      rating: Number(data.rating),
      title: data.title.trim(),
      comment: data.comment.trim(),
      imageUrl: data.imageUrl
    };

    if (selectedFile) {
      try {
        const uploadedUrl = await storageService.uploadProfile(selectedFile);
        payload.imageUrl = uploadedUrl;
      } catch (error) {
        toast.error('Failed to upload image');
        return;
      }
    }

    if (isEditMode && id) {
      updateMutation.mutate(
        { id, data: payload },
        {
          onSuccess: () => navigate('/admin/reviews'),
          onError: () => toast.error('Failed to update review')
        }
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => navigate('/admin/reviews'),
      onError: () => toast.error('Failed to create review')
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader />
          <span>Loading review...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Main Form */}
        <div className="flex-1 space-y-6 pb-48">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => navigate('/admin/reviews')}
                className="h-10 w-10 rounded-lg border-border bg-card hover:bg-muted"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {isEditMode ? 'Edit Review' : 'Create New Review'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isEditMode ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                  {isEditMode ? 'Update customer testimonial' : 'Add a new customer review'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={form.handleSubmit(onSubmit)} 
                className="gap-2 h-10 px-5 bg-primary hover:bg-primary/90 shadow-md"
                disabled={saving}
              >
                <ButtonLoader loading={saving}>
                  <Save className="w-4 h-4" /> {isEditMode ? 'Update' : 'Save'} Review
                </ButtonLoader>
              </Button>
            </div>
          </div>

          {/* Section 1: Customer Details */}
          <Card id="basic" className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-2">
                <div className="relative group">
                  <div className={cn(
                    "w-24 h-24 rounded-full overflow-hidden border-2 transition-all duration-300 bg-muted/50 flex items-center justify-center",
                    imagePreview ? "border-primary" : "border-dashed border-border"
                  )}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-muted-foreground/50" />
                    )}
                  </div>
                  <label 
                    htmlFor="profile-upload" 
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform"
                  >
                    <Upload className="w-4 h-4" />
                    <input 
                      id="profile-upload" 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => setImagePreview(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <h4 className="text-sm font-semibold">Customer Photo</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Upload a profile picture for the reviewer. This makes the testimonial more authentic and visually appealing.
                  </p>
                  {imagePreview && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 mt-1"
                      onClick={() => {
                        setSelectedFile(null);
                        setImagePreview(null);
                        form.setValue('imageUrl', '');
                      }}
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Remove Photo
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">
                    Customer Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      {...form.register('name', { 
                        required: 'Customer name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                      })} 
                      className={`h-11 pl-10 bg-background border focus:border-primary ${
                        form.formState.errors.name ? 'border-destructive focus:border-destructive' : 'border-border'
                      }`} 
                      placeholder="e.g., John Doe" 
                    />
                  </div>
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span className="inline-block">•</span> {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      {...form.register('email', { 
                        required: 'Email address is required',
                        pattern: { 
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
                          message: 'Please enter a valid email address' 
                        }
                      })} 
                      type="email"
                      className={`h-11 pl-10 bg-background border focus:border-primary ${
                        form.formState.errors.email ? 'border-destructive focus:border-destructive' : 'border-border'
                      }`} 
                      placeholder="e.g., john.doe@example.com" 
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span className="inline-block">•</span> {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Review Content */}
          <Card id="content" className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                Review Content
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Rating Stars */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">
                  Rating <span className="text-destructive">*</span>
                </Label>
                <Controller 
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          className="p-1 hover:scale-110 transition-transform focus:outline-none"
                        >
                          <Star 
                            className={`w-8 h-8 ${
                              star <= field.value 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'fill-muted text-muted'
                            }`} 
                          />
                        </button>
                      ))}
                      <span className="ml-3 text-sm font-medium text-muted-foreground">
                        {field.value} out of 5 stars
                      </span>
                    </div>
                  )}
                />
              </div>

              {/* Review Title */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">
                  Review Title <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Textarea
                    {...form.register('title', { 
                      required: 'Review title is required',
                      minLength: { value: 3, message: 'Title must be at least 3 characters' },
                      maxLength: { value: TITLE_MAX, message: `Title must be less than ${TITLE_MAX} characters` }
                    })} 
                    rows={2}
                    className={`pl-10 bg-background border focus:border-primary resize-none ${
                      form.formState.errors.title ? 'border-destructive focus:border-destructive' : 'border-border'
                    }`}
                    placeholder="e.g., Unforgettable Journey!"
                    maxLength={TITLE_MAX}
                  />
                </div>
                <div className="flex items-center justify-between">
                  {form.formState.errors.title ? (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span className="inline-block">•</span> {form.formState.errors.title.message}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">A catchy headline that summarizes the review</p>
                  )}
                  <span className={`text-xs tabular-nums shrink-0 ml-2 ${
                    titleValue.length >= TITLE_MAX
                      ? 'text-destructive font-semibold'
                      : titleValue.length >= TITLE_MAX * 0.8
                      ? 'text-amber-500'
                      : 'text-muted-foreground'
                  }`}>
                    {titleValue.length}/{TITLE_MAX}
                  </span>
                </div>
              </div>

              {/* Review Comment */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">
                  Review Comment <span className="text-destructive">*</span>
                </Label>
                <Textarea 
                  {...form.register('comment', { 
                    required: 'Review comment is required',
                    minLength: { value: 10, message: 'Comment must be at least 10 characters' },
                    maxLength: { value: COMMENT_MAX, message: `Comment must be less than ${COMMENT_MAX} characters` }
                  })} 
                  placeholder="Enter the customer's detailed review here..." 
                  className={`min-h-[180px] text-base bg-background border focus:border-primary resize-y ${
                    form.formState.errors.comment ? 'border-destructive focus:border-destructive' : 'border-border'
                  }`}
                  maxLength={COMMENT_MAX}
                />
                <div className="flex items-center justify-between">
                  {form.formState.errors.comment ? (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span className="inline-block">•</span> {form.formState.errors.comment.message}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">The detailed feedback from the customer</p>
                  )}
                  <span className={`text-xs tabular-nums shrink-0 ml-2 ${
                    commentValue.length >= COMMENT_MAX
                      ? 'text-destructive font-semibold'
                      : commentValue.length >= COMMENT_MAX * 0.8
                      ? 'text-amber-500'
                      : 'text-muted-foreground'
                  }`}>
                    {commentValue.length}/{COMMENT_MAX}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Navigation */}
        <div className="hidden lg:block w-64 sticky top-24 h-fit">
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 py-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Quick Navigation
              </CardTitle>
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 ease-out ${
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground font-medium shadow-sm scale-[1.02] translate-x-1'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-0.5'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-md text-xs flex items-center justify-center font-bold transition-all duration-300 ${
                    activeSection === section.id 
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
                <span className="text-lg">⭐</span>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Review Tips</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Authentic customer reviews help build trust and showcase your excellent service.
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