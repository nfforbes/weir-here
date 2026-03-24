import { NextRequest, NextResponse } from 'next/server';
import { getTransporter } from '@/lib/nodemailer';

export async function POST(request: NextRequest) {
    try {
        const { name, email, phone, message, solutionName } = await request.json();

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 });
        }

        const { transporter, from } = await getTransporter();

        const mailOptions = {
            from,
            to: from, // Send to yourself (the site administrator)
            replyTo: email,
            subject: `Consultation Request: ${solutionName || 'General Inquiry'}`,
            text: `
Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}
Solution: ${solutionName || 'General Inquiry'}

Message:
${message}
      `,
            html: `
        <h2>Consultation Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Solution:</strong> ${solutionName || 'General Inquiry'}</p>
        <br/>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'Consultation request sent successfully' });
    } catch (err: unknown) {
        console.error('SMTP Error:', err);
        const message = err instanceof Error ? err.message : 'Failed to send consultation request';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
