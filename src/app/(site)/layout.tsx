import { display, displayItalic } from '../fonts';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${displayItalic.variable}`}>{children}</div>;
}
