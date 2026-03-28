import { NextRequest, NextResponse } from 'next/server';
import { requireAdministrator } from '@/lib/adminAuth';
import Testimonial from '@/models/Testimonial';

const MAX_LEN = { quote: 8000, name: 200, title: 300, context: 300, avatar: 2000 };

function trimBody(input: {
  quote?: unknown;
  authorName?: unknown;
  authorTitle?: unknown;
  context?: unknown;
  avatarUrl?: unknown;
  published?: unknown;
  sortOrder?: unknown;
}): Record<string, unknown> | { error: string } {
  const quote = typeof input.quote === 'string' ? input.quote.trim() : '';
  const authorName = typeof input.authorName === 'string' ? input.authorName.trim() : '';
  if (!quote || !authorName) {
    return { error: 'quote and authorName are required' };
  }
  if (quote.length > MAX_LEN.quote || authorName.length > MAX_LEN.name) {
    return { error: 'quote or authorName too long' };
  }

  const authorTitle =
    typeof input.authorTitle === 'string' ? input.authorTitle.trim().slice(0, MAX_LEN.title) : '';
  const context =
    typeof input.context === 'string' ? input.context.trim().slice(0, MAX_LEN.context) : '';
  const avatarUrl =
    typeof input.avatarUrl === 'string' ? input.avatarUrl.trim().slice(0, MAX_LEN.avatar) : '';
  const published = typeof input.published === 'boolean' ? input.published : true;
  const sortOrder = typeof input.sortOrder === 'number' && Number.isFinite(input.sortOrder) ? input.sortOrder : 0;

  return { quote, authorName, authorTitle, context, avatarUrl, published, sortOrder };
}

export async function GET() {
  try {
    const gate = await requireAdministrator();
    if (!gate.ok) {
      return NextResponse.json({ error: gate.status === 401 ? 'Not authenticated' : 'Forbidden' }, { status: gate.status });
    }

    const docs = await Testimonial.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
    const testimonials = docs.map((d) => ({
      id: String(d._id),
      quote: d.quote,
      authorName: d.authorName,
      authorTitle: d.authorTitle,
      context: d.context,
      avatarUrl: d.avatarUrl,
      published: d.published,
      sortOrder: d.sortOrder,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
    return NextResponse.json({ testimonials });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const gate = await requireAdministrator();
    if (!gate.ok) {
      return NextResponse.json({ error: gate.status === 401 ? 'Not authenticated' : 'Forbidden' }, { status: gate.status });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const parsed = trimBody(body);
    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const doc = await Testimonial.create({
      quote: parsed.quote as string,
      authorName: parsed.authorName as string,
      authorTitle: parsed.authorTitle as string,
      context: parsed.context as string,
      avatarUrl: parsed.avatarUrl as string,
      published: parsed.published as boolean,
      sortOrder: parsed.sortOrder as number,
    });
    return NextResponse.json({
      testimonial: {
        id: String(doc._id),
        quote: doc.quote,
        authorName: doc.authorName,
        authorTitle: doc.authorTitle,
        context: doc.context,
        avatarUrl: doc.avatarUrl,
        published: doc.published,
        sortOrder: doc.sortOrder,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
