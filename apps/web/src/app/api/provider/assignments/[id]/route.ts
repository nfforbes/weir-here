import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import Provider from '@/models/Provider';
import User from '@/models/User';
import { getApiAuthUser } from '@/lib/apiAuth';
import { auth0 } from '@/lib/auth0';
import mongoose from 'mongoose';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    let email: string | undefined;

    // Try cookie session first
    const session = await auth0.getSession();
    if (session?.user?.email) {
      email = session.user.email;
    } else {
      // Try Bearer token
      const apiUser = await getApiAuthUser(req);
      if (apiUser?.email) {
        email = apiUser.email;
      }
    }

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email });
    if (!user || (!user.personas.includes('provider') && !user.personas.includes('administrator'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const provider = await Provider.findOne({ email });
    if (!provider) {
      return NextResponse.json({ error: 'Provider record not found' }, { status: 404 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid assignment ID' }, { status: 400 });
    }

    const assignment = await Assignment.findOne({ _id: id, providerId: provider._id });
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found or you do not have permission to modify it' }, { status: 404 });
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
    return NextResponse.json(assignment);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
