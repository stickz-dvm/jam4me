import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { useAuth } from "../../context/AuthContext";

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, updateUserProfile, isLoading } = useAuth();
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  
  // if (!user) {
  //   navigate("/login");
  //   return null;
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      updateUserProfile({
        phone,
      });
      navigate("/parties");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Add more details to enhance your Jam4me experience
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pb-6">
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
                Add your phone for SMS recovery if you lose email access.
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="bio">About You</label>
              <Textarea
                id="bio"
                placeholder="Tell us about your music preferences..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="bg-input-background min-h-[100px]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Continue"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full text-muted-foreground hover:text-foreground text-sm"
              onClick={() => navigate("/parties")}
            >
              Skip
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}