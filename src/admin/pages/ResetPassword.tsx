import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { adminAuthService } from "../services/authService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Lock, KeyRound, Eye, EyeOff, CheckCircle, AlertCircle, ShieldCheck } from "lucide-react";
import { ButtonLoader } from "@/admin/components/ui/Loader";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [resetSuccess, setResetSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error("Invalid or missing reset token");
            setTimeout(() => navigate("/admin/login"), 2000);
        }
    }, [token, navigate]);

    const validatePassword = (password: string): boolean => {
        if (password.length < 8) {
            setPasswordError("Password must be at least 8 characters long");
            return false;
        }
        setPasswordError("");
        return true;
    };

    const validateConfirmPassword = (password: string, confirm: string): boolean => {
        if (password !== confirm) {
            setConfirmPasswordError("Passwords do not match");
            return false;
        }
        setConfirmPasswordError("");
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!token) {
            toast.error("Invalid reset link");
            return;
        }

        // Validate inputs
        const isPasswordValid = validatePassword(newPassword);
        const isConfirmValid = validateConfirmPassword(newPassword, confirmPassword);

        if (!isPasswordValid || !isConfirmValid) {
            return;
        }

        setLoading(true);
        try {
            await adminAuthService.resetPassword({
                token,
                newPassword,
                confirmPassword,
            });
            toast.success("Password reset successful!");
            setResetSuccess(true);
            setTimeout(() => {
                navigate("/admin/login");
            }, 2000);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Password reset failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewPassword(value);
        if (passwordError) {
            validatePassword(value);
        }
        if (confirmPassword && confirmPasswordError) {
            validateConfirmPassword(value, confirmPassword);
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setConfirmPassword(value);
        if (confirmPasswordError) {
            validateConfirmPassword(newPassword, value);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ backgroundColor: '#2f3541' }}>
                <Card className="w-full max-w-md shadow-2xl border-0 relative z-10 bg-white dark:bg-gray-800">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                        <p className="text-lg font-semibold text-gray-700">Invalid Reset Link</p>
                        <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ backgroundColor: '#2f3541' }}>
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10" style={{ backgroundColor: '#209aa0' }}></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: '#209aa0' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-5" style={{ backgroundColor: '#209aa0' }}></div>
            </div>

            <Card className="w-full max-w-md shadow-2xl border-0 relative z-10 bg-white dark:bg-gray-800">
                {!resetSuccess ? (
                    <>
                        <CardHeader className="text-center space-y-3 pb-6 pt-8">
                            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-2 shadow-lg" style={{ backgroundColor: '#209aa0' }}>
                                <ShieldCheck className="w-8 h-8 text-white" />
                            </div>
                            <CardTitle className="text-3xl font-bold tracking-tight" style={{ color: '#2f3541' }}>
                                Reset Password
                            </CardTitle>
                            <CardDescription className="text-base">
                                Enter your new password below
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-5 px-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium" style={{ color: '#2f3541' }}>
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={handleNewPasswordChange}
                                            onBlur={() => validatePassword(newPassword)}
                                            className={`h-12 pl-11 pr-11 border-2 focus:border-[#209aa0] focus:border-opacity-100 transition-all ${passwordError ? 'border-red-500 focus:border-red-500' : ''}`}
                                            style={{ 
                                                borderColor: passwordError ? '#ef4444' : '#e5e7eb'
                                            }}
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {passwordError && (
                                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {passwordError}
                                        </p>
                                    )}
                                    {!passwordError && newPassword && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Password must be at least 8 characters
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium" style={{ color: '#2f3541' }}>
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={handleConfirmPasswordChange}
                                            onBlur={() => validateConfirmPassword(newPassword, confirmPassword)}
                                            className={`h-12 pl-11 pr-11 border-2 focus:border-[#209aa0] focus:border-opacity-100 transition-all ${confirmPasswordError ? 'border-red-500 focus:border-red-500' : ''}`}
                                            style={{ 
                                                borderColor: confirmPasswordError ? '#ef4444' : '#e5e7eb'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {confirmPasswordError && (
                                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {confirmPasswordError}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="px-8 pb-8 pt-2">
                                <Button 
                                    type="submit" 
                                    disabled={loading || !newPassword || !confirmPassword}
                                    className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] gap-2"
                                    style={{ 
                                        backgroundColor: '#209aa0',
                                        color: 'white'
                                    }}
                                >
                                    <ButtonLoader loading={loading}>
                                    Reset Password
                                </ButtonLoader>
                                </Button>
                            </CardFooter>
                        </form>
                    </>
                ) : (
                    <CardContent className="px-8 py-12">
                        <div className="space-y-4">
                            <div className="flex flex-col items-center py-4">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 animate-bounce" style={{ backgroundColor: '#d1fae5' }}>
                                    <CheckCircle className="w-10 h-10" style={{ color: '#059669' }} />
                                </div>
                                <h3 className="text-2xl font-bold mb-2" style={{ color: '#2f3541' }}>
                                    Password Reset Successful!
                                </h3>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdfa', borderLeft: '4px solid #209aa0' }}>
                                <p className="text-sm text-gray-700 leading-relaxed text-center">
                                    Your password has been reset successfully. You will be redirected to the login page shortly.
                                </p>
                            </div>
                            <div className="flex justify-center pt-4">
                                <Button
                                    onClick={() => navigate("/admin/login")}
                                    className="px-6 h-10 text-sm font-medium shadow-md"
                                    style={{ 
                                        backgroundColor: '#209aa0',
                                        color: 'white'
                                    }}
                                >
                                    Go to Login
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}