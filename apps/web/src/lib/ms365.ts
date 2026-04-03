import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { connectDB } from './mongodb';
import SystemSetting from '@/models/SystemSetting';

/** Graph + SharePoint (upload) configuration */
interface MS365Config extends MS365Credentials {
  siteId: string;
  resumeFolderPath: string;
  logoFolderPath: string;
  jobAttachmentPath: string;
}

interface MS365Credentials {
  clientId: string;
  clientSecret: string;
  tenantId: string;
}

const CREDENTIAL_KEYS = [
  'MS365_CLIENT_ID',
  'MS365_CLIENT_SECRET',
  'MS365_TENANT_ID',
] as const;

async function loadCredentialMap(): Promise<Map<string, string>> {
  await connectDB();
  const rows = await SystemSetting.find({
    key: { $in: [...CREDENTIAL_KEYS] },
  }).lean();
  return new Map(rows.map((s) => [s.key, s.value]));
}

async function loadCredentialSettings(): Promise<MS365Credentials | null> {
  const map = await loadCredentialMap();
  const clientId = map.get('MS365_CLIENT_ID');
  const clientSecret = map.get('MS365_CLIENT_SECRET');
  const tenantId = map.get('MS365_TENANT_ID');
  if (!clientId || !clientSecret || !tenantId) return null;
  return { clientId, clientSecret, tenantId };
}

function createGraphClient(creds: MS365Credentials): Client {
  const credential = new ClientSecretCredential(
    creds.tenantId,
    creds.clientId,
    creds.clientSecret,
  );

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const token = await credential.getToken(
          'https://graph.microsoft.com/.default',
        );
        return token.token;
      },
    },
  });
}

async function getMS365Config(): Promise<MS365Config | null> {
  const creds = await loadCredentialSettings();
  if (!creds) return null;

  await connectDB();
  const extra = await SystemSetting.find({
    key: {
      $in: [
        'MS365_SHAREPOINT_SITE_ID',
        'MS365_RESUME_FOLDER_PATH',
        'MS365_LOGO_FOLDER_PATH',
        'MS365_JOB_ATTACHMENT_PATH',
      ],
    },
  }).lean();
  const map = new Map(extra.map((s) => [s.key, s.value]));
  const siteId = map.get('MS365_SHAREPOINT_SITE_ID');
  if (!siteId) return null;

  return {
    ...creds,
    siteId,
    resumeFolderPath: map.get('MS365_RESUME_FOLDER_PATH') || '/Resumes',
    logoFolderPath: map.get('MS365_LOGO_FOLDER_PATH') || '/Logos',
    jobAttachmentPath: map.get('MS365_JOB_ATTACHMENT_PATH') || '/JobAttachments',
  };
}

/** True when app credentials and SharePoint site ID are set (resume upload can run). */
export async function isSharePointUploadConfigured(): Promise<boolean> {
  return (await getMS365Config()) != null;
}

export async function uploadToSharePoint(
  folderType: 'resume' | 'logo' | 'jobAttachment',
  fileName: string,
  fileBuffer: Buffer,
): Promise<string> {
  const config = await getMS365Config();
  if (!config) throw new Error('MS365 not configured. Ask an administrator.');

  const client = createGraphClient(config);

  const folderPathMap: Record<string, string> = {
    resume: config.resumeFolderPath,
    logo: config.logoFolderPath,
    jobAttachment: config.jobAttachmentPath,
  };
  const folderPath = folderPathMap[folderType];
  const uploadPath = `${folderPath}/${fileName}`;

  const driveItem = await client
    .api(`/sites/${config.siteId}/drive/root:${uploadPath}:/content`)
    .put(fileBuffer);

  return driveItem.webUrl || uploadPath;
}

export interface GraphMailAttachment {
  name: string;
  contentType: string;
  /** Base64-encoded file content (Microsoft Graph `fileAttachment.contentBytes`). */
  contentBytes: string;
}

export interface SendGraphMailParams {
  /** Primary recipient (inbox that receives the message). */
  to: string;
  replyTo?: string;
  subject: string;
  bodyHtml: string;
  /** Optional file attachments (e.g. PDF resume). */
  attachments?: GraphMailAttachment[];
}

/**
 * Sends email via Microsoft Graph using app-only credentials.
 * Requires Mail.Send **application** permission (admin consent) on the app registration.
 * @param sendAs Ups UPN / smtp address of the mailbox that sends the message
 */
export async function sendMailViaGraph(
  sendAs: string,
  params: SendGraphMailParams,
): Promise<void> {
  const creds = await loadCredentialSettings();
  if (!creds) {
    throw new Error(
      'Microsoft 365 is not configured. Set application (client) ID, directory (tenant) ID, and client secret in Admin Settings.',
    );
  }

  const client = createGraphClient(creds);
  const sender = sendAs.trim();
  if (!sender) {
    throw new Error('Send-as mailbox address is missing.');
  }

  const message = {
    subject: params.subject,
    body: {
      contentType: 'HTML',
      content: params.bodyHtml,
    },
    toRecipients: [{ emailAddress: { address: params.to.trim() } }],
    ...(params.replyTo?.trim()
      ? {
          replyTo: [
            { emailAddress: { address: params.replyTo.trim() } },
          ],
        }
      : {}),
    ...(params.attachments?.length
      ? {
          attachments: params.attachments.map((a) => ({
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: a.name,
            contentType: a.contentType,
            contentBytes: a.contentBytes,
          })),
        }
      : {}),
  };

  await client.api(`/users/${encodeURIComponent(sender)}/sendMail`).post({
    message,
    saveToSentItems: true,
  });
}
