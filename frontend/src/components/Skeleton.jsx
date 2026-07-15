import React from 'react';

export function SkeletonLine({ className = '' }) {
  return (
    <div className={`animate-pulse bg-slate-800 rounded-md ${className}`} />
  );
}

export function AlertsSkeleton() {
  return (
    <div className="space-y-3" data-testid="alerts-skeleton">
      {[1, 2].map((i) => (
        <div key={i} className="p-4 bg-stadiumNavy/40 border border-slate-800/85 rounded-2xl space-y-3">
          <div className="flex justify-between items-center">
            <SkeletonLine className="h-4 w-1/4" />
            <SkeletonLine className="h-3 w-16" />
          </div>
          <SkeletonLine className="h-3 w-full" />
          <SkeletonLine className="h-3 w-5/6" />
        </div>
      ))}
    </div>
  );
}

export function FoodCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="food-cards-skeleton">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-5 bg-stadiumNavy/40 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2 w-2/3">
              <SkeletonLine className="h-5 w-3/4" />
              <SkeletonLine className="h-3 w-1/2" />
            </div>
            <SkeletonLine className="h-5 w-12" />
          </div>
          <SkeletonLine className="h-12 w-full" />
          <div className="flex gap-2">
            <SkeletonLine className="h-5 w-16" />
            <SkeletonLine className="h-5 w-16" />
          </div>
          <div className="flex justify-between items-center border-t border-slate-800/80 pt-3">
            <div className="space-y-1 w-1/3">
              <SkeletonLine className="h-2.5 w-full" />
              <SkeletonLine className="h-2 w-3/4" />
            </div>
            <SkeletonLine className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VenueStatusSkeleton() {
  return (
    <div className="space-y-3" data-testid="venue-status-skeleton">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800/40 last:border-0">
          <SkeletonLine className="h-4 w-1/3" />
          <SkeletonLine className="h-5 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

export function AIAssistantSkeleton() {
  return (
    <div className="space-y-4 py-4" data-testid="ai-assistant-skeleton">
      <div className="flex justify-start">
        <div className="max-w-[80%] rounded-2xl p-4 bg-slate-800/30 border border-slate-800 space-y-2 w-3/4">
          <SkeletonLine className="h-4 w-1/3" />
          <SkeletonLine className="h-3 w-full" />
          <SkeletonLine className="h-3 w-5/6" />
        </div>
      </div>
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl p-4 bg-electricBlue/10 border border-electricBlue/20 space-y-2 w-1/2">
          <SkeletonLine className="h-3 w-full" />
          <SkeletonLine className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  );
}

export function ReportsSkeleton() {
  return (
    <div className="space-y-3" data-testid="reports-skeleton">
      {[1, 2].map((i) => (
        <div key={i} className="p-4 bg-stadiumNavy/40 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center space-x-2">
            <SkeletonLine className="h-4 w-1/4" />
            <SkeletonLine className="h-5 w-12" />
          </div>
          <SkeletonLine className="h-3 w-5/6" />
        </div>
      ))}
    </div>
  );
}

export function CommandCenterSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="command-center-skeleton">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-[350px] bg-stadiumNavy/40 border border-slate-800 rounded-3xl p-4 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/10 to-transparent animate-pulse" />
          <SkeletonLine className="h-10 w-1/3" />
        </div>
        <div className="p-5 bg-stadiumNavy/40 border border-slate-800 rounded-3xl space-y-4">
          <SkeletonLine className="h-5 w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonLine className="h-16 w-full" />
            <SkeletonLine className="h-16 w-full" />
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="p-5 bg-stadiumNavy/40 border border-slate-800 rounded-3xl space-y-4">
          <SkeletonLine className="h-5 w-1/2" />
          <div className="space-y-3">
            <SkeletonLine className="h-12 w-full" />
            <SkeletonLine className="h-12 w-full" />
            <SkeletonLine className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
