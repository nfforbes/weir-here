import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAdministrator } from '@/lib/adminAuth';
import Testimonial from '@/models/Testimonial';

const MAX_LEN = { quote: 8000, name: 200, title: 300, context: 300, avatar: 2000 };

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const gate = await requireAdministrator();
    if (!gate.ok) {
      return NextResponse.json({ error: gate.status === 401 ? 'Not authenticated' : 'Forbidden' }, { status: gate.status });
    }

    const { id } = await ctx.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const target = await Testimonial.findById(id);
    if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (typeof body.quote === 'string') {
      const q = body.quote.trim();
      if (!q || q.length > MAX_LEN.quote) return NextResponse.json({ error: 'Invalid quote' }, { status: 400 });
      target.quote = q;
    }
    if (typeof body.authorName === 'string') {
      const n = body.authorName.trim();
      if (!n || n.length > MAX_LEN.name) return NextResponse.json({ error: 'Invalid authorName' }, { status: 400 });
      target.authorName = n;
    }
    if (typeof body.authorTitle === 'string') {
      target.authorTitle = body.authorTitle.trim().slice(0, MAX_LEN.title);
    }
    if (typeof body.context === 'string') {
      target.context = body.context.trim().slice(0, MAX_LEN.context);
    }
    if (typeof body.avatarUrl === 'string') {
      target.avatarUrl = body.avatarUrl.trim().slice(0, MAX_LEN.avatar);
    }
    if (typeof body.published === 'boolean') {
      target.published = body.published;
    }
    if (typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder)) {
      target.sortOrder = body.sortOrder;
    }

    await target.save();
    return NextResponse.json({
      testimonial: {
        id: String(target._id),
        quote: target.quote,
        authorName: target.authorName,
        authorTitle: target.authorTitle,
        context: target.context,
        avatarUrl: target.avatarUrl,
        published: target.published,
        sortOrder: target.sortOrder,
        createdAt: target.createdAt,
        updatedAt: target.updatedAt,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const gate = await requireAdministrator();
    if (!gate.ok) {
      return NextResponse.json({ error: gate.status === 401 ? 'Not authenticated' : 'Forbidden' }, { status: gate.status });
    }

    const { id } = await ctx.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const deleted = await Testimonial.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
