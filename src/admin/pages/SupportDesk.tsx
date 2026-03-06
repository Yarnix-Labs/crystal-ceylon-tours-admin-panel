import { useState } from "react";
import { AdminPageHeader } from "@/admin/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
    Send, 
    Mail, 
    Loader2, 
    Phone, 
    MapPin, 
    Clock, 
    Globe, 
    MessageSquare,
    HelpCircle,
    FileText
} from "lucide-react";
import { toast } from "sonner";
import { contactSupportService } from "@/admin/services/contactSupportService";

export default function SupportDesk() {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!subject.trim() || !message.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await contactSupportService.create({
                subject: subject.trim(),
                message: message.trim(),
            });
            
            if (response.success) {
                toast.success(response.message || "Support email sent successfully");
                setSubject("");
                setMessage("");
            } else {
                toast.error("Failed to send support request");
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to send support request";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className="flex flex-col gap-2">
                <AdminPageHeader
                    heading="Support Center"
                    description="Get help with technical issues, report bugs, or request new features."
                />
            </div>

            <div className="grid gap-8 lg:grid-cols-3 items-start">
                {/* Main Content - Contact Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border/50 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                        <CardHeader className="pb-4 border-b border-border/5">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl ring-1 ring-primary/20">
                                    <Mail className="h-6 w-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold tracking-tight">Contact Development Team</CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground/90 leading-normal">
                                        Fill out the form below to open a direct line with our engineering team. We typically respond within 24 hours.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-sm font-medium text-foreground flex items-center gap-2">
                                            Subject <span className="text-destructive">*</span>
                                        </label>
                                        <Input
                                            id="subject"
                                            placeholder="What can we help you with?"
                                            className="h-12 bg-background/50 border-input/60 focus:bg-background transition-all"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-medium text-foreground flex items-center gap-2">
                                            Message <span className="text-destructive">*</span>
                                        </label>
                                        <Textarea
                                            id="message"
                                            placeholder="Please describe the issue in detail..."
                                            className="min-h-[250px] resize-y bg-background/50 border-input/60 focus:bg-background transition-all leading-relaxed p-4"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button 
                                        type="submit" 
                                        size="lg"
                                        className="w-full sm:w-auto min-w-[180px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold"
                                        disabled={isSubmitting || !subject.trim() || !message.trim()}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Sending Request...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-5 w-5" />
                                                Submit Request
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Contact Info */}
                <div className="space-y-6 sticky top-6">
                    <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-primary/90 text-primary-foreground overflow-hidden relative group">
                         <div className="absolute top-0 right-0 p-16 bg-white/10 rounded-full -mr-10 -mt-10 backdrop-blur-3xl transition-transform duration-500 group-hover:scale-110" />
                         <div className="absolute bottom-0 left-0 p-12 bg-black/5 rounded-full -ml-6 -mb-6 backdrop-blur-3xl" />
                         
                        <CardHeader className="relative z-10 pb-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 opacity-80" />
                                Contact Info
                            </CardTitle>
                            <CardDescription className="text-primary-foreground/90 font-medium">
                                Direct channels for urgent matters.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 relative z-10">
                            <div className="flex items-start gap-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-semibold text-sm opacity-90">Email Support</p>
                                    <p className="text-sm font-medium hover:underline cursor-pointer">yarnixlabs@gmail.com</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold text-sm opacity-90">Emergency Hotline</p>
                                    <p className="text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer">+94 77 166 2008</p>
                                    <p className="text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer">+94 77 876 5269</p>
                                    <p className="text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer">+94 74 024 6010</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Globe className="h-5 w-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-semibold text-sm opacity-90">Developer Site</p>
                                    <p className="text-sm font-medium hover:underline cursor-pointer">www.yarnixlabs.com</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-md bg-card/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                Support Hours
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm py-2 border-b border-border/50 last:border-0 last:pb-0">
                                <span className="text-muted-foreground">Mon - Fri</span>
                                <span className="font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">9:00 AM - 6:00 PM</span>
                            </div>
                            <div className="flex justify-between items-center text-sm py-2 border-b border-border/50 last:border-0 last:pb-0">
                                <span className="text-muted-foreground">Saturday</span>
                                <span className="font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs">10:00 AM - 4:00 PM</span>
                            </div>
                            <div className="flex justify-between items-center text-sm pt-2">
                                <span className="text-muted-foreground">Sunday</span>
                                <span className="font-semibold text-destructive flex items-center gap-1 text-xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                                    Closed
                                </span>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/30 p-3 rounded-b-xl border-t border-border/10">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground w-full justify-center">
                                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="font-medium text-center">223/1 Welivita, Kaduwela, Sri Lanka</span>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
