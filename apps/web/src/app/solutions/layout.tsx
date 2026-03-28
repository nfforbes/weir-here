import type { Metadata } from 'next';
import SolutionsSnapScroll from '@/components/solutions/SolutionsSnapScroll';

export const metadata: Metadata = {
  title: {
    default: 'Staffing Solutions in Jamaica | Weir Here Staffing',
    template: '%s | Weir Here Staffing',
  },
};

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SolutionsSnapScroll>{children}</SolutionsSnapScroll>;
}
