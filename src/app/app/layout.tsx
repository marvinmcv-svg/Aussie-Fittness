import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers/Providers';

export const metadata: Metadata = {
  title: 'AussieFit app: plan your week, shop in one tap',
  description: 'The Aussie Fitness recipe app: 135 high-protein recipes, a weekly macro planner and one-tap shopping lists.',
  alternates: { canonical: '/app' },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Session, theme and toasts are app-only, so marketing pages don't ship them.
  return (
    <>
      <Providers>{children}</Providers>
      <Toaster />
    </>
  );
}
