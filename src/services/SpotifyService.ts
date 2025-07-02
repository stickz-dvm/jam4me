// This is a mock implementation of Spotify API integration
// In a real application, you would need to implement proper OAuth flow

// Define Spotify API types
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

// Spotify service class
class SpotifyService {
  private clientId: string = "YOUR_SPOTIFY_CLIENT_ID_HERE"; // Replace with real client ID in production
  private accessToken: string | null = null;
  private expiresAt: number = 0;

  // Mock authentication - in a real app, implement proper OAuth
  public async authenticate(): Promise<boolean> {
    // Simulate successful authentication
    this.accessToken = "mock-access-token";
    this.expiresAt = Date.now() + 3600 * 1000; // 1 hour expiry
    return true;
  }

  // Check if token is valid
  public isAuthenticated(): boolean {
    return !!this.accessToken && Date.now() < this.expiresAt;
  }

  // Search for tracks
  public async searchTracks(query: string): Promise<SpotifyTrack[]> {
    try {
      if (!this.isAuthenticated()) {
        await this.authenticate();
      }

      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 500));

      // Return mock data based on the query
      return this.getMockSearchResults(query);
    } catch (error) {
      console.error("Error in searchTracks:", error);
      return []; // Return empty array on error
    }
  }

  // Mock search results with Nigerian music focus
  private getMockSearchResults(query: string): SpotifyTrack[] {
    try {
      // Create mock data with Nigerian artists and Afrobeats
      const mockDatabase = [
        {
          id: "1",
          name: "Unavailable",
          artists: [{ name: "Davido" }, { name: "Musa Keys" }],
          album: {
            name: "Timeless",
            images: [{ url: "https://images.unsplash.com/photo-1625336858841-8938f4d72425?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzV8fGFmcm9iZWF0c3xlbnwwfHwwfHx8MA%3D%3D" }]
          },
          duration_ms: 204800,
          preview_url: null,
          uri: "spotify:track:nigerian1"
        },
        {
          id: "2",
          name: "Last Last",
          artists: [{ name: "Burna Boy" }],
          album: {
            name: "Love, Damini",
            images: [{ url: "https://images.unsplash.com/photo-1619983081563-430f63602796?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnVybmElMjBib3l8ZW58MHx8MHx8fDA%3D" }]
          },
          duration_ms: 172800,
          preview_url: null,
          uri: "spotify:track:nigerian2"
        },
        {
          id: "3",
          name: "Rush",
          artists: [{ name: "Ayra Starr" }],
          album: {
            name: "19 & Dangerous",
            images: [{ url: "https://images.unsplash.com/photo-1619983081593-e2ba5b543168?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YWZyaWNhbiUyMG11c2ljfGVufDB8fDB8fHww" }]
          },
          duration_ms: 189400,
          preview_url: null,
          uri: "spotify:track:nigerian3"
        },
        {
          id: "4",
          name: "Essence",
          artists: [{ name: "WizKid" }, { name: "Tems" }],
          album: {
            name: "Made in Lagos",
            images: [{ url: "https://images.unsplash.com/photo-1571151596869-98fe367a8a07?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fExhZ29zfGVufDB8fDB8fHww" }]
          },
          duration_ms: 248000,
          preview_url: null,
          uri: "spotify:track:nigerian4"
        },
        {
          id: "5",
          name: "Calm Down",
          artists: [{ name: "Rema" }, { name: "Selena Gomez" }],
          album: {
            name: "Rave & Roses",
            images: [{ url: "https://images.unsplash.com/photo-1598387846148-47e82ee3d7a1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGFmcmljYW4lMjBtdXNpY3xlbnwwfHwwfHx8MA%3D%3D" }]
          },
          duration_ms: 210000,
          preview_url: null,
          uri: "spotify:track:nigerian5"
        },
        {
          id: "6",
          name: "Peru",
          artists: [{ name: "Fireboy DML" }, { name: "Ed Sheeran" }],
          album: {
            name: "Playboy",
            images: [{ url: "https://images.unsplash.com/photo-1517230878791-4d28214057c2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2x1YiUyMG5pZ2h0fGVufDB8fDB8fHww" }]
          },
          duration_ms: 180000,
          preview_url: null,
          uri: "spotify:track:nigerian6"
        },
        {
          id: "7",
          name: "Sungba (Remix)",
          artists: [{ name: "Asake" }, { name: "Burna Boy" }],
          album: {
            name: "Mr Money With The Vibe",
            images: [{ url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bmlnZXJpYW4lMjBwYXJ0eXxlbnwwfHwwfHx8MA%3D%3D" }]
          },
          duration_ms: 225000,
          preview_url: null,
          uri: "spotify:track:nigerian7"
        },
        {
          id: "8",
          name: "Who's Your Guy?",
          artists: [{ name: "Spyro" }],
          album: {
            name: "Who's Your Guy?",
            images: [{ url: "https://images.unsplash.com/photo-1520283060538-fa4b98cc5d9b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bmlnZXJpYW4lMjBjbHVifGVufDB8fDB8fHww" }]
          },
          duration_ms: 158000,
          preview_url: null,
          uri: "spotify:track:nigerian8"
        },
        {
          id: "9",
          name: "Common Person",
          artists: [{ name: "Burna Boy" }],
          album: {
            name: "Love, Damini",
            images: [{ url: "https://images.unsplash.com/photo-1619983081563-430f63602796?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnVybmElMjBib3l8ZW58MHx8MHx8fDA%3D" }]
          },
          duration_ms: 189000,
          preview_url: null,
          uri: "spotify:track:nigerian9"
        },
        {
          id: "10",
          name: "Gwagwalada",
          artists: [{ name: "BNXN" }, { name: "Kizz Daniel" }, { name: "Seyi Vibez" }],
          album: {
            name: "Gwagwalada",
            images: [{ url: "https://images.unsplash.com/photo-1611162457412-3842feaffd27?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YWZyb2JlYXRzfGVufDB8fDB8fHww" }]
          },
          duration_ms: 202000,
          preview_url: null,
          uri: "spotify:track:nigerian10"
        },
        {
          id: "11",
          name: "Feel",
          artists: [{ name: "Davido" }],
          album: {
            name: "Timeless",
            images: [{ url: "https://images.unsplash.com/photo-1567361294492-8af0471efe84?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fGFmcm9iZWF0c3xlbnwwfHwwfHx8MA%3D%3D" }]
          },
          duration_ms: 220000,
          preview_url: null,
          uri: "spotify:track:nigerian11"
        },
        {
          id: "12",
          name: "Away",
          artists: [{ name: "Ayra Starr" }],
          album: {
            name: "19 & Dangerous",
            images: [{ url: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YWZyb2JlYXRzfGVufDB8fDB8fHww" }]
          },
          duration_ms: 186000,
          preview_url: null,
          uri: "spotify:track:nigerian12"
        },
        {
          id: "13",
          name: "Joro",
          artists: [{ name: "WizKid" }],
          album: {
            name: "Soundman Vol. 1",
            images: [{ url: "https://images.unsplash.com/photo-1577931512914-b17c2b79bedA?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG5pZ2VyaWFuJTIwZGp8ZW58MHx8MHx8fDA%3D" }]
          },
          duration_ms: 195000,
          preview_url: null,
          uri: "spotify:track:nigerian13"
        },
        {
          id: "14",
          name: "Amapiano",
          artists: [{ name: "Asake" }, { name: "Olamide" }],
          album: {
            name: "Work of Art",
            images: [{ url: "https://images.unsplash.com/photo-1517230878791-4d28214057c2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2x1YiUyMG5pZ2h0fGVufDB8fDB8fHww" }]
          },
          duration_ms: 183000,
          preview_url: null,
          uri: "spotify:track:nigerian14"
        },
        {
          id: "15",
          name: "Ojuelegba",
          artists: [{ name: "WizKid" }],
          album: {
            name: "Ayo",
            images: [{ url: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjV8fGFmcm9iZWF0c3xlbnwwfHwwfHx8MA%3D%3D" }]
          },
          duration_ms: 225000,
          preview_url: null,
          uri: "spotify:track:nigerian15"
        }
      ];

      if (!query || !query.trim()) {
        return mockDatabase.slice(0, 5);
      }

      const lowerQuery = query.toLowerCase();
      return mockDatabase.filter(
        track => 
          track.name.toLowerCase().includes(lowerQuery) || 
          track.artists.some(artist => artist.name.toLowerCase().includes(lowerQuery)) ||
          track.album.name.toLowerCase().includes(lowerQuery)
      ).slice(0, 5);
    } catch (error) {
      console.error("Error in getMockSearchResults:", error);
      return []; // Return empty array on error
    }
  }
}

export const spotifyService = new SpotifyService();