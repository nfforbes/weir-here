import { NextRequest, NextResponse } from 'next/server';
import Assignment from '@/models/Assignment';
import '@/models/Client';
import '@/models/Provider';
import { resolveProviderForRequest } from '@/lib/providerAuth';
import mongoose from 'mongoose';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await resolveProviderForRequest(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid assignment ID' }, { status: 400 });
    }

    const assignment = await Assignment.findOne({ _id: id, providerId: auth.provider._id });
    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found or you do not have permission to modify it' },
        { status: 404 },
      );
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'arrive') {
      if (assignment.status !== 'assigned') {
        return NextResponse.json({ error: 'Can only mark as arrived when status is assigned' }, { status: 400 });
      }
      assignment.status = 'arrived';
      assignment.arrivedAt = new Date();
    } else if (action === 'checkout') {
      if (assignment.status !== 'arrived') {
        return NextResponse.json({ error: 'Can only check out when status is arrived' }, { status: 400 });
      }
      assignment.status = 'completed';
      assignment.checkedOutAt = new Date();
    } else {
      return NextResponse.json({ error: 'Invalid action. Must be "arrive" or "checkout"' }, { status: 400 });
    }

    await assignment.save();

    const updated = await Assignment.findById(assignment._id)
      .populate('clientId', 'name address')
      .populate('providerId', 'name')
      .lean();

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
