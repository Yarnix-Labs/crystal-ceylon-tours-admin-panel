import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AdminPageHeader } from "@/admin/components/ui/PageHeader";
import {
  User,
  Mail,
  Shield,
  Key,
  Camera,
  Save,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react";
import { Loader, ButtonLoader } from "@/admin/components/ui/Loader";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { profileService, UserProfile } from "@/admin/services/profileService";
import { useUser } from "@/admin/context/UserContext";
import { useUserProfile, useProfileMutations } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const { data: profileResponse, isLoading, isFetching } = useUserProfile();
  const { updateMutation, uploadImageMutation, changePasswordMutation } = useProfileMutations();
  const userData = profileResponse?.data ?? null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string>(""); // preview only
  const [avatarUrl, setAvatarUrl] = useState<string>(""); // backend URL
  const { updateAvatar, updateUser } = useUser();

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync form data when userData loads
  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName);
      setLastName(userData.lastName);
      setEmail(userData.email);
      setPhone(userData.phone);
      setAvatarPreview(userData.avatar);
      updateUser(userData);
    }
  }, [userData, updateUser]);

  const handleUpdateProfile = async () => {
    const payload: any = {
      firstName,
      lastName,
      phoneNumber: phone,
    };

    if (avatarUrl) {
      payload.avatar = avatarUrl;
    }

    updateMutation.mutate(payload, {
      onError: () => {
        toast.error("Update failed");
      },
    });
  };


