import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Job from '@/models/Job';
import { getPublicSiteUrl } from '@/lib/siteUrl';

/** Refresh job title/description metadata periodically for search snippets. */
export const revalidate = 300;

type Props = { children: React.ReactNode; params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const canonicalPath = `/jobs/${slug}`;
  const base = getPublicSiteUrl();
  const absoluteUrl = `${base}${canonicalPath}`;

  try {
    await connectDB();
    const job = await Job.findOne({ slug }).select('title location').lean<{
      title?: string;
      location?: string;
    }>();
    
    if (!job?.title) {
      return {
        title: 'Job posting | Weir Here Staffing',
        alternates: { canonical: canonicalPath },
      };
    }

    const titleStr = String(job.title);
    const location = job.location ? String(job.location) : '';

    const title = `${titleStr} | Weir Here Staffing`;
    const description = location
      ? `Apply for ${titleStr} in ${location}. Healthcare and domestic staffing with Weir Here Staffing, Jamaica.`
      : `Apply for ${titleStr}. Healthcare and domestic staffing with Weir Here Staffing, Jamaica.`;

    return {
      title,
      description,
      alternates: { canonical: canonicalPath },
      openGraph: {
        title,
        description,
        url: absoluteUrl,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  } catch {
    return {
      title: 'Job posting | Weir Here Staffing',
      alternates: { canonical: canonicalPath },
    };
  }
}

export default function JobDetailLayout({ children }: Props) {
  return children;
}
