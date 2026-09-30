"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { CommunityReel } from "@/types";
import { useCart } from "@/lib/cartContext";
import { ShoppingCart, Check, Play, Pause, Volume2, VolumeX } from "lucide-react";

const DEFAULT_COMMUNITY_REELS: CommunityReel[] = [
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
    createdAt: "2026-09-30T00:00:00Z",
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
    createdAt: "2026-09-30T00:00:00Z",
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
    createdAt: "2026-09-30T00:00:00Z",
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
    createdAt: "2026-09-30T00:00:00Z",
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
    createdAt: "2026-09-30T00:00:00Z",
  },
];

interface MeetOurCommunityProps {
  initialReels?: CommunityReel[];
}

export default function MeetOurCommunity({ initialReels }: MeetOurCommunityProps) {
  const [reels, setReels] = useState<CommunityReel[]>(initialReels || DEFAULT_COMMUNITY_REELS);
  const { addItem, openCart } = useCart();
  const [addedReelId, setAddedReelId] = useState<string | null>(null);

  // Load from API if needed or fallback
  useEffect(() => {
    fetch("/api/community/reels")
      .then((res) => res.json())
      .then((data) => {
        if (data.reels && data.reels.length > 0) {
          setReels(data.reels.filter((r: CommunityReel) => r.isActive));
        }
      })
      .catch(() => {});
  }, []);

  const handleAddToCart = (e: React.MouseEvent, reel: CommunityReel) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: reel.product.id || reel._id,
      name: reel.product.name,
      slug: reel.product.slug,
      image: reel.product.thumbnail,
      color: "Standard",
      size: "M",
      sku: `${reel._id}-M`.toUpperCase(),
      price: reel.product.price,
    });

    openCart();

    setAddedReelId(reel._id);
    setTimeout(() => setAddedReelId(null), 1800);
  };

  return (
    <div className="w-full">
      {/* Title Centered matching reference */}
      <h2 className="text-xl sm:text-2xl md:text-[26px] font-bold uppercase tracking-tight text-neutral-900 text-center mb-6 sm:mb-8">
        MEET OUR COMMUNITY
      </h2>

      {/* 5 Reel Cards Horizontal Grid matching reference */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5 lg:gap-4">
        {reels.slice(0, 5).map((reel) => (
          <ReelVideoCard
            key={reel._id}
            reel={reel}
            isJustAdded={addedReelId === reel._id}
            onAddToCart={(e) => handleAddToCart(e, reel)}
          />
        ))}
      </div>
    </div>
  );
}

function ReelVideoCard({
  reel,
  isJustAdded,
  onAddToCart,
}: {
  reel: CommunityReel;
  isJustAdded: boolean;
  onAddToCart: (e: React.MouseEvent) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <div className="group flex flex-col bg-white overflow-hidden">
      {/* Video Container (Vertical 9:16 aspect ratio) */}
      <div
        onClick={togglePlay}
        className="relative aspect-[9/15] sm:aspect-[9/16] w-full bg-neutral-900 overflow-hidden cursor-pointer select-none"
      >
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={reel.posterUrl}
          playsInline
          loop
          muted={isMuted}
          className="w-full h-full object-cover object-center"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Video Overlay Play/Pause & Sound Indicator */}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors pointer-events-none" />

        {/* Center Play Button if paused */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center text-white shadow-md">
              <Play className="w-4 h-4 fill-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Sound Toggle Button */}
        <button
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute reel" : "Mute reel"}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors z-10"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Linked Product Bar matching reference image */}
      <div className="border border-neutral-200 border-t-0 p-2 sm:p-2.5 flex items-center justify-between gap-2 bg-white">
        {/* Left: Product Thumbnail */}
        <Link
          href={`/product/${reel.product.slug}`}
          className="relative w-8 h-8 sm:w-9 sm:h-9 bg-neutral-100 flex-shrink-0 border border-neutral-200 overflow-hidden block"
        >
          <Image
            src={reel.product.thumbnail}
            alt={reel.product.name}
            fill
            sizes="40px"
            className="object-contain p-0.5"
          />
        </Link>

        {/* Middle: Product Title & Price */}
        <div className="flex-1 min-w-0 text-left">
          <Link
            href={`/product/${reel.product.slug}`}
            className="text-[10px] sm:text-[11px] font-semibold text-neutral-900 leading-tight truncate block hover:underline"
            title={reel.product.name}
          >
            {reel.product.name}
          </Link>
          <span className="text-[10px] sm:text-[11px] font-bold text-neutral-900 block mt-0.5">
            Tk {reel.product.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Right: Black Round Cart Button */}
        <button
          onClick={onAddToCart}
          title="Add to cart"
          aria-label={`Add ${reel.product.name} to cart`}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-xs cursor-pointer ${
            isJustAdded
              ? "bg-emerald-600 text-white"
              : "bg-black text-white hover:bg-neutral-800 active:scale-90"
          }`}
        >
          {isJustAdded ? (
            <Check className="w-3.5 h-3.5 text-white" />
          ) : (
            <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
