import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import Provider from '@/models/Provider';
import User from '@/models/User';
import { getApiAuthUser } from '@/lib/apiAuth';
import { auth0 } from '@/lib/auth0';

export async function GET(req: NextRequest) {
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

  const assignments = await Assignment.find({ providerId: provider._id })
    .populate('clientId', 'name address')
    .sort({ serviceDate: 1 })
    .lean();

  return NextResponse.json(assignments);
}
