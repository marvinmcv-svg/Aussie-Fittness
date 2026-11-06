'use client';

import Image from 'next/image';
import { ChevronRight, Check, ShieldCheck, CalendarDays, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { getRecipeStats, getFeaturedRecipes, getFreeRecipes } from '@/lib/recipes';
import { PRICE_LABEL, PRICE_CURRENCY, REFUND_DAYS } from '@/lib/pricing';
import { usePremium } from '@/store/premium';
import { usePaywall } from '@/store/paywall';
import type { Screen } from '@/types';

interface HomeScreenProps {
  onNavigate: (screen: Screen, recipeId?: string) => void;
  onBrowseCategory?: (category?: 'all' | 'Savoury' | 'Sweet' | 'favorites') => void;
}

/**
 * Home doubles as the landing page. Structure follows the pattern of top
 * nutrition/recipe apps on Mobbin: photo-led hero → proof in numbers →
 * product carousel → how it works → pricing → FAQ. No invented testimonials.
 */
export function HomeScreen({ onNavigate, onBrowseCategory }: HomeScreenProps) {
  const stats = getRecipeStats();
  const featured = getFeaturedRecipes(10);
  const free = getFreeRecipes().slice(0, 6);
  const { isPremium } = usePremium();
  const openPaywall = (source: string) => usePaywall.getState().show(source);

  return (
    <div className="space-y-10">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative -mx-4 -mt-4 overflow-hidden sm:mx-0 sm:mt-0 sm:rounded-[28px]">
        <div className="relative aspect-[4/5] w-full sm:aspect-[21/9]">
          <Image
            src="/recipes/hero-spread.png"
            alt="High-protein meal prep containers with chicken, rice and vegetables"
            fill
            priority
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 via-55% to-black/0" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-white/70">
            {stats.total} recipes · every macro counted
          </p>
          <h1 className="mt-2 text-[40px] font-bold leading-[1.02] tracking-tight sm:text-6xl">
            Eat like
            <br />
            you train.
          </h1>
          <p className="mt-3 max-w-md text-[17px] leading-snug text-white/80">
            High-protein meals that taste like cheat meals. Plan your week,
            then get your shopping list in one tap.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <button
              onClick={() => onBrowseCategory?.('all')}
              className="pressable flex h-[52px] items-center justify-center rounded-full bg-white px-7 text-[17px] font-semibold text-black"
            >
              Browse recipes
            </button>
            {isPremium ? (
              <button
                onClick={() => onNavigate('planner')}
                className="pressable flex h-[52px] items-center justify-center rounded-full bg-white/15 px-7 text-[17px] font-semibold text-white backdrop-blur-md"
              >
                Plan my week
              </button>
            ) : (
              <button
                onClick={() => openPaywall('home-hero')}
                className="pressable flex h-[52px] items-center justify-center rounded-full bg-white/15 px-7 text-[17px] font-semibold text-white backdrop-blur-md"
              >
                Unlock all {stats.total} — {PRICE_LABEL}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Proof in numbers ─────────────────────────────── */}
      <section className="surface grid grid-cols-3 divide-x divide-border rounded-[20px] py-4 text-center">
        <Stat value={`${stats.avgProtein}g`} label="avg protein" className="text-protein" />
        <Stat value={`${stats.avgCalories}`} label="avg calories" className="text-calories" />
        <Stat value={`${stats.freeCount}`} label="free to try" />
      </section>

      {/* ── Carousel ─────────────────────────────────────── */}
      <section>
        <SectionHeader title="Highest protein" action="See all" onAction={() => onBrowseCategory?.('all')} />
        <div className="snap-row -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {featured.map((r) => (
            <div key={r.id} className="w-[46%] shrink-0 sm:w-[220px]">
              <RecipeCard recipe={r} compact onClick={() => onNavigate('recipe', r.id)} />
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section>
        <SectionHeader title="How it works" />
        <ol className="surface divide-y divide-border overflow-hidden rounded-[20px]">
          <Step
            icon={<UtensilsCrossed className="h-[18px] w-[18px]" />}
            tint="bg-calories"
            title="Pick meals you'll actually enjoy"
            body="Burgers, curries, cheesecake. Every recipe is macro-counted for you."
          />
          <Step
            icon={<CalendarDays className="h-[18px] w-[18px]" />}
            tint="bg-carbs"
            title="Drop them into your week"
            body="See daily calories and protein add up against your goals."
          />
          <Step
            icon={<ShoppingBag className="h-[18px] w-[18px]" />}
            tint="bg-protein"
            title="Shop in one tap"
            body="Your whole week becomes a grouped shopping list."
          />
        </ol>
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-3">
        <CategoryTile
          name="Savoury"
          count={stats.savoury}
          photo="/recipes/r001.png"
          onClick={() => onBrowseCategory?.('Savoury')}
        />
        <CategoryTile
          name="Sweet"
          count={stats.sweet}
          photo="/recipes/r095.png"
          onClick={() => onBrowseCategory?.('Sweet')}
        />
      </section>

      {/* ── Free recipes ─────────────────────────────────── */}
      <section>
        <SectionHeader title="Try these free" subtitle="Full recipes, no account needed" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {free.map((r) => (
            <RecipeCard key={r.id} recipe={r} onClick={() => onNavigate('recipe', r.id)} />
          ))}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      {!isPremium && (
        <section id="pricing" className="surface rounded-[28px] p-6 sm:p-8">
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Lifetime access
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tight">{PRICE_LABEL}</span>
            <span className="text-[15px] text-muted-foreground">{PRICE_CURRENCY} · once</span>
          </div>
          <p className="mt-1 text-[15px] text-muted-foreground">Less than one takeaway meal. No subscription.</p>
          <ul className="mt-5 space-y-3">
            {[
              `All ${stats.total} recipes, with full ingredients and steps`,
              'Weekly planner with live macro totals',
              'One-tap shopping list from your plan',
              'Every new recipe we add, free',
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-[15px]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground">
                  <Check className="h-3 w-3 text-background" strokeWidth={3} aria-hidden="true" />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <button
            onClick={() => openPaywall('home-pricing')}
            className="pressable mt-6 flex h-[52px] w-full items-center justify-center rounded-full bg-foreground text-[17px] font-semibold text-background"
          >
            Unlock everything
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-muted-foreground">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {REFUND_DAYS}-day money-back guarantee
          </p>
        </section>
      )}

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section>
        <SectionHeader title="Questions" />
        <div className="surface divide-y divide-border overflow-hidden rounded-[20px]">
          <Faq q="Is it really a one-time payment?">
            Yes. Pay {PRICE_LABEL} {PRICE_CURRENCY} once and keep access for good, including recipes we add later.
          </Faq>
          <Faq q="What if it's not for me?">
            Email us within {REFUND_DAYS} days of purchase for a full refund. No questions asked.
          </Faq>
          <Faq q="Are the macros per serving?">
            Yes, unless a recipe says &ldquo;whole recipe&rdquo;. You can scale servings and the macros update.
          </Faq>
          <Faq q="Can I use it like an app?">
            Yes. On iPhone, tap Share → Add to Home Screen. It opens full-screen like a native app.
          </Faq>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  title, subtitle, action, onAction,
}: { title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-[13px] text-muted-foreground">{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={onAction}
          className="inline-flex items-center text-[15px] font-medium text-muted-foreground hover:text-foreground"
        >
          {action}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function Stat({ value, label, className = '' }: { value: string; label: string; className?: string }) {
  return (
    <div className="px-2">
      <div className={`text-[26px] font-bold tracking-tight ${className}`}>{value}</div>
      <div className="text-[12px] text-muted-foreground">{label}</div>
    </div>
  );
}

function Step({
  icon, tint, title, body,
}: { icon: React.ReactNode; tint: string; title: string; body: string }) {
  return (
    <li className="flex items-start gap-3.5 px-4 py-3.5">
      <span className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] text-white ${tint}`}>
        {icon}
      </span>
      <div>
        <div className="text-[16px] font-semibold leading-tight">{title}</div>
        <div className="mt-0.5 text-[14px] leading-snug text-muted-foreground">{body}</div>
      </div>
    </li>
  );
}

function CategoryTile({
  name, count, photo, onClick,
}: { name: string; count: number; photo: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="pressable relative aspect-[4/3] overflow-hidden rounded-[20px] text-left"
    >
      <Image src={photo} alt="" fill sizes="(min-width: 640px) 50vw, 50vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-3 left-4 text-white">
        <div className="text-[20px] font-bold leading-tight">{name}</div>
        <div className="text-[13px] text-white/75">{count} recipes</div>
      </div>
    </button>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group px-4 py-3.5 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium">
        {q}
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" aria-hidden="true" />
      </summary>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{children}</p>
    </details>
  );
}
