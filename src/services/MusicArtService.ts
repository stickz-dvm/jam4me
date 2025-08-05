/**
 * MusicArtService.ts
 * 
 * Service for fetching real album artwork for songs in the Jam4me app.
 * This simulates API integration but works with predefined data for demonstration.
 */

// Popular Nigerian artists with real album art posters
interface ArtistData {
  name: string;
  albums?: {
    title: string;
    coverUrl: string;
    year?: number;
    tracks?: string[];
  }[];
  singles?: {
    title: string;
    coverUrl: string;
    year?: number;
  }[];
}

// Database of Nigerian artists and their albums with expanded track information
const nigerianMusicDatabase: Record<string, ArtistData> = {
  "wizkid": {
    name: "Wizkid",
    albums: [
      {
        title: "Made in Lagos",
        coverUrl: "https://upload.wikimedia.org/wikipedia/en/c/c2/Wizkid_-_Made_in_Lagos.png",
        year: 2020,
        tracks: ["Reckless", "Ginger", "Longtime", "Mighty Wine", "Essence", "Blessed", "Smile", "Piece of Me", "No Stress", "True Love", "Sweet One", "Grace", "Gyrate", "Roma"]
      },
      {
        title: "Ayo",
        coverUrl: "https://upload.wikimedia.org/wikipedia/en/8/88/Wizkid_-_Ayo.png",
        year: 2014,
        tracks: ["Talk", "For You", "Bombay", "Show You The Money", "In My Bed", "Kind Love", "On Top Your Matter", "Jaiye Jaiye", "Ojuelegba", "One Question", "Joy", "Kilofe", "In My Bed", "Omalicha"]
      },
      {
        title: "Superstar",
        coverUrl: "https://upload.wikimedia.org/wikipedia/en/9/9a/Wizkid_Superstar.jpg",
        year: 2011,
        tracks: ["Superstar", "Holla at Your Boy", "Tease Me", "Don't Dull", "Love My Baby", "Pakurumo", "Slow Whine", "Gidi Girl", "Wad Up", "For Me", "No Lele", "Say My Name", "Scatter the Floor"]
      }
    ],
    singles: [
      {
        title: "Essence (feat. Tems)",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273523996409e7f24931602e334",
        year: 2020
      },
      {
        title: "Joro",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273a760052240d1c4bcec68f480",
        year: 2019
      }
    ]
  },
  "burna boy": {
    name: "Burna Boy",
    albums: [
      {
        title: "Love, Damini",
        coverUrl: "https://images.genius.com/4a669f447d27afdb9d2522fd9d3a3f3f.1000x1000x1.png",
        year: 2022,
        tracks: ["Glory", "Science", "Kilometre", "Jagele", "Cloak & Dagger", "Whiskey", "Last Last", "Different Size", "It's Plenty", "For My Hand", "Rollercoaster", "Solid", "Wild Dreams", "How Bad Could It Be", "Love, Damini"]
      },
      {
        title: "Twice As Tall",
        coverUrl: "https://upload.wikimedia.org/wikipedia/en/9/9d/Burna_Boy_-_Twice_as_Tall.png",
        year: 2020,
        tracks: ["Level Up", "Alarm Clock", "Way Too Big", "Bebo", "Wonderful", "Onyeka", "Naughty By Nature", "Comma", "No Fit Vex", "23", "Time Flies", "Monsters You Made", "Wetin Dey Sup", "Real Life", "Bank On It"]
      },
      {
        title: "African Giant",
        coverUrl: "https://upload.wikimedia.org/wikipedia/en/d/d1/Burna_Boy_-_African_Giant.png",
        year: 2019,
        tracks: ["African Giant", "Anybody", "Dangote", "Gbona", "On The Low", "Killin Dem", "Omo", "Secret", "Collateral Damage", "Another Story", "Pull Up", "Blak Ryno", "Destiny", "Different", "Spiritual", "Gum Body", "Show & Tell"]
      }
    ],
    singles: [
      {
        title: "Last Last",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273b99e443bc2cbf4adce8ed9fa",
        year: 2022
      }
    ]
  },
  "davido": {
    name: "Davido",
    albums: [
      {
        title: "Timeless",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273c886ccd1d758033984809eec",
        year: 2023,
        tracks: ["Feel", "Over Dem", "In The Garden", "Unavailable", "LCND", "Kante", "Na Money", "U (Juju)", "Away", "Precision", "Godfather", "BOP", "For The Road", "No Competition", "Feel", "Champion Sound", "E Pain Me"]
      },
      {
        title: "A Better Time",
        coverUrl: "https://upload.wikimedia.org/wikipedia/en/1/12/Davido_-_A_Better_Time.png",
        year: 2020,
        tracks: ["FEM", "Jowo", "Something Fishy", "Holy Ground", "Heaven", "Very Special", "Shopping Spree", "Sunlight", "Tanana", "Mebe", "La La", "So Crazy", "Birthday Cake", "I Got a Friend", "Fade", "On My Way", "Coolest Kid in Africa"]
      },
      {
        title: "A Good Time",
        coverUrl: "https://upload.wikimedia.org/wikipedia/en/5/51/Davido_-_A_Good_Time.png",
        year: 2019,
        tracks: ["Intro", "1 Milli", "Check Am", "Fall", "Disturbance", "If", "D & G", "Get to You", "One Thing", "Assurance", "Animashaun", "Sweet in the Middle", "Risky", "Company", "Green Light Riddim", "Big Picture", "One Thing"]
      }
    ],
    singles: [
      {
        title: "Fall",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273b298547305749a25b0d7ba89",
        year: 2017
      },
      {
        title: "Champion Sound",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273f7b48e25e1d5c45fedee894d",
        year: 2021
      },
      {
        title: "FEM",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273f607eba0b519c3cba97c9b95",
        year: 2020
      }
    ]
  },
  "tems": {
    name: "Tems",
    albums: [
      {
        title: "For Broken Ears",
        coverUrl: "https://upload.wikimedia.org/wikipedia/en/d/d5/Tems_-_For_Broken_Ears.png",
        year: 2020,
        tracks: ["Interference", "Ice T", "Free Mind", "Damages", "Temilade Interlude", "The Key", "Higher"]
      }
    ],
    singles: [
      {
        title: "Free Mind",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b2736a0ce57c15460e28c973cd71",
        year: 2022
      },
      {
        title: "Essence",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273523996409e7f24931602e334",
        year: 2020
      }
    ]
  },
  "asake": {
    name: "Asake",
    albums: [
      {
        title: "Mr Money With The Vibe",
        coverUrl: "https://upload.wikimedia.org/wikipedia/en/5/5c/Asake_-_Mr._Money_with_the_Vibe.png",
        year: 2022,
        tracks: ["Dupe", "Organise", "Yoga", "Dull", "Nzaza", "Ototo", "Joha", "Terminator", "Sungba", "Peace Be Unto You", "Muse", "Sunmomi"]
      },
      {
        title: "Work of Art",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273c40602147f33dc47a5241894",
        year: 2023,
        tracks: ["Basquiat", "Amapiano", "Yoga", "2:30", "Supernatural", "Mogbe", "Sunshine", "Wake Up", "Endless Love", "I Believe", "Midnight Vibration", "Blessings", "Til Forever", "Spirit"]
      }
    ],
    singles: [
      {
        title: "Sungba (Remix)",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273b6f50369adde910678c8a58c",
        year: 2022
      },
      {
        title: "Yoga",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b2731484cd6436e4351510ddc9b9",
        year: 2023
      },
      {
        title: "Joha",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b2738135debf2b27246b730acd9b",
        year: 2022
      },
      {
        title: "Organise",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273cc58c1130e0b942b1e9dcecc",
        year: 2022
      }
    ]
  },
  "tiwa savage": {
    name: "Tiwa Savage",
    albums: [
      {
        title: "Water & Garri",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273db9259c2a3e4478f2ef13395",
        year: 2021,
        tracks: ["Work Fada", "Ade Ori", "Tales by Moonlight", "Somebody's Son", "Special Kinda"]
      },
      {
        title: "Celia",
        coverUrl: "https://upload.wikimedia.org/wikipedia/en/3/33/Tiwa_Savage_-_Celia.png",
        year: 2020,
        tracks: ["Save My Life", "Temptation", "Pakka", "Attention", "Bombay", "Koroba", "Dangerous Love", "Ole", "Park Well", "FWMM", "Glory", "Celia's Song"]
      }
    ],
    singles: [
      {
        title: "Somebody's Son",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273c254616063b63e7c207dc187",
        year: 2021
      },
      {
        title: "Dangerous Love",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273b67e41fc645c90f05b821422",
        year: 2020
      }
    ]
  },
  "rema": {
    name: "Rema",
    albums: [
      {
        title: "Rave & Roses",
        coverUrl: "https://upload.wikimedia.org/wikipedia/en/e/e5/Rema_-_Rave_%26_Roses.png",
        year: 2022,
        tracks: ["Divine", "Calm Down", "FYN", "Hold Me", "Jo", "Mara", "Love", "Dirty", "Oroma Baby", "Time N Affection", "Are You There", "Runaway", "Carry", "Wine", "Soundgasm", "Addicted"]
      }
    ],
    singles: [
      {
        title: "Calm Down",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b2732712d38c399927aa2dbc3280",
        year: 2022
      },
      {
        title: "Woman",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b2735c5cdd664c33129e3bd1289d",
        year: 2021
      },
      {
        title: "Bounce",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273275b322a681f805f791a51fb",
        year: 2021
      }
    ]
  },
  "ckay": {
    name: "CKay",
    albums: [
      {
        title: "Sad Romance",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273e24ea76d980d752407372cf4",
        year: 2022,
        tracks: ["Love Nwantiti", "Watawi", "Mmadu", "Kiss Me Like You Miss Me", "Emiliana"]
      }
    ],
    singles: [
      {
        title: "Love Nwantiti",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b2738de02872d0f01145d616ca59",
        year: 2019
      },
      {
        title: "Emiliana",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273e4d31740a9a2ecc5e4c51b0e",
        year: 2021
      }
    ]
  },
  "ayra starr": {
    name: "Ayra Starr",
    albums: [
      {
        title: "19 & Dangerous",
        coverUrl: "https://upload.wikimedia.org/wikipedia/en/5/54/Ayra_Starr_-_19_%26_Dangerous.png",
        year: 2021,
        tracks: ["Cast (Gen Z Anthem)", "Fashion Killer", "Bloody Samaritan", "Snitch", "Lonely", "Beggie Beggie", "Toxic", "Bridgertn", "In Between", "Karma", "Amin"]
      }
    ],
    singles: [
      {
        title: "Rush",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273517a39fbc69adae4f49fa8f6",
        year: 2022
      },
      {
        title: "Bloody Samaritan",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273c11cb76a6f34e78c6c129dcb",
        year: 2021
      },
      {
        title: "Sability",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b2730c0f2c072bfcc551e812cfc6",
        year: 2023
      }
    ]
  },
  "fireboy dml": {
    name: "Fireboy DML",
    albums: [
      {
        title: "Playboy",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273b0b5735e6df415d86e5160b0",
        year: 2022,
        tracks: ["Change", "Sofri", "Ashawo", "Playboy", "Bandana", "Adore", "Diana", "Compromise", "Afro Highlife", "Ember", "Peru", "Glory", "Airline", "Havin' Fun"]
      },
      {
        title: "Apollo",
        coverUrl: "https://upload.wikimedia.org/wikipedia/en/4/43/Fireboy_DML_-_Apollo.png",
        year: 2020,
        tracks: ["Champ", "Spell", "Eli", "Dreamer", "New York City Girl", "24", "Favourite Song", "Afar", "Lifestyle", "Go Away", "Tattoo", "Sound", "God Only Knows", "Remember Me", "Champion", "Friday Feeling", "Like I Do"]
      }
    ],
    singles: [
      {
        title: "Peru",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b27375d0127f5fcd454cb3d7b97f",
        year: 2021
      },
      {
        title: "Bandana",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b2735715c916720cddb5abfbc414",
        year: 2022
      }
    ]
  },
  "omah lay": {
    name: "Omah Lay",
    albums: [
      {
        title: "Boy Alone",
        coverUrl: "https://upload.wikimedia.org/wikipedia/en/3/3f/Omah_Lay_-_Boy_Alone.png",
        year: 2022,
        tracks: ["I", "Attention", "Woman", "Bend You", "Safe Heaven", "I'm a Mess", "Understand", "Soso", "Never Forget", "Emotions", "Tell Everybody", "Purple Song"]
      }
    ],
    singles: [
      {
        title: "Soso",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273ce116bf5f02bc32733ada76a",
        year: 2022
      },
      {
        title: "Understand",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b27345c5ac172a006b5e480c0f54",
        year: 2021
      }
    ]
  },
  "teni": {
    name: "Teni",
    singles: [
      {
        title: "Case",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273a1271a4e445b262942b0b6c7",
        year: 2018
      },
      {
        title: "Uyo Meyo",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273572e4ec7e4e843759c3391e3",
        year: 2018
      }
    ]
  }
};

