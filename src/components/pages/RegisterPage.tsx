import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useAuth, UserType } from "../../context/AuthContext";
import { LogoPlaceholder } from "../LogoPlaceholder";
import { User, Music } from "lucide-react";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, signupResponse } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [user_status, setUserStatus] = useState<UserType>("user");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      console.log("payload in component: ", {
        username,
        email,
        password,
        user_status
      })
      await register(username, email, password, user_status);

      console.log("register response in component: ", signupResponse);
      
      // Navigate based on user type
      // if (userType === "dj") {
      //   navigate("/dj/onboarding");
      // } else {
      //   navigate("/onboarding");
      // }
    } catch (err) {
      setError("Failed to register. Please try again.");
      console.error(err);
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
          className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
          animate={{ 
            x: [0, -30, 0], 
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
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>
              Enter your details to create your Jam4me account
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="user" onValueChange={(value) => setUserStatus(value as UserType)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="user" className="flex items-center justify-center gap-2">
                <User className="h-4 w-4" />
                <span>User</span>
              </TabsTrigger>
              <TabsTrigger value="dj" className="flex items-center justify-center gap-2">
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
                      placeholder="jamesBond"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="bg-input-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email">Email</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-input-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password">Password</label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-input-background"
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2 mb-2">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="bg-input-background"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 pt-2">
                  <Button type="submit" className="w-full glow" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Register as User"}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground pt-2">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary underline hover:text-primary/80 transition-colors">
                      Login
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="dj">
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 mb-4">
                  {error && (
                    <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label htmlFor="dj-name">Full Name</label>
                    <Input
                      id="dj-name"
                      placeholder="John Doe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="bg-input-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="dj-email">Email</label>
                    <Input
                      id="dj-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-input-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="dj-password">Password</label>
                    <Input
                      id="dj-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-input-background"
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2 mb-2">
                    <label htmlFor="dj-confirmPassword">Confirm Password</label>
                    <Input
                      id="dj-confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="bg-input-background"
                    />
                  </div>
                  <div className="p-3 rounded-md bg-primary/10 text-sm">
                    <p className="font-medium text-primary">DJ Account Benefits:</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• Create and manage music parties</li>
                      <li>• Receive song requests with payments</li>
                      <li>• Control the music queue</li>
                      <li>• Generate QR codes for easy access</li>
                      <li>• Withdraw earnings to your bank account</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 pt-2">
                  <Button 
                    type="submit" 
                    className="w-full glow-accent bg-accent text-accent-foreground hover:bg-accent/90" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Register as DJ"}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground pt-2">
                    Already have a DJ account?{" "}
                    <Link to="/login" className="text-primary underline hover:text-primary/80 transition-colors">
                      Login
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