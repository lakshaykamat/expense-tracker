"use client";

import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <div className="px-6 pt-8 pb-6 text-center border-b border-border/50">
          <Skeleton className="w-14 h-14 rounded-full mx-auto mb-4" />
          <Skeleton className="h-3 w-16 mx-auto mb-2" />
          <Skeleton className="h-5 w-48 mx-auto" />
        </div>
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-border/50">
            <Skeleton className="h-3 w-20 mb-3" />
            <div className="flex gap-1 p-1 rounded-lg bg-muted/50 w-fit">
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
          </div>
          <div className="px-6 py-4 space-y-2">
            <Skeleton className="h-3 w-12 mb-3" />
            <Skeleton className="h-11 w-full rounded-md" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

