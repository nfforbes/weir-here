import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import type { Persona } from '@weir-here/shared';
import User from '@/models/User';
import { requireAdministrator, countAdministrators } from '@/lib/adminAuth';

const VALID_PERSONAS: Persona[] = ['administrator', 'user'];

function normalizePersonas(raw: unknown): Persona[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const next = [...new Set(raw.map((p) => String(p)))] as Persona[];
  if (!next.every((p) => VALID_PERSONAS.includes(p))) return null;
  return next;
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const gate = await requireAdministrator(request);
    if (!gate.ok) {
      return NextResponse.json({ error: gate.status === 401 ? 'Not authenticated' : 'Forbidden' }, { status: gate.status });
    }

    const { id } = await ctx.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }

    const body = (await request.json()) as { personas?: unknown };
    const personas = normalizePersonas(body.personas);
    if (!personas) {
      return NextResponse.json(
        { error: 'personas must be a non-empty array of "user" and/or "administrator"' },
        { status: 400 },
      );
    }

    const target = await User.findById(id);
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const wasAdmin = target.personas.includes('administrator');
    const willBeAdmin = personas.includes('administrator');

    if (wasAdmin && !willBeAdmin) {
      const adminCount = await countAdministrators();
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last administrator. Promote another user first.' },
          { status: 400 },
        );
      }
    }

    target.personas = personas;
    await target.save();

    return NextResponse.json({
      user: {
        id: String(target._id),
        auth0Id: target.auth0Id,
        email: target.email,
        name: target.name,
        personas: target.personas,
        emailVerified: target.emailVerified,
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
    const gate = await requireAdministrator(_request);
    if (!gate.ok) {
      return NextResponse.json({ error: gate.status === 401 ? 'Not authenticated' : 'Forbidden' }, { status: gate.status });
    }

    const { id } = await ctx.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }

    const target = await User.findById(id);
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (target.auth0Id === gate.session.user.sub) {
      return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
    }

    if (target.personas.includes('administrator')) {
      const adminCount = await countAdministrators();
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last administrator.' },
          { status: 400 },
        );
      }
    }

    await User.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
