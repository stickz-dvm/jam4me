import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export type Transaction = {
  id: string;
  amount: number;
  type: "deposit" | "withdrawal" | "payment" | "songPayment" | "refund";
  description: string;
  date: Date;
  // Additional fields for song payments
  songTitle?: string;
  artist?: string;
  partyName?: string;
  requestedBy?: string;
};

export type PaymentMethod = {
  id: string;
  type: "bankAccount" | "paystack";
  lastFour: string;
  name: string;
  isDefault: boolean;
};

type WalletContextType = {
  balance: number;
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  fundWallet: (amount: number) => Promise<void>;
  withdrawFunds: (amount: number, bankDetails?: { accountNumber: string; bankName: string }) => Promise<void>;
  payForSong: (amount: number, partyName: string, songTitle: string, artist: string) => Promise<void>;
  receiveSongPayment: (amount: number, partyName: string, songTitle: string, artist: string, requestedBy: string) => Promise<void>;
  refundSongPayment: (amount: number, partyName: string, songTitle: string, artist: string, requestedBy: string) => Promise<void>;
  addFunds: (amount: number) => Promise<void>;
  deductFunds: (amount: number) => Promise<void>;
  addPaymentMethod: (method: Omit<PaymentMethod, "id">) => Promise<void>;
  removePaymentMethod: (methodId: string) => Promise<void>;
  setDefaultPaymentMethod: (methodId: string) => Promise<void>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Sample payment methods
const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pm-1",
    type: "paystack",
    lastFour: "N/A",
    name: "Paystack (Default)",
    isDefault: true
  },
  {
    id: "pm-2",
    type: "bankAccount",
    lastFour: "1234",
    name: "GTBank Account",
    isDefault: false
  }
];

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(5000); // Start with some initial balance for demo
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Load wallet data from local storage
      const storedBalance = localStorage.getItem(`jam4me-balance-${user.id}`);
      const storedTransactions = localStorage.getItem(`jam4me-transactions-${user.id}`);
      const storedPaymentMethods = localStorage.getItem(`jam4me-payment-methods-${user.id}`);
      
      if (storedBalance) {
        setBalance(Number(storedBalance));
      }
      
      if (storedTransactions) {
        try {
          const parsedTransactions = JSON.parse(storedTransactions);
          // Convert string dates back to Date objects
          setTransactions(
            parsedTransactions.map((t: any) => ({
              ...t,
              date: new Date(t.date)
            }))
          );
        } catch (e) {
          console.error("Failed to parse transactions", e);
          setTransactions([]);
        }
      } else {
        // If no transactions yet, provide some demo data
        const demoTransactions: Transaction[] = [
          {
            id: "trx-1",
            amount: 5000,
            type: "deposit",
            description: "Initial wallet funding via Paystack",
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
          }
        ];
        setTransactions(demoTransactions);
      }
      
      if (storedPaymentMethods) {
        try {
          setPaymentMethods(JSON.parse(storedPaymentMethods));
        } catch (e) {
          console.error("Failed to parse payment methods", e);
          setPaymentMethods(DEFAULT_PAYMENT_METHODS);
        }
      } else {
        setPaymentMethods(DEFAULT_PAYMENT_METHODS);
      }
    } else {
      // Reset wallet when logged out
      setBalance(0);
      setTransactions([]);
      setPaymentMethods([]);
    }
    setIsLoading(false);
  }, [user]);

  const saveWalletData = () => {
    if (user) {
      localStorage.setItem(`jam4me-balance-${user.id}`, balance.toString());
      localStorage.setItem(`jam4me-transactions-${user.id}`, JSON.stringify(transactions));
      localStorage.setItem(`jam4me-payment-methods-${user.id}`, JSON.stringify(paymentMethods));
    }
  };

  useEffect(() => {
    saveWalletData();
  }, [balance, transactions, paymentMethods, user]);

  const fundWallet = async (amount: number) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTransaction: Transaction = {
        id: `trx-${Date.now()}`,
        amount,
        type: "deposit",
        description: "Wallet funding via Paystack",
        date: new Date(),
      };
      
      setBalance(prev => prev + amount);
      setTransactions(prev => [newTransaction, ...prev]);
      
      toast.success(`Successfully added ₦${amount.toLocaleString()} to your wallet`);
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawFunds = async (amount: number, bankDetails?: { accountNumber: string; bankName: string }) => {
    if (amount > balance) {
      toast.error("Insufficient funds");
      throw new Error("Insufficient funds");
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let description = "Funds withdrawal";
      if (bankDetails) {
        description = `Withdrawal to ${bankDetails.bankName} account ending in ${bankDetails.accountNumber.slice(-4)}`;
      }
      
      const newTransaction: Transaction = {
        id: `trx-${Date.now()}`,
        amount,
        type: "withdrawal",
        description,
        date: new Date(),
      };
      
      setBalance(prev => prev - amount);
      setTransactions(prev => [newTransaction, ...prev]);
      
      toast.success(`Successfully withdrew ₦${amount.toLocaleString()}`);
    } finally {
      setIsLoading(false);
    }
  };

  const payForSong = async (amount: number, partyName: string, songTitle: string, artist: string) => {
    if (amount > balance) {
      toast.error("Insufficient funds");
      throw new Error("Insufficient funds");
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTransaction: Transaction = {
        id: `trx-${Date.now()}`,
        amount,
        type: "payment",
        description: `Song request: ${songTitle} by ${artist}`,
        date: new Date(),
        songTitle,
        artist,
        partyName
      };
      
      setBalance(prev => prev - amount);
      setTransactions(prev => [newTransaction, ...prev]);
      
      return Promise.resolve();
    } finally {
      setIsLoading(false);
    }
  };

  const receiveSongPayment = async (amount: number, partyName: string, songTitle: string, artist: string, requestedBy: string) => {
    if (!user || user.userType !== "dj") {
      throw new Error("Only DJs can receive song payments");
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
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
        requestedBy
      };
      
      setBalance(prev => prev + amount);
      setTransactions(prev => [newTransaction, ...prev]);
      
      return Promise.resolve();
    } finally {
      setIsLoading(false);
    }
  };

  const refundSongPayment = async (amount: number, partyName: string, songTitle: string, artist: string, requestedBy: string) => {
    if (!user || user.userType !== "dj") {
      throw new Error("Only DJs can issue refunds");
    }
    
    if (amount > balance) {
      toast.error("Insufficient funds for refund");
      throw new Error("Insufficient funds for refund");
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
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
        requestedBy
      };
      
      setBalance(prev => prev - amount);
      setTransactions(prev => [newTransaction, ...prev]);
      
      return Promise.resolve();
    } finally {
      setIsLoading(false);
    }
  };
  
  // General purpose functions for adding/deducting funds
  const addFunds = async (amount: number) => {
    setIsLoading(true);
    try {
      setBalance(prev => prev + amount);
      return Promise.resolve();
    } finally {
      setIsLoading(false);
    }
  };
  
  const deductFunds = async (amount: number) => {
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
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMethod: PaymentMethod = {
        ...method,
        id: `pm-${Date.now()}`
      };
      
      // If this is set as default, update other methods
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
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const method = paymentMethods.find(m => m.id === methodId);
      if (!method) {
        throw new Error("Payment method not found");
      }
      
      setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
      
      // If we removed the default method, set a new default if possible
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
    setIsLoading(true);
    try {
      // Simulate API call
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