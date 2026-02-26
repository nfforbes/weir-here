import { NextRequest, NextResponse } from 'next/server';
import { getAppUser } from '@/lib/auth';
import { uploadToSharePoint, type UploadTarget } from '@/lib/ms365';

const VALID_TARGETS: UploadTarget[] = ['resume', 'logo', 'jobAttachment'];

export async function POST(req: NextRequest) {
  const user = await getAppUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData: any = await req.formData(); // eslint-disable-line @typescript-eslint/no-explicit-any
  const file = formData.get('file') as File | null;
  const target = formData.get('target') as string | null;

  if (!file || !target || !VALID_TARGETS.includes(target as UploadTarget)) {
    return NextResponse.json({ error: 'file and target (resume|logo|jobAttachment) required' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadToSharePoint(target as UploadTarget, file.name, buffer);

  return NextResponse.json({ url });
}
