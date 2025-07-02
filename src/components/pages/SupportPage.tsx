import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { HelpCircle, MessageSquare, Phone, Mail, Instagram, Facebook, Twitter } from "lucide-react";
import { toast } from "sonner";

export function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2 gradient-text">Help & Support</h1>
        <p className="text-muted-foreground mb-8">
          Get help with using Jam4me and requesting songs at parties
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
                <CardDescription>Find answers to common questions about using Jam4me</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How do I join a party?</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">To join a party, you need either:</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>A 6-digit passcode provided by the DJ or event organizer</li>
                        <li>Or scan the QR code displayed at the venue</li>
                      </ul>
                      <p className="mt-2">
                        Once you have either of these, you can:
                      </p>
                      <ol className="list-decimal pl-5 space-y-2 mt-2">
                        <li>Go to the "Parties" tab in the app</li>
                        <li>Click "Join Party"</li>
                        <li>Enter the passcode or scan the QR code</li>
                        <li>You'll be connected to the party and can start requesting songs!</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How do I request a song?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        Once you've joined a party, requesting a song is easy:
                      </p>
                      <ol className="list-decimal pl-5 mt-2 space-y-2">
                        <li>Click the "Request Song" button</li>
                        <li>Search for the song you want using the Spotify integration</li>
                        <li>Select the amount you want to pay (minimum is set by the DJ)</li>
                        <li>Confirm your request</li>
                      </ol>
                      <p className="mt-2">
                        Remember, the more you pay, the higher priority your song gets in the queue!
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>How does the wallet system work?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        Jam4me uses a wallet system to make song requests easier:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li>Fund your wallet using your debit/credit card or bank transfer</li>
                        <li>Use your wallet balance to pay for song requests</li>
                        <li>If a DJ declines your song, you'll automatically get a refund to your wallet</li>
                        <li>Your wallet balance stays available for future parties</li>
                      </ul>
                      <p className="mt-2">
                        You can add funds to your wallet at any time from the Wallet page.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>What happens if my song request is declined?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        If a DJ declines your song request:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li>You'll receive a notification that your request was declined</li>
                        <li>The DJ may provide a reason (e.g., song already in queue, inappropriate for venue)</li>
                        <li>The full amount you paid will be automatically refunded to your wallet</li>
                        <li>You can use this refunded amount to request another song</li>
                      </ul>
                      <p className="mt-2">
                        DJs have the final say on which songs are played at their parties.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>How do I check the status of my song request?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        You can track the status of your song requests in the party detail page:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li><strong>In Queue:</strong> Your song is waiting to be played</li>
                        <li><strong>Now Playing:</strong> Your song is currently playing</li>
                        <li><strong>Played:</strong> Your song has been played</li>
                        <li><strong>Declined:</strong> Your song was declined by the DJ (with refund)</li>
                      </ul>
                      <p className="mt-2">
                        The party page updates in real-time, so you'll always see the current status.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-6">
                    <AccordionTrigger>What if the song I want isn't found?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        If you can't find the song you're looking for:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li>Try searching for the artist name instead of the song title</li>
                        <li>Check if there are any spelling errors in your search</li>
                        <li>The song might not be available on Spotify (our music source)</li>
                        <li>Try requesting a different song by the same artist</li>
                      </ul>
                      <p className="mt-2">
                        You can also approach the DJ directly to see if they have the song in their personal collection.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-7">
                    <AccordionTrigger>Can I request the same song multiple times?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        While you can request the same song multiple times, please note:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li>If the same song is already in the queue, your request will be combined with the existing one</li>
                        <li>Your payment will be added to the existing request, increasing its priority</li>
                        <li>DJs typically avoid playing the same song multiple times in a short period</li>
                        <li>If the song was recently played, the DJ might decline your request (with refund)</li>
                      </ul>
                      <p className="mt-2">
                        For the best experience, we recommend requesting diverse songs throughout the night.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-8">
                    <AccordionTrigger>How does song priority work?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        Song priority in the queue is determined by several factors:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li><strong>Payment amount:</strong> Higher payments get higher priority</li>
                        <li><strong>Combined requests:</strong> If multiple people request the same song, their payments are combined</li>
                        <li><strong>Time of request:</strong> Earlier requests generally play before later ones of the same amount</li>
                        <li><strong>DJ discretion:</strong> DJs may adjust the order based on the flow of the party</li>
                      </ul>
                      <p className="mt-2">
                        If you really want your song played sooner, consider paying more than the minimum amount.
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
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Get in touch with our customer support team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Contact Information</h3>
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
                            +234 800 526 463
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
                            href="mailto:support@jam4me.com" 
                            className="text-sm text-primary hover:text-primary/80 transition-colors"
                          >
                            support@jam4me.com
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
                    <h3 className="text-lg font-medium mb-4">Connect With Us</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Follow us for updates, new features, and party announcements:
                    </p>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Twitter className="h-4 w-4" />
                        Twitter
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Facebook className="h-4 w-4" />
                        Facebook
                      </Button>
                    </div>
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