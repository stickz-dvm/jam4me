import { useState } from "react";
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
  CreditCard,
  BanknoteIcon,
} from "lucide-react";

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
  const [bankName, setBankName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFundDialogOpen, setIsFundDialogOpen] =
    useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] =
    useState(false);
  const [isPaystackModalOpen, setIsPaystackModalOpen] =
    useState(false);
  const [selectedBank, setSelectedBank] = useState("");

  const nigerianBanks = [
    { name: "Access Bank", code: "044" },
    { name: "First Bank", code: "011" },
    { name: "GT Bank", code: "058" },
    { name: "UBA", code: "033" },
    { name: "Zenith Bank", code: "057" },
    { name: "Wema Bank", code: "035" },
    { name: "Sterling Bank", code: "232" },
    { name: "Kuda Bank", code: "090267" },
    { name: "Opay", code: "090172" },
  ];

  const handleInitiatePaystack = () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // In a real implementation, this would make an API call to initialize a Paystack transaction
    setIsPaystackModalOpen(true);

    // Simulate Paystack popup
    setTimeout(() => {
      // This would be handled by the Paystack callback in a real implementation
      handlePaystackSuccess();
    }, 2000);
  };

  const handlePaystackSuccess = async () => {
    setIsProcessing(true);
    setIsPaystackModalOpen(false);

    try {
      // Convert fundAmount to a number
      const amount = parseFloat(fundAmount);

      // Call the fundWallet method from WalletContext to update the wallet balance and add transaction history
      await fundWallet(amount);

      setIsFundDialogOpen(false);
      setFundAmount("");
    } catch (error) {
      toast.error(
        "Failed to process payment. Please try again.",
      );
      console.error("Payment processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(withdrawAmount) > balance) {
      toast.error("Insufficient funds");
      return;
    }

    if (!selectedBank) {
      toast.error("Please select a bank");
      return;
    }

    if (!accountNumber || accountNumber.length < 10) {
      toast.error("Please enter a valid account number");
      return;
    }

    setIsProcessing(true);

    try {
      const amount = parseFloat(withdrawAmount);
      const bankDetails = {
        accountNumber: accountNumber,
        bankName: selectedBank,
      };

      // Call the withdrawFunds method from WalletContext
      await withdrawFunds(amount, bankDetails);

      setIsWithdrawDialogOpen(false);
      setWithdrawAmount("");
      setSelectedBank("");
      setAccountNumber("");
    } catch (error) {
      toast.error(
        "Failed to process withdrawal. Please try again.",
      );
      console.error("Withdrawal processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Use the actual transactions from the wallet context
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

  // Summary statistics based on actual transactions
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
                            Secure Nigerian Payment
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
                      {isProcessing
                        ? "Processing..."
                        : isPaystackModalOpen
                          ? "Processing payment..."
                          : "Pay with Paystack"}
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
                      Withdraw money from your wallet to your
                      bank account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label
                        htmlFor="withdrawAmount"
                        className="text-right"
                      >
                        Amount
                      </Label>
                      <div className="col-span-3 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          ₦
                        </span>
                        <Input
                          id="withdrawAmount"
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) =>
                            setWithdrawAmount(e.target.value)
                          }
                          className="pl-8 bg-input/50 backdrop-blur-sm"
                          placeholder="Enter amount"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label
                        htmlFor="bank"
                        className="text-right"
                      >
                        Bank
                      </Label>
                      <div className="col-span-3">
                        <Select
                          value={selectedBank}
                          onValueChange={setSelectedBank}
                        >
                          <SelectTrigger className="bg-input/50 backdrop-blur-sm">
                            <SelectValue placeholder="Select your bank" />
                          </SelectTrigger>
                          <SelectContent>
                            {nigerianBanks.map((bank) => (
                              <SelectItem
                                key={bank.code}
                                value={bank.name}
                              >
                                {bank.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label
                        htmlFor="accountNumber"
                        className="text-right"
                      >
                        Account No.
                      </Label>
                      <div className="col-span-3">
                        <Input
                          id="accountNumber"
                          type="text"
                          value={accountNumber}
                          onChange={(e) =>
                            setAccountNumber(
                              e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10),
                            )
                          }
                          className="bg-input/50 backdrop-blur-sm"
                          placeholder="10-digit account number"
                          maxLength={10}
                        />
                      </div>
                    </div>

                    {selectedBank &&
                      accountNumber.length === 10 && (
                        <div className="bg-muted/20 p-3 rounded-md">
                          <div className="flex items-center">
                            <Building className="h-5 w-5 mr-2 text-yellow-accent" />
                            <div>
                              <p className="text-sm font-medium">
                                Account Verification
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Mohamed Ibrahim - {selectedBank}
                              </p>
                            </div>
                            <CheckCircle className="h-5 w-5 ml-auto text-green-500" />
                          </div>
                        </div>
                      )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setIsWithdrawDialogOpen(false)
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleWithdraw}
                      disabled={
                        isProcessing ||
                        !withdrawAmount ||
                        parseFloat(withdrawAmount) <= 0 ||
                        parseFloat(withdrawAmount) > balance ||
                        !selectedBank ||
                        accountNumber.length !== 10
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
      </motion.div>
    </div>
  );
}