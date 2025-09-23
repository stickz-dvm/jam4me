import { Link } from "react-router-dom";
import { Users, CreditCard, Sparkles, PartyPopper, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { useAuth } from "../../context/AuthContext";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { LogoPlaceholder } from "../LogoPlaceholder";
import React, { useEffect, useState } from "react";

// Animation variants
const containerVariants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { 
    y: 20, 
    opacity: 0 
  },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

const featureCardVariants = {
  hidden: { 
    y: 50, 
    opacity: 0 
  },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

// Direct URL to the Nigerian DJ image
const DJ_IMAGE_URL = "https://img.freepik.com/premium-photo/african-american-dj-wearing-headphones-glasses-mixing-music-nightclub_14117-115215.jpg?uid=P192534668&ga=GA1.1.1381693928.1739400041&semt=ais_items_boosted&w=740";

export function LandingPage() {
  const { isAuthenticated, getHomeRoute, isDj, getUserType } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Dynamically generate user's home route based on their stored type
  const homeRoute = getHomeRoute();
  
  // Get user type for more personalized messaging
  const userType = getUserType();
  
  return (
    <div className="min-h-screen">
      <div className="relative flex flex-col items-center justify-center text-center px-4 py-20 md:py-32 overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src={DJ_IMAGE_URL}
            alt="Nigerian DJ mixing music"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 1 }}
            onLoad={() => {
              console.log("DJ image loaded successfully");
              setImageLoaded(true);
            }}
          />
          
          {/* Darker overlay to dim the background image more */}
          <div className="absolute inset-0 bg-black/70"></div>
          
          {/* Animated elements for visual interest */}
          <motion.div 
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/20 blur-3xl"
            animate={{ 
              x: [0, 50, 0], 
              y: [0, 30, 0],
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2] 
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-accent/20 blur-3xl"
            animate={{ 
              x: [0, -30, 0], 
              y: [0, 50, 0],
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2] 
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1 
            }}
          />
        </div>
        
        {/* Content with proper centering classes */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full">
          <motion.div variants={itemVariants} className="flex justify-center">
            <LogoPlaceholder className="w-24 h-24 mb-6" />
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold mb-4 gradient-text">
            Jam4me
          </motion.h1>
          <motion.p variants={itemVariants} className="text-xl text-white max-w-md mb-8 drop-shadow-md">
            Request your favorite songs at parties by paying the DJ directly
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="glow" asChild>
              <Link to={isAuthenticated ? homeRoute : "/register"}>
                {isAuthenticated 
                  ? userType === "HUB_DJ" 
                    ? "Go to DJ Dashboard" 
                    : "Go to Parties"
                  : "Create Account"
                }
              </Link>
            </Button>
            {!isAuthenticated && (
              <Button size="lg" variant="outline" asChild className="backdrop-blur-sm bg-black/20 border-white/20 hover:bg-black/30">
                <Link to="/login">Login</Link>
              </Button>
            )}
          </motion.div>
        </div>
      </div>
      
      <motion.div 
        className="container mx-auto px-4 py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        <div className="text-center mb-16">
          <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-4">
            The Ultimate Party Experience
          </motion.h2>
          <motion.p variants={itemVariants} className="text-muted-foreground max-w-2xl mx-auto">
            Jam4me connects party-goers with DJs in real-time, creating an interactive music experience for Nigerian nightlife
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div 
            className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-6"
            variants={featureCardVariants}
          >
            <div className="p-3 bg-primary/10 w-fit rounded-full mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">For Party-Goers</h3>
            <p className="text-muted-foreground mb-4">
              Request your favorite songs directly from your phone. No more shouting over the music to get the DJ's attention.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <Sparkles className="w-4 h-4 text-accent mr-2 mt-0.5 shrink-0" />
                <span>Connect to parties with QR codes or passcodes</span>
              </li>
              <li className="flex items-start">
                <Sparkles className="w-4 h-4 text-accent mr-2 mt-0.5 shrink-0" />
                <span>Search and request songs through Spotify integration</span>
              </li>
              <li className="flex items-start">
                <Sparkles className="w-4 h-4 text-accent mr-2 mt-0.5 shrink-0" />
                <span>Fund your wallet with Paystack and withdraw to Nigerian banks</span>
              </li>
            </ul>
          </motion.div>
          
          <motion.div 
            className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-6"
            variants={featureCardVariants}
          >
            <div className="p-3 bg-primary/10 w-fit rounded-full mb-4">
              <Volume2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">For DJs</h3>
            <p className="text-muted-foreground mb-4">
              Manage song requests and earn more at your gigs. Create a direct connection with your audience.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <Sparkles className="w-4 h-4 text-accent mr-2 mt-0.5 shrink-0" />
                <span>Create and share parties with a unique passcode</span>
              </li>
              <li className="flex items-start">
                <Sparkles className="w-4 h-4 text-accent mr-2 mt-0.5 shrink-0" />
                <span>Set minimum song request prices for each party</span>
              </li>
              <li className="flex items-start">
                <Sparkles className="w-4 h-4 text-accent mr-2 mt-0.5 shrink-0" />
                <span>Track earnings and withdraw directly to your bank account</span>
              </li>
            </ul>
          </motion.div>
          
          <motion.div 
            className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-6 md:col-span-2 lg:col-span-1"
            variants={featureCardVariants}
          >
            <div className="p-3 bg-primary/10 w-fit rounded-full mb-4">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
            <p className="text-muted-foreground mb-4">
              Integrated with Paystack for secure, hassle-free transactions in Naira. Your money, your music.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <Sparkles className="w-4 h-4 text-accent mr-2 mt-0.5 shrink-0" />
                <span>Pay with bank transfer, card, or USSD via Paystack</span>
              </li>
              <li className="flex items-start">
                <Sparkles className="w-4 h-4 text-accent mr-2 mt-0.5 shrink-0" />
                <span>Secure wallet system for managing funds</span>
              </li>
              <li className="flex items-start">
                <Sparkles className="w-4 h-4 text-accent mr-2 mt-0.5 shrink-0" />
                <span>Automatic refunds for declined song requests</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </motion.div>
      
      <div className="relative bg-gradient-to-b from-background to-background/80 py-16">
        <div className="absolute inset-0 z-0 opacity-10 overflow-hidden">
          {/* Secondary background image */}
          <img 
            src={DJ_IMAGE_URL}
            alt="Nigerian DJ background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        
        <motion.div 
          className="container mx-auto px-4 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          <div className="text-center mb-12">
            <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-4">
              Experience the Nigerian Club Scene
            </motion.h2>
            <motion.p variants={itemVariants} className="text-muted-foreground max-w-2xl mx-auto">
              Jam4me brings the vibrant Nigerian party culture to your smartphone, connecting you directly with the music
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div 
              className="order-2 md:order-1"
              variants={featureCardVariants}
            >
              <h3 className="text-2xl font-bold mb-4">How It Works</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 text-accent p-3 rounded-full">
                    <PartyPopper className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Join a Party</h4>
                    <p className="text-muted-foreground">
                      Scan a QR code or enter a 6-digit passcode to connect to the party
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 text-accent p-3 rounded-full">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Request Your Song</h4>
                    <p className="text-muted-foreground">
                      Browse the Spotify library and set your price – higher bids get priority
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 text-accent p-3 rounded-full">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Enjoy the Music</h4>
                    <p className="text-muted-foreground">
                      The DJ receives your request and plays your song for everyone to enjoy
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="order-1 md:order-2 flex justify-center"
              variants={featureCardVariants}
            >
              <div className="relative w-full max-w-sm">
                <ImageWithFallback
                  src="https://img.freepik.com/free-photo/vibrant-scene-with-dj-techno-party_23-2150551533.jpg?uid=P192534668&ga=GA1.1.1381693928.1739400041&semt=ais_items_boosted&w=740"
                  alt="Nigerian DJ at a club"
                  className="rounded-lg shadow-2xl object-cover aspect-[3/4]"
                  width={400}
                  height={533}
                />
                
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        className="container mx-auto px-4 py-16 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-4">
          Ready to Change How You Experience Music?
        </motion.h2>
        <motion.p variants={itemVariants} className="text-muted-foreground max-w-2xl mx-auto mb-8">
          Join Jam4me today and transform your party experience. Request your favorite songs, support DJs, and make every party memorable.
        </motion.p>
        <motion.div variants={itemVariants}>
          <Button size="lg" className="glow" asChild>
            <Link to={isAuthenticated ? homeRoute : "/register"}>
              {isAuthenticated 
                ? userType === "HUB_DJ" 
                  ? "Go to DJ Dashboard" 
                  : "Go to Parties"
                : "Get Started For Free"
              }
            </Link>
          </Button>
        </motion.div>
      </motion.div>
      
      <footer className="bg-card/40 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <LogoPlaceholder className="w-10 h-10 mb-2 mx-auto md:mx-0" />
              <p className="text-sm text-muted-foreground">© 2025 Jam4me. All rights reserved.</p>
            </div>
            <div className="flex gap-4">
              <Link to="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Support
              </Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}