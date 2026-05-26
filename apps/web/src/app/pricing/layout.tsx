import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing | ChaiForms',
  description: 'Simple, transparent pricing for ChaiForms. Start free and upgrade as you grow.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
