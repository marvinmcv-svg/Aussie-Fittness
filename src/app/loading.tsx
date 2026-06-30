import { ChefHat } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <div className="relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ChefHat className="h-8 w-8 text-primary" />
        </div>
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
      </div>
      <div className="space-y-2 text-center">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-3 w-24 animate-pulse rounded bg-muted/60" />
      </div>
    </div>
  );
}
