import { NextRequest, NextResponse } from 'next/server';

// FatSecret API credentials (should be in env vars in production)
const FATSECRET_CLIENT_ID = process.env.FATSECRET_CLIENT_ID || '981174d41daa4b679782bc0313668a59';
const FATSECRET_CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET || '9b033e962beb4748a950a35975fe9d7f';

let cachedToken: { token: string; expiry: number } | null = null;

// Get OAuth2 access token from FatSecret
async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiry) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(`${FATSECRET_CLIENT_ID}:${FATSECRET_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch('https://oauth.fatsecret.com/connect/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=basic',
  });

  if (!response.ok) {
    throw new Error('Failed to get FatSecret access token');
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiry: Date.now() + (data.expires_in * 1000) - 60000, // Refresh 1 min early
  };
  
  return cachedToken.token;
}

// Search foods using FatSecret API
async function searchFatSecret(query: string): Promise<FoodResult[]> {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(
      `https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${encodeURIComponent(query)}&format=json&max_results=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('FatSecret API error:', response.status);
      return [];
    }

    const data = await response.json();
    
    if (!data.foods?.food) {
      return [];
    }

    const foods = Array.isArray(data.foods.food) ? data.foods.food : [data.foods.food];
    
    return foods.map((food: FatSecretFood) => {
      // Parse the description string like "Per 100g - Calories: 89kcal | Fat: 0.33g | Carbs: 22.84g | Protein: 1.09g"
      const desc = food.food_description || '';
      const calories = parseFloat(desc.match(/Calories:\s*([\d.]+)/)?.[1] || '0');
      const fat = parseFloat(desc.match(/Fat:\s*([\d.]+)/)?.[1] || '0');
      const carbs = parseFloat(desc.match(/Carbs:\s*([\d.]+)/)?.[1] || '0');
      const protein = parseFloat(desc.match(/Protein:\s*([\d.]+)/)?.[1] || '0');

      return {
        id: `fs_${food.food_id}`,
        name: food.food_name,
        brand: food.brand_name || null,
        calories: Math.round(calories),
        protein: Math.round(protein * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
        fat: Math.round(fat * 10) / 10,
        source: 'fatsecret' as const,
        serving: desc.match(/Per\s+([^-]+)/)?.[1]?.trim() || '100g',
      };
    });
  } catch (error) {
    console.error('FatSecret search error:', error);
    return [];
  }
}

interface FatSecretFood {
  food_id: string;
  food_name: string;
  brand_name?: string;
  food_description?: string;
}

interface FoodResult {
  id: string;
  name: string;
  brand?: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  source: 'nin' | 'fatsecret' | 'local';
  serving?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ foods: [] });
  }

  try {
    // Search FatSecret API
    const fatSecretResults = await searchFatSecret(query);
    
    return NextResponse.json({ 
      foods: fatSecretResults,
      source: 'fatsecret'
    });
  } catch (error) {
    console.error('Food search error:', error);
    return NextResponse.json({ foods: [], error: 'Search failed' }, { status: 500 });
  }
}
