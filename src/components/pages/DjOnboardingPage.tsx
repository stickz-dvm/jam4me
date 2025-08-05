import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../context/AuthContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Avatar } from "../ui/avatar";
import { User, Upload, Music, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const formSchema = z.object({
  djName: z.string().min(2, "DJ name must be at least 2 characters").max(50),
  phone: z.string().min(8, "Phone number must be at least 8 digits"),
  genre: z.string().min(1, "Please select your primary genre"),
  bio: z.string().max(500, "Bio must be less than 500 characters"),
  yearsOfExperience: z.string().min(1, "Please select your experience level"),
});

export function DjOnboardingPage() {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      djName: user?.djName || "",
      phone: user?.phone || "",
      genre: "",
      bio: user?.bio || "",
      yearsOfExperience: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Update user profile
      updateUserProfile({
        djName: values.djName,
        phone: values.phone,
        bio: values.bio,
        genre: values.genre,
      });
      
      toast.success("DJ profile created successfully!");
      navigate("/dj/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload this to a server and get a URL back
      // For demo purposes, we'll create a local URL
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      
      // Update the user profile with the avatar
      updateUserProfile({ avatar: url });
      toast.success("Profile image uploaded successfully!");
    }
  };

  const handleSkip = () => {
    navigate("/dj/dashboard");
  };

  return (
    <div className="container mx-auto max-w-lg px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="mb-2 text-3xl font-bold gradient-text">Complete Your DJ Profile</h1>
        <p className="text-muted-foreground">
          Set up your DJ profile to start hosting parties and earning from song requests.
        </p>
      </motion.div>
      
      <div className="flex justify-center mb-8">
        <div className="flex space-x-2">
          {[1, 2, 3].map(step => (
            <motion.div 
              key={step}
              className={`h-2 w-12 rounded-full ${currentStep >= step ? 'bg-primary' : 'bg-muted'}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: currentStep === step ? 1.1 : 1 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
      
      <Card className="border-border/50 bg-card/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Basic Information"}
            {currentStep === 2 && "Professional Details"}
            {currentStep === 3 && "Profile Picture"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Let's start with your basic DJ information"}
            {currentStep === 2 && "Tell us about your DJ experience and style"}
            {currentStep === 3 && "Add a profile picture to complete your DJ profile"}
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {currentStep === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="djName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DJ Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. DJ Spinmaster" 
                            {...field} 
                            className="bg-input/50 backdrop-blur-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+234 800 123 4567" 
                            {...field} 
                            className="bg-input/50 backdrop-blur-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              {currentStep === 2 && (
                <>
                  <FormField
                    control={form.control}
                    name="genre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Music Genre</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-input/50 backdrop-blur-sm">
                              <SelectValue placeholder="Select your primary genre" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="afrobeats">Afrobeats</SelectItem>
                            <SelectItem value="afropop">Afropop</SelectItem>
                            <SelectItem value="amapiano">Amapiano</SelectItem>
                            <SelectItem value="highlife">Highlife</SelectItem>
                            <SelectItem value="hiphop">Hip Hop</SelectItem>
                            <SelectItem value="rnb">R&B</SelectItem>
                            <SelectItem value="dancehall">Dancehall</SelectItem>
                            <SelectItem value="gospel">Gospel</SelectItem>
                            <SelectItem value="juju">Juju</SelectItem>
                            <SelectItem value="fuji">Fuji</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="yearsOfExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-input/50 backdrop-blur-sm">
                              <SelectValue placeholder="Select your experience level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="less-than-1">Less than 1 year</SelectItem>
                            <SelectItem value="1-3">1-3 years</SelectItem>
                            <SelectItem value="3-5">3-5 years</SelectItem>
                            <SelectItem value="5-10">5-10 years</SelectItem>
                            <SelectItem value="10+">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell partygoers about yourself and your DJ style..." 
                            {...field} 
                            className="min-h-[120px] bg-input/50 backdrop-blur-sm"
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground mt-1">
                          {field.value?.length || 0}/500 characters
                        </p>
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              {currentStep === 3 && (
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-accent/20">
                      {avatarUrl ? (
                        <ImageWithFallback
                          src={avatarUrl}
                          alt="DJ profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <User className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </Avatar>
                    
                    <label 
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Upload className="h-4 w-4" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Upload a professional profile picture
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: square image, at least 400x400 pixels
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className={`flex pt-8 ${currentStep === 1 ? 'justify-between gap-2' : currentStep === 3 ? 'justify-between' : 'justify-end'} ${currentStep !== 1 ? 'space-x-2' : ''}`}>
              {currentStep === 1 && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleSkip}
                    type="button"
                    className="flex-1"
                  >
                    Skip
                  </Button>
                  <Button 
                    type="button" 
                    onClick={async () => {
                      const isValid = await form.trigger(['djName', 'phone']);
                      if (isValid) {
                        setCurrentStep(2);
                      }
                    }}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                </>
              )}
              
              {currentStep === 2 && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)}
                    type="button"
                  >
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={async () => {
                      const isValid = await form.trigger(['genre', 'bio', 'yearsOfExperience']);
                      if (isValid) {
                        setCurrentStep(3);
                      }
                    }}
                  >
                    Continue
                  </Button>
                </>
              )}
              
              {currentStep === 3 && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(2)}
                    type="button"
                  >
                    Back
                  </Button>
                  <Button type="submit" className="space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Complete Profile</span>
                  </Button>
                </>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Step {currentStep} of 3 - {currentStep === 1 ? "Basic Information" : currentStep === 2 ? "Professional Details" : "Profile Picture"}
        </p>
      </div>
    </div>
  );
}