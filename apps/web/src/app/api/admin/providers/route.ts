import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Provider from '@/models/Provider';
import Qualification from '@/models/Qualification';
import { requireAdministrator } from '@/lib/adminAuth';
import User from '@/models/User';
import PlatformInvite from '@/models/PlatformInvite';
import SystemSetting from '@/models/SystemSetting';
import { sendMailViaGraph } from '@/lib/ms365';
import { v4 as uuidv4 } from 'uuid';

async function assignProviderAccessAndNotify(email: string, authUser: any) {
  try {
    const targetEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: targetEmail });

    let isExistingUserUpdated = false;

    if (!user) {
      let invite = await PlatformInvite.findOne({ email: targetEmail });
      if (invite) {
        invite.token = uuidv4();
        invite.invitedBy = authUser?.email || authUser?.sub || 'admin';
        if (!invite.roles) invite.roles = ['user'];
        if (!invite.roles.includes('provider')) invite.roles.push('provider');
        await invite.save();
      } else {
        invite = await PlatformInvite.create({
          email: targetEmail,
          invitedBy: authUser?.email || authUser?.sub || 'admin',
          token: uuidv4(),
          roles: ['user', 'provider'],
        });
      }
    } else {
      if (!user.personas.includes('provider')) {
        user.personas.push('provider');
        await user.save();
        isExistingUserUpdated = true;
      }
    }

    const senderSetting = await SystemSetting.findOne({ key: 'MS365_MAIL_FROM' });
    const sender = senderSetting?.value;

    if (sender) {
      const appUrl = process.env.APP_BASE_URL || 'https://localhost:3000';
      if (!user) {
        const loginLink = `${appUrl}/auth/login?returnTo=/dashboard`;
        const htmlBody = `
          <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
            <h2 style="color: #1976d2;">You're Invited!</h2>
            <p>Hello,</p>
            <p>You have been added as a Provider on the platform, and are invited to join.</p>
            <p>Please click the link below to sign up and get started:</p>
            <p style="margin: 20px 0;">
              <a href="${loginLink}" style="background-color: #1976d2; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Join Platform
              </a>
            </p>
            <p>If you have any questions, feel free to reply to this email.</p>
            <p>Best regards,<br/>The Team</p>
          </div>
        `;
        await sendMailViaGraph(sender, {
          recipients: [targetEmail],
          subject: 'You have been invited to join the platform',
          bodyHtml: htmlBody,
        });
      } else if (isExistingUserUpdated) {
        const link = `${appUrl}/dashboard`;
        const htmlBody = `
          <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
            <h2 style="color: #1976d2;">Provider Access Granted</h2>
            <p>Hello ${user.name},</p>
            <p>You have been added as a Provider on the platform.</p>
            <p>You can view your assignments and details by logging into your dashboard:</p>
            <p style="margin: 20px 0;">
              <a href="${link}" style="background-color: #1976d2; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Go to Dashboard
              </a>
            </p>
            <p>If you have any questions, feel free to reply to this email.</p>
            <p>Best regards,<br/>The Team</p>
          </div>
        `;
        await sendMailViaGraph(sender, {
          recipients: [targetEmail],
          subject: 'You have been added as a Provider',
          bodyHtml: htmlBody,
        });
      }
    }
  } catch (err) {
    console.error('Failed to assign provider roles or send email:', err);
  }
}


export async function GET() {
  const auth = await requireAdministrator();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  await connectDB();
  const providers = await Provider.find({}).sort({ name: 1 }).lean();

  // Attach qualifications
  const qualifications = await Qualification.find({
    providerId: { $in: providers.map((p) => p._id) },
  }).lean();

  const providersWithQuals = providers.map((p) => ({
    ...p,
    qualifications: qualifications.filter(
      (q) => q.providerId.toString() === String(p._id)
    ),
  }));

  return NextResponse.json(providersWithQuals);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdministrator();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const body = await req.json();
  const { name, address, email } = body;
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  await connectDB();
  
  if (!email?.trim()) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const existing = await Provider.findOne({ email: email.trim().toLowerCase() });
  if (existing) {
    return NextResponse.json({ error: 'Email is already in use by another provider' }, { status: 400 });
  }

  const provider = await Provider.create({ 
    name: name.trim(), 
    address: address?.trim(),
    email: email.trim().toLowerCase(),
  });

  await assignProviderAccessAndNotify(email, auth.admin);

  return NextResponse.json(provider, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdministrator();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const body = await req.json();
  const { id, name, address, email } = body;
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  await connectDB();
  
  if (!email?.trim()) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const existing = await Provider.findOne({ email: email.trim().toLowerCase() });
  if (existing && existing._id.toString() !== id) {
    return NextResponse.json({ error: 'Email is already in use by another provider' }, { status: 400 });
  }

  const provider = await Provider.findByIdAndUpdate(
    id,
    { 
      name: name?.trim(), 
      address: address?.trim(),
      email: email.trim().toLowerCase(),
    },
    { new: true }
  );
  
  await assignProviderAccessAndNotify(email, auth.admin);

  if (!provider) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(provider);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdministrator();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  await connectDB();
  await Provider.findByIdAndDelete(id);
  await Qualification.deleteMany({ providerId: id });
  return NextResponse.json({ success: true });
}
