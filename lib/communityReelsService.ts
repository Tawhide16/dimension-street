import fs from "fs";
import path from "path";
import { CommunityReel } from "@/types";

const DATA_FILE = path.join(process.cwd(), "data", "communityReels.json");

const INITIAL_REELS: CommunityReel[] = [
  {
    _id: "reel-1",
    title: "Community club Kaur hoodie - Navi",
    videoUrl: "",
    posterUrl: "/images/community_photo_1.jpg",
    product: {
      id: "prod-hoodie-navi",
      name: "Community club Kaur hoodie - Navi",
      price: 6500,
      slug: "architectural-pullover-hoodie-480gsm",
      thumbnail: "/images/community_thumb_1.jpg",
    },
    likes: 1890,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "reel-2",
    title: "Black stone washed Singh T-shirt",
    videoUrl: "",
    posterUrl: "/images/community_photo_2.jpg",
    product: {
      id: "prod-tee-stonewash-2",
      name: "Black stone washed Singh T-shirt",
      price: 8500,
      slug: "dimension-isometric-heavyweight-tee",
      thumbnail: "/images/community_thumb_2.jpg",
    },
    likes: 2480,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "reel-3",
    title: "Black stone washed Singh T-shirt - Central Feature",
    videoUrl: "",
    posterUrl: "/images/community_photo_3.jpg",
    product: {
      id: "prod-tee-stonewash-3",
      name: "Black stone washed Singh T-shirt",
      price: 8500,
      slug: "dimension-isometric-heavyweight-tee",
      thumbnail: "/images/community_thumb_3.jpg",
    },
    likes: 5120,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "reel-4",
    title: "Community club Singh sweater - Green",
    videoUrl: "",
    posterUrl: "/images/community_photo_4.jpg",
    product: {
      id: "prod-sweater-green",
      name: "Community club Singh sweater - Green",
      price: 11300,
      slug: "architectural-pullover-hoodie-480gsm",
      thumbnail: "/images/community_thumb_4.jpg",
    },
    likes: 3490,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "reel-5",
    title: "Community club Singh hoodie - Grey stonewash",
    videoUrl: "",
    posterUrl: "/images/community_photo_5.jpg",
    product: {
      id: "prod-hoodie-grey-5",
      name: "Community club Singh hoodie - Grey stonewash",
      price: 13600,
      slug: "architectural-pullover-hoodie-480gsm",
      thumbnail: "/images/community_thumb_5.jpg",
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
