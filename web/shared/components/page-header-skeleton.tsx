"use client";

import { Skeleton } from "./ui/skeleton";

interface PageHeaderSkeletonProps {
  showButton?: boolean;
}

export function PageHeaderSkeleton({ showButton = true }: PageHeaderSkeletonProps) {
  return (
    <div className="flex items-center justify-between">
      {/* Left: Month Dropdown Skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-[140px]" />
      </div>

      {/* Center: Empty space for balance */}
      <div className="flex-1"></div>
      
      {/* Right: Action Button Skeleton */}
      {showButton && (
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32 hidden md:block" />
        </div>
      )}
    </div>
  );
}

