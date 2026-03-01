import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { connectDB } from './mongodb';
import SystemSetting from '@/models/SystemSetting';

interface MS365Config {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  siteId: string;
  resumeFolderPath: string;
  logoFolderPath: string;
  jobAttachmentPath: string;
}

async function getMS365Config(): Promise<MS365Config | null> {
  await connectDB();
  const settings = await SystemSetting.find({
    key: {
      $in: [
        'MS365_CLIENT_ID',
        'MS365_CLIENT_SECRET',
        'MS365_TENANT_ID',
        'MS365_SHAREPOINT_SITE_ID',
        'MS365_RESUME_FOLDER_PATH',
        'MS365_LOGO_FOLDER_PATH',
        'MS365_JOB_ATTACHMENT_PATH',
      ],
    },
  });

  const map = new Map(settings.map((s) => [s.key, s.value]));

  const clientId = map.get('MS365_CLIENT_ID');
  const clientSecret = map.get('MS365_CLIENT_SECRET');
  const tenantId = map.get('MS365_TENANT_ID');
  const siteId = map.get('MS365_SHAREPOINT_SITE_ID');

  if (!clientId || !clientSecret || !tenantId || !siteId) return null;

  return {
    clientId,
    clientSecret,
    tenantId,
    siteId,
    resumeFolderPath: map.get('MS365_RESUME_FOLDER_PATH') || '/Resumes',
    logoFolderPath: map.get('MS365_LOGO_FOLDER_PATH') || '/Logos',
    jobAttachmentPath: map.get('MS365_JOB_ATTACHMENT_PATH') || '/JobAttachments',
  };
}

function getGraphClient(config: MS365Config): Client {
  const credential = new ClientSecretCredential(
    config.tenantId,
    config.clientId,
    config.clientSecret
  );

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const token = await credential.getToken(
          'https://graph.microsoft.com/.default'
        );
        return token.token;
      },
    },
  });
}

export async function uploadToSharePoint(
  folderType: 'resume' | 'logo' | 'jobAttachment',
  fileName: string,
  fileBuffer: Buffer
): Promise<string> {
  const config = await getMS365Config();
  if (!config) throw new Error('MS365 not configured. Ask an administrator.');

  const client = getGraphClient(config);

  const folderPathMap: Record<string, string> = {
    resume: config.resumeFolderPath,
    logo: config.logoFolderPath,
    jobAttachment: config.jobAttachmentPath,
  };
  const folderPath = folderPathMap[folderType];
  const uploadPath = `${folderPath}/${fileName}`;

  const driveItem = await client
    .api(
      `/sites/${config.siteId}/drive/root:${uploadPath}:/content`
    )
    .put(fileBuffer);

  return driveItem.webUrl || uploadPath;
}
