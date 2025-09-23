import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useAuth } from "../../context/AuthContext";
import { LogoPlaceholder } from "../LogoPlaceholder";
import { AtSign, Phone, ArrowLeft } from "lucide-react";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("email");

  const handleEmailReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    
    try {
      const response = await resetPassword(email);

      console.log("reset passsword resposne: ", response);
      setSuccess("Password reset instructions sent to your email");
      setEmail("");
    } catch (err) {
      setError("Failed to send reset instructions. Please try again.");
      console.error(err);
    }
  };

  const handlePhoneReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }
    
    try {
      // In a real app, this would call your backend API
      await resetPassword(phone);
      setSuccess("Password reset code sent to your phone");
      setPhone("");
    } catch (err) {
      setError("Failed to send reset code. Please try again.");
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
        <p className="text-muted-foreground">Pay to play your favorite songs at parties</p>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="glass border-border/50">
          <CardHeader>
            <div className="flex items-center mb-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2 h-8 w-8" 
                onClick={() => navigate("/login")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Forgot Password</CardTitle>
            </div>
            <CardDescription>
              Choose a method to reset your password
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs 
              defaultValue="email" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email" className="flex items-center justify-center gap-2">
                  <AtSign className="h-4 w-4" />
                  <span>Email</span>
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>Phone</span>
                </TabsTrigger>
              </TabsList>
              
              {error && (
                <div className="p-3 mb-4 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="p-3 mb-4 bg-primary/10 text-primary rounded-md text-sm">
                  {success}
                </div>
              )}
              
              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleEmailReset} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email">Email Address</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-input-background"
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll send a password reset link to this email
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="phone" className="space-y-4">
                <form onSubmit={handlePhoneReset} className="space-y-4">
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
                    <p className="text-xs text-muted-foreground">
                      We'll send a password reset code to this number
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Code"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-center pt-2">
            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link to="/login" className="text-primary underline hover:text-primary/80 transition-colors">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}