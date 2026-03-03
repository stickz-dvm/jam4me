import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { useAuth } from "../../context/AuthContext";
import { LogoPlaceholder } from "../LogoPlaceholder";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function ResetPasswordPage() {
    const navigate = useNavigate();
    const { uuid, token } = useParams<{ uuid: string; token: string }>();
    const { confirmResetPassword, isLoading } = useAuth();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!uuid || !token) {
            toast.error("Invalid or expired reset link");
            navigate("/login");
        }
    }, [uuid, token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!newPassword) {
            setError("Please enter a new password");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            if (uuid && token) {
                await confirmResetPassword(uuid, token, newPassword);
                setSuccess(true);
                toast.success("Password reset successfully!");
            }
        } catch (err: any) {
            setError(err.message || "Failed to reset password. The link may be expired.");
        }
    };

    return (
        <motion.div
            className="flex flex-col items-center justify-center min-h-[80vh] p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
        >
            <div className="relative w-full h-full inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background"></div>
                <motion.div
                    className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
                    animate={{
                        x: [0, 30, 0],
                        y: [0, 20, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                />
            </div>

            <motion.div
                className="flex flex-col items-center mb-8"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <LogoPlaceholder className="w-16 h-16 mb-4" />
                <h1 className="gradient-text mb-1">Jam4me</h1>
                <p className="text-muted-foreground text-center">Set your new password to regain access</p>
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="w-full max-w-md"
            >
                <Card className="glass border-border/50 shadow-2xl overflow-hidden">
                    <CardHeader className="pb-4">
                        <div className="flex items-center mb-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="mr-2 h-8 w-8"
                                onClick={() => navigate("/login")}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <CardTitle className="text-2xl font-black gradient-text italic uppercase tracking-tighter">Reset Password</CardTitle>
                        </div>
                        <CardDescription>
                            Create a new, strong password for your account.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {error && (
                            <div className="p-3 mb-4 bg-destructive/10 text-destructive rounded-md text-sm border border-destructive/20">
                                {error}
                            </div>
                        )}

                        {success ? (
                            <div className="text-center py-6 space-y-6">
                                <div className="flex justify-center">
                                    <div className="p-4 bg-primary/20 rounded-full">
                                        <CheckCircle2 className="w-12 h-12 text-primary" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white">Success!</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Your password has been reset successfully. You can now use your new password to log in.
                                    </p>
                                </div>
                                <Button className="w-full glow py-6" onClick={() => navigate("/login")}>
                                    Proceed to Login
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label htmlFor="newPassword text-sm font-medium">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="bg-input-background pl-10 h-12 rounded-xl"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword text-sm font-medium">Confirm New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="bg-input-background pl-10 h-12 rounded-xl"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full glow h-12 font-black uppercase tracking-widest mt-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Resetting..." : "Update Password"}
                                </Button>
                            </form>
                        )}
                    </CardContent>

                    {!success && (
                        <CardFooter className="flex justify-center border-t border-white/5 pt-6 pb-6">
                            <p className="text-sm text-muted-foreground font-medium">
                                Wait, I remember it!{" "}
                                <Link to="/login" className="text-primary hover:text-primary/80 underline underline-offset-4 transition-all font-bold">
                                    Log in
                                </Link>
                            </p>
                        </CardFooter>
                    )}
                </Card>
            </motion.div>
        </motion.div>
    );
}
