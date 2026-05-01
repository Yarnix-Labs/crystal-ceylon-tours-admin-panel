import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Star, Upload, CheckCircle2, MessageSquare, User, Mail, Send, Camera, MapPin, Globe, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { reviewService, type CreateReviewPayload } from "@/admin/services/reviewService";
import { storageService } from "@/admin/services/storageService";
import logo from "@/assets/logo-png.png";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  rating: z.number().min(1, "Please select a rating").max(5),
  title: z.string().min(3, "Title must be at least 3 characters"),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
});

const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent!"];

export default function SubmitReview() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", rating: 0, title: "", comment: "" },
  });

  const currentRating = form.watch("rating");
  const displayRating = hoverRating || currentRating;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const payload: CreateReviewPayload = { ...(values as CreateReviewPayload) };
      
      if (selectedFile) {
        const imageUrl = await storageService.uploadProfile(selectedFile);
        payload.imageUrl = imageUrl;
      }

      await reviewService.create(payload);
      setIsSubmitted(true);
      toast.success("Review submitted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #fffbf0 0%, #fff8e7 50%, #fef3cd 100%)" }}>
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="max-w-md w-full">
          <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-[#fbb03b]/20">
            <div className="bg-gradient-to-r from-[#fbb03b] to-[#f7931e] p-10 flex flex-col items-center gap-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
                className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
                <CheckCircle2 className="w-14 h-14 text-[#fbb03b]" />
              </motion.div>
              <h2 className="text-3xl font-black text-white tracking-tight">Thank You!</h2>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-white text-white opacity-80" />)}
              </div>
            </div>
            <div className="p-8 text-center space-y-4">
              <p className="text-gray-500 leading-relaxed">Your review has been submitted and will be published shortly. We truly appreciate your valuable feedback!</p>
              <Button onClick={() => window.location.reload()} className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-[#fbb03b] to-[#f7931e] text-white hover:opacity-90 shadow-lg">
                Submit Another Review
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 relative overflow-hidden font-sans" style={{ background: "linear-gradient(160deg, #fffbf0 0%, #fff8e7 60%, #fef3cd 100%)" }}>
      {/* Decorative background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #fbb03b 0%, transparent 70%)" }} />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #f7931e 0%, transparent 70%)" }} />
        {/* Subtle dotted pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#f7931e 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      <div className="max-w-2xl mx-auto relative">
        {/* Brand header */}
        <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur px-5 py-2.5 rounded-full shadow-md border border-[#fbb03b]/30 mb-6">
            <img src={logo} alt="Logo" className="h-8 w-8 object-cover rounded-full" />
            <span className="font-bold text-gray-800 text-sm tracking-wide">Crystal Ceylon Tours</span>
            <Globe className="w-4 h-4 text-[#fbb03b]" />
          </div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight tracking-tight">
            Share Your{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#f7931e]">Experience</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#fbb03b]/20 rounded-full -z-0" />
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-3 text-gray-500 text-base max-w-md mx-auto leading-relaxed">
            Your story inspires fellow travelers. Tell us about your journey with us!
          </motion.p>
        </motion.div>

        {/* Main form card */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-2xl border border-[#fbb03b]/15 overflow-hidden">
            {/* Top accent stripe */}
            <div className="h-1.5 bg-gradient-to-r from-[#fbb03b] via-[#f7931e] to-[#fbb03b]" />

            {/* Profile image section — the hero of the form */}
            <div className="bg-gradient-to-br from-[#fbb03b]/10 to-[#f7931e]/10 px-8 pt-8 pb-6 flex flex-col items-center gap-3 border-b border-[#fbb03b]/10">
              <div className="relative group cursor-pointer" onClick={() => document.getElementById("profile-upload")?.click()}>
                <div className={cn(
                  "w-28 h-28 rounded-full overflow-hidden shadow-xl ring-4 transition-all duration-300",
                  profileImage ? "ring-[#fbb03b]" : "ring-white"
                )}>
                  {profileImage ? (
                    <img src={profileImage} alt="Your photo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#fbb03b]/20 to-[#f7931e]/30 flex items-center justify-center">
                      <User className="w-12 h-12 text-[#fbb03b]/60" />
                    </div>
                  )}
                </div>
                {/* Camera badge */}
                <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-gradient-to-br from-[#fbb03b] to-[#f7931e] rounded-full flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">Add Your Photo</p>
                <p className="text-xs text-gray-400">Makes your review more personal</p>
              </div>
              <input id="profile-upload" type="file" className="hidden" accept="image/*" onChange={handleProfileImageChange} />
            </div>

            <div className="p-8 sm:p-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
                  {/* Star Rating — centrepiece */}
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem className="text-center space-y-3">
                        <FormLabel className="text-base font-semibold text-gray-700 flex items-center justify-center gap-2">
                          <Compass className="w-4 h-4 text-[#fbb03b]" /> How was your trip with us?
                        </FormLabel>
                        <FormControl>
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex justify-center gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <motion.button
                                  key={star}
                                  type="button"
                                  whileHover={{ scale: 1.25, rotate: star % 2 === 0 ? 5 : -5 }}
                                  whileTap={{ scale: 0.85 }}
                                  onMouseEnter={() => setHoverRating(star)}
                                  onMouseLeave={() => setHoverRating(0)}
                                  onClick={() => field.onChange(star)}
                                  className="focus:outline-none"
                                >
                                  <Star className={cn(
                                    "w-11 h-11 transition-all duration-200 drop-shadow-sm",
                                    displayRating >= star
                                      ? "fill-[#fbb03b] text-[#fbb03b] drop-shadow-[0_2px_6px_rgba(251,176,59,0.5)]"
                                      : "text-gray-200 fill-gray-100"
                                  )} />
                                </motion.button>
                              ))}
                            </div>
                            <AnimatePresence mode="wait">
                              {displayRating > 0 && (
                                <motion.span
                                  key={displayRating}
                                  initial={{ opacity: 0, y: -6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 6 }}
                                  className="text-sm font-bold text-[#f7931e] bg-[#fbb03b]/10 px-4 py-1 rounded-full"
                                >
                                  {ratingLabels[displayRating]}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#fbb03b]/20" />
                    <MapPin className="w-4 h-4 text-[#fbb03b]/50" />
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#fbb03b]/20" />
                  </div>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#fbb03b]" /> Full Name
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Your name"
                                {...field}
                                className="h-12 pl-4 border-gray-200 focus:ring-2 focus:ring-[#fbb03b]/30 focus:border-[#fbb03b] rounded-xl bg-gray-50/50 text-gray-800 placeholder:text-gray-400 transition-all"
                              />
                            </div>
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
                          <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-[#fbb03b]" /> Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="your@email.com"
                              {...field}
                              className="h-12 pl-4 border-gray-200 focus:ring-2 focus:ring-[#fbb03b]/30 focus:border-[#fbb03b] rounded-xl bg-gray-50/50 text-gray-800 placeholder:text-gray-400 transition-all"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Review Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#fbb03b]" /> Review Headline
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Unforgettable Sri Lankan adventure!"
                            {...field}
                            className="h-12 pl-4 border-gray-200 focus:ring-2 focus:ring-[#fbb03b]/30 focus:border-[#fbb03b] rounded-xl bg-gray-50/50 text-gray-800 placeholder:text-gray-400 transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Comment */}
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-[#fbb03b]" /> Your Story
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What made this trip special? Share your highlights, favourite moments, the hospitality, the landscapes..."
                            className="min-h-[140px] border-gray-200 focus:ring-2 focus:ring-[#fbb03b]/30 focus:border-[#fbb03b] rounded-2xl p-4 resize-none bg-gray-50/50 text-gray-800 placeholder:text-gray-400 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 text-base font-black rounded-2xl shadow-xl gap-2.5 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed border-0"
                    style={{ background: "linear-gradient(135deg, #fbb03b 0%, #f7931e 100%)" }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                        Submitting...
                      </span>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit My Review
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 text-center text-gray-400 text-xs space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-[#fbb03b]/70">
            <Star className="w-3 h-3 fill-current" />
            <span className="font-semibold text-gray-500">Trusted by 500+ happy travellers</span>
            <Star className="w-3 h-3 fill-current" />
          </div>
          <p>© {new Date().getFullYear()} Crystal Ceylon Tours. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}