// Extended database for hit songs that may be by less-known artists or collaborations
const hitSongsDatabase = {
  "amapiano": {
    coverUrl: "https://i.scdn.co/image/ab67706f00000003441c80978a431c8afdcc1c33",
    relatedArtists: ["Asake", "Focalistic", "DBN Gogo"]
  },
  "afrobeats": {
    coverUrl: "https://i.scdn.co/image/ab67706f00000003319c7966099f5752197ddb32",
    relatedArtists: ["Wizkid", "Burna Boy", "Davido", "Tiwa Savage"]
  },
  "african": {
    coverUrl: "https://i.scdn.co/image/ab67706f0000000334c92c44226777ab2441d937",
    relatedArtists: ["Burna Boy", "Black Sherif", "Sarkodie"]
  },
  "naija": {
    coverUrl: "https://i.scdn.co/image/ab67706f000000030f7735e3e7e8eabc2282f8ac",
    relatedArtists: ["Wizkid", "Davido", "Burna Boy"]
  },
  "lagos": {
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273523996409e7f24931602e334",
    relatedArtists: ["Wizkid", "Davido", "Burna Boy"]
  },
  "yoga": {
    coverUrl: "https://i.scdn.co/image/ab67616d0000b2731484cd6436e4351510ddc9b9",
    relatedArtists: ["Asake"]
  },
  "lungu boy": {
    coverUrl: "https://media.pitchfork.com/photos/66b10a3eee21ef0a8b842d3e/2:3/w_2000,h_3000,c_limit/Asake-Lungu-Boy.jpg",
    relatedArtists: ["Asake"]
  }
};

