import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Star, Upload, CheckCircle2, MessageSquare, User, Mail, Send, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { reviewService, type CreateReviewPayload } from "@/admin/services/reviewService";
import logo from "@/assets/logo.jpeg";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  rating: z.number().min(1, "Please select a rating").max(5),
  title: z.string().min(3, "Title must be at least 3 characters"),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
});

export default function SubmitReview() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      rating: 0,
      title: "",
      comment: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await reviewService.create(values as CreateReviewPayload);
      setIsSubmitted(true);
      toast.success("Review submitted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#fcf8f1] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="border-none shadow-2xl bg-white overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-[#fbb03b] to-[#f7931e]" />
            <CardContent className="pt-12 pb-10 px-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">Thank You!</h2>
                <p className="text-gray-500">Your review has been submitted and will be published shortly. We appreciate your feedback!</p>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4 border-[#fbb03b] text-[#fbb03b] hover:bg-[#fbb03b] hover:text-white"
                onClick={() => window.location.reload()}
              >
                Submit Another Review
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8f1] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-white p-2 rounded-2xl shadow-lg border border-[#fbb03b]/20">
              <img src={logo} alt="Logo" className="h-16 w-16 object-cover rounded-xl" />
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl"
          >
            Share Your <span className="text-[#fbb03b]">Experience</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600 max-w-xl mx-auto"
          >
            Your feedback helps us grow and provides valuable insights for other travelers. Tell us about your journey!
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-3xl">
            <div className="h-2 bg-gradient-to-r from-[#fbb03b] to-[#f7931e]" />
            <CardContent className="p-8 sm:p-12">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Rating Stars */}
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem className="text-center space-y-4">
                        <FormLabel className="text-lg font-semibold text-gray-700">How would you rate your trip?</FormLabel>
                        <FormControl>
                          <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <motion.button
                                key={star}
                                type="button"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => field.onChange(star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={cn(
                                    "w-12 h-12 transition-colors duration-200",
                                    (hoverRating || field.value) >= star
                                      ? "fill-[#fbb03b] text-[#fbb03b]"
                                      : "text-gray-200 fill-transparent"
                                  )}
                                />
                              </motion.button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#fbb03b]" /> Full Name
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your name" {...field} className="h-12 border-gray-200 focus:ring-[#fbb03b] focus:border-[#fbb03b] rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-[#fbb03b]" /> Email Address
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email" {...field} className="h-12 border-gray-200 focus:ring-[#fbb03b] focus:border-[#fbb03b] rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#fbb03b]" /> Review Title
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Unforgettable Safari Experience" {...field} className="h-12 border-gray-200 focus:ring-[#fbb03b] focus:border-[#fbb03b] rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-[#fbb03b]" /> Your Message
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about the highlights of your trip, the service, and any special moments..." 
                            className="min-h-[160px] border-gray-200 focus:ring-[#fbb03b] focus:border-[#fbb03b] rounded-2xl p-4 resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Optional Image Upload Placeholder */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Camera className="w-4 h-4 text-[#fbb03b]" /> Photos (Optional)
                    </label>
                    <div 
                      className={cn(
                        "border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden relative group",
                        previewImage ? "border-[#fbb03b] bg-[#fbb03b]/5" : "border-gray-200 hover:border-[#fbb03b] hover:bg-gray-50"
                      )}
                      onClick={() => document.getElementById("image-upload")?.click()}
                    >
                      {previewImage ? (
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                          <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white font-medium">Change Photo</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#fbb03b]/10 group-hover:text-[#fbb03b] transition-colors">
                            <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#fbb03b]" />
                          </div>
                          <p className="text-sm font-semibold text-gray-700">Click or drag to upload photos</p>
                          <p className="text-xs text-gray-400 mt-1">Capture your best moments (JPG, PNG)</p>
                        </>
                      )}
                      <input 
                        id="image-upload" 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#fbb03b] to-[#f7931e] hover:shadow-xl hover:scale-[1.01] transition-all duration-200 rounded-2xl shadow-lg gap-2 text-white"
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="w-5 h-5" /> Submit My Review
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Crystal Ceylon Tours. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

// Helper function for conditional class joining (usually in @/lib/utils)
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
