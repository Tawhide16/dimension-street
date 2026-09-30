import React from "react";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Box,
  TrendingUp,
  CreditCard,
  LucideIcon,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon?: LucideIcon | "dollar" | "bag" | "users" | "box" | "trend" | "card";
  iconColor?: string;
  badgeText?: string;
  badgeColor?: string;
  footerText?: string;
}

export default function MetricCard({
  title,
  value,
  subValue,
  icon = "dollar",
  iconColor = "text-emerald-500",
  badgeText,
  badgeColor = "bg-neutral-100 text-neutral-600",
  footerText,
}: MetricCardProps) {
  // Render icon based on type or component
  const renderIcon = () => {
    if (typeof icon === "string") {
      switch (icon) {
        case "dollar":
          return <DollarSign className="w-4 h-4" />;
        case "bag":
          return <ShoppingBag className="w-4 h-4" />;
        case "users":
          return <Users className="w-4 h-4" />;
        case "box":
          return <Box className="w-4 h-4" />;
        case "trend":
          return <TrendingUp className="w-4 h-4" />;
        case "card":
          return <CreditCard className="w-4 h-4" />;
        default:
          return <DollarSign className="w-4 h-4" />;
      }
    }
    const IconComponent = icon;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all flex flex-col justify-between">
      {/* Top Title & Icon */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-neutral-400">
          {title}
        </span>
        <div className={`p-2 rounded-lg bg-neutral-50 ${iconColor}`}>
          {renderIcon()}
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="my-3">
        <div className="text-2xl font-black text-neutral-900 tracking-tight font-sans">
          {value}
        </div>
        {subValue && (
          <div className="text-xs text-neutral-400 font-mono mt-0.5">
            {subValue}
          </div>
        )}
      </div>

      {/* Footer & Badge */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[11px] font-mono">
        <span className="text-neutral-500">{footerText || "Storefront live"}</span>
        {badgeText && (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeColor}`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
