import fs from "fs";
import path from "path";
import { CommunityReel } from "@/types";

const DATA_FILE = path.join(process.cwd(), "data", "communityReels.json");

const INITIAL_REELS: CommunityReel[] = [
  {
    _id: "reel-1",
    title: "Gym Workout - Singh Stonewash Hoodie",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    posterUrl: "/images/review_green_hoodie.jpg",
    product: {
      id: "prod-hoodie-grey",
      name: "Community club Singh hoodie - Grey stonewash",
      price: 13600,
      slug: "architectural-pullover-hoodie-480gsm",
      thumbnail: "/images/review_green_hoodie.jpg",
    },
    likes: 1420,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "reel-2",
    title: "Parking Garage Night Fit - Kaur Hoodie",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    posterUrl: "/images/bestseller_kaur_tote.jpg",
    product: {
      id: "prod-hoodie-brown",
      name: "Community club Singh hoodie - Brown",
      price: 4200,
      slug: "architectural-pullover-hoodie-480gsm",
      thumbnail: "/images/bestseller_singh_black_tee.jpg",
    },
    likes: 2180,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "reel-3",
    title: "Motion Streetwear Reel - Blue Hoodie",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    posterUrl: "/images/community_our_story.jpg",
    product: {
      id: "prod-hoodie-blue",
      name: "Community club Singh hoodie - Blue",
      price: 13600,
      slug: "architectural-pullover-hoodie-480gsm",
      thumbnail: "/images/review_green_hoodie.jpg",
    },
    likes: 3490,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "reel-4",
    title: "Misty Rooftop Skyline - Kaur Navy",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    posterUrl: "/images/offer_closing_banner.jpg",
    product: {
      id: "prod-hoodie-navi",
      name: "Community club Kaur hoodie - Navi",
      price: 6500,
      slug: "architectural-pullover-hoodie-480gsm",
      thumbnail: "/images/bestseller_singh_black_tee.jpg",
    },
    likes: 1890,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "reel-5",
    title: "Outdoor Clapping Fit - Stonewashed Tee",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    posterUrl: "/images/bestseller_baaj_tee.jpg",
    product: {
      id: "prod-tee-stonewash",
      name: "Black stone washed Singh T-shirt",
      price: 8400,
      slug: "dimension-isometric-heavyweight-tee",
      thumbnail: "/images/bestseller_baaj_tee.jpg",
    },
    likes: 4120,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_REELS, null, 2), "utf-8");
  }
}

export function getCommunityReels(): CommunityReel[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading community reels:", err);
    return INITIAL_REELS;
  }
}

export function saveCommunityReels(reels: CommunityReel[]): void {
  ensureDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(reels, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving community reels:", err);
  }
}

export function addCommunityReel(reel: Omit<CommunityReel, "_id" | "createdAt">): CommunityReel {
  const reels = getCommunityReels();
  const newReel: CommunityReel = {
    ...reel,
    _id: `reel-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  reels.unshift(newReel);
  saveCommunityReels(reels);
  return newReel;
}

export function deleteCommunityReel(id: string): boolean {
  const reels = getCommunityReels();
  const filtered = reels.filter((r) => r._id !== id);
  if (filtered.length !== reels.length) {
    saveCommunityReels(filtered);
    return true;
  }
  return false;
}

export function toggleCommunityReelActive(id: string): CommunityReel | null {
  const reels = getCommunityReels();
  const item = reels.find((r) => r._id === id);
  if (item) {
    item.isActive = !item.isActive;
    saveCommunityReels(reels);
    return item;
  }
  return null;
}
