import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { HelpCircle, MessageSquare, Phone, Mail, Smartphone } from "lucide-react";
import { toast } from "sonner";

export function DjSupportPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2 gradient-text">DJ Support Center</h1>
        <p className="text-muted-foreground mb-8">
          Get help with your DJ account, party management, and earnings
        </p>

        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span>FAQs</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Contact Us</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Find answers to common questions about DJ features</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How do I create a party?</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">To create a party:</p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Go to your DJ Dashboard</li>
                        <li>Click the "Create New Party" button</li>
                        <li>Fill in party details like name, venue, date, and time</li>
                        <li>Set your base price for song requests</li>
                        <li>Click "Create Party" to generate a unique 6-digit passcode and QR code</li>
                      </ol>
                      <p className="mt-2">
                        Share the passcode or QR code with partygoers so they can join and request songs.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How do I set pricing for song requests?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        When creating a party, you can set a minimum base price for all song requests. This is the minimum amount partygoers will need to pay to request a song.
                      </p>
                      <p className="mt-2">
                        Partygoers can choose to pay more than the minimum to prioritize their requests. The higher the payment, the higher the priority of the request in your queue.
                      </p>
                      <p className="mt-2">
                        You can also adjust the base price for an ongoing party by going to the party details page and clicking "Edit Party Settings".
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>How do earnings and payments work?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        When a partygoer requests a song and pays for it, 85% of the payment amount goes directly to your Jam4me wallet. The remaining 15% is Jam4me's service fee.
                      </p>
                      <p className="mt-2">
                        You can withdraw your earnings to your Nigerian bank account at any time from your DJ Wallet page. Standard bank transfers typically process within 24 hours on business days.
                      </p>
                      <p className="mt-2">
                        There's no minimum withdrawal amount, and we don't charge any additional fees for withdrawals.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>What happens when I decline a song request?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        As a DJ, you have full control over which songs to play. If you decide to decline a song request:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li>The request is removed from your queue</li>
                        <li>The partygoer is automatically refunded their full payment</li>
                        <li>The partygoer receives a notification that their request was declined</li>
                      </ul>
                      <p className="mt-2">
                        You can optionally provide a reason for declining the request, which will be shared with the partygoer.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>How do I connect my Spotify account?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        Connecting your Spotify account allows you to easily search for songs and play them during parties:
                      </p>
                      <ol className="list-decimal pl-5 mt-2 space-y-2">
                        <li>Go to your DJ Profile page</li>
                        <li>Click "Connect Spotify"</li>
                        <li>Sign in to your Spotify account and authorize Jam4me</li>
                      </ol>
                      <p className="mt-2">
                        For optimal performance, we recommend using a Spotify Premium account. Free accounts have limitations on playback control that may affect your DJ experience.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-6">
                    <AccordionTrigger>How do I close a party?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        To close a party and prevent new song requests:
                      </p>
                      <ol className="list-decimal pl-5 mt-2 space-y-2">
                        <li>Go to your active party's page</li>
                        <li>Click the "Close Party" button in the top right corner</li>
                        <li>Confirm that you want to close the party</li>
                      </ol>
                      <p className="mt-2">
                        After closing a party, existing song requests in the queue will remain, but no new requests can be made. You can still play the remaining requested songs.
                      </p>
                      <p className="mt-2">
                        Party details and statistics will be available in your DJ Dashboard under "Past Parties".
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-7">
                    <AccordionTrigger>What are the system requirements for DJing?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        For the best DJ experience on Jam4me, we recommend:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li>A stable internet connection (at least 10 Mbps download/upload)</li>
                        <li>A recent smartphone (iOS 14+ or Android 9+) or computer (Windows 10+, macOS 10.15+)</li>
                        <li>Spotify Premium account for full playback control</li>
                        <li>External speakers or sound system connected to your device</li>
                      </ul>
                      <p className="mt-2">
                        If using a mobile device, we recommend keeping it charged or connected to power during long events.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-8">
                    <AccordionTrigger>How do I handle multiple song requests for the same song?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        If multiple partygoers request the same song, the system will automatically:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li>Combine the requests into a single entry in your queue</li>
                        <li>Add the total paid amount from all requests</li>
                        <li>Show you how many people requested the song</li>
                      </ul>
                      <p className="mt-2">
                        This helps prevent playing the same song multiple times while still respecting the popularity of the request and the combined payment amount.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Contact DJ Support</CardTitle>
                <CardDescription>Get in touch with our dedicated DJ support team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Direct Contact</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/20 rounded-full">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Phone Support</p>
                          <a 
                            href="tel:+2348005264633" 
                            className="text-sm text-primary hover:text-primary/80 transition-colors"
                          >
                            +234 800 JAM 4ME (800 526 463)
                          </a>
                          <p className="text-xs text-muted-foreground">Mon-Fri, 9am-6pm WAT</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/20 rounded-full">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Email Support</p>
                          <a 
                            href="mailto:dj-support@jam4me.com" 
                            className="text-sm text-primary hover:text-primary/80 transition-colors"
                          >
                            dj-support@jam4me.com
                          </a>
                          <p className="text-xs text-muted-foreground">24/7 response within 24 hours</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/20 rounded-full">
                          <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">WhatsApp Support</p>
                          <a 
                            href="https://wa.me/2348005264633" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm text-primary hover:text-primary/80 transition-colors"
                          >
                            +234 800 526 4633
                          </a>
                          <p className="text-xs text-muted-foreground">Faster responses for urgent issues</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">DJ Community</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Join our DJ community to connect with other DJs, share tips, and get help:
                    </p>
                    <a href="https://chat.whatsapp.com/DJsJam4me" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="mr-2 flex items-center gap-2">
                        <div className="bg-[#25D366] p-1 rounded-full flex items-center justify-center">
                          <Smartphone className="h-3 w-3 text-white" />
                        </div>
                        DJ Whatsapp Group
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}