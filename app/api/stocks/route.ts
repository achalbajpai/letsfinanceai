import { NextResponse } from 'next/server';

const API_KEY = process.env.MARKETSTACK_API_KEY;
const BASE_URL = 'http://api.marketstack.com/v1';

if (!API_KEY) {
  throw new Error('MARKETSTACK_API_KEY environment variable is not set');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  
  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    // Fetch end-of-day data
    const response = await fetch(
      `${BASE_URL}/eod?access_key=${API_KEY}&symbols=${symbol}&limit=30`
    );
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}

// Fetch stock symbols
export async function POST() {
  try {
    const response = await fetch(
      `${BASE_URL}/tickers?access_key=${API_KEY}&limit=100`
    );
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching stock symbols:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock symbols' },
      { status: 500 }
    );
  }
} 