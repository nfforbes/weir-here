import nodemailer from 'nodemailer';
import { connectDB } from './mongodb';
import SystemSetting from '@/models/SystemSetting';

export async function getTransporter() {
    await connectDB();

    const settings = await SystemSetting.find({
        key: { $regex: /^SMTP_/ }
    }).lean();

    const config = settings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {} as Record<string, string>);

    if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASS) {
        throw new Error('SMTP configuration is incomplete');
    }

    const transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: parseInt(config.SMTP_PORT || '587'),
        secure: config.SMTP_SECURE === 'true',
        auth: {
            user: config.SMTP_USER,
            pass: config.SMTP_PASS,
        },
        tls: {
            ciphers: config.SMTP_CIPHERS || undefined,
            rejectUnauthorized: false, // Often needed for custom SMTP ports/ciphers
        }
    });

    return { transporter, from: config.SMTP_FROM || config.SMTP_USER };
}
