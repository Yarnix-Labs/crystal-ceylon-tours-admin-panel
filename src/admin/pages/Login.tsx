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
        <div
            className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
            style={{ backgroundColor: '#dce8de' }}
        >
            {/* Background — amber wave bottom, blue accent top right, like the banner */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Top-right blue circle accent */}
                <div
                    className="absolute"
                    style={{
                        width: '340px',
                        height: '340px',
                        top: '-120px',
                        right: '-100px',
                        borderRadius: '50%',
                        backgroundColor: '#02aad7',
                        opacity: 0.12,
                    }}
                />
                <div
                    className="absolute"
                    style={{
                        width: '180px',
                        height: '180px',
                        top: '60px',
                        right: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#02aad7',
                        opacity: 0.07,
                    }}
                />
                {/* Bottom amber wave */}
                <svg
                    className="absolute bottom-0 left-0 w-full"
                    viewBox="0 0 1440 200"
                    preserveAspectRatio="none"
                    style={{ height: '180px' }}
                >
                    <path
                        d="M0,100 C240,180 480,20 720,100 C960,180 1200,20 1440,100 L1440,200 L0,200 Z"
                        fill="#fbb03b"
                        opacity="0.18"
                    />
                    <path
                        d="M0,130 C300,80 600,170 900,120 C1100,90 1300,150 1440,130 L1440,200 L0,200 Z"
                        fill="#fbb03b"
                        opacity="0.12"
                    />
                </svg>
                {/* Green small accent dot */}
                <div
                    className="absolute"
                    style={{
                        width: '90px',
                        height: '90px',
                        bottom: '120px',
                        right: '10%',
                        borderRadius: '50%',
                        backgroundColor: '#1c5e20',
                        opacity: 0.08,
                    }}
                />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Brand header above card */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">
                        <span style={{ color: '#02aad7' }}>Crystal </span>
                        <span style={{ color: '#fbb03b' }}>Ceylon Tours</span>
                    </h1>
                    <p className="text-sm mt-1 font-medium" style={{ color: '#1c5e20' }}>Admin Portal</p>
                </div>

                <Card className="w-full shadow-xl border-0 rounded-2xl bg-white overflow-hidden">
                    {/* Top border stripe in brand colors */}
                    <div className="h-1 w-full" style={{
                        background: 'linear-gradient(90deg, #1c5e20 0%, #02aad7 50%, #fbb03b 100%)'
                    }} />

                    {!showForgotPassword ? (
                        <>
                            <CardHeader className="text-center space-y-2 pb-4 pt-8">
                                <div
                                    className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-2 shadow-md"
                                    style={{ backgroundColor: '#02aad7' }}
                                >
                                    <Lock className="w-7 h-7 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-bold" style={{ color: '#1a3a1b' }}>
                                    Welcome Back
                                </CardTitle>
                                <CardDescription className="text-sm" style={{ color: '#6b7280' }}>
                                    Sign in to your admin dashboard
                                </CardDescription>
                            </CardHeader>

                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-4 px-8">
                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold" style={{ color: '#1a3a1b' }}>
                                            Email
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#02aad7' }} />
                                            <Input
                                                type="email"
                                                placeholder="Enter your email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="h-11 pl-10 border-2 rounded-xl transition-all text-sm"
                                                style={{ borderColor: '#e5e7eb', backgroundColor: '#fafafa' }}
                                                onFocus={(e) => e.currentTarget.style.borderColor = '#02aad7'}
                                                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold" style={{ color: '#1a3a1b' }}>
                                            Password
                                        </label>
                                        <div className="relative">
                                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#02aad7' }} />
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="h-11 pl-10 pr-11 border-2 rounded-xl transition-all text-sm"
                                                style={{ borderColor: '#e5e7eb', backgroundColor: '#fafafa' }}
                                                onFocus={(e) => e.currentTarget.style.borderColor = '#02aad7'}
                                                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={handleForgotPasswordClick}
                                                className="text-xs font-semibold hover:underline transition-all"
                                                style={{ color: '#02aad7' }}
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
                                        className="w-full h-11 text-sm font-bold rounded-xl gap-2 border-0 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                                        style={{
                                            backgroundColor: '#fbb03b',
                                            color: '#1a2e1b',
                                            boxShadow: '0 4px 14px rgba(251,176,59,0.35)',
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
                        <>
                            <CardHeader className="text-center space-y-2 pb-4 pt-8">
                                <div
                                    className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-2 shadow-md"
                                    style={{ backgroundColor: '#1c5e20' }}
                                >
                                    <Mail className="w-7 h-7 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-bold" style={{ color: '#1a3a1b' }}>
                                    {resetSent ? "Check Your Email" : "Reset Password"}
                                </CardTitle>
                                <CardDescription className="text-sm" style={{ color: '#6b7280' }}>
                                    {resetSent
                                        ? "We've sent password reset instructions to your email"
                                        : "Enter your email to receive reset instructions"
                                    }
                                </CardDescription>
                            </CardHeader>

                            {!resetSent ? (
                                <form onSubmit={handleResetPassword}>
                                    <CardContent className="space-y-4 px-8">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold" style={{ color: '#1a3a1b' }}>
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#02aad7' }} />
                                                <Input
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    value={resetEmail}
                                                    onChange={(e) => {
                                                        setResetEmail(e.target.value);
                                                        setEmailError("");
                                                    }}
                                                    className="h-11 pl-10 border-2 rounded-xl transition-all text-sm"
                                                    style={{
                                                        borderColor: emailError ? '#ef4444' : '#e5e7eb',
                                                        backgroundColor: '#fafafa',
                                                    }}
                                                    onFocus={(e) => {
                                                        if (!emailError) e.currentTarget.style.borderColor = '#02aad7';
                                                    }}
                                                    onBlur={(e) => {
                                                        if (!emailError) e.currentTarget.style.borderColor = '#e5e7eb';
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
                                            className="w-full h-11 text-sm font-bold rounded-xl gap-2 border-0 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                                            style={{
                                                backgroundColor: '#02aad7',
                                                color: 'white',
                                                boxShadow: '0 4px 14px rgba(2,170,215,0.3)',
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
                                            className="w-full h-11 text-sm font-medium gap-2 rounded-xl hover:bg-gray-50"
                                            style={{ color: '#1c5e20' }}
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Back to Login
                                        </Button>
                                    </CardFooter>
                                </form>
                            ) : (
                                <CardContent className="px-8 pb-8">
                                    <div className="space-y-4">
                                        <div className="flex flex-col items-center py-2">
                                            <div
                                                className="w-14 h-14 rounded-full flex items-center justify-center mb-2"
                                                style={{ backgroundColor: '#dcfce7' }}
                                            >
                                                <CheckCircle className="w-7 h-7" style={{ color: '#1c5e20' }} />
                                            </div>
                                        </div>
                                        <div
                                            className="p-4 rounded-xl text-sm leading-relaxed"
                                            style={{ backgroundColor: '#fffbf0', borderLeft: '4px solid #fbb03b' }}
                                        >
                                            <p className="text-gray-700">
                                                We've sent a password reset link to{' '}
                                                <strong style={{ color: '#1c5e20' }}>{resetEmail}</strong>.{' '}
                                                Please check your inbox and follow the instructions.
                                            </p>
                                        </div>
                                        <div className="text-center text-sm text-gray-500">
                                            <p>Didn't receive the email?</p>
                                            <button
                                                type="button"
                                                className="font-semibold mt-1 hover:underline disabled:opacity-60"
                                                style={{ color: '#02aad7' }}
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
                                            className="w-full h-11 text-sm font-medium gap-2 rounded-xl mt-2 hover:bg-gray-50"
                                            style={{ color: '#1c5e20' }}
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

                <p className="text-center text-xs mt-4" style={{ color: '#9ca3af' }}>
                    Admin access only · Crystal Ceylon Tours
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;