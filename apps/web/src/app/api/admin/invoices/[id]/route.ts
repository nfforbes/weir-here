import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import { requireAdministrator } from '@/lib/adminAuth';
import { generateInvoicePdf } from '@/lib/invoicePdf';

// Lean populated assignment shape
interface PopulatedAssignment {
  _id: unknown;
  clientId: { _id: unknown; name: string; address: string } | null;
  providerId: { _id: unknown; name: string } | null;
  clientChargeCents: number;
  providerPayCents: number;
  description: string;
  serviceDate: Date;
  invoiced: boolean;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdministrator();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format'); // 'pdf' or 'json' (default)

  await connectDB();
  const assignment = (await Assignment.findById(id)
    .populate('clientId', 'name address')
    .populate('providerId', 'name')
    .lean()) as PopulatedAssignment | null;

  if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

  const client = assignment.clientId;
  const provider = assignment.providerId;

  if (format === 'pdf') {
    const pdfBuffer = await generateInvoicePdf({
      invoiceNumber: `INV-${String(id).slice(-6).toUpperCase()}`,
      issueDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      clientName: client?.name ?? 'Unknown Client',
      clientAddress: client?.address ?? '',
      providerName: provider?.name ?? 'Unknown Provider',
      description: assignment.description || 'Care services rendered',
      serviceDate: new Date(assignment.serviceDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      amountDollars: assignment.clientChargeCents / 100,
      companyName: 'Weir Here',
    });

    // Mark as invoiced
    await Assignment.findByIdAndUpdate(id, { invoiced: true });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${String(id).slice(-6)}.pdf"`,
      },
    });
  }

  return NextResponse.json({
    ...assignment,
    invoiceNumber: `INV-${String(id).slice(-6).toUpperCase()}`,
  });
}
