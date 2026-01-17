"use client";

import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export function ProfileSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-48" />
            </div>
          </div>
          <div className="pt-4 border-t border-border space-y-3">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

