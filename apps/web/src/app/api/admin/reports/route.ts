import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import { requireAdministrator } from '@/lib/adminAuth';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  const auth = await requireAdministrator();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month'); // e.g. "2025-01"
  const providerId = searchParams.get('providerId'); // optional
  const format = searchParams.get('format'); // 'json' | 'excel'

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: 'month is required in YYYY-MM format' }, { status: 400 });
  }

  const [year, mon] = month.split('-').map(Number);
  const startDate = new Date(year, mon - 1, 1);
  const endDate = new Date(year, mon, 1);

  const filter: Record<string, unknown> = {
    serviceDate: { $gte: startDate, $lt: endDate },
  };
  if (providerId) filter.providerId = providerId;

  await connectDB();
  const assignments = await Assignment.find(filter)
    .populate('clientId', 'name address')
    .populate('providerId', 'name')
    .sort({ 'clientId.name': 1, serviceDate: 1 })
    .lean();

  // Aggregate per client
  type Row = {
    client: string;
    address: string;
    provider: string;
    description: string;
    serviceDate: string;
    chargeAmount: number;
    providerPay: number;
    invoiced: boolean;
  };

  const rows: Row[] = assignments.map((a) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = a.clientId as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const provider = a.providerId as any;
    return {
      client: client?.name ?? 'Unknown',
      address: client?.address ?? '',
      provider: provider?.name ?? 'Unknown',
      description: a.description,
      serviceDate: new Date(a.serviceDate).toLocaleDateString('en-US'),
      chargeAmount: a.clientChargeCents / 100,
      providerPay: a.providerPayCents / 100,
      invoiced: a.invoiced,
    };
  });

  if (format === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`Report ${month}`);

    sheet.columns = [
      { header: 'Client', key: 'client', width: 25 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'Provider', key: 'provider', width: 25 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Service Date', key: 'serviceDate', width: 15 },
      { header: 'Charge to Client ($)', key: 'chargeAmount', width: 22 },
      { header: 'Pay to Provider ($)', key: 'providerPay', width: 22 },
      { header: 'Invoiced', key: 'invoiced', width: 10 },
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } };

    rows.forEach((r) => sheet.addRow(r));

    // Totals row
    const totalRow = sheet.addRow({
      client: 'TOTAL',
      address: '',
      provider: '',
      description: '',
      serviceDate: '',
      chargeAmount: rows.reduce((s, r) => s + r.chargeAmount, 0),
      providerPay: rows.reduce((s, r) => s + r.providerPay, 0),
      invoiced: '',
    });
    totalRow.font = { bold: true };
    totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="report-${month}.xlsx"`,
      },
    });
  }

  return NextResponse.json({ month, rows, total: rows.reduce((s, r) => s + r.chargeAmount, 0) });
}