const handleChangePassword = async () => {
  // frontend validation
  if (!currentPassword || !newPassword || !confirmPassword) {
    toast.error("All password fields are required");
    return;
  }

  if (newPassword !== confirmPassword) {
    toast.error("New password and confirm password do not match");
    return;
  }

  const payload = {
    currentPassword: currentPassword.trim(),
    newPassword: newPassword.trim(),
    confirmPassword: confirmPassword.trim(),
  };

  changePasswordMutation.mutate(payload, {
    onSuccess: () => {
      // Clear password fields after success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      const errorData = error.response?.data;

      // Handle field-specific validation errors (VAL001)
      if (errorData?.error?.code === "VAL001" && errorData?.error?.fields?.length > 0) {
        const fieldErrors = errorData.error.fields.map((f: any) => `${f.field}: ${f.message}`).join("\n");
        toast.error(fieldErrors);
        return;
      }

      const errorMessage =
        errorData?.message ||
        errorData?.error?.message ||
        error.message ||
        "Password change failed";

      toast.error(errorMessage);
    },
  });
};


  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // preview for UI
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // upload to Supabase via backend API
    uploadImageMutation.mutate(file, {
      onSuccess: (response) => {
        const uploadedUrl = response.data.url;
        // save Supabase URL
        setAvatarUrl(uploadedUrl);
        // Update global context for TopBar
        updateAvatar(uploadedUrl);
      },
      onError: () => {
        toast.error("Image upload failed");
      },
    });
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Administrator";
      case "ADMIN":
        return "Administrator";
      default:
        return "User";
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "ACTIVE" ? (
      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
    ) : (
      <Badge variant="destructive">Inactive</Badge>
    );
  };

  const getInitials = () => {
    if (!userData) return "AD";
    return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Skeleton loading state for initial load
  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/40 pb-20">
        <div className="p-6 max-w-7xl mx-auto space-y-8">
          <AdminPageHeader
            heading="My Profile"
            description="Manage your account settings and preferences."
            className="pb-0 border-none"
          />
          <div className="grid gap-8 md:grid-cols-12 items-start">
            {/* Sidebar Skeleton */}
            <div className="md:col-span-4 lg:col-span-4 space-y-6">
              <Card className="overflow-hidden border-border/60 shadow-lg">
                <div className="h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 relative overflow-hidden">
                  <Skeleton className="absolute inset-0" />
                </div>
                <CardContent className="pt-0 relative px-6 pb-8">
                  <div className="flex flex-col items-center -mt-16 mb-6">
                    <Skeleton className="h-32 w-32 rounded-full border-4 border-background" />
                    <div className="text-center space-y-2 mt-4 w-full">
                      <Skeleton className="h-8 w-48 mx-auto" />
                      <Skeleton className="h-5 w-32 mx-auto" />
                      <Skeleton className="h-6 w-20 mx-auto" />
                    </div>
                  </div>
                  <Separator className="my-6 opacity-50" />
                  <div className="space-y-5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Main Content Skeleton */}
            <div className="md:col-span-8 lg:col-span-8 space-y-8">
              <Card className="border-border/60 shadow-sm overflow-hidden">
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-1">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-11 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-11 w-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-11 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-11 w-full" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t bg-muted/30 px-8 py-5">
                  <Skeleton className="h-11 w-32" />
                </CardFooter>
              </Card>
              <Card className="border-border/60 shadow-sm overflow-hidden">
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-1">
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-4 w-56" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-11 w-full max-w-md" />
                  </div>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-11 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-11 w-full" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t bg-muted/30 px-8 py-5">
                  <Skeleton className="h-11 w-36" />
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state when no user data
  if (!userData) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg text-muted-foreground">
            Failed to load profile
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 pb-20 relative">
      {/* Overlay loader for subsequent data fetching */}
      {isFetching && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader size="lg" />
            <p className="text-sm text-muted-foreground">Updating...</p>
          </div>
        </div>
      )}
      <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <AdminPageHeader
          heading="My Profile"
          description="Manage your account settings and preferences."
          className="pb-0 border-none"
        />

        <div className="grid gap-8 md:grid-cols-12 items-start">
          {/* Sidebar / User Card */}
          <div className="md:col-span-4 lg:col-span-4 space-y-6 sticky top-6">
            <Card className="overflow-hidden border-border/60 shadow-lg group">
              <div className="h-40 bg-gradient-to-br from-primary/80 via-primary to-primary/60 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              </div>
              <CardContent className="pt-0 relative px-6 pb-8">
                <div className="flex flex-col items-center -mt-16 mb-6">
                  <div
                    className="relative group/avatar cursor-pointer"
                    onClick={triggerFileInput}
                  >
                    <Avatar className="h-32 w-32 border-4 border-background shadow-2xl transition-transform duration-500 group-hover/avatar:scale-105">
                      <AvatarImage src={avatarPreview || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Upload Overlay with Loader - always visible during upload */}
                    <div className={`absolute inset-0 bg-black/50 rounded-full transition-all duration-300 flex items-center justify-center backdrop-blur-[2px] ${uploadImageMutation.isPending ? 'opacity-100' : 'opacity-0 group-hover/avatar:opacity-100'}`}>
                      {uploadImageMutation.isPending ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader size="lg" className="text-white" />
                          <span className="text-white text-xs font-medium">Uploading...</span>
                        </div>
                      ) : (
                        <Camera className="text-white w-8 h-8 drop-shadow-lg" />
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadImageMutation.isPending}
                    />
                  </div>
                  <div className="text-center space-y-2 mt-4">
                    <h3 className="font-bold text-2xl tracking-tight">
                      {userData.firstName} {userData.lastName}
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                      {getRoleDisplay(userData.role)}
                    </p>
                    {getStatusBadge(userData.status)}
                  </div>
                </div>

                <Separator className="my-6 opacity-50" />

                <div className="space-y-5">
                  <div className="flex items-center gap-4 text-sm group/item">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors duration-300">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium">
                        Email Address
                      </p>
                      <p className="text-foreground truncate">
                        {userData.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm group/item">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors duration-300">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground font-medium">
                        Role Access
                      </p>
                      <p className="text-foreground">
                        {getRoleDisplay(userData.role)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm group/item">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors duration-300">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground font-medium">
                        Member Since
                      </p>
                      <p className="text-foreground">
                        {new Date(userData.createdAt).toLocaleDateString(
                          undefined,
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm group/item">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors duration-300">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium">
                        User ID
                      </p>
                      <p className="text-foreground text-xs font-mono truncate">
                        {userData.id}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-8 lg:col-span-8 space-y-8">
            {/* Personal Information */}
            <Card className="border-border/60 shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl">
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal details and contact information.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="pl-10 h-11"
                        placeholder="Enter first name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="pl-10 h-11"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11"
                        type="email"
                        placeholder="Enter email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 h-11"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t bg-muted/30 px-8 py-5">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={updateMutation.isPending}
                  className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                >
                  <ButtonLoader loading={updateMutation.isPending}>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </ButtonLoader>
                </Button>
              </CardFooter>
            </Card>

            {/* Security */}
            <Card className="border-border/60 shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl">
                      Security & Password
                    </CardTitle>
                    <CardDescription>
                      Manage your password and security preferences.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <div className="relative max-w-md">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      className="pl-10 pr-10 h-11"
                      placeholder="••••••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        className="pl-10 pr-10 h-11"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        className="pl-10 pr-10 h-11"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t bg-muted/30 px-8 py-5">
                <Button
                  variant="outline"
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                  className="gap-2 border-primary/20 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all"
                >
                  <ButtonLoader loading={changePasswordMutation.isPending}>
                    Change Password
                  </ButtonLoader>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
