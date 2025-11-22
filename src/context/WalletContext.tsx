import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { api } from "../api/apiMethods";

// NOTE: The original file imported these from a central types file. I'm defining them here
// to match the code you provided, but they should ideally live in `src/api/types.ts`.
export type Transaction = {
  id: string;
  amount: number;
  type: "deposit" | "withdrawal" | "payment" | "songPayment" | "refund";
  description: string;
  date: Date;
  songTitle?: string;
  artist?: string;
  partyName?: string;
  requestedBy?: string;
  status?: "completed" | "pending" | "processing" | "failed";
};

export type PaymentMethod = {
  id: string;
  type: "bankAccount" | "paystack";
  lastFour: string;
  name: string;
  isDefault: boolean;
};

// This is the main context type definition
export type WalletContextType = {
  balance: number;
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  fundWallet: (amount: number) => Promise<void>;
  // This is the line we are fixing. It now includes bankCode and accountName.
  withdrawFunds: (amount: number, bankDetails: { accountNumber: string; bankCode: string; accountName: string; }) => Promise<void>;
  payForSong: (amount: number, partyName: string, songTitle: string, artist: string) => Promise<void>;
  receiveSongPayment: (amount: number, partyName: string, songTitle: string, artist: string, requestedBy: string) => Promise<void>;
  refundSongPayment: (amount: number, partyName: string, songTitle: string, artist: string, requestedBy: string) => Promise<void>;
  addFunds: (amount: number) => Promise<void>;
  deductFunds: (amount: number) => Promise<void>;
  addPaymentMethod: (method: Omit<PaymentMethod, "id">) => Promise<void>;
  removePaymentMethod: (methodId: string) => Promise<void>;
  setDefaultPaymentMethod: (methodId: string) => Promise<void>;
  refreshWalletData: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pm-1", type: "paystack", lastFour: "N/A", name: "Paystack (Default)", isDefault: true },
  { id: "pm-2", type: "bankAccount", lastFour: "1234", name: "GTBank Account", isDefault: false }
];

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasFetchedDataRef = useRef(false);
  /**
   * Load wallet data from localStorage
   * This runs immediately without waiting for API calls
   */
  const loadLocalWalletData = useCallback(() => {
    if (!user) {
      setBalance(0);
      setTransactions([]);
      setPaymentMethods([]);
      return;
    }

    try {
      const storedBalance = localStorage.getItem(`jam4me-balance-${user.id}`);
      const storedTransactions = localStorage.getItem(`jam4me-transactions-${user.id}`);
      const storedPaymentMethods = localStorage.getItem(`jam4me-payment-methods-${user.id}`);

      if (storedBalance) {
        setBalance(Number(storedBalance));
      }

      if (storedTransactions) {
        const parsedTransactions = JSON.parse(storedTransactions);
        setTransactions(
          parsedTransactions.map((t: any) => ({
            ...t,
            date: new Date(t.date)
          }))
        );
      }

      if (storedPaymentMethods) {
        setPaymentMethods(JSON.parse(storedPaymentMethods));
      } else {
        setPaymentMethods(DEFAULT_PAYMENT_METHODS);
      }
    } catch (error) {
      console.error("Failed to load wallet data from localStorage:", error);
      // Set defaults on error
      setBalance(0);
      setTransactions([]);
      setPaymentMethods(DEFAULT_PAYMENT_METHODS);
    }
  }, [user]);

  /**
   * Save wallet data to localStorage
   */
  const saveWalletData = useCallback(() => {
    if (!user) return;

    try {
      localStorage.setItem(`jam4me-balance-${user.id}`, balance.toString());
      localStorage.setItem(`jam4me-transactions-${user.id}`, JSON.stringify(transactions));
      localStorage.setItem(`jam4me-payment-methods-${user.id}`, JSON.stringify(paymentMethods));
    } catch (error) {
      console.error("Failed to save wallet data to localStorage:", error);
    }
  }, [user, balance, transactions, paymentMethods]);

  /**
   * Fetch balance from API (DJ only)
   */
  const fetchBalance = async (): Promise<number | null> => {
    // Endpoint is returning 405 Method Not Allowed, commenting out for now
    /*
    if (!user || !isAuthenticated) {
      console.warn("Cannot fetch balance: User not authenticated");
      return null;
    }

    // Only DJs have the balance endpoint
    if (user.userType !== "HUB_DJ") {
      return null;
    }

    try {
      // Add a small delay to ensure token is properly set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await api.get("/dj_wallet/dj/check/wal/223/");
      
      if (response.data && typeof response.data.balance === "number") {
        return response.data.balance;
      }
      
      console.warn("Balance not found in API response:", response.data);
      return null;
    } catch (error: any) {
      // Log but don't show error for 401 (handled by interceptor) or 403 (permission)
      if (error.status === 401) {
        console.warn("⚠️ 401 when fetching balance - might be race condition after login");
        // Retry once after a delay
        await new Promise(resolve => setTimeout(resolve, 500));
        try {
          const retryResponse = await api.get("/dj_wallet/dj/check/wal/223/");
          if (retryResponse.data && typeof retryResponse.data.balance === "number") {
            return retryResponse.data.balance;
          }
        } catch (retryError) {
          console.warn("Retry failed:", retryError);
        }
        return null;
      }
      
      if (error.status === 403) {
        console.warn("⚠️ 403 when fetching balance - permission issue");
        return null;
      }
      
      console.error("Error fetching wallet balance:", error);
      toast.error("Failed to fetch wallet balance");
      
      return null;
    }
    */
    return null;
  };

  /**
   * Fetch transaction history from API (DJ only)
   */
  const fetchTransactionHistory = async (): Promise<Transaction[] | null> => {
    // Endpoint is returning 404, commenting out for now
    /*
    if (!user || !isAuthenticated) {
      console.warn("Cannot fetch transactions: User not authenticated");
      return null;
    }

    // Only DJs have the transaction history endpoint
    if (user.userType !== "HUB_DJ") {
      return null;
    }

    try {
      const response = await api.get("/dj_wallet/transaction_history/");
      
      if (response.data && Array.isArray(response.data.transactions)) {
        return response.data.transactions.map((t: any) => ({
          ...t,
          date: new Date(t.date || t.created_at)
        }));
      }
      
      console.warn("Transactions not found in API response:", response.data);
      return null;
    } catch (error: any) {
      console.error("Error fetching transaction history:", error);
      
      // Don't show error toast on 401 (handled by interceptor)
      if (error.status !== 401) {
        toast.error("Failed to fetch transaction history");
      }
      
      return null;
    }
    */
    return null;
  };

  /**
   * Refresh wallet data from API and update state
   */
  const refreshWalletData = useCallback(async () => {
    if (!user || !isAuthenticated || authLoading) {
      return;
    }

    setIsLoading(true);
    try {
      // Add a small delay to ensure auth is settled
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Fetch transaction history only (balance fetching is problematic)
      const apiTransactions = await fetchTransactionHistory();

      // Update state with API data if available
      if (apiTransactions !== null && apiTransactions.length > 0) {
        setTransactions(apiTransactions);
      }
    } catch (error) {
      console.error("Error refreshing wallet data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, authLoading]);

  /**
   * Initialize wallet on mount and when auth state changes
   * Separate effect from data persistence to avoid loops
   */
  useEffect(() => {
    // Reset initialization flag when user changes
    hasFetchedDataRef.current = false;
    setIsInitialized(false);

    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // If not authenticated, clear wallet data
    if (!isAuthenticated || !user) {
      setBalance(0);
      setTransactions([]);
      setPaymentMethods([]);
      setIsInitialized(true);
      return;
    }

    // Load local data first (instant)
    loadLocalWalletData();

    // CRITICAL: Add small delay before API calls to let auth settle
    // This prevents 401 errors immediately after login
    if (!hasFetchedDataRef.current) {
      hasFetchedDataRef.current = true;
      
      // Wait 500ms for token to be properly set in axios interceptor
      const timer = setTimeout(() => {
        refreshWalletData().finally(() => {
          setIsInitialized(true);
        });
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setIsInitialized(true);
    }
  }, [user, isAuthenticated, authLoading, loadLocalWalletData, refreshWalletData]);

  /**
   * Save wallet data to localStorage whenever it changes
   * Separate effect to avoid triggering API calls
   */
  useEffect(() => {
    if (isInitialized && user) {
      saveWalletData();
    }
  }, [balance, transactions, paymentMethods, isInitialized, user, saveWalletData]);

  const fundWallet = async (amount: number) => {
    if (!isAuthenticated) {
      toast.error("Please login to fund your wallet");
      throw new Error("Not authenticated");
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTransaction: Transaction = {
        id: `trx-${Date.now()}`,
        amount,
        type: "deposit",
        description: "Wallet funding via Paystack",
        date: new Date(),
        status: "completed"
      };
      
      setBalance(prev => prev + amount);
      setTransactions(prev => [newTransaction, ...prev]);
      
      toast.success(`Successfully added ₦${amount.toLocaleString()} to your wallet`);
    } finally {
      setIsLoading(false);
    }
  };

  // This is the function we are fixing. It now accepts the correct parameters and makes the real API call.
  const withdrawFunds = async (amount: number, bankDetails: { accountNumber: string; bankCode: string; accountName: string; }) => {
    if (!isAuthenticated) {
      toast.error("Please login to withdraw funds");
      throw new Error("Not authenticated");
    }

    if (amount > balance) {
      toast.error("Insufficient funds");
      throw new Error("Insufficient funds");
    }
    
    setIsLoading(true);
    try {
      const payload = {
        amount: amount,
        account_number: bankDetails.accountNumber,
        account_name: bankDetails.accountName,
        bank_code: bankDetails.bankCode,
        Transfer_currency: "NGN",
      };
      
      await api.post("/transfer_out/", payload);

      const newTransaction: Transaction = {
        id: `trx-${Date.now()}`,
        amount,
        type: "withdrawal",
        description: `Withdrawal to ${bankDetails.accountName}`,
        date: new Date(),
        status: "processing"
      };
      
      setBalance(prev => prev - amount);
      setTransactions(prev => [newTransaction, ...prev]);
      
      toast.success(`Withdrawal of ₦${amount.toLocaleString()} initiated successfully!`);

    } catch (error: any) {
      const message = error.message || "An error occurred during withdrawal.";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const payForSong = async (amount: number, partyName: string, songTitle: string, artist: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to request songs");
      throw new Error("Not authenticated");
    }

    if (amount > balance) {
      toast.error("Insufficient funds");
      throw new Error("Insufficient funds");
    }
    
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTransaction: Transaction = {
        id: `trx-${Date.now()}`,
        amount,
        type: "payment",
        description: `Song request: ${songTitle} by ${artist}`,
        date: new Date(),
        songTitle,
        artist,
        partyName,
        status: "completed"
      };
      
      setBalance(prev => prev - amount);
      setTransactions(prev => [newTransaction, ...prev]);
      
      return Promise.resolve();
    } finally {
      setIsLoading(false);
    }
  };

  const receiveSongPayment = async (
    amount: number, 
    partyName: string, 
    songTitle: string, 
    artist: string, 
    requestedBy: string
  ) => {
    if (!isAuthenticated || !user || user.userType !== "HUB_DJ") {
      toast.error("Only DJs can receive song payments");
      throw new Error("Only DJs can receive song payments");
    }
    
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTransaction: Transaction = {
        id: `trx-${Date.now()}`,
        amount,
        type: "songPayment",
        description: `Payment received for playing "${songTitle}" by ${artist}`,
        date: new Date(),
        songTitle,
        artist,
        partyName,
        requestedBy,
        status: "completed"
      };
      
      setBalance(prev => prev + amount);
      setTransactions(prev => [newTransaction, ...prev]);
      
      return Promise.resolve();
    } finally {
      setIsLoading(false);
    }
  };

  const refundSongPayment = async (
    amount: number, 
    partyName: string, 
    songTitle: string, 
    artist: string, 
    requestedBy: string
  ) => {
    if (!isAuthenticated || !user || user.userType !== "HUB_DJ") {
      toast.error("Only DJs can issue refunds");
      throw new Error("Only DJs can issue refunds");
    }
    
    if (amount > balance) {
      toast.error("Insufficient funds for refund");
      throw new Error("Insufficient funds for refund");
    }
    
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTransaction: Transaction = {
        id: `trx-${Date.now()}`,
        amount,
        type: "refund",
        description: `Refund issued for "${songTitle}" by ${artist}`,
        date: new Date(),
        songTitle,
        artist,
        partyName,
        requestedBy,
        status: "completed"
      };
      
      setBalance(prev => prev - amount);
      setTransactions(prev => [newTransaction, ...prev]);
      
      return Promise.resolve();
    } finally {
      setIsLoading(false);
    }
  };
  
  const addFunds = async (amount: number) => {
    if (!isAuthenticated) {
      toast.error("Please login to add funds");
      throw new Error("Not authenticated");
    }

    setIsLoading(true);
    try {
      setBalance(prev => prev + amount);
      return Promise.resolve();
    } finally {
      setIsLoading(false);
    }
  };
  
  const deductFunds = async (amount: number) => {
    if (!isAuthenticated) {
      toast.error("Please login to deduct funds");
      throw new Error("Not authenticated");
    }

    if (amount > balance) {
      toast.error("Insufficient funds");
      throw new Error("Insufficient funds");
    }
    
    setIsLoading(true);
    try {
      setBalance(prev => prev - amount);
      return Promise.resolve();
    } finally {
      setIsLoading(false);
    }
  };

  const addPaymentMethod = async (method: Omit<PaymentMethod, "id">) => {
    if (!isAuthenticated) {
      toast.error("Please login to add payment methods");
      throw new Error("Not authenticated");
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMethod: PaymentMethod = {
        ...method,
        id: `pm-${Date.now()}`
      };
      
      if (newMethod.isDefault) {
        setPaymentMethods(prev => 
          prev.map(pm => ({ ...pm, isDefault: false })).concat(newMethod)
        );
      } else {
        setPaymentMethods(prev => [...prev, newMethod]);
      }
      
      toast.success("Payment method added successfully");
    } finally {
      setIsLoading(false);
    }
  };

  const removePaymentMethod = async (methodId: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to remove payment methods");
      throw new Error("Not authenticated");
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const method = paymentMethods.find(m => m.id === methodId);
      if (!method) {
        throw new Error("Payment method not found");
      }
      
      setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
      
      if (method.isDefault && paymentMethods.length > 1) {
        const remaining = paymentMethods.filter(m => m.id !== methodId);
        if (remaining.length > 0) {
          setPaymentMethods(prev => 
            prev.map((m, i) => i === 0 ? { ...m, isDefault: true } : m)
          );
        }
      }
      
      toast.success("Payment method removed successfully");
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultPaymentMethod = async (methodId: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to change default payment method");
      throw new Error("Not authenticated");
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const method = paymentMethods.find(m => m.id === methodId);
      if (!method) {
        throw new Error("Payment method not found");
      }
      
      setPaymentMethods(prev => 
        prev.map(m => ({ ...m, isDefault: m.id === methodId }))
      );
      
      toast.success(`${method.name} set as default payment method`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        transactions,
        paymentMethods,
        isLoading,
        fundWallet,
        withdrawFunds,
        payForSong,
        receiveSongPayment,
        refundSongPayment,
        addFunds,
        deductFunds,
        addPaymentMethod,
        removePaymentMethod,
        setDefaultPaymentMethod,
        refreshWalletData,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}