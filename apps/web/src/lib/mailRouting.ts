import { connectDB } from '@/lib/mongodb';
import SystemSetting from '@/models/SystemSetting';

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export type MailRouting = { sendAs: string; notifyInbox: string };

/** Send-as + inbox for general consultation / site mail (same as legacy behavior). */
export async function loadConsultationMailRouting(): Promise<MailRouting | null> {
  await connectDB();
  const rows = await SystemSetting.find({
    key: { $in: ['MS365_MAIL_FROM', 'MS365_MAIL_TO'] },
  }).lean();
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const sendAs = (map.get('MS365_MAIL_FROM') || '').trim();
  if (!sendAs) return null;
  const notifyInbox = (map.get('MS365_MAIL_TO') || '').trim() || sendAs;
  return { sendAs, notifyInbox };
}

/**
 * Send-as + inbox for job application notifications.
 * Uses MS365_APPLICATIONS_MAIL_TO when set; otherwise MS365_MAIL_TO; otherwise send-as mailbox.
 */
export async function loadApplicationsMailRouting(): Promise<MailRouting | null> {
  await connectDB();
  const rows = await SystemSetting.find({
    key: {
      $in: ['MS365_MAIL_FROM', 'MS365_MAIL_TO', 'MS365_APPLICATIONS_MAIL_TO'],
    },
  }).lean();
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const sendAs = (map.get('MS365_MAIL_FROM') || '').trim();
  if (!sendAs) return null;
  const applicationsTo = (map.get('MS365_APPLICATIONS_MAIL_TO') || '').trim();
  const consultationTo = (map.get('MS365_MAIL_TO') || '').trim();
  const notifyInbox = applicationsTo || consultationTo || sendAs;
  return { sendAs, notifyInbox };
}