// Default album cover when nothing else matches
const DEFAULT_ALBUM_COVER = "https://i.scdn.co/image/ab67706f000000030f7735e3e7e8eabc2282f8ac"; // Nigerian playlist cover
const DEFAULT_AFROBEATS_COVER = "https://i.scdn.co/image/ab67706f00000003319c7966099f5752197ddb32"; // Afrobeats cover
const NIGERIAN_FLAG_COVER = "https://i.scdn.co/image/ab67616d0000b273c2348a96152d5fa386b3fc8c"; // Nigerian themed cover
const ASAKE_YOGA_COVER = "https://i.scdn.co/image/ab67616d0000b2731484cd6436e4351510ddc9b9"; // Asake's Yoga cover
const ASAKE_LUNGU_BOY_COVER = "https://media.pitchfork.com/photos/66b10a3eee21ef0a8b842d3e/2:3/w_2000,h_3000,c_limit/Asake-Lungu-Boy.jpg"; // Asake's Lungu Boy cover

export class MusicArtService {
  /**
   * Finds album artwork based on song title and artist
   * @param songTitle The title of the song
   * @param artistName The name of the artist
   * @returns URL for album artwork
   */
  static getAlbumArtwork(songTitle: string, artistName: string): string {
    try {
      // Normalize inputs for case-insensitive matching
      const normalizedTitle = songTitle?.toLowerCase().trim() || "";
      const normalizedArtist = artistName?.toLowerCase().trim() || "";

      console.log(`Fetching artwork for: "${normalizedTitle}" by "${normalizedArtist}"`);
      
      // Handle special cases directly
      if (normalizedTitle === "yoga" && normalizedArtist === "asake") {
        return ASAKE_YOGA_COVER;
      }
      
      if (normalizedTitle === "lungu boy" && normalizedArtist === "asake") {
        return ASAKE_LUNGU_BOY_COVER;
      }
      
      // Try to find a direct match for the song as a single
      for (const artistKey in nigerianMusicDatabase) {
        const artistData = nigerianMusicDatabase[artistKey];
        
        // Check if this artist or featured artist matches
        if (normalizedArtist.includes(artistKey) || 
            artistKey.includes(normalizedArtist) || 
            normalizedArtist.includes(artistData.name.toLowerCase()) ||
            normalizedTitle.includes(artistKey)) {
          
          // First check singles for exact matches
          if (artistData.singles) {
            const matchingSingle = artistData.singles.find(single => 
              single.title.toLowerCase().includes(normalizedTitle) ||
              normalizedTitle.includes(single.title.toLowerCase())
            );
            
            if (matchingSingle) {
              console.log(`Found single match: ${matchingSingle.title}`);
              return matchingSingle.coverUrl;
            }
          }
          
          // Then check albums for track matches
          if (artistData.albums) {
            for (const album of artistData.albums) {
              if (album.tracks?.some(track => 
                track.toLowerCase().includes(normalizedTitle) || 
                normalizedTitle.includes(track.toLowerCase())
              )) {
                console.log(`Found album track match in: ${album.title}`);
                return album.coverUrl;
              }
            }
            
            // If the title matches album name, use album cover
            const matchingAlbum = artistData.albums.find(album => 
              album.title.toLowerCase().includes(normalizedTitle) || 
              normalizedTitle.includes(album.title.toLowerCase())
            );
            
            if (matchingAlbum) {
              console.log(`Found album title match: ${matchingAlbum.title}`);
              return matchingAlbum.coverUrl;
            }
            
            // As last resort for matching artist, use their latest album
            return artistData.albums[0].coverUrl;
          }
        }
      }
      
      // Try to match using genre or location keywords
      for (const [keyword, data] of Object.entries(hitSongsDatabase)) {
        if (normalizedTitle.includes(keyword) || normalizedArtist.includes(keyword)) {
          console.log(`Found keyword match: ${keyword}`);
          return data.coverUrl;
        }
      }
      
      // Check if any of the related artists match
      for (const[keyword, data] of Object.entries(hitSongsDatabase)) {
        for (const artist of data.relatedArtists) {
          if (normalizedArtist.includes(artist.toLowerCase())) {
            console.log(`Found related artist match: ${artist}`);
            return data.coverUrl;
          }
        }
      }
      
      // Final fallbacks based on keywords
      if (normalizedTitle.includes("love") || normalizedTitle.includes("heart")) {
        return "https://i.scdn.co/image/ab67616d0000b273db9259c2a3e4478f2ef13395"; // Romantic cover
      }
      
      if (normalizedTitle.includes("party") || normalizedTitle.includes("club")) {
        return "https://i.scdn.co/image/ab67616d0000b273b6f50369adde910678c8a58c"; // Party cover
      }
      
      // Return default Nigerian music cover as absolute last resort
      return DEFAULT_ALBUM_COVER;
    } catch (error) {
      console.error("Error getting album artwork:", error);
      return DEFAULT_ALBUM_COVER;
    }
  }
  
