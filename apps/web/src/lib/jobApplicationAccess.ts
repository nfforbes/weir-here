import type { Persona } from '@weir-here/shared';
import User from '@/models/User';

type SessionUser = { sub: string; email?: string };

/**
 * Who may list or manage applications for a job: poster, listed reviewer, or site administrator.
 * (Matches the spirit of job edit routes that allow administrators.)
 */
export async function canAccessJobApplications(
  user: SessionUser,
  job: { postedBy: string; reviewerEmails?: string[] | null },
): Promise<boolean> {
  if (job.postedBy === user.sub) return true;

  const reviewerEmails = Array.isArray(job.reviewerEmails) ? job.reviewerEmails : [];
  const sessionEmail = user.email?.trim().toLowerCase();
  if (
    sessionEmail &&
    reviewerEmails.some((e) => String(e ?? '').trim().toLowerCase() === sessionEmail)
  ) {
    return true;
  }

  const dbUser = await User.findOne({ auth0Id: user.sub })
    .select('personas')
    .lean<{ personas: Persona[] } | null>();
  return Boolean(dbUser?.personas?.includes('administrator'));
}
