import { parseReceipt } from '@/ai/flows/parse-receipt';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { receiptDataUri } = await request.json();
    const result = await parseReceipt({ receiptDataUri });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not a receipt')) {
      return NextResponse.json(
        { error: 'The uploaded image is not a valid receipt' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
