import { NextRequest, NextResponse } from 'next/server';
import { sendMailViaGraph } from '@/lib/ms365';
import { escapeHtml, loadConsultationMailRouting } from '@/lib/mailRouting';

const MAX_NAME_LEN = 200;
const MAX_EMAIL_LEN = 254;
const MAX_PHONE_LEN = 50;
const MAX_MESSAGE_LEN = 5000;
const MAX_SOLUTION_LEN = 200;

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, message, solutionName } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email and message are required' },
        { status: 400 },
      );
    }

    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).trim();
    const trimmedMessage = String(message).trim();
    if (
      trimmedName.length > MAX_NAME_LEN ||
      trimmedEmail.length > MAX_EMAIL_LEN ||
      String(phone ?? '').trim().length > MAX_PHONE_LEN ||
      trimmedMessage.length > MAX_MESSAGE_LEN ||
      String(solutionName ?? '').trim().length > MAX_SOLUTION_LEN
    ) {
      return NextResponse.json({ error: 'Request exceeds allowed field lengths' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const routing = await loadConsultationMailRouting();
    if (!routing) {
      return NextResponse.json(
        {
          error:
            'Email is not configured. An administrator must set Microsoft 365 mail settings (send-as address and app registration).',
        },
        { status: 503 },
      );
    }

    const safeName = escapeHtml(trimmedName);
    const safeEmail = escapeHtml(trimmedEmail);
    const safePhone = escapeHtml(String(phone ?? '').trim());
    const safeSolution = escapeHtml(String(solutionName || 'General Inquiry').trim());
    const safeMessage = escapeHtml(trimmedMessage).replace(/\n/g, '<br/>');

    const subject = `Consultation request: ${solutionName || 'General inquiry'}`;

    const html = `
        <h2>Consultation request</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Phone:</strong> ${safePhone || 'N/A'}</p>
        <p><strong>Solution:</strong> ${safeSolution}</p>
        <br/>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      `;

    await sendMailViaGraph(routing.sendAs, {
      recipients: routing.recipients,
      replyTo: trimmedEmail,
      subject,
      bodyHtml: html,
    });

    return NextResponse.json({ message: 'Consultation request sent successfully' });
  } catch (err: unknown) {
    console.error('Consultation mail (Microsoft Graph):', err);
    const message = err instanceof Error ? err.message : 'Failed to send consultation request';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
