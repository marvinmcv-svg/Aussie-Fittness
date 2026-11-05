import { AboutPage } from '@/components/site/pages/AboutPage';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({ locale: 'es', path: '/about', title: 'La historia: 60 kg menos con versiones de comida rápida', description: 'Cómo Dez Cerimagic pasó de 135 kg a 75 kg sin dejar la comida rápida y creó Aussie Fitness.' });

export default function Page() {
  return <AboutPage locale="es" />;
}
