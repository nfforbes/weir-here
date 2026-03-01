import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { uploadToSharePoint } from '@/lib/ms365';

export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const validTypes = ['resume', 'logo', 'jobAttachment'] as const;
    if (!type || !validTypes.includes(type as (typeof validTypes)[number])) {
      return NextResponse.json({ error: `type must be one of: ${validTypes.join(', ')}` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToSharePoint(type as 'resume' | 'logo' | 'jobAttachment', file.name, buffer);
    return NextResponse.json({ url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
