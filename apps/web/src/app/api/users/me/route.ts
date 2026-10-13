import { NextResponse, type NextRequest } from 'next/server';
import { getApiAuthUser } from '@/lib/apiAuth';
import { countAdministrators } from '@/lib/adminAuth';
import { connectDB } from '@/lib/mongodb';
import Application from '@/models/Application';
import Assignment from '@/models/Assignment';
import Client from '@/models/Client';
import Invite from '@/models/Invite';
import Job from '@/models/Job';
import PlatformInvite from '@/models/PlatformInvite';
import Provider from '@/models/Provider';
import Qualification from '@/models/Qualification';
import Review from '@/models/Review';
import User from '@/models/User';

const AUTH0_TENANT_DOMAIN = 'weirherestaffing.us.auth0.com';

async function managementToken(): Promise<string> {
  const clientId = process.env.AUTH0_MGMT_CLIENT_ID?.trim();
  const clientSecret = process.env.AUTH0_MGMT_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error('Account deletion is not configured.');
  }
  const res = await fetch(`https://${AUTH0_TENANT_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${AUTH0_TENANT_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    }),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Could not delete the sign-in account.');
  }
  const body = (await res.json()) as { access_token?: string };
  if (!body.access_token) {
    throw new Error('Could not delete the sign-in account.');
  }
  return body.access_token;
}

async function deleteAuth0User(userId: string): Promise<void> {
  const token = await managementToken();
  const res = await fetch(
    `https://${AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    },
  );
  if (res.status === 404 || res.ok) return;
  throw new Error('Could not delete the sign-in account.');
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getApiAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ auth0Id: authUser.sub });
    if (user?.personas.includes('administrator')) {
      const adminCount = await countAdministrators();
      if (adminCount <= 1) {
        return NextResponse.json(
          {
            error:
              'Add another administrator before deleting the only administrator account.',
          },
          { status: 400 },
        );
      }
    }

    await deleteAuth0User(authUser.sub);

    const email = (user?.email || authUser.email || '').trim().toLowerCase();
    const auth0Id = authUser.sub;

    const ownApplications = await Application.find({
      $or: [{ applicantId: auth0Id }, ...(email ? [{ applicantEmail: email }] : [])],
    }).select('_id');
    const ownApplicationIds = ownApplications.map((application) => application._id);
    if (ownApplicationIds.length > 0) {
      await Review.deleteMany({ applicationId: { $in: ownApplicationIds } });
      await Application.deleteMany({ _id: { $in: ownApplicationIds } });
    }
    await Review.deleteMany({ reviewerId: auth0Id });

    const postedJobs = await Job.find({ postedBy: auth0Id }).select('_id');
    const postedJobIds = postedJobs.map((job) => job._id);
    if (postedJobIds.length > 0) {
      const jobApplications = await Application.find({ jobId: { $in: postedJobIds } }).select('_id');
      const jobApplicationIds = jobApplications.map((application) => application._id);
      if (jobApplicationIds.length > 0) {
        await Review.deleteMany({ applicationId: { $in: jobApplicationIds } });
        await Application.deleteMany({ _id: { $in: jobApplicationIds } });
      }
      await Invite.deleteMany({ jobId: { $in: postedJobIds } });
      await Job.deleteMany({ _id: { $in: postedJobIds } });
    }

    if (email) {
      const provider = await Provider.findOne({ email });
      if (provider) {
        await Qualification.deleteMany({ providerId: provider._id });
        await Assignment.deleteMany({ providerId: provider._id });
        await Provider.deleteOne({ _id: provider._id });
      }
      const clients = await Client.find({ email }).select('_id');
      const clientIds = clients.map((client) => client._id);
      if (clientIds.length > 0) {
        await Assignment.deleteMany({ clientId: { $in: clientIds } });
        await Client.deleteMany({ _id: { $in: clientIds } });
      }
      await Invite.deleteMany({ email });
      await PlatformInvite.deleteMany({ email });
    }

    if (user) {
      await User.deleteOne({ _id: user._id });
    }

    return NextResponse.json({ ok: true, message: 'Account deleted' });
  } catch (err: unknown) {
    console.error('[delete account]', err);
    const message = err instanceof Error ? err.message : 'Could not delete account';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
