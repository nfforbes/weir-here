import { NextRequest, NextResponse } from 'next/server';
import { requireAdministrator } from '@/lib/adminAuth';
import PlatformInvite from '@/models/PlatformInvite';
import User from '@/models/User';
import SystemSetting from '@/models/SystemSetting';
import { sendMailViaGraph } from '@/lib/ms365';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const gate = await requireAdministrator(request);
    if (!gate.ok) {
      return NextResponse.json(
        { error: gate.status === 401 ? 'Not authenticated' : 'Forbidden' },
        { status: gate.status }
      );
    }

    const body = await request.json();
    const { email, roles } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const targetEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: targetEmail });
    if (existingUser) {
      return NextResponse.json({ error: 'User is already registered' }, { status: 400 });
    }

    // Check if we have MS365 email configured
    const senderSetting = await SystemSetting.findOne({ key: 'MS365_MAIL_FROM' });
    const sender = senderSetting?.value;

    if (!sender) {
      return NextResponse.json(
        { error: 'Microsoft 365 email integration is not configured. Please configure it in Admin Settings.' },
        { status: 500 }
      );
    }

    const validRoles = Array.isArray(roles) ? roles : ['user'];
    const sanitizedRoles = validRoles.filter(r => ['user', 'administrator', 'provider'].includes(r));
    if (sanitizedRoles.length === 0) {
      sanitizedRoles.push('user');
    }

    // Check if invite already exists
    let invite = await PlatformInvite.findOne({ email: targetEmail });
    if (invite) {
      invite.token = uuidv4();
      invite.invitedBy = gate.admin.email || gate.admin.auth0Id || 'admin';
      invite.roles = sanitizedRoles;
      await invite.save();
    } else {
      invite = await PlatformInvite.create({
        email: targetEmail,
        invitedBy: gate.admin.email || gate.admin.auth0Id || 'admin',
        token: uuidv4(),
        roles: validRoles,
      });
    }

    const appUrl = process.env.APP_BASE_URL || 'https://localhost:3000';
    const loginLink = `${appUrl}/auth/login?returnTo=/dashboard`;

    const htmlBody = `
      <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
        <h2 style="color: #1976d2;">You're Invited!</h2>
        <p>Hello,</p>
        <p>You have been invited to join the platform.</p>
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

    return NextResponse.json({ message: 'Invite sent successfully', invite });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

