import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Star, CheckCircle2, MessageSquare, User, Mail, Send,
  Camera, MapPin, Globe, Compass, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { toast } from "sonner";
import { reviewService, type CreateReviewPayload } from "@/admin/services/reviewService";
import { storageService } from "@/admin/services/storageService";
import logo from "@/assets/logo-png.png";

/* ─── schema ─────────────────────────────────────────── */
const formSchema = z.object({
  name:    z.string().min(2,  "Name must be at least 2 characters"),
  email:   z.string().email("Invalid email address"),
  rating:  z.number().min(1, "Please select a rating").max(5),
  title:   z.string().min(3,  "Title must be at least 3 characters"),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
});
type FormValues = z.infer<typeof formSchema>;

const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent!"];
const ratingEmojis = ["", "😕", "😐", "🙂", "😊", "🤩"];

/* ─── tiny cn util ────────────────────────────────────── */
function cn(...args: (string | boolean | undefined | null)[]) {
  return args.filter(Boolean).join(" ");
}

/* ─── Decorative wave SVG ─────────────────────────────── */
function WaveDivider() {
  return (
    <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none" style={{ height: 40, display: "block" }}>
      <path
        d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
        fill="url(#waveGrad)"
      />
      <defs>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#fbb03b" stopOpacity="0.18" />
          <stop offset="50%"  stopColor="#f7931e" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#fbb03b" stopOpacity="0.18" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── FloatingOrb ─────────────────────────────────────── */
function FloatingOrb({ className, style }: { className: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      className={cn("absolute rounded-full pointer-events-none", className)}
      style={style}
      animate={{ y: [0, -18, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ─── SuccessScreen ───────────────────────────────────── */
function SuccessScreen({ onReset }: { onReset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fffbf0]">
      {/* Confetti dots */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: i % 2 === 0 ? "#fbb03b" : "#f7931e",
            left: `${(i * 8.3) + 2}%`,
            top: "20%",
          }}
          animate={{ y: [0, 400], opacity: [1, 0], rotate: [0, 360] }}
          transition={{ duration: 2 + i * 0.2, delay: i * 0.1, ease: "easeIn" }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#fbb03b]/20">
          <div
            className="p-10 flex flex-col items-center gap-4"
            style={{ background: "linear-gradient(135deg, #fbb03b 0%, #f7931e 100%)" }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl"
            >
              <CheckCircle2 className="w-14 h-14 text-[#fbb03b]" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-black text-white tracking-tight"
            >
              Thank You!
            </motion.h2>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <motion.div key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 + s * 0.08 }}>
                  <Star className="w-6 h-6 fill-white text-white" />
                </motion.div>
              ))}
            </div>
          </div>
          <div className="p-8 text-center space-y-4">
            <p className="text-gray-500 leading-relaxed text-sm">
              Your review has been submitted and will be published shortly. We truly appreciate your valuable feedback!
            </p>
            <button
              onClick={onReset}
              className="w-full h-12 rounded-2xl font-bold text-white text-sm shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #fbb03b 0%, #f7931e 100%)" }}
            >
              Submit Another Review
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────── */
export default function SubmitReview() {
  const [isSubmitted,   setIsSubmitted]   = useState(false);
  const [hoverRating,   setHoverRating]   = useState(0);
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [profileImage,  setProfileImage]  = useState<string | null>(null);
  const [selectedFile,  setSelectedFile]  = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", rating: 0, title: "", comment: "" },
  });

  const currentRating = form.watch("rating");
  const displayRating = hoverRating || currentRating;

  const onSubmit = async (values: FormValues) => {
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

  if (isSubmitted) return <SuccessScreen onReset={() => { setIsSubmitted(false); form.reset(); }} />;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #fffdf7 0%, #fff8e7 55%, #fef3cd 100%)" }}
    >
      {/* ── Background ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <FloatingOrb className="w-96 h-96 -top-24 -right-24 opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #fbb03b, transparent 70%)" }} />
        <FloatingOrb className="w-72 h-72 -bottom-20 -left-20 opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #f7931e, transparent 70%)" }} />
        {/* dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(#f7931e 1.2px, transparent 1.2px)", backgroundSize: "24px 24px" }}
        />
      </div>

      <div className="relative max-w-lg mx-auto px-4 py-8 sm:py-12">

        {/* ── Brand header ── */}
        <motion.header
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          {/* Logo pill */}
          <div className="inline-flex items-center gap-2.5 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-[#fbb03b]/25 mb-6">
            <img
              src={logo}
              alt="Crystal Ceylon Tours"
              className="h-7 w-7 object-contain rounded-full"
            />
            <span className="font-bold text-gray-800 text-sm tracking-wide leading-none">
              Crystal Ceylon Tours
            </span>
            <Globe className="w-3.5 h-3.5 text-[#fbb03b]" />
          </div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-4xl sm:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Share Your{" "}
            <span className="relative inline-block">
              <span className="relative z-10" style={{ color: "#f7931e" }}>Adventure</span>
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 180 12"
                fill="none"
              >
                <path d="M2 8 Q45 2 90 8 Q135 14 178 8" stroke="#fbb03b" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"/>
              </svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-3 text-gray-500 text-sm sm:text-base max-w-xs mx-auto leading-relaxed"
          >
            Your story inspires fellow travellers. Tell us about your journey with us!
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-5 flex items-center justify-center gap-3 flex-wrap"
          >
            {["500+ Reviews", "Verified Trips", "Trusted Service"].map((badge, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#b97a1a] bg-[#fbb03b]/12 border border-[#fbb03b]/25 px-3 py-1 rounded-full"
              >
                <Sparkles className="w-3 h-3" /> {badge}
              </span>
            ))}
          </motion.div>
        </motion.header>

        {/* ── Card ── */}
        <motion.div
          initial={{ y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white/92 backdrop-blur-sm rounded-[2rem] shadow-[0_20px_80px_rgba(247,147,30,0.12)] border border-[#fbb03b]/15 overflow-hidden">
            {/* Top stripe */}
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #fbb03b, #f7931e, #fbb03b)" }} />

            {/* ── Avatar picker ── */}
            <div className="px-6 sm:px-8 pt-7 pb-5 flex flex-col items-center gap-2 bg-gradient-to-br from-[#fbb03b]/8 to-[#f7931e]/8">
              <label
                htmlFor="profile-upload"
                className="relative group cursor-pointer"
              >
                <div
                  className={cn(
                    "w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-xl transition-all duration-300 ring-[3px]",
                    profileImage ? "ring-[#fbb03b]" : "ring-white hover:ring-[#fbb03b]/50"
                  )}
                >
                  {profileImage ? (
                    <img src={profileImage} alt="Your photo" className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #ffeec8, #ffd98a)" }}
                    >
                      <User className="w-10 h-10 sm:w-12 sm:h-12 text-[#f7931e]/60" />
                    </div>
                  )}
                </div>
                {/* Camera badge */}
                <div
                  className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-110 transition-transform"
                  style={{ background: "linear-gradient(135deg, #fbb03b, #f7931e)" }}
                >
                  <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
              </label>
              <p className="text-xs text-gray-400 font-medium mt-1">Tap to add your photo</p>
              <input
                id="profile-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleProfileImageChange}
              />
            </div>

            {/* wave between sections */}
            <WaveDivider />

            {/* ── Form ── */}
            <div className="px-5 sm:px-8 pb-8 pt-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                  {/* ── Star Rating ── */}
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <div className="bg-gradient-to-br from-[#fffbf0] to-[#fff4d6] rounded-2xl p-5 text-center border border-[#fbb03b]/15">
                          <FormLabel className="text-sm font-bold text-gray-600 flex items-center justify-center gap-1.5 mb-4">
                            <Compass className="w-4 h-4 text-[#fbb03b]" />
                            How was your trip with us?
                          </FormLabel>
                          <FormControl>
                            <div className="flex flex-col items-center gap-3">
                              <div className="flex justify-center gap-1.5 sm:gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <motion.button
                                    key={star}
                                    type="button"
                                    whileHover={{ scale: 1.3, y: -4 }}
                                    whileTap={{ scale: 0.8 }}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onTouchStart={() => setHoverRating(star)}
                                    onClick={() => { field.onChange(star); setHoverRating(0); }}
                                    className="focus:outline-none touch-manipulation"
                                  >
                                    <Star
                                      className={cn(
                                        "w-10 h-10 sm:w-12 sm:h-12 transition-all duration-150",
                                        displayRating >= star
                                          ? "fill-[#fbb03b] text-[#fbb03b] drop-shadow-[0_3px_8px_rgba(251,176,59,0.55)]"
                                          : "text-gray-200 fill-gray-100"
                                      )}
                                    />
                                  </motion.button>
                                ))}
                              </div>
                              <AnimatePresence mode="wait">
                                {displayRating > 0 && (
                                  <motion.div
                                    key={displayRating}
                                    initial={{ opacity: 0, y: -6, scale: 0.85 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.85 }}
                                    className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-[#fbb03b]/20"
                                  >
                                    <span className="text-lg">{ratingEmojis[displayRating]}</span>
                                    <span className="text-sm font-bold text-[#f7931e]">
                                      {ratingLabels[displayRating]}
                                    </span>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </FormControl>
                          <FormMessage className="mt-2 text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Divider */}
                  <div className="flex items-center gap-3 -my-1">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#fbb03b]/25 to-transparent" />
                    <MapPin className="w-3.5 h-3.5 text-[#fbb03b]/50 flex-shrink-0" />
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#fbb03b]/25 to-transparent" />
                  </div>

                  {/* ── Name & Email ── */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] flex items-center gap-1.5 mb-1.5">
                            <User className="w-3 h-3 text-[#fbb03b]" /> Full Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your name"
                              {...field}
                              className="h-11 sm:h-12 pl-4 border-gray-200 focus:ring-2 focus:ring-[#fbb03b]/30 focus:border-[#fbb03b] rounded-xl bg-gray-50/60 text-gray-800 placeholder:text-gray-300 transition-all text-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs mt-1" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] flex items-center gap-1.5 mb-1.5">
                            <Mail className="w-3 h-3 text-[#fbb03b]" /> Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="your@email.com"
                              {...field}
                              className="h-11 sm:h-12 pl-4 border-gray-200 focus:ring-2 focus:ring-[#fbb03b]/30 focus:border-[#fbb03b] rounded-xl bg-gray-50/60 text-gray-800 placeholder:text-gray-300 transition-all text-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs mt-1" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* ── Title ── */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] flex items-center gap-1.5 mb-1.5">
                          <CheckCircle2 className="w-3 h-3 text-[#fbb03b]" /> Review Headline
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Unforgettable Sri Lankan adventure!"
                            {...field}
                            className="h-11 sm:h-12 pl-4 border-gray-200 focus:ring-2 focus:ring-[#fbb03b]/30 focus:border-[#fbb03b] rounded-xl bg-gray-50/60 text-gray-800 placeholder:text-gray-300 transition-all text-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-xs mt-1" />
                      </FormItem>
                    )}
                  />

                  {/* ── Comment ── */}
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] flex items-center gap-1.5 mb-1.5">
                          <MessageSquare className="w-3 h-3 text-[#fbb03b]" /> Your Story
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What made this trip special? Share your highlights, favourite moments, the hospitality, the landscapes..."
                            className="min-h-[130px] sm:min-h-[150px] border-gray-200 focus:ring-2 focus:ring-[#fbb03b]/30 focus:border-[#fbb03b] rounded-2xl p-4 resize-none bg-gray-50/60 text-gray-800 placeholder:text-gray-300 transition-all text-sm leading-relaxed"
                            {...field}
                          />
                        </FormControl>
                        {/* Character count hint */}
                        <div className="flex items-center justify-between mt-1">
                          <FormMessage className="text-xs" />
                          <span className="text-[10px] text-gray-300 ml-auto">
                            {field.value.length} chars
                          </span>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* ── Submit ── */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.97 } : {}}
                    className="w-full h-14 sm:h-[3.75rem] text-base font-black rounded-2xl shadow-xl text-white transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 border-0 outline-none focus:ring-2 focus:ring-[#fbb03b]/50"
                    style={{ background: "linear-gradient(135deg, #fbb03b 0%, #f7931e 100%)", boxShadow: "0 8px 32px rgba(247,147,30,0.32)" }}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                          className="w-5 h-5 border-[2.5px] border-white/30 border-t-white rounded-full"
                        />
                        <span>Submitting…</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit My Review
                      </>
                    )}
                  </motion.button>

                  {/* Privacy note */}
                  <p className="text-center text-[10px] text-gray-350 text-gray-400 leading-relaxed">
                    🔒 Your email is never shared publicly. Reviews are moderated before publishing.
                  </p>
                </form>
              </Form>
            </div>
          </div>
        </motion.div>

        {/* ── Footer ── */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-1.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className="w-3.5 h-3.5 fill-[#fbb03b] text-[#fbb03b]" />
            ))}
          </div>
          <p className="text-xs font-semibold text-gray-500">Trusted by 500+ happy travellers</p>
          <p className="text-[10px] text-gray-400">
            © {new Date().getFullYear()} Crystal Ceylon Tours. All rights reserved.
          </p>
        </motion.footer>
      </div>
    </div>
  );
}