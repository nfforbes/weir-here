import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Job from '@/models/Job';
import { getPublicSiteUrl } from '@/lib/siteUrl';

/** Refresh job title/description metadata periodically for search snippets. */
export const revalidate = 300;

type Props = { children: React.ReactNode; params: Promise<{ id: string }> };

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const canonicalPath = `/jobs/${id}`;
  const base = getPublicSiteUrl();
  const absoluteUrl = `${base}${canonicalPath}`;

  if (!OBJECT_ID_RE.test(id)) {
    return {
      title: 'Job posting',
      alternates: { canonical: canonicalPath },
    };
  }

  try {
    await connectDB();
    const job = await Job.findById(id).select('title location').lean<{
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
