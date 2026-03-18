import type { Metadata } from 'next';
import SolutionsSnapScroll from '@/components/solutions/SolutionsSnapScroll';

export const metadata: Metadata = {
  title: 'Solutions | Weir Here Staffing',
};

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SolutionsSnapScroll>{children}</SolutionsSnapScroll>;
}
