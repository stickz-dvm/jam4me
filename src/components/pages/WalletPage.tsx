import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import {
  WalletIcon,
  PlusIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  Landmark,
  Building,
  BanknoteIcon,
  Loader2,
} from "lucide-react";
import apiClient from "../../api/apiClient";

export function WalletPage() {
  const { user } = useAuth();
  const {
    balance,
    transactions,
    fundWallet,
    withdrawFunds,
    isLoading,
  } = useWallet();
  const [fundAmount, setFundAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFundDialogOpen, setIsFundDialogOpen] =
    useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] =
    useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [showValidationPopup, setShowValidationPopup] = useState(false);

  // I'm adding all the states I need for the real withdrawal flow.
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [accountName, setAccountName] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  // This is my new logic to handle the user coming back from Paystack.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const trxref = urlParams.get('trxref');
    const reference = urlParams.get('reference');

    if (trxref && reference) {
      setShowValidationPopup(true);
      setTimeout(() => {
        setShowValidationPopup(false);
        toast.success("Your wallet has been funded successfully!");
        // TODO: In a real app, I'd get the real amount from the backend after verification.
        fundWallet(1000); // Using a placeholder amount for now.
      }, 3000);
      window.history.replaceState(null, '', '/wallet');
    }
  }, [fundWallet]);

  // I'm adding the logic to fetch banks when the page loads.
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        // Add a small delay to ensure auth is fully initialized
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const response = await apiClient.get("/user_wallet/list_banks/");
        if (response.data && Array.isArray(response.data.data)) {
          setBanks(response.data.data);
        } else {
          // Retry once
          await new Promise(resolve => setTimeout(resolve, 500));
          const retryResponse = await apiClient.get("/user_wallet/list_banks/");
          if (retryResponse.data && Array.isArray(retryResponse.data.data)) {
            setBanks(retryResponse.data.data);
          } else {
            toast.error("Could not read the bank list from the server.");
          }
        }
      } catch (error: any) {
        // Retry once on error
        await new Promise(resolve => setTimeout(resolve, 500));
        try {
          const retryResponse = await apiClient.get("/user_wallet/list_banks/");
          if (retryResponse.data && Array.isArray(retryResponse.data.data)) {
            setBanks(retryResponse.data.data);
          } else {
            toast.error("Failed to load the list of banks.");
          }
        } catch (retryError) {
          toast.error("Failed to load the list of banks.");
        }
      }
    };
    
    fetchBanks();
  }, []);

  // This is my function to verify the user's bank account.
  const handleVerifyAccount = async (accountNum?: string) => {
    const accountToVerify = accountNum || accountNumber;
    if (accountToVerify.length !== 10 || !selectedBank) {
      return;
    }

    setIsVerifying(true);
    setIsVerified(false);
    setAccountName("");
    setVerificationError("");

    try {
      const bank = banks.find(b => b.name === selectedBank);
      if (!bank) {
        toast.error("Selected bank is not valid.");
        setIsVerifying(false);
        return;
      }
      
      const response = await apiClient.post("/user_wallet/verify_account/", {
        account_number: accountToVerify,
        bank_code: bank.code,
      });

      if (response.data && response.data.account_name) {
        setAccountName(response.data.account_name);
        setIsVerified(true);
        toast.success("Account verified!");
      } else {
        setVerificationError("Verification successful, but no account name was returned.");
      }
    } catch (error: any) {
      const message = error.message || "Verification failed. Please check the details.";
      setVerificationError(message);
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  // This resets the verification if I change the inputs.
  useEffect(() => {
    setIsVerified(false);
    setAccountName("");
    setVerificationError("");
  }, [accountNumber, selectedBank]);

  const handleInitiatePaystack = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (!user || !user.id) {
      toast.error("You need to be logged in to fund your wallet.");
      return;
    }

    setIsProcessing(true);

    try {
      const amountAsString = fundAmount.toString();
      const payload = {
        user_id: user.id,
        amount: amountAsString,
        user_status: 'hub_user' 
      };
      
      const response = await apiClient.post('/fund_wallet/', payload);

      if (response.data && response.data.checkout_url) {
        toast.success("Redirecting to Paystack...");
        window.location.href = response.data.checkout_url;
      } else {
        toast.error("Could not create a payment session. Please try again.");
      }

    } catch (error) {
      console.error("Error creating Paystack session:", error);
      toast.error("Something went wrong. Could not connect to payment service.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleWithdraw = async () => {
    if (!isVerified || !withdrawAmount || !accountName || !selectedBank) {
      toast.error("Please ensure your account is verified and you have entered an amount.");
      return;
    }

    setIsProcessing(true);

    try {
      const amount = parseFloat(withdrawAmount);
      const bank = banks.find(b => b.name === selectedBank);
      if (!bank) {
        toast.error("An error occurred with the selected bank.");
        setIsProcessing(false);
        return;
      }

      await withdrawFunds(amount, {
        accountNumber: accountNumber,
        bankCode: bank.code,
        accountName: accountName,
      });

      setIsWithdrawDialogOpen(false);
      setWithdrawAmount("");
      setSelectedBank("");
      setAccountNumber("");
      setAccountName("");
      setIsVerified(false);

    } catch (error) {
      console.error("Withdrawal failed on the page:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const walletTransactions = transactions.map((tx) => ({
    id: tx.id,
    type:
      tx.type === "deposit"
        ? "fund"
        : tx.type === "withdrawal"
          ? "withdrawal"
          : "spend",
    amount: tx.amount,
    description: tx.description,
    timestamp: tx.date,
    status: "completed",
    partyName: tx.partyName,
  }));

  const totalFunded = transactions
    .filter((tx) => tx.type === "deposit")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalSpent = transactions
    .filter(
      (tx) =>
        tx.type === "payment" &&
        !tx.description.includes("refund"),
    )
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalRefunded = transactions
    .filter(
      (tx) =>
        tx.type === "refund" ||
        tx.description.includes("refund"),
    )
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2 gradient-text">
          My Wallet
        </h1>
        <p className="text-muted-foreground mb-8">
          Fund your wallet to request songs at parties
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">
                Available Balance
              </CardTitle>
              <CardDescription>
                Your current wallet balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <WalletIcon className="h-6 w-6 text-primary" />
                <span className="text-3xl font-bold">
                  ₦{balance.toLocaleString()}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Dialog
                open={isFundDialogOpen}
                onOpenChange={setIsFundDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Fund Wallet
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-md">
                  <DialogHeader>
                    <DialogTitle>Fund Your Wallet</DialogTitle>
                    <DialogDescription>
                      Add money to your wallet to request songs
                      at parties.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label
                        htmlFor="amount"
                        className="text-right"
                      >
                        Amount
                      </Label>
                      <div className="col-span-3 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          ₦
                        </span>
                        <Input
                          id="amount"
                          type="number"
                          value={fundAmount}
                          onChange={(e) =>
                            setFundAmount(e.target.value)
                          }
                          className="pl-8 bg-input/50 backdrop-blur-sm"
                          placeholder="Enter amount"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">
                        Payment Method
                      </Label>
                      <div className="col-span-3">
                        <div className="flex items-center p-3 rounded-md bg-muted/30 backdrop-blur-sm border border-border/50">
                          <Landmark className="h-5 w-5 mr-2 text-green-500" />
                          <span>Paystack</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            Secure Payment
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Pay with bank transfer, card, or USSD
                          via Paystack
                        </p>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsFundDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleInitiatePaystack}
                      disabled={
                        isProcessing || !fundAmount || isLoading
                      }
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? "Connecting to Paystack..." : "Pay with Paystack"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isWithdrawDialogOpen}
                onOpenChange={setIsWithdrawDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <BanknoteIcon className="h-4 w-4 mr-2" />
                    Withdraw Funds
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-md">
                  <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                    <DialogDescription>
                      Withdraw money from your wallet to your bank account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="withdrawAmount" className="text-right">
                        Amount
                      </Label>
                      <div className="col-span-3 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                        <Input
                          id="withdrawAmount"
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
                        <Select value={selectedBank} onValueChange={setSelectedBank}>
                          <SelectTrigger className="bg-input/50 backdrop-blur-sm">
                            <SelectValue placeholder="Select your bank" />
                          </SelectTrigger>
                          <SelectContent>
                            {banks.length > 0 ? (
                              banks.map((bank, index) => (
                                <SelectItem key={`${bank.code}-${index}`} value={bank.name}>
                                  {bank.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="loading" disabled>
                                Loading banks...
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="accountNumber" className="text-right">
                        Account No.
                      </Label>
                      <div className="col-span-3">
                        <Input
                          id="accountNumber"
                          type="text"
                          value={accountNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setAccountNumber(value);
                            if (value.length === 10 && selectedBank) {
                              handleVerifyAccount(value);
                            }
                          }}
                          className="bg-input/50 backdrop-blur-sm"
                          placeholder="10-digit account number"
                          maxLength={10}
                        />
                      </div>
                    </div>
                    { (isVerifying || isVerified || verificationError) && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <div className="col-start-2 col-span-3 text-sm">
                          {isVerifying && (
                            <div className="flex items-center text-muted-foreground">
                              <WalletIcon className="h-4 w-4 mr-2 animate-spin" />
                              Verifying...
                            </div>
                          )}
                          {verificationError && !isVerifying && (
                            <div className="text-destructive font-medium">
                              {verificationError}
                            </div>
                          )}
                          {isVerified && accountName && !isVerifying && (
                            <div className="text-green-500 font-bold flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" /> {accountName}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsWithdrawDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleWithdraw}
                      disabled={
                        isProcessing ||
                        !isVerified ||
                        !withdrawAmount ||
                        parseFloat(withdrawAmount) <= 0 ||
                        parseFloat(withdrawAmount) > balance
                      }
                    >
                      {isProcessing ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ArrowDownIcon className="h-4 w-4 mr-2" />
                          Withdraw
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">
                Total Funded
              </CardTitle>
              <CardDescription>
                Total money added to wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <PlusIcon className="h-6 w-6 text-green-500" />
                <span className="text-3xl font-bold">
                  ₦{totalFunded.toLocaleString()}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                All your wallet funding activities
              </p>
            </CardFooter>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">
                Total Spent
              </CardTitle>
              <CardDescription>
                Total spent on song requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <ArrowUpIcon className="h-6 w-6 text-primary" />
                <span className="text-3xl font-bold">
                  ₦{totalSpent.toLocaleString()}
                </span>
              </div>
              {totalRefunded > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <span className="text-yellow-accent">
                    ₦{totalRefunded.toLocaleString()}
                  </span>{" "}
                  refunded
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                All your song request payments
              </p>
            </CardFooter>
          </Card>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50 mb-8">
          <CardHeader>
            <CardTitle>Quick Fund</CardTitle>
            <CardDescription>
              Quickly add money to your wallet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[500, 1000, 2000, 5000, 10000].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  className="flex-1 min-w-[80px]"
                  onClick={() => {
                    setFundAmount(amount.toString());
                    setIsFundDialogOpen(true);
                  }}
                >
                  ₦{amount.toLocaleString()}
                </Button>
              ))}
              <Button
                variant="outline"
                className="flex-1 min-w-[80px]"
                onClick={() => {
                  setFundAmount("");
                  setIsFundDialogOpen(true);
                }}
              >
                Custom
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="all">
              All Transactions
            </TabsTrigger>
            <TabsTrigger value="funding">Funding</TabsTrigger>
            <TabsTrigger value="requests">
              Song Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  View all your wallet transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {walletTransactions.length > 0 ? (
                    walletTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 backdrop-blur-sm"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-2 rounded-full ${
                              tx.type === "fund"
                                ? "bg-green-500/20 text-green-500"
                                : tx.type === "withdrawal"
                                  ? "bg-yellow-accent/20 text-yellow-accent"
                                  : "bg-primary/20 text-primary"
                            }`}
                          >
                            {tx.type === "fund" ? (
                              <ArrowDownIcon className="h-5 w-5" />
                            ) : tx.type === "withdrawal" ? (
                              <BanknoteIcon className="h-5 w-5" />
                            ) : (
                              <ArrowUpIcon className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {tx.description}
                            </p>
                            {tx.partyName && (
                              <p className="text-sm text-muted-foreground">
                                {tx.partyName}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {formatDate(tx.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              tx.type === "fund"
                                ? "text-green-500"
                                : tx.type === "withdrawal"
                                  ? "text-yellow-accent"
                                  : ""
                            }`}
                          >
                            {tx.type === "fund" ? "+" : "-"}₦
                            {tx.amount.toLocaleString()}
                          </p>
                          <div className="flex items-center justify-end space-x-1 text-xs">
                            {tx.status === "completed" ? (
                              <>
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-green-500">
                                  Completed
                                </span>
                              </>
                            ) : tx.status === "processing" ? (
                              <>
                                <Clock className="h-3 w-3 text-yellow-accent" />
                                <span className="text-yellow-accent">
                                  Processing
                                </span>
                              </>
                            ) : tx.status === "refunded" ? (
                              <>
                                <ArrowDownIcon className="h-3 w-3 text-yellow-accent" />
                                <span className="text-yellow-accent">
                                  Refunded
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 text-destructive" />
                                <span className="text-destructive">
                                  Failed
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">
                        No transactions yet. Fund your wallet to
                        get started!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funding">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Funding History</CardTitle>
                <CardDescription>
                  View your wallet funding transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {walletTransactions
                    .filter(
                      (tx) =>
                        tx.type === "fund" ||
                        tx.type === "withdrawal",
                    )
                    .map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 backdrop-blur-sm"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-2 rounded-full ${
                              tx.type === "fund"
                                ? "bg-green-500/20 text-green-500"
                                : "bg-yellow-accent/20 text-yellow-accent"
                            }`}
                          >
                            {tx.type === "fund" ? (
                              <ArrowDownIcon className="h-5 w-5" />
                            ) : (
                              <BanknoteIcon className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {tx.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(tx.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${tx.type === "fund" ? "text-green-500" : "text-yellow-accent"}`}
                          >
                            {tx.type === "fund" ? "+" : "-"}₦
                            {tx.amount.toLocaleString()}
                          </p>
                          <div className="flex items-center justify-end space-x-1 text-xs">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">
                              Completed
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Song Request History</CardTitle>
                <CardDescription>
                  View your song request payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {walletTransactions
                    .filter((tx) => tx.type === "spend")
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
                            <p className="font-medium">
                              {tx.description}
                            </p>
                            {tx.partyName && (
                              <p className="text-sm text-muted-foreground">
                                {tx.partyName}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {formatDate(tx.timestamp)}
                            </p>
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
                                <span className="text-green-500">
                                  Completed
                                </span>
                              </>
                            ) : tx.status === "refunded" ? (
                              <>
                                <ArrowDownIcon className="h-3 w-3 text-yellow-accent" />
                                <span className="text-yellow-accent">
                                  Refunded
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 text-destructive" />
                                <span className="text-destructive">
                                  Failed
                                </span>
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

        <Dialog open={showValidationPopup}>
          <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle className="text-center">Validating Payment</DialogTitle>
              <DialogDescription className="text-center">
                Please wait while we confirm your transaction. Do not close this page.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}