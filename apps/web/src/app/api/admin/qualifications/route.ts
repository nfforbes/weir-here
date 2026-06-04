import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Qualification from '@/models/Qualification';
import { uploadFileToDrive } from '@/lib/googleDrive';
import { requireAdministrator } from '@/lib/adminAuth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const auth = await requireAdministrator();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const clientId = formData.get('clientId') as string | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!clientId) return NextResponse.json({ error: 'clientId is required' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    const { fileId, webViewLink } = await uploadFileToDrive(buffer, file.name, file.type || 'application/octet-stream');

    await connectDB();
    const qual = await Qualification.create({
      clientId,
      fileName: file.name,
      driveFileId: fileId,
      driveWebViewLink: webViewLink,
    });

    return NextResponse.json(qual, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdministrator();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  await connectDB();
  await Qualification.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
