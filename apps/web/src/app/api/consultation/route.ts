import { NextRequest, NextResponse } from 'next/server';
import { sendMailViaGraph } from '@/lib/ms365';
import { escapeHtml, loadConsultationMailRouting } from '@/lib/mailRouting';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, message, solutionName } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email and message are required' },
        { status: 400 },
      );
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

    const safeName = escapeHtml(String(name));
    const safeEmail = escapeHtml(String(email));
    const safePhone = escapeHtml(String(phone ?? ''));
    const safeSolution = escapeHtml(String(solutionName || 'General Inquiry'));
    const safeMessage = escapeHtml(String(message)).replace(/\n/g, '<br/>');

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
      replyTo: email,
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
