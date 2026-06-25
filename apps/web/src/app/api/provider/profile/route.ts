import { NextRequest, NextResponse } from 'next/server';
import { resolveProviderForRequest } from '@/lib/providerAuth';
import Provider, { buildProviderAddressPayload } from '@/models/Provider';
import { hydrateProviderAddressDetails } from '@weir-here/shared';

function serializeProviderProfile(provider: {
  _id: unknown;
  name: string;
  email: string;
  address: string;
  addressDetails?: Parameters<typeof hydrateProviderAddressDetails>[0];
  preferredParishes?: string[];
  phoneNumbers?: { number: string; isBest: boolean }[];
}) {
  const addressDetails = hydrateProviderAddressDetails(provider.addressDetails, provider.address);
  return {
    _id: provider._id,
    name: provider.name,
    email: provider.email,
    address: provider.address,
    addressDetails,
    preferredParishes: provider.preferredParishes ?? [],
    phoneNumbers: provider.phoneNumbers ?? [],
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await resolveProviderForRequest(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    return NextResponse.json(serializeProviderProfile(auth.provider));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await resolveProviderForRequest(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { name, address, addressDetails, preferredParishes, phoneNumbers } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (phoneNumbers !== undefined) updateData.phoneNumbers = phoneNumbers;
    if (address !== undefined || addressDetails !== undefined || preferredParishes !== undefined) {
      const addressPayload = buildProviderAddressPayload({
        address: address ?? auth.provider.address,
        addressDetails: addressDetails ?? auth.provider.addressDetails,
        preferredParishes: preferredParishes ?? auth.provider.preferredParishes,
      });
      Object.assign(updateData, addressPayload);
    }

    const provider = await Provider.findByIdAndUpdate(auth.provider._id, updateData, { new: true });
    if (!provider) {
      return NextResponse.json({ error: 'Provider record not found' }, { status: 404 });
    }

    return NextResponse.json(serializeProviderProfile(provider));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
