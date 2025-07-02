import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { WalletIcon, ArrowDownIcon, ArrowUpIcon, Clock, CheckCircle, AlertCircle } from "lucide-react";

export function DjWalletPage() {
  const { user } = useAuth();
  const { balance, transactions } = useWallet();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleWithdraw = () => {
    setIsWithdrawing(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success(`₦${withdrawAmount} withdrawal initiated successfully!`);
      setIsWithdrawing(false);
      setIsDialogOpen(false);
      setWithdrawAmount("");
      setBankName("");
      setAccountNumber("");
    }, 2000);
  };

  // Mock transaction data - in a real app, this would come from the API
  const mockTransactions = [
    {
      id: "tx1",
      type: "earning",
      amount: 500,
      description: "Song request: 'Calm Down' by Rema",
      timestamp: new Date(2025, 4, 20, 20, 15),
      status: "completed",
      partyName: "Friday Night Jam @ Club Quilox"
    },
    {
      id: "tx2",
      type: "earning",
      amount: 2000,
      description: "Song request: 'Unavailable' by Davido",
      timestamp: new Date(2025, 4, 20, 21, 30),
      status: "completed",
      partyName: "Friday Night Jam @ Club Quilox"
    },
    {
      id: "tx3",
      type: "withdrawal",
      amount: 2000,
      description: "Withdrawal to GTBank ****4532",
      timestamp: new Date(2025, 4, 21, 10, 15),
      status: "processing",
    },
    {
      id: "tx4",
      type: "earning",
      amount: 1500,
      description: "Song request: 'Last Last' by Burna Boy",
      timestamp: new Date(2025, 4, 22, 22, 45),
      status: "completed",
      partyName: "Saturday Night Special @ The Deck"
    },
    {
      id: "tx5",
      type: "earning",
      amount: 1000,
      description: "Song request: 'Essence' by Wizkid ft. Tems",
      timestamp: new Date(2025, 4, 22, 23, 10),
      status: "completed",
      partyName: "Saturday Night Special @ The Deck"
    },
    {
      id: "tx6",
      type: "earning",
      amount: 3000,
      description: "Song request: 'Sungba Remix' by Asake ft. Burna Boy",
      timestamp: new Date(2025, 4, 22, 23, 45),
      status: "completed",
      partyName: "Saturday Night Special @ The Deck"
    },
    {
      id: "tx7",
      type: "withdrawal",
      amount: 5000,
      description: "Withdrawal to First Bank ****7890",
      timestamp: new Date(2025, 4, 23, 9, 30),
      status: "completed",
    }
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Summary statistics
  const totalEarned = mockTransactions
    .filter(tx => tx.type === "earning")
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const totalWithdrawn = mockTransactions
    .filter(tx => tx.type === "withdrawal" && tx.status === "completed")
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const pendingWithdrawals = mockTransactions
    .filter(tx => tx.type === "withdrawal" && tx.status === "processing")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2 gradient-text">DJ Wallet</h1>
        <p className="text-muted-foreground mb-8">
          Manage your earnings from song requests and withdraw funds
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Available Balance</CardTitle>
              <CardDescription>Your current wallet balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <WalletIcon className="h-6 w-6 text-primary" />
                <span className="text-3xl font-bold">₦{balance.toLocaleString()}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">Withdraw Funds</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-md">
                  <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                    <DialogDescription>
                      Enter the amount you want to withdraw and your bank details.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">
                        Amount
                      </Label>
                      <div className="col-span-3 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                        <Input
                          id="amount"
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="pl-8 bg-input/50 backdrop-blur-sm"
                          placeholder="Enter amount"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="bank" className="text-right">
                        Bank
                      </Label>
                      <div className="col-span-3">
                        <Select value={bankName} onValueChange={setBankName}>
                          <SelectTrigger className="bg-input/50 backdrop-blur-sm">
                            <SelectValue placeholder="Select bank" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gtbank">Guaranty Trust Bank</SelectItem>
                            <SelectItem value="firstbank">First Bank</SelectItem>
                            <SelectItem value="zenithbank">Zenith Bank</SelectItem>
                            <SelectItem value="accessbank">Access Bank</SelectItem>
                            <SelectItem value="uba">United Bank for Africa</SelectItem>
                            <SelectItem value="stanbic">Stanbic IBTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="account" className="text-right">
                        Account No.
                      </Label>
                      <Input
                        id="account"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="col-span-3 bg-input/50 backdrop-blur-sm"
                        placeholder="Enter account number"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleWithdraw} 
                      disabled={
                        isWithdrawing || 
                        !withdrawAmount || 
                        !bankName || 
                        !accountNumber ||
                        parseFloat(withdrawAmount) > balance
                      }
                    >
                      {isWithdrawing ? "Processing..." : "Withdraw"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Total Earned</CardTitle>
              <CardDescription>Your lifetime earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <ArrowDownIcon className="h-6 w-6 text-spotify-green" />
                <span className="text-3xl font-bold">₦{totalEarned.toLocaleString()}</span>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">From all song requests across your parties</p>
            </CardFooter>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Total Withdrawn</CardTitle>
              <CardDescription>Your lifetime withdrawals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <ArrowUpIcon className="h-6 w-6 text-primary" />
                <span className="text-3xl font-bold">₦{totalWithdrawn.toLocaleString()}</span>
              </div>
              {pendingWithdrawals > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <span className="text-yellow-accent">₦{pendingWithdrawals.toLocaleString()}</span> pending
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">All successful withdrawals to your bank account</p>
            </CardFooter>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>View all your wallet transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTransactions.map((tx) => (
                    <div 
                      key={tx.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 backdrop-blur-sm"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          tx.type === "earning" 
                            ? "bg-green-500/20 text-green-500" 
                            : "bg-primary/20 text-primary"
                        }`}>
                          {tx.type === "earning" ? (
                            <ArrowDownIcon className="h-5 w-5" />
                          ) : (
                            <ArrowUpIcon className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          {tx.partyName && <p className="text-sm text-muted-foreground">{tx.partyName}</p>}
                          <p className="text-xs text-muted-foreground">{formatDate(tx.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${tx.type === "earning" ? "text-green-500" : ""}`}>
                          {tx.type === "earning" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                        </p>
                        <div className="flex items-center justify-end space-x-1 text-xs">
                          {tx.status === "completed" ? (
                            <>
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-green-500">Completed</span>
                            </>
                          ) : tx.status === "processing" ? (
                            <>
                              <Clock className="h-3 w-3 text-yellow-accent" />
                              <span className="text-yellow-accent">Processing</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 text-destructive" />
                              <span className="text-destructive">Failed</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="earnings">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Earnings History</CardTitle>
                <CardDescription>View your song request earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTransactions
                    .filter(tx => tx.type === "earning")
                    .map((tx) => (
                      <div 
                        key={tx.id} 
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 backdrop-blur-sm"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-full bg-green-500/20 text-green-500">
                            <ArrowDownIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{tx.description}</p>
                            {tx.partyName && <p className="text-sm text-muted-foreground">{tx.partyName}</p>}
                            <p className="text-xs text-muted-foreground">{formatDate(tx.timestamp)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-500">
                            +₦{tx.amount.toLocaleString()}
                          </p>
                          <div className="flex items-center justify-end space-x-1 text-xs">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">Completed</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="withdrawals">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>View your bank withdrawals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTransactions
                    .filter(tx => tx.type === "withdrawal")
                    .map((tx) => (
                      <div 
                        key={tx.id} 
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 backdrop-blur-sm"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-full bg-primary/20 text-primary">
                            <ArrowUpIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{tx.description}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(tx.timestamp)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            -₦{tx.amount.toLocaleString()}
                          </p>
                          <div className="flex items-center justify-end space-x-1 text-xs">
                            {tx.status === "completed" ? (
                              <>
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-green-500">Completed</span>
                              </>
                            ) : tx.status === "processing" ? (
                              <>
                                <Clock className="h-3 w-3 text-yellow-accent" />
                                <span className="text-yellow-accent">Processing</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 text-destructive" />
                                <span className="text-destructive">Failed</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}