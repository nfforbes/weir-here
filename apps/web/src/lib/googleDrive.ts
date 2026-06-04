import { google } from 'googleapis';
import { Readable } from 'stream';
import { connectDB } from '@/lib/mongodb';
import Config from '@/models/Config';

async function getGoogleDriveConfig() {
  await connectDB();
  const [clientId, clientSecret, refreshToken, folderId] = await Promise.all([
    Config.findOne({ key: 'gdrive_client_id' }),
    Config.findOne({ key: 'gdrive_client_secret' }),
    Config.findOne({ key: 'gdrive_refresh_token' }),
    Config.findOne({ key: 'gdrive_folder_id' }),
  ]);

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Google Drive is not configured. Please add credentials in Admin → Configuration.'
    );
  }

  return {
    clientId: clientId.value,
    clientSecret: clientSecret.value,
    refreshToken: refreshToken.value,
    folderId: folderId?.value ?? undefined,
  };
}

export async function uploadFileToDrive(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ fileId: string; webViewLink: string }> {
  const cfg = await getGoogleDriveConfig();

  const auth = new google.auth.OAuth2(cfg.clientId, cfg.clientSecret);
  auth.setCredentials({ refresh_token: cfg.refreshToken });

  const drive = google.drive({ version: 'v3', auth });

  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: cfg.folderId ? [cfg.folderId] : undefined,
    },
    media: {
      mimeType,
      body: readable,
    },
    fields: 'id,webViewLink',
  });

  if (!res.data.id) throw new Error('Google Drive upload returned no file ID');

  // Make the file readable by anyone with the link
  await drive.permissions.create({
    fileId: res.data.id,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  return {
    fileId: res.data.id,
    webViewLink: res.data.webViewLink ?? `https://drive.google.com/file/d/${res.data.id}/view`,
  };
}
