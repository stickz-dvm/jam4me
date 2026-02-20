import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Edit, Phone, Camera, X, Mail, Lock, Shield, History, MapPin } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useAuth } from "../../context/AuthContext";
import { useParty } from "../../context/PartyContext";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { LogoutConfirmDialog } from "../LogoutConfirmDialog";
import { PasswordInput } from "../ui/password-input";
import { api } from "@/api/apiMethods";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUserProfile, logout, refreshUserProfile } = useAuth();
  const { joinedParties, createdParties, refreshPartyData } = useParty();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial load of user details from backend
  useEffect(() => {
    if (user?.id) {
      refreshUserProfile();
      refreshPartyData();
    }
  }, []);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleEditProfile = async () => {
    setError("");
    if (!username.trim()) {
      setError("Please enter your username");
      return;
    }

    setIsLoading(true);
    try {
      const isDj = user?.userType === "HUB_DJ";

      // 1. Update Profile Information (Text)
      // DJs use a slightly different path structure matching the balance endpoint
      const textEndpoint = isDj ? "/dj_wallet/dj/edit/profile/" : "/user_wallet/edit/profile/";
      const textPayload: any = {
        user_id: user?.id,
        new_username: username
      };

      // Ensure dj_id is present for DJ accounts
      if (isDj) {
        textPayload.dj_id = user?.id;
      }

      console.log(`Updating profile text at ${textEndpoint}`, textPayload);
      await api.post(textEndpoint, textPayload);

      // 2. Update Profile Picture (if changed)
      if (imagePreviewUrl) {
        const photoEndpoint = isDj ? "/dj_wallet/dj/edit/profile/photo/" : "/user_wallet/edit/profile/photo/";

        const photoPayload: any = {
          user_id: user?.id,
          profile_picture: imagePreviewUrl // This is the base64 string
        };

        if (isDj) {
          photoPayload.dj_id = user?.id;
          photoPayload.dj_name = username || user?.username;
        } else {
          photoPayload.username = username || user?.username;
        }

        console.log(`Updating profile photo at ${photoEndpoint}`);
        await api.post(photoEndpoint, photoPayload);
      }

      // 3. Refresh from backend to get the actual permanent URL
      console.log("Refreshing user details from backend...");
      await refreshUserProfile();

      toast.success("Profile updated successfully!");

      // Small delay for better UX and state flush
      setTimeout(() => {
        setShowEditDialog(false);
        setSelectedImage(null);
        setImagePreviewUrl(null);
      }, 500);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const msg = error.response?.data?.message || error.message || "Failed to update profile. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = async () => {
    setError("");

    // Basic email validation
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate current password
    if (!currentPassword.trim()) {
      setError("Please enter your current password for security verification");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the user email
      updateUserProfile({ email });
      setShowEmailDialog(false);
      setCurrentPassword("");
      toast.success("Email updated successfully!");
    } catch (error) {
      console.error("Error updating email:", error);
      setError("Failed to update email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    logout();
    navigate("/login");
    setShowLogoutDialog(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  const handlePasswordChange = async () => {
    setError("");

    // Password validations
    if (!currentPassword.trim()) {
      setError("Please enter your current password");
      return;
    }

    if (!newPassword.trim() || newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, you would make an API call to update the password
      // For now, we'll just show a success message
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      setError("Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, GIF, WEBP)");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setSelectedImage(file);
    setError("");

    // Create a preview URL for the selected image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

  };

  useEffect(() => {
    console.log("image url: ", imagePreviewUrl);
  }, [imagePreviewUrl])

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading profile information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2>Profile</h2>

      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative group">
          <Avatar className="w-24 h-24 mb-4 cursor-pointer" onClick={triggerFileInput}>
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback className="text-xl">{getInitials(user.username)}</AvatarFallback>
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </Avatar>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg, image/png, image/gif, image/webp"
            onChange={handleImageChange}
          />
        </div>
        <h2>{user.username}</h2>

        {phone && (
          <p className="text-muted-foreground flex items-center mt-1">
            <Phone className="w-3 h-3 mr-1" />
            {phone}
          </p>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Username</span>
            <span>{user.username}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Phone</span>
            <span>{phone || "Not provided"}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setUsername(user.username);
              setPhone(user.phone || "");
              setSelectedImage(null);
              setImagePreviewUrl(null);
              setShowEditDialog(true);
            }}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </CardFooter>
      </Card>

      {/* New Security Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-primary" />
              Account Security
            </div>
          </CardTitle>
          <CardDescription>
            Manage your account credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">Email Address</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEmail(user.email!);
                setCurrentPassword("");
                setError("");
                setShowEmailDialog(true);
              }}
            >
              Change
            </Button>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Lock className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">Password</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setError("");
                setShowPasswordDialog(true);
              }}
            >
              Change
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My Hubs / History Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>
            <div className="flex items-center">
              <History className="w-4 h-4 mr-2 text-primary" />
              {user?.userType === "HUB_DJ" ? "My Created Hubs" : "My Joined Hubs"}
            </div>
          </CardTitle>
          <CardDescription>
            Your recent party activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(user?.userType === "HUB_DJ" ? createdParties : joinedParties).length > 0 ? (
            <div className="space-y-3">
              {(user?.userType === "HUB_DJ" ? createdParties : joinedParties).slice(0, 3).map((hub) => (
                <div key={hub.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-medium truncate">{hub.name}</p>
                    <div className="flex items-center text-[10px] text-muted-foreground mt-0.5">
                      <MapPin size={10} className="mr-1" />
                      <span className="truncate">{hub.location}</span>
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${hub.isActive ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                    {hub.isActive ? 'ACTIVE' : 'CLOSED'}
                  </div>
                </div>
              ))}
              {(user?.userType === "HUB_DJ" ? createdParties : joinedParties).length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-primary"
                  onClick={() => navigate(user?.userType === "HUB_DJ" ? "/dj/dashboard" : "/parties")}
                >
                  View All History
                </Button>
              )}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground italic">No hub history found yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        variant="destructive"
        className="w-full"
        onClick={handleLogoutClick}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>

      {/* Logout confirmation dialog */}
      <LogoutConfirmDialog
        isOpen={showLogoutDialog}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />

      {/* Profile Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col items-center justify-center">
              <div className="relative group mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center cursor-pointer" onClick={triggerFileInput}>
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">{getInitials(user.username)}</span>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>

                  {imagePreviewUrl && (
                    <button
                      className="absolute top-0 right-0 bg-destructive rounded-full p-1"
                      onClick={(e) => removeSelectedImage(e)}
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-center mt-1 text-muted-foreground">Click to change profile picture</p>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg, image/png, image/gif, image/webp"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="username">Username</label>
              <Input
                id="username"
                placeholder="John Doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-input-background"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone">Phone Number</label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 123 456 7890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-input-background"
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleEditProfile} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Change Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Email Address</DialogTitle>
            <DialogDescription>
              Enter your new email address and current password
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email">New Email Address</label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input-background"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="currentPassword">Current Password</label>
              <PasswordInput
                id="currentPassword"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-input-background"
                required
              />
              <p className="text-sm text-muted-foreground">
                Enter your current password for security verification
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleEmailChange} disabled={isLoading}>
              {isLoading ? "Saving..." : "Update Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your password to secure your account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="currentPasswordChange">Current Password</label>
              <PasswordInput
                id="currentPasswordChange"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-input-background"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword">New Password</label>
              <PasswordInput
                id="newPassword"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-input-background"
                required
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-input-background"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}