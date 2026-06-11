import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Qualification from '@/models/Qualification';
import { uploadToSharePoint } from '@/lib/ms365';
import { requireAdministrator } from '@/lib/adminAuth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const auth = await requireAdministrator();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const providerId = formData.get('providerId') as string | null;
    const description = formData.get('description') as string | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!providerId) return NextResponse.json({ error: 'providerId is required' }, { status: 400 });

    const allowedExtensions = ['.pdf', '.txt', '.doc', '.docx'];
    const fileNameLower = file.name.toLowerCase();
    const hasAllowedExtension = allowedExtensions.some(ext => fileNameLower.endsWith(ext));
    if (!hasAllowedExtension) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF, TXT, and DOC/DOCX files are allowed.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Use SharePoint jobAttachment folder for qualifications
    const webViewLink = await uploadToSharePoint('jobAttachment', file.name, buffer);

    await connectDB();
    const qual = await Qualification.create({
      providerId,
      fileName: file.name,
      description: description?.trim(),
      driveFileId: 'sharepoint-attachment', // Dummy value since we're no longer using Google Drive IDs
      driveWebViewLink: webViewLink,
    });

    return NextResponse.json(qual, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdministrator();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const body = await req.json();
  const { id, description } = body;
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  await connectDB();
  const qual = await Qualification.findByIdAndUpdate(
    id,
    { description: description?.trim() },
    { new: true }
  );
  if (!qual) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(qual);
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
