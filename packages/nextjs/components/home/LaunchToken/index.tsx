"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import { RightChevronArrow } from "~~/icons/actions";

export default function LaunchToken() {
  const [isHovered, setIsHovered] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  // Add attention-grabbing pulse effect after a delay
  useEffect(() => {
    const pulseTimer = setTimeout(() => {
      setShowPulse(true);
    }, 3000);

    return () => clearTimeout(pulseTimer);
  }, []);

  return (
    <div className="relative">
      {showPulse && <div className="launch-button-pulse"></div>}
      <Link href="/create">
        <Button 
          className={`bg-primary-500 text-white-500 relative overflow-hidden transition-all duration-300 ease-in-out px-6 py-3 font-semibold rounded-lg group ${isHovered ? 'shadow-lg shadow-purple-500/30' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex items-center justify-center relative z-10">
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            <span className="mr-2">Launch Token</span>
            <span className={`transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}>
              <RightChevronArrow />
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg"></div>
            <div className="h-[200%] w-[200%] absolute -top-1/2 -left-1/2 animate-slow-spin bg-conic-gradient opacity-70 blur-xl"></div>
          </div>
        </Button>
      </Link>
    </div>
  );
}

// Add this to your globals.css or another suitable css file
// @keyframes slow-spin {
//   from {
//     transform: rotate(0deg);
//   }
//   to {
//     transform: rotate(360deg);
//   }
// }
// 
// .bg-conic-gradient {
//   background: conic-gradient(
//     rgba(139, 92, 246, 0),
//     rgba(139, 92, 246, 0.1),
//     rgba(139, 92, 246, 0.2),
//     rgba(139, 92, 246, 0.3),
//     rgba(139, 92, 246, 0.4),
//     rgba(139, 92, 246, 0.5),
//     rgba(139, 92, 246, 0.6),
//     rgba(139, 92, 246, 0.7),
//     rgba(139, 92, 246, 0.8),
//     rgba(139, 92, 246, 0.9),
//     rgba(139, 92, 246, 1),
//     rgba(139, 92, 246, 0)
//   );
// }
// 
// .animate-slow-spin {
//   animation: slow-spin 5s linear infinite;
// }
