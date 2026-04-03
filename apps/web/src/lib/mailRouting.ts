import { connectDB } from '@/lib/mongodb';
import SystemSetting from '@/models/SystemSetting';

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Microsoft Graph send-as + one or more TO addresses. */
export type GraphMailRouting = { sendAs: string; recipients: string[] };

export type DeliveryMode = 'primary' | 'secondary' | 'both';

function normalizeDeliveryMode(raw: string | undefined): DeliveryMode {
  const m = (raw || 'primary').trim().toLowerCase();
  if (m === 'secondary' || m === 'both') return m;
  return 'primary';
}

function dedupeEmails(emails: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of emails) {
    const t = e.trim();
    if (!t) continue;
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
  }
  return out;
}

/**
 * Resolves TO list from primary inbox, optional second inbox, and delivery mode.
 */
export function resolveRecipients(params: {
  primary: string;
  secondary: string;
  mode: DeliveryMode;
  logPrefix?: string;
}): string[] {
  const primary = params.primary.trim();
  const secondary = params.secondary.trim();

  if (params.mode === 'primary') {
    return primary ? [primary] : [];
  }

  if (params.mode === 'secondary') {
    if (secondary) return [secondary];
    if (params.logPrefix) {
      console.warn(
        `${params.logPrefix} Second inbox is empty; falling back to primary delivery.`,
      );
    }
    return primary ? [primary] : [];
  }

  const list: string[] = [];
  if (primary) list.push(primary);
  if (secondary) list.push(secondary);
  const deduped = dedupeEmails(list);
  if (deduped.length > 0) return deduped;
  return primary ? [primary] : [];
}

/** Consultation form: primary = MS365_MAIL_TO or send-as; second = MS365_MAIL_TO_2. */
export async function loadConsultationMailRouting(): Promise<GraphMailRouting | null> {
  await connectDB();
  const rows = await SystemSetting.find({
    key: {
      $in: [
        'MS365_MAIL_FROM',
        'MS365_MAIL_TO',
        'MS365_MAIL_TO_2',
        'MS365_CONSULTATION_DELIVERY',
      ],
    },
  }).lean();
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const sendAs = (map.get('MS365_MAIL_FROM') || '').trim();
  if (!sendAs) return null;

  const mailTo = (map.get('MS365_MAIL_TO') || '').trim();
  const primary = mailTo || sendAs;
  const secondary = (map.get('MS365_MAIL_TO_2') || '').trim();
  const mode = normalizeDeliveryMode(map.get('MS365_CONSULTATION_DELIVERY'));

  const recipients = resolveRecipients({
    primary,
    secondary,
    mode,
    logPrefix: '[consultation mail]',
  });

  if (recipients.length === 0) return null;

  return { sendAs, recipients };
}

/**
 * Job applications: primary = applications inbox, else consultation inbox, else send-as;
 * second = MS365_APPLICATIONS_MAIL_TO_2.
 */
export async function loadApplicationsMailRouting(): Promise<GraphMailRouting | null> {
  await connectDB();
  const rows = await SystemSetting.find({
    key: {
      $in: [
        'MS365_MAIL_FROM',
        'MS365_MAIL_TO',
        'MS365_APPLICATIONS_MAIL_TO',
        'MS365_APPLICATIONS_MAIL_TO_2',
        'MS365_APPLICATIONS_DELIVERY',
      ],
    },
  }).lean();
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const sendAs = (map.get('MS365_MAIL_FROM') || '').trim();
  if (!sendAs) return null;

  const applicationsTo = (map.get('MS365_APPLICATIONS_MAIL_TO') || '').trim();
  const consultationTo = (map.get('MS365_MAIL_TO') || '').trim();
  const primary = applicationsTo || consultationTo || sendAs;
  const secondary = (map.get('MS365_APPLICATIONS_MAIL_TO_2') || '').trim();
  const mode = normalizeDeliveryMode(map.get('MS365_APPLICATIONS_DELIVERY'));

  const recipients = resolveRecipients({
    primary,
    secondary,
    mode,
    logPrefix: '[applications mail]',
  });

  if (recipients.length === 0) return null;

  return { sendAs, recipients };
}

/** @deprecated Use GraphMailRouting */
export type MailRouting = { sendAs: string; notifyInbox: string };
