import { Dispatch, SetStateAction } from "react";

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  originalError?: any;
}

// Authentication
export type UserType = "user" | "HUB_DJ";

export type User = {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  avatar?: string;
  userType: UserType;
  // DJ-specific fields
  djName?: string;
  genre?: string;
  bio?: string;
};

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, user_status: UserType) => Promise<ApiResponse<any> | undefined>;
  register: (username: string, email: string, password: string, user_status: UserType) => Promise<ApiResponse>;
  resetPassword: (emailOrPhone: string) => Promise<ApiResponse>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => void;
  isDj: boolean;
  getUserType: () => UserType | null;
  getHomeRoute: () => string;
  refreshUserProfile: () => Promise<void>;
};

// Party
export type Song = {
  id: string;
  title: string;
  artist: string;
  price: number;
  requestedBy: string;
  status: "pending" | "playing" | "played" | "declined";
  requestedAt: Date;
  albumArt?: string;
};

export type Party = {
  id: string;
  name: string;
  passcode: string;
  location: string;
  dj: string;
  djId: string; // ID of the DJ who created the party
  songs: Song[];
  activeUntil: string;
  endDate: string;
  minRequestPrice: number;
  isActive: boolean;
  qrCode?: string; // URL to QR code image
  createdAt: Date;
  earnings?: number; // Total earnings for the party
};

export type PartyContextType = {
  currentParty: Party | null;
  joinedParties: Party[];
  createdParties: Party[]; // For DJs - parties they created
  joinParty: (passcode: string) => void;
  leaveParty: () => void;
  createParty: (partyData: Omit<Party, "id" | "djId" | "songs" | "passcode" | "createdAt">) => Promise<Party>;
  requestSong: (songTitle: string, artist: string, price: number, albumArt?: string) => Promise<void>;
  approveSong: (songId: string, partyId?: string) => Promise<void>;
  declineSong: (songId: string, partyId?: string) => Promise<void>;
  playSong: (songId: string, partyId?: string) => Promise<void>;
  markSongAsPlayed: (songId: string, partyId?: string) => Promise<void>;
  closeParty: (partyId: string) => Promise<ApiResponse>;
  isLoading: boolean;
  getPartyQrCode: (partyId: string) => string;
  hasPendingSongs: (partyId: string) => boolean;
  setCurrentParty: Dispatch<SetStateAction<Party | null>>;
  setCreatedParties: Dispatch<SetStateAction<Party[]>>;
  handleExpiredParties: () => void;
  refreshPartyData: () => Promise<void>;
  fetchPartyByPasscode: (passcode: string) => Promise<Party | null>;
  updatePartySettings: (partyId: string, settings: Partial<Party>) => Promise<void>;
  fetchSongList: (hubId: string) => Promise<void>;
  fetchNowPlaying: (hubId: string) => Promise<void>;
  fetchHubDetails: (hubId: string) => Promise<void>;
  nowPlaying: any | null;
};

// Wallet
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
  status?: "completed" | "pending" | "processing" | "failed";
};

export type PaymentMethod = {
  id: string;
  type: "bankAccount" | "paystack";
  lastFour: string;
  name: string;
  isDefault: boolean;
};

export type WalletContextType = {
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
  refreshWalletData: () => Promise<void>;
};

// Spotify
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  duration_ms: number;
  preview_url: string | null;
  uri: string;
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}