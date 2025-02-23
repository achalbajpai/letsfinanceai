import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface Expense {
  id: string;
  amount: number;
  category: string;
  currency: string;
  date: string;
  description: string;
}

interface PortfolioStock {
  id: string;
  name: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  totalValue: number;
  current_price?: number;
}

const API_KEY = process.env.NEBIUS_API_KEY;

if (!API_KEY) {
  throw new Error('NEBIUS_API_KEY environment variable is not set');
}

const client = new OpenAI({
  baseURL: 'https://api.studio.nebius.com/v1/',
  apiKey: API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages, userData } = await request.json();
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User data is required' },
        { status: 400 }
      );
    }

    const { expenses, stockPortfolio, stockHistory, cryptoPortfolio } = userData;

    // Create a context with user data
    const context = {
      expenses: expenses || [],
      stockPortfolio: stockPortfolio || [],
      stockHistory: stockHistory || [],
      cryptoPortfolio: cryptoPortfolio || [],
      totalExpenses: expenses ? expenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0) : 0,
      portfolioValue: stockPortfolio ? stockPortfolio.reduce((sum: number, stock: PortfolioStock) => sum + stock.totalValue, 0) : 0,
    };

    const completion = await client.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are a helpful financial advisor chatbot. You have access to the user's financial data:
          
          Expenses: ${JSON.stringify(context.expenses)}
          Stock Portfolio: ${JSON.stringify(context.stockPortfolio)}
          Stock History: ${JSON.stringify(context.stockHistory)}
          Crypto Portfolio: ${JSON.stringify(context.cryptoPortfolio)}
          
          Total Expenses: $${context.totalExpenses.toFixed(2)}
          Portfolio Value: $${context.portfolioValue.toFixed(2)}
          
          When answering questions about the user's finances:
          1. ONLY use this real data provided above
          2. DO NOT make up or imagine any data
          3. If data exists, provide specific calculations and insights
          4. If specific data is not available, clearly state what information you have and what's missing
          5. Use exact numbers from the data when available
          6. For expenses, consider the category, amount, and date
          7. For stocks, consider quantity, purchase price, and current value
          8. Always format currency values with 2 decimal places
          
          Remember: Your role is to provide accurate financial insights based ONLY on the actual data shown above.`,
        },
        ...messages,
      ],
    });

    return NextResponse.json({ response: completion.choices[0].message });
  } catch (error) {
    console.error('Error in chat completion:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 