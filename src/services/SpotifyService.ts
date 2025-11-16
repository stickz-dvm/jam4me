import { toast } from "sonner";

// These are the data types that the Spotify API returns.
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

// This is the main class that will handle all my Spotify logic.
class SpotifyService {
  private accessToken: string | null = null;
  private expiresAt: number = 0;

  // I'm doing the Spotify authentication directly on the frontend for now.
  // This is NOT secure for production, but it will get the search working for testing.
  // TODO: The backend developer MUST move this to the backend before going live.
  public async authenticate(): Promise<boolean> {
    // I need to get my ID and Secret from the .env file.
    // Remember, the names in my .env file must start with VITE_
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

    // I'm adding this to see if my keys from the .env file are loading correctly.
    console.log("Are my Spotify keys loading?", { clientId, clientSecret });

    // If I forgot to add them to the .env file, I should stop here.
    if (!clientId || !clientSecret) {
      console.error("My Spotify Client ID or Secret is missing from the .env file.");
      toast.error("Spotify is not configured. Please contact support.");
      return false;
    }

    // This is the special format Spotify requires for the request.
    const authString = btoa(`${clientId}:${clientSecret}`);

    try {
      // I'm making a POST request directly to Spotify's official token endpoint.
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authString}`,
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        // If Spotify didn't like my request, I'll log the error.
        console.error("Failed to get token from Spotify API", response.statusText);
        return false;
      }

      const data = await response.json();

      // Now I'll store the token and when it expires, just like before.
      this.accessToken = data.access_token;
      this.expiresAt = Date.now() + data.expires_in * 1000;

      console.log("Got a new Spotify token directly from Spotify.");
      return true;

    } catch (error) {
      console.error("An error happened while trying to get the Spotify token:", error);
      this.accessToken = null;
      this.expiresAt = 0;
      return false;
    }
  }

  // This just checks if I have a token and if it hasn't expired yet.
  public isAuthenticated(): boolean {
    return !!this.accessToken && Date.now() < this.expiresAt;
  }

  // This is my real search function. It calls the official Spotify API.
  public async searchTracks(query: string): Promise<SpotifyTrack[]> {
    // First, I need to make sure I have a valid token. If not, I'll try to get one.
    if (!this.isAuthenticated()) {
      const success = await this.authenticate();
      // If I can't even get a token, there's no point in trying to search.
      if (!success) {
        throw new Error("Could not authenticate with Spotify. Check your API keys.");
      }
    }

    // Now I'll build and make the actual request to Spotify.
    try {
      // I'm adding this to see what my access token looks like right before I make the search call.
      console.log("Using this access token for search:", this.accessToken);
      
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        // If the token expired or something went wrong, I'll log the error.
        console.error("Spotify API returned an error:", response.statusText);
        return [];
      }

      const data: SpotifySearchResponse = await response.json();
      return data.tracks.items; // This returns the array of song results.

    } catch (error) {
      console.error("Error searching tracks on Spotify:", error);
      return []; // I'll return an empty array if anything goes wrong.
    }
  }
}

// This is the line that actually creates the service and exports it so other files can use it.
export const spotifyService = new SpotifyService();