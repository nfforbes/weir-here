import { NextRequest, NextResponse } from 'next/server';
import Assignment from '@/models/Assignment';
import '@/models/Client';
import '@/models/Provider';
import { resolveProviderForRequest } from '@/lib/providerAuth';

export async function GET(req: NextRequest) {
  try {
    const auth = await resolveProviderForRequest(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const assignments = await Assignment.find({ providerId: auth.provider._id })
      .populate('clientId', 'name address')
      .populate('providerId', 'name')
      .sort({ serviceDate: 1 })
      .lean();

    return NextResponse.json(assignments);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
