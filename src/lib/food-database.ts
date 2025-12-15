// Common Indian foods database with nutritional information
// All values are per serving

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  category: 'dairy' | 'protein' | 'grains' | 'vegetables' | 'fruits' | 'snacks' | 'beverages' | 'sweets';
  servingSize?: string;
}

export const FOOD_DATABASE: FoodItem[] = [
  // Dairy Products
  { name: 'Buffalo Milk (250ml)', calories: 150, protein: 8, carbs: 12, fat: 8, category: 'dairy', servingSize: '250ml' },
  { name: 'Buffalo Milk (350ml)', calories: 210, protein: 11, carbs: 17, fat: 11, category: 'dairy', servingSize: '350ml' },
  { name: 'Cow Milk (250ml)', calories: 120, protein: 8, carbs: 12, fat: 5, category: 'dairy', servingSize: '250ml' },
  { name: 'Curd/Dahi (100g)', calories: 60, protein: 3, carbs: 5, fat: 3, category: 'dairy', servingSize: '100g' },
  { name: 'Paneer (100g)', calories: 265, protein: 18, carbs: 3, fat: 21, category: 'dairy', servingSize: '100g' },
  { name: 'Lassi Sweet (200ml)', calories: 160, protein: 5, carbs: 24, fat: 5, category: 'dairy', servingSize: '200ml' },
  { name: 'Buttermilk/Chaas (200ml)', calories: 40, protein: 2, carbs: 4, fat: 2, category: 'dairy', servingSize: '200ml' },
  { name: 'Ghee (1 tbsp)', calories: 112, protein: 0, carbs: 0, fat: 12, category: 'dairy', servingSize: '1 tbsp' },

  // Protein Sources
  { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 4, category: 'protein', servingSize: '100g' },
  { name: 'Chicken Curry (1 serving)', calories: 280, protein: 25, carbs: 8, fat: 17, category: 'protein', servingSize: '1 serving' },
  { name: 'Egg Boiled (1)', calories: 78, protein: 6, carbs: 1, fat: 5, category: 'protein', servingSize: '1 egg' },
  { name: 'Egg Bhurji (2 eggs)', calories: 200, protein: 14, carbs: 4, fat: 15, category: 'protein', servingSize: '2 eggs' },
  { name: 'Fish Curry (1 serving)', calories: 220, protein: 22, carbs: 6, fat: 12, category: 'protein', servingSize: '1 serving' },
  { name: 'Mutton Curry (1 serving)', calories: 350, protein: 28, carbs: 8, fat: 23, category: 'protein', servingSize: '1 serving' },
  { name: 'Dal/Lentils (1 bowl)', calories: 180, protein: 12, carbs: 30, fat: 2, fiber: 8, category: 'protein', servingSize: '1 bowl' },
  { name: 'Rajma (1 bowl)', calories: 210, protein: 14, carbs: 35, fat: 2, fiber: 10, category: 'protein', servingSize: '1 bowl' },
  { name: 'Chole (1 bowl)', calories: 240, protein: 13, carbs: 38, fat: 5, fiber: 9, category: 'protein', servingSize: '1 bowl' },
  { name: 'Soya Chunks (50g dry)', calories: 170, protein: 26, carbs: 16, fat: 1, category: 'protein', servingSize: '50g dry' },
  { name: 'Whey Protein (1 scoop)', calories: 120, protein: 24, carbs: 3, fat: 2, category: 'protein', servingSize: '30g' },
  { name: 'Whey Protein (2 scoops)', calories: 228, protein: 60, carbs: 6, fat: 3, category: 'protein', servingSize: '60g' },

  // Grains & Breads
  { name: 'Rice (1 bowl cooked)', calories: 200, protein: 4, carbs: 45, fat: 0, category: 'grains', servingSize: '1 bowl' },
  { name: 'Roti/Chapati (1)', calories: 70, protein: 2, carbs: 15, fat: 1, fiber: 2, category: 'grains', servingSize: '1 piece' },
  { name: 'Paratha (1)', calories: 150, protein: 3, carbs: 20, fat: 7, category: 'grains', servingSize: '1 piece' },
  { name: 'Paratha Aloo (1)', calories: 200, protein: 4, carbs: 28, fat: 9, category: 'grains', servingSize: '1 piece' },
  { name: 'Naan (1)', calories: 260, protein: 8, carbs: 45, fat: 5, category: 'grains', servingSize: '1 piece' },
  { name: 'Dosa (1)', calories: 120, protein: 3, carbs: 18, fat: 4, category: 'grains', servingSize: '1 piece' },
  { name: 'Idli (1)', calories: 40, protein: 2, carbs: 8, fat: 0, category: 'grains', servingSize: '1 piece' },
  { name: 'Upma (1 bowl)', calories: 200, protein: 5, carbs: 30, fat: 7, category: 'grains', servingSize: '1 bowl' },
  { name: 'Poha (1 bowl)', calories: 180, protein: 4, carbs: 32, fat: 5, category: 'grains', servingSize: '1 bowl' },
  { name: 'Khichdi (1 bowl)', calories: 220, protein: 8, carbs: 38, fat: 4, category: 'grains', servingSize: '1 bowl' },
  { name: 'Oats (1 bowl cooked)', calories: 150, protein: 6, carbs: 27, fat: 3, fiber: 4, category: 'grains', servingSize: '1 bowl' },
  { name: 'Bread White (1 slice)', calories: 75, protein: 2, carbs: 14, fat: 1, category: 'grains', servingSize: '1 slice' },
  { name: 'Bread Brown (1 slice)', calories: 70, protein: 3, carbs: 12, fat: 1, fiber: 2, category: 'grains', servingSize: '1 slice' },
  { name: 'Makki Ki Roti (1)', calories: 110, protein: 2, carbs: 20, fat: 3, fiber: 2, category: 'grains', servingSize: '1 piece' },

  // Vegetables & Curries
  { name: 'Sabzi Mixed (1 bowl)', calories: 120, protein: 3, carbs: 12, fat: 7, fiber: 4, category: 'vegetables', servingSize: '1 bowl' },
  { name: 'Palak Paneer (1 bowl)', calories: 280, protein: 12, carbs: 10, fat: 22, category: 'vegetables', servingSize: '1 bowl' },
  { name: 'Aloo Gobi (1 bowl)', calories: 180, protein: 4, carbs: 25, fat: 8, category: 'vegetables', servingSize: '1 bowl' },
  { name: 'Bhindi Fry (1 bowl)', calories: 130, protein: 3, carbs: 12, fat: 8, category: 'vegetables', servingSize: '1 bowl' },
  { name: 'Baingan Bharta (1 bowl)', calories: 140, protein: 3, carbs: 15, fat: 8, category: 'vegetables', servingSize: '1 bowl' },
  { name: 'Sarson Ka Saag (1 bowl)', calories: 150, protein: 5, carbs: 12, fat: 10, fiber: 4, category: 'vegetables', servingSize: '1 bowl' },
  { name: 'Salad (1 bowl)', calories: 50, protein: 2, carbs: 10, fat: 0, fiber: 3, category: 'vegetables', servingSize: '1 bowl' },

  // Fruits
  { name: 'Banana (1 medium)', calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3, category: 'fruits', servingSize: '1 medium' },
  { name: 'Apple (1 medium)', calories: 95, protein: 0, carbs: 25, fat: 0, fiber: 4, category: 'fruits', servingSize: '1 medium' },
  { name: 'Mango (1 cup)', calories: 100, protein: 1, carbs: 25, fat: 0, fiber: 3, category: 'fruits', servingSize: '1 cup' },
  { name: 'Papaya (1 cup)', calories: 55, protein: 1, carbs: 14, fat: 0, fiber: 2, category: 'fruits', servingSize: '1 cup' },
  { name: 'Orange (1 medium)', calories: 62, protein: 1, carbs: 15, fat: 0, fiber: 3, category: 'fruits', servingSize: '1 medium' },
  { name: 'Watermelon (1 cup)', calories: 46, protein: 1, carbs: 12, fat: 0, category: 'fruits', servingSize: '1 cup' },
  { name: 'Grapes (1 cup)', calories: 104, protein: 1, carbs: 27, fat: 0, category: 'fruits', servingSize: '1 cup' },
  { name: 'Pomegranate (1 cup)', calories: 145, protein: 3, carbs: 33, fat: 2, fiber: 7, category: 'fruits', servingSize: '1 cup' },

  // Snacks
  { name: 'Samosa (1)', calories: 250, protein: 4, carbs: 28, fat: 14, category: 'snacks', servingSize: '1 piece' },
  { name: 'Pakora (5 pieces)', calories: 200, protein: 4, carbs: 18, fat: 13, category: 'snacks', servingSize: '5 pieces' },
  { name: 'Bhel Puri (1 plate)', calories: 200, protein: 5, carbs: 35, fat: 5, category: 'snacks', servingSize: '1 plate' },
  { name: 'Pani Puri (6 pieces)', calories: 180, protein: 3, carbs: 30, fat: 6, category: 'snacks', servingSize: '6 pieces' },
  { name: 'Vada Pav (1)', calories: 290, protein: 6, carbs: 40, fat: 12, category: 'snacks', servingSize: '1 piece' },
  { name: 'Pav Bhaji (1 serving)', calories: 400, protein: 10, carbs: 55, fat: 16, category: 'snacks', servingSize: '1 serving' },
  { name: 'Momos Veg (6 pieces)', calories: 200, protein: 6, carbs: 30, fat: 6, category: 'snacks', servingSize: '6 pieces' },
  { name: 'Momos Chicken (6 pieces)', calories: 250, protein: 12, carbs: 28, fat: 10, category: 'snacks', servingSize: '6 pieces' },
  { name: 'Namkeen Mix (50g)', calories: 250, protein: 6, carbs: 30, fat: 12, category: 'snacks', servingSize: '50g' },
  { name: 'Dry Fruits Laddoo (1)', calories: 100, protein: 2, carbs: 12, fat: 5, category: 'snacks', servingSize: '1 piece' },
  { name: 'Peanuts (30g)', calories: 170, protein: 7, carbs: 5, fat: 14, category: 'snacks', servingSize: '30g' },
  { name: 'Almonds (10 pieces)', calories: 70, protein: 3, carbs: 2, fat: 6, category: 'snacks', servingSize: '10 pieces' },
  { name: 'Cashews (10 pieces)', calories: 90, protein: 2, carbs: 5, fat: 7, category: 'snacks', servingSize: '10 pieces' },

  // Beverages
  { name: 'Tea with Milk (1 cup)', calories: 50, protein: 2, carbs: 6, fat: 2, category: 'beverages', servingSize: '1 cup' },
  { name: 'Coffee with Milk (1 cup)', calories: 60, protein: 2, carbs: 7, fat: 2, category: 'beverages', servingSize: '1 cup' },
  { name: 'Black Coffee (1 cup)', calories: 5, protein: 0, carbs: 1, fat: 0, category: 'beverages', servingSize: '1 cup' },
  { name: 'Green Tea (1 cup)', calories: 2, protein: 0, carbs: 0, fat: 0, category: 'beverages', servingSize: '1 cup' },
  { name: 'Nimbu Pani (1 glass)', calories: 30, protein: 0, carbs: 8, fat: 0, category: 'beverages', servingSize: '1 glass' },
  { name: 'Coconut Water (250ml)', calories: 45, protein: 2, carbs: 9, fat: 0, category: 'beverages', servingSize: '250ml' },
  { name: 'Mango Shake (1 glass)', calories: 250, protein: 6, carbs: 45, fat: 6, category: 'beverages', servingSize: '1 glass' },
  { name: 'Banana Shake (1 glass)', calories: 220, protein: 8, carbs: 35, fat: 6, category: 'beverages', servingSize: '1 glass' },

  // Sweets
  { name: 'Gulab Jamun (1)', calories: 150, protein: 2, carbs: 20, fat: 7, category: 'sweets', servingSize: '1 piece' },
  { name: 'Rasgulla (1)', calories: 120, protein: 2, carbs: 22, fat: 3, category: 'sweets', servingSize: '1 piece' },
  { name: 'Jalebi (1)', calories: 150, protein: 1, carbs: 30, fat: 4, category: 'sweets', servingSize: '1 piece' },
  { name: 'Ladoo Besan (1)', calories: 180, protein: 3, carbs: 22, fat: 9, category: 'sweets', servingSize: '1 piece' },
  { name: 'Kheer (1 bowl)', calories: 250, protein: 6, carbs: 40, fat: 8, category: 'sweets', servingSize: '1 bowl' },
  { name: 'Halwa (1 serving)', calories: 300, protein: 4, carbs: 45, fat: 12, category: 'sweets', servingSize: '1 serving' },
  { name: 'Barfi (1 piece)', calories: 150, protein: 3, carbs: 20, fat: 7, category: 'sweets', servingSize: '1 piece' },
];

// Helper function to search foods
export function searchFoods(query: string): FoodItem[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return FOOD_DATABASE.slice(0, 20); // Return first 20 when no query
  
  return FOOD_DATABASE.filter(food => 
    food.name.toLowerCase().includes(lowerQuery) ||
    food.category.toLowerCase().includes(lowerQuery)
  ).slice(0, 10); // Return max 10 results
}

// Helper function to get foods by category
export function getFoodsByCategory(category: FoodItem['category']): FoodItem[] {
  return FOOD_DATABASE.filter(food => food.category === category);
}

// Get all categories
export function getAllCategories(): FoodItem['category'][] {
  return ['dairy', 'protein', 'grains', 'vegetables', 'fruits', 'snacks', 'beverages', 'sweets'];
}
