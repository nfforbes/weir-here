import { ConfidentialClientApplication } from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import { connectDB } from './mongodb';
import { getMS365Settings } from '@/models/Settings';

async function getGraphClient(): Promise<Client> {
  await connectDB();
  const config = await getMS365Settings();

  const clientId = config.MS365_CLIENT_ID;
  const clientSecret = config.MS365_CLIENT_SECRET;
  const tenantId = config.MS365_TENANT_ID;

  if (!clientId || !clientSecret || !tenantId) {
    throw new Error('MS365 credentials not configured. Ask an administrator to set them up.');
  }

  const cca = new ConfidentialClientApplication({
    auth: {
      clientId,
      clientSecret,
      authority: `https://login.microsoftonline.com/${tenantId}`,
    },
  });

  const tokenResponse = await cca.acquireTokenByClientCredential({
    scopes: ['https://graph.microsoft.com/.default'],
  });

  if (!tokenResponse?.accessToken) {
    throw new Error('Failed to acquire MS365 access token');
  }

  return Client.init({
    authProvider: (done) => {
      done(null, tokenResponse.accessToken);
    },
  });
}

export type UploadTarget = 'resume' | 'logo' | 'jobAttachment';

const folderKeyMap: Record<UploadTarget, string> = {
  resume: 'MS365_RESUME_FOLDER_PATH',
  logo: 'MS365_LOGO_FOLDER_PATH',
  jobAttachment: 'MS365_JOB_ATTACHMENT_PATH',
};

export async function uploadToSharePoint(
  target: UploadTarget,
  fileName: string,
  fileBuffer: Buffer
): Promise<string> {
  await connectDB();
  const config = await getMS365Settings();
  const siteId = config.MS365_SHAREPOINT_SITE_ID;
  const folderPath = config[folderKeyMap[target]];

  if (!siteId || !folderPath) {
    throw new Error(`SharePoint configuration incomplete for ${target} uploads.`);
  }

  const client = await getGraphClient();

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueName = `${Date.now()}_${safeName}`;

  const uploadUrl = `/sites/${siteId}/drive/root:/${folderPath}/${uniqueName}:/content`;

  const result = await client
    .api(uploadUrl)
    .headers({ 'Content-Type': 'application/octet-stream' })
    .put(fileBuffer);

  return result.webUrl || result['@microsoft.graph.downloadUrl'] || uniqueName;
}
