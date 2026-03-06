import { useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/admin/context/AdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Lock, User, KeyRound, Eye, EyeOff, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Loader, ButtonLoader } from "@/admin/components/ui/Loader";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetSent, setResetSent] = useState(false);
    const [emailError, setEmailError] = useState("");
    const { login, forgotPassword } = useAdminAuth();

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError("");
        
        if (!resetEmail.trim()) {
            setEmailError("Please enter your email address.");
            return;
        }
        
        if (!validateEmail(resetEmail.trim())) {
            setEmailError("Please enter a valid email address.");
            return;
        }
        
        setLoading(true);
        try {
            await forgotPassword(resetEmail.trim());
            setResetSent(true);
            toast.success("Password reset link sent to your email.");
        } catch (error) {
            // Error is handled in AdminAuth context
        } finally {
            setLoading(false);
        }
    };

    const handleResendResetLink = async () => {
        if (!resetEmail.trim()) {
            toast.error("Missing email address to resend link.");
            return;
        }
        
        setLoading(true);
        try {
            await forgotPassword(resetEmail.trim());
            toast.success("Reset link resent to your email.");
        } catch (error) {
            // Error is handled in AdminAuth context
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        setShowForgotPassword(false);
        setResetSent(false);
        setResetEmail("");
        setEmailError("");
    };

    const handleForgotPasswordClick = () => {
        setShowForgotPassword(true);
        setResetEmail(email);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ backgroundColor: '#2f3541' }}>
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10" style={{ backgroundColor: '#209aa0' }}></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: '#209aa0' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-5" style={{ backgroundColor: '#209aa0' }}></div>
            </div>

            <Card className="w-full max-w-md shadow-2xl border-0 relative z-10 bg-white dark:bg-gray-800">
                {!showForgotPassword ? (
                    // Login Form
                    <>
                        <CardHeader className="text-center space-y-3 pb-6 pt-8">
                            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-2 shadow-lg" style={{ backgroundColor: '#209aa0' }}>
                                <Lock className="w-8 h-8 text-white" />
                            </div>
                            <CardTitle className="text-3xl font-bold tracking-tight" style={{ color: '#2f3541' }}>
                                Admin Portal
                            </CardTitle>
                            <CardDescription className="text-base">
                                Enter your credentials to access the dashboard
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-5 px-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium" style={{ color: '#2f3541' }}>
                                        Email
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-12 pl-11 border-2 focus:border-[#209aa0] focus:border-opacity-100 transition-all"
                                            style={{ 
                                                borderColor: '#e5e7eb'
                                            }}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium" style={{ color: '#2f3541' }}>
                                        Password
                                    </label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-12 pl-11 pr-11 border-2 focus:border-[#209aa0] focus:border-opacity-100 transition-all"
                                            style={{ 
                                                borderColor: '#e5e7eb'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleForgotPasswordClick}
                                            className="text-sm font-medium hover:underline transition-all"
                                            style={{ color: '#209aa0' }}
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="px-8 pb-8 pt-2">
                                <Button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] gap-2"
                                    style={{ 
                                        backgroundColor: '#209aa0',
                                        color: 'white'
                                    }}
                                >
                                    <ButtonLoader loading={loading}>
                                        Sign In
                                    </ButtonLoader>
                                </Button>
                            </CardFooter>
                        </form>
                    </>
                ) : (
                    // Forgot Password Form
                    <>
                        <CardHeader className="text-center space-y-3 pb-6 pt-8">
                            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-2 shadow-lg" style={{ backgroundColor: '#209aa0' }}>
                                <Mail className="w-8 h-8 text-white" />
                            </div>
                            <CardTitle className="text-3xl font-bold tracking-tight" style={{ color: '#2f3541' }}>
                                {resetSent ? "Check Your Email" : "Reset Password"}
                            </CardTitle>
                            <CardDescription className="text-base">
                                {resetSent 
                                    ? "We've sent password reset instructions to your email"
                                    : "Enter your email to receive reset instructions"
                                }
                            </CardDescription>
                        </CardHeader>
                        
                        {!resetSent ? (
                            <form onSubmit={handleResetPassword}>
                                <CardContent className="space-y-5 px-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium" style={{ color: '#2f3541' }}>
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <Input
                                                type="email"
                                                placeholder="Enter your email"
                                                value={resetEmail}
                                                onChange={(e) => {
                                                    setResetEmail(e.target.value);
                                                    setEmailError("");
                                                }}
                                                className={`h-12 pl-11 border-2 focus:border-[#209aa0] focus:border-opacity-100 transition-all ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
                                                style={{ 
                                                    borderColor: emailError ? '#ef4444' : '#e5e7eb'
                                                }}
                                                autoFocus
                                            />
                                        </div>
                                        {emailError && (
                                            <p className="text-sm text-red-500 mt-1">{emailError}</p>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="px-8 pb-6 pt-2 flex-col gap-3">
                                    <Button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] gap-2"
                                        style={{ 
                                            backgroundColor: '#209aa0',
                                            color: 'white'
                                        }}
                                    >
                                        <ButtonLoader loading={loading}>
                                            Send Reset Link
                                        </ButtonLoader>
                                    </Button>
                                    <Button 
                                        type="button"
                                        onClick={handleBackToLogin}
                                        variant="ghost"
                                        className="w-full h-12 text-base font-medium gap-2"
                                        style={{ color: '#2f3541' }}
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Login
                                    </Button>
                                </CardFooter>
                            </form>
                        ) : (
                            <CardContent className="px-8 pb-8">
                                <div className="space-y-4">
                                    <div className="flex flex-col items-center py-4">
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#d1fae5' }}>
                                            <CheckCircle className="w-8 h-8" style={{ color: '#059669' }} />
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdfa', borderLeft: '4px solid #209aa0' }}>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            We've sent a password reset link to <strong>{resetEmail}</strong>. 
                                            Please check your inbox and follow the instructions to reset your password.
                                        </p>
                                    </div>
                                    <div className="text-center text-sm text-gray-600">
                                        <p>Didn't receive the email?</p>
                                        <button 
                                            type="button"
                                            className="font-medium mt-1 hover:underline disabled:opacity-60"
                                            style={{ color: '#209aa0' }}
                                            onClick={handleResendResetLink}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Loader size="sm" />
                                                    Resending...
                                                </span>
                                            ) : "Resend reset link"}
                                        </button>
                                    </div>
                                    <Button 
                                        type="button"
                                        onClick={handleBackToLogin}
                                        variant="ghost"
                                        className="w-full h-12 text-base font-medium gap-2 mt-4"
                                        style={{ color: '#2f3541' }}
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Login
                                    </Button>
                                </div>
                            </CardContent>
                        )}
                    </>
                )}
            </Card>
        </div>
    );
};

export default AdminLogin;