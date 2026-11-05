import { bricolage } from '../fonts';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <div className={bricolage.variable}>{children}</div>;
}
