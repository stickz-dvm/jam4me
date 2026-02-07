import { useState, useEffect } from "react";
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
import apiClient from "../../api/apiClient";

export function DjWalletPage() {
  const { user } = useAuth();
  const { balance, transactions, withdrawFunds } = useWallet();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // My new states for handling the withdrawal form
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  // I'll run this once when the page loads to get the bank list.
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
  }, []); // The empty array means this only runs once.

  // This function will handle verifying the account number.
  const handleVerifyAccount = async (accountNum?: string) => {
    const accountToVerify = accountNum || accountNumber;
    if (accountToVerify.length !== 10 || !selectedBankCode) {
      return;
    }

    setIsVerifying(true);
    setIsVerified(false);
    setAccountName("");
    setVerificationError("");

    try {
      const response = await apiClient.post("/user_wallet/verify_account/", {
        account_number: accountToVerify,
        bank_code: selectedBankCode,
      });

      // Log the full response for debugging
      console.log("Full DJ Verification Response Object:", response);
      console.log("Response Body (data):", response.data);

      const responseBody = response.data;

      // The dev confirmed the structure is { "data": { "account_name": "..." } }
      // So we check responseBody.data.account_name first
      const accountNameFromApi =
        responseBody?.data?.account_name ||
        responseBody?.account_name ||
        responseBody?.data?.name ||
        responseBody?.name ||
        responseBody?.accountName ||
        responseBody?.data?.accountName;

      if (responseBody && accountNameFromApi) {
        setAccountName(accountNameFromApi);
        setIsVerified(true);
        toast.success("Account verified: " + accountNameFromApi);
      } else {
        console.warn("Could not find account name in response body:", responseBody);
        // If we got a 200 but couldn't find the name, let's show what we DID get
        const rawInfo = responseBody?.data ? JSON.stringify(responseBody.data) : JSON.stringify(responseBody);
        setVerificationError(`Account found but name hidden. Response: ${rawInfo.substring(0, 50)}...`);
      }
    } catch (error: any) {
      console.error("DJ Verification Error:", error);
      const message = error.response?.data?.message || error.message || "Verification failed. Please check the details.";
      setVerificationError(message);
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  // I'll use this to reset the verification if the user changes the bank or account number.
  useEffect(() => {
    setIsVerified(false);
    setAccountName("");
    setVerificationError("");
  }, [accountNumber, selectedBankCode]);

  const handleWithdraw = async () => {
    if (!isVerified || !withdrawAmount || !accountName) {
      toast.error("Please ensure your account is verified and you have entered an amount.");
      return;
    }

    setIsWithdrawing(true);

    try {
      // Call the real 'withdrawFunds' function from the WalletContext
      await withdrawFunds(parseFloat(withdrawAmount), {
        accountNumber,
        bankCode: selectedBankCode,
        accountName
      });
      toast.success(`₦${withdrawAmount} withdrawal initiated successfully!`);

      setIsDialogOpen(false);
      setWithdrawAmount("");
      setSelectedBankCode("");
      setAccountNumber("");
      setAccountName("");
      setIsVerified(false);

    } catch (error) {
      console.error("Withdrawal failed:", error);
      toast.error("Withdrawal failed. Please try again.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const totalEarned = transactions
    .filter(tx => tx.type === "songPayment")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalWithdrawn = transactions
    .filter(tx => tx.type === "withdrawal" && tx.status === "completed")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const pendingWithdrawals = transactions
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
                    {/* Amount Input */}
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

                    {/* Bank Selection */}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="bank" className="text-right">
                        Bank
                      </Label>
                      <div className="col-span-3">
                        <Select value={selectedBankCode} onValueChange={setSelectedBankCode}>
                          <SelectTrigger className="bg-input/50 backdrop-blur-sm">
                            <SelectValue placeholder="Select bank" />
                          </SelectTrigger>
                          <SelectContent>
                            {banks.length > 0 ? (
                              banks.map((bank, index) => (
                                <SelectItem key={`${bank.code}-${index}`} value={bank.code}>
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

                    {/* Account Number Input */}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="account" className="text-right">
                        Account No.
                      </Label>
                      <div className="col-span-3">
                        <Input
                          id="account"
                          value={accountNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setAccountNumber(value);
                            // Seamless verification: trigger when 10 digits are entered
                            if (value.length === 10 && selectedBankCode) {
                              handleVerifyAccount(value);
                            }
                          }}
                          maxLength={10}
                          className="bg-input/50 backdrop-blur-sm"
                          placeholder="Enter account number"
                        />
                      </div>
                    </div>

                    {/* Verification Status Display */}
                    {(isVerifying || isVerified || verificationError) && (
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
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleWithdraw}
                      disabled={
                        isWithdrawing ||
                        !isVerified ||
                        !withdrawAmount ||
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
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 backdrop-blur-sm"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${tx.type === "songPayment"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-primary/20 text-primary"
                          }`}>
                          {tx.type === "songPayment" ? (
                            <ArrowDownIcon className="h-5 w-5" />
                          ) : (
                            <ArrowUpIcon className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          {tx.partyName && <p className="text-sm text-muted-foreground">{tx.partyName}</p>}
                          <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${tx.type === "songPayment" ? "text-green-500" : ""}`}>
                          {tx.type === "songPayment" ? "+" : "-"}₦{tx.amount.toLocaleString()}
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
                  {transactions
                    .filter(tx => tx.type === "songPayment")
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
                            <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
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
                  {transactions
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
                            <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
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