  /**
   * Gets generic album art for a genre
   */
  static getGenericAlbumArt(genre: string): string {
    const normalizedGenre = genre.toLowerCase().trim();
    
    if (normalizedGenre === "afrobeats" || normalizedGenre.includes("afro")) {
      return DEFAULT_AFROBEATS_COVER;
    }
    
    if (normalizedGenre === "yoga") {
      return ASAKE_YOGA_COVER;
    }
    
    if (normalizedGenre === "lungu boy") {
      return ASAKE_LUNGU_BOY_COVER;
    }
    
    if (normalizedGenre in hitSongsDatabase) {
      return hitSongsDatabase[normalizedGenre as keyof typeof hitSongsDatabase].coverUrl;
    }
    
    return DEFAULT_ALBUM_COVER;
  }
  
  /**
   * Gets a random Nigerian song with artwork for demo purposes
   */
  static getRandomNigerianSong(): { title: string; artist: string; albumArt: string } {
    // Default to Yoga by Asake if needed
    if (Math.random() < 0.3) {
      return {
        title: "Yoga",
        artist: "Asake",
        albumArt: ASAKE_YOGA_COVER
      };
    }
    
    // Get random artist
    const artistEntries = Object.entries(nigerianMusicDatabase).filter(([_, data]) => data.albums && data.albums.length > 0);

    if (artistEntries.length === 0) {
      throw new Error('No artists with albums found');
    }
    const randomEntry = artistEntries[Math.floor(Math.random() * artistEntries.length)];
    const [ randomArtistsKey, artistData ] = randomEntry;
    
    // Choose between album track or single
    let title: string;
    let albumArt: string;
    
    if (artistData.singles && artistData.singles.length > 0 && Math.random() > 0.5) {
      // Pick a single
      const randomSingle = artistData.singles[Math.floor(Math.random() * artistData.singles.length)];
      title = randomSingle.title;
      albumArt = randomSingle.coverUrl;
    } else {
      // Pick an album
      const randomAlbum = artistData.albums![Math.floor(Math.random() * artistData.albums!.length)];
      // Pick a random track from album if available
      if (randomAlbum.tracks && randomAlbum.tracks.length > 0) {
        title = randomAlbum.tracks[Math.floor(Math.random() * randomAlbum.tracks.length)];
      } else {
        title = randomAlbum.title + " (Track)";
      }
      albumArt = randomAlbum.coverUrl;
    }
    
    return {
      title,
      artist: artistData.name,
      albumArt
    };
  }
}