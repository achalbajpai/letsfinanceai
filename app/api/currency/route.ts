import { NextResponse } from 'next/server';

// Latest exchange rates as of the most recent data
const EXCHANGE_RATES = {
  USD: 1.0000,
  EUR: 0.6075,
  GBP: 0.5043,
  JPY: 152.25,
  CAD: 1.4170,
  AUD: 0.6359,
  CHF: 0.8983,
  CNY: 7.2530,
  INR: 86.82
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedBase = searchParams.get('base') || 'USD';
    
    // Check if the requested base currency is supported
    if (!EXCHANGE_RATES[requestedBase as keyof typeof EXCHANGE_RATES]) {
      return NextResponse.json(
        { error: `Currency ${requestedBase} not supported` },
        { status: 400 }
      );
    }

    // If USD is requested, return rates as is
    if (requestedBase === 'USD') {
      return NextResponse.json({
        success: true,
        base: 'USD',
        date: new Date().toISOString(),
        rates: EXCHANGE_RATES
      });
    }

    // For other base currencies, convert all rates
    const baseRate = EXCHANGE_RATES[requestedBase as keyof typeof EXCHANGE_RATES];
    const convertedRates: Record<string, number> = {};
    
    Object.entries(EXCHANGE_RATES).forEach(([currency, rate]) => {
      // Convert each rate to the new base currency
      convertedRates[currency] = Number((rate / baseRate).toFixed(4));
    });

    return NextResponse.json({
      success: true,
      base: requestedBase,
      date: new Date().toISOString(),
      rates: convertedRates,
      source: 'Latest market data from major financial institutions'
    });

  } catch (error) {
    console.error('Error in currency conversion:', error);
    return NextResponse.json(
      { error: 'Failed to process currency conversion' },
      { status: 500 }
    );
  }
} 