import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useAuth } from "../../context/AuthContext";
import { LogoPlaceholder } from "../LogoPlaceholder";
import { User, Music } from "lucide-react";
import { PasswordInput } from "../ui/password-input";
import { toast } from "sonner";
import { UserType } from "@/src/api/types";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, isLoading: authLoading, isAuthenticated, getUserType } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user_status, setUserStatus] = useState<UserType>("user");

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const targetRoute = getUserType() === "HUB_DJ" ? "/dj/dashboard" : "/parties";
      const from = (location.state as any)?.from?.pathname || targetRoute;

      console.log("✅ Already authenticated, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, getUserType, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!username.trim() || !password.trim()) {
      toast.error("Please enter username and password");
      return;
    };

    try {
      const response = await login(username, password, user_status);

      console.log("login response in component: ", response);

      // Navigate based on user type
      if (response?.status === 200 && (response?.data.message.includes("Login successful") || response?.data.message.includes("login success"))) {
        // 1s delay so that localStorage can populate
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Navigate based on user type
        const targetRoute = user_status === "HUB_DJ" ? "/dj/dashboard" : "/parties";

        navigate(targetRoute, { replace: true });
      }
    } catch (err) {
      setError("Failed to log in. Please check your credentials.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 w-full h-full rounded-full border-4 border-primary/20 border-t-accent animate-spin"></div>
        </div>
      </div>
    );
  }

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
        <p className="text-muted-foreground">The ultimate party music request platform</p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <Tabs defaultValue="user" onValueChange={(value) => setUserStatus(value as UserType)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="user" className="flex items-center justify-center gap-2">
                <User className="h-4 w-4" />
                <span>User</span>
              </TabsTrigger>
              <TabsTrigger value="HUB_DJ" className="flex items-center justify-center gap-2">
                <Music className="h-4 w-4" />
                <span>DJ</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 mb-4">
                  {error && (
                    <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label htmlFor="username">Username</label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="jamesbond007"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="bg-input-background"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2 mb-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="password">Password</label>
                      <Link
                        to="/forgot-password"
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <PasswordInput
                      id="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-input-background"
                      disabled={isSubmitting}
                    />
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-2 pt-2">
                  <Button type="submit" className="w-full glow" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login as User"}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground pt-2">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-primary underline hover:text-primary/80 transition-colors">
                      Register
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="HUB_DJ">
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 mb-4">
                  {error && (
                    <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label htmlFor="dj-username">Username</label>
                    <Input
                      id="dj-username"
                      type="text"
                      placeholder="jamesbond007"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="bg-input-background"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2 mb-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="dj-password">Password</label>
                      <Link
                        to="/forgot-password"
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <PasswordInput
                      id="dj-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-input-background"
                      disabled={isSubmitting}
                    />
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-2 pt-2">
                  <Button type="submit" className="w-full glow-accent bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login as DJ"}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground pt-2">
                    DJ without an account?{" "}
                    <Link to="/register" className="text-primary underline hover:text-primary/80 transition-colors">
                      Register as DJ
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </motion.div>
  );
}