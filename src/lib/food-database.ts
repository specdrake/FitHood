// Indian Food Composition Tables 2017 (NIN) + Common Foods Database
// Values are per 100g unless otherwise specified

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  category: 'dairy' | 'protein' | 'grains' | 'vegetables' | 'fruits' | 'snacks' | 'beverages' | 'sweets' | 'cooked';
  servingSize?: string;
  source?: 'nin' | 'local';
}

// NIN/IFCT2017 Based Data - Raw ingredients (per 100g)
// Source: Indian Food Composition Tables 2017, National Institute of Nutrition
const NIN_RAW_DATA: FoodItem[] = [
  // Cereals & Millets (Raw)
  { name: 'Rice, Raw (White)', calories: 356, protein: 6.4, carbs: 78.2, fat: 0.5, fiber: 0.2, category: 'grains', source: 'nin' },
  { name: 'Rice, Raw (Brown)', calories: 346, protein: 7.5, carbs: 76.0, fat: 1.0, fiber: 3.4, category: 'grains', source: 'nin' },
  { name: 'Wheat Flour (Atta)', calories: 341, protein: 12.1, carbs: 69.4, fat: 1.7, fiber: 1.9, category: 'grains', source: 'nin' },
  { name: 'Maize/Corn Flour', calories: 355, protein: 9.2, carbs: 73.0, fat: 3.6, fiber: 2.8, category: 'grains', source: 'nin' },
  { name: 'Bajra (Pearl Millet)', calories: 363, protein: 11.8, carbs: 67.0, fat: 5.4, fiber: 1.2, category: 'grains', source: 'nin' },
  { name: 'Jowar (Sorghum)', calories: 349, protein: 10.4, carbs: 72.6, fat: 1.9, fiber: 1.6, category: 'grains', source: 'nin' },
  { name: 'Ragi (Finger Millet)', calories: 336, protein: 7.7, carbs: 72.6, fat: 1.5, fiber: 3.6, category: 'grains', source: 'nin' },
  { name: 'Oats', calories: 389, protein: 13.6, carbs: 67.0, fat: 6.4, fiber: 10.1, category: 'grains', source: 'nin' },
  { name: 'Semolina (Suji/Rava)', calories: 348, protein: 10.4, carbs: 74.8, fat: 0.8, fiber: 0.9, category: 'grains', source: 'nin' },
  { name: 'Poha (Flattened Rice)', calories: 346, protein: 6.6, carbs: 77.3, fat: 1.2, fiber: 1.0, category: 'grains', source: 'nin' },

  // Pulses & Legumes (Raw/Dry)
  { name: 'Toor Dal (Arhar)', calories: 335, protein: 22.3, carbs: 57.6, fat: 1.7, fiber: 5.1, category: 'protein', source: 'nin' },
  { name: 'Moong Dal (Green Gram)', calories: 334, protein: 24.5, carbs: 56.7, fat: 1.2, fiber: 4.1, category: 'protein', source: 'nin' },
  { name: 'Moong Dal (Yellow/Split)', calories: 348, protein: 24.0, carbs: 59.9, fat: 1.3, fiber: 0.8, category: 'protein', source: 'nin' },
  { name: 'Masoor Dal (Red Lentils)', calories: 343, protein: 25.4, carbs: 56.5, fat: 0.7, fiber: 1.9, category: 'protein', source: 'nin' },
  { name: 'Chana Dal (Bengal Gram)', calories: 360, protein: 20.8, carbs: 59.8, fat: 5.3, fiber: 3.9, category: 'protein', source: 'nin' },
  { name: 'Urad Dal (Black Gram)', calories: 341, protein: 24.0, carbs: 59.6, fat: 1.4, fiber: 0.9, category: 'protein', source: 'nin' },
  { name: 'Rajma (Kidney Beans)', calories: 346, protein: 22.9, carbs: 60.6, fat: 1.3, fiber: 4.8, category: 'protein', source: 'nin' },
  { name: 'Kabuli Chana (Chickpeas)', calories: 360, protein: 17.1, carbs: 61.0, fat: 5.3, fiber: 3.7, category: 'protein', source: 'nin' },
  { name: 'Soybean', calories: 432, protein: 43.2, carbs: 20.9, fat: 19.5, fiber: 3.7, category: 'protein', source: 'nin' },

  // Dairy Products
  { name: 'Milk, Buffalo', calories: 117, protein: 4.3, carbs: 5.0, fat: 8.8, category: 'dairy', source: 'nin' },
  { name: 'Milk, Cow', calories: 67, protein: 3.2, carbs: 4.4, fat: 4.1, category: 'dairy', source: 'nin' },
  { name: 'Milk, Toned', calories: 54, protein: 3.0, carbs: 4.6, fat: 3.0, category: 'dairy', source: 'nin' },
  { name: 'Curd/Dahi', calories: 60, protein: 3.1, carbs: 3.0, fat: 4.0, category: 'dairy', source: 'nin' },
  { name: 'Paneer', calories: 265, protein: 18.3, carbs: 1.2, fat: 20.8, category: 'dairy', source: 'nin' },
  { name: 'Ghee', calories: 900, protein: 0, carbs: 0, fat: 99.5, category: 'dairy', source: 'nin' },
  { name: 'Butter', calories: 729, protein: 0.5, carbs: 0, fat: 81.0, category: 'dairy', source: 'nin' },
  { name: 'Khoya/Mawa', calories: 421, protein: 14.6, carbs: 26.8, fat: 27.5, category: 'dairy', source: 'nin' },

  // Eggs & Meat
  { name: 'Egg, Whole (1 large ~50g)', calories: 155, protein: 12.6, carbs: 0.7, fat: 10.6, category: 'protein', source: 'nin' },
  { name: 'Egg White (1 large)', calories: 52, protein: 10.9, carbs: 0.7, fat: 0.2, category: 'protein', source: 'nin' },
  { name: 'Chicken Breast', calories: 110, protein: 23.1, carbs: 0, fat: 1.2, category: 'protein', source: 'nin' },
  { name: 'Chicken Thigh', calories: 119, protein: 19.7, carbs: 0, fat: 3.9, category: 'protein', source: 'nin' },
  { name: 'Mutton/Goat', calories: 118, protein: 21.4, carbs: 0, fat: 3.6, category: 'protein', source: 'nin' },
  { name: 'Fish, Rohu', calories: 97, protein: 17.0, carbs: 0, fat: 1.4, category: 'protein', source: 'nin' },
  { name: 'Fish, Pomfret', calories: 87, protein: 19.3, carbs: 0, fat: 0.6, category: 'protein', source: 'nin' },
  { name: 'Prawns/Shrimp', calories: 89, protein: 19.1, carbs: 0, fat: 0.8, category: 'protein', source: 'nin' },

  // Vegetables
  { name: 'Potato', calories: 97, protein: 1.6, carbs: 22.6, fat: 0.1, fiber: 1.6, category: 'vegetables', source: 'nin' },
  { name: 'Onion', calories: 50, protein: 1.2, carbs: 11.1, fat: 0.1, fiber: 0.6, category: 'vegetables', source: 'nin' },
  { name: 'Tomato', calories: 20, protein: 0.9, carbs: 3.6, fat: 0.2, fiber: 0.8, category: 'vegetables', source: 'nin' },
  { name: 'Spinach (Palak)', calories: 26, protein: 2.0, carbs: 2.9, fat: 0.7, fiber: 0.6, category: 'vegetables', source: 'nin' },
  { name: 'Cauliflower', calories: 30, protein: 2.6, carbs: 4.0, fat: 0.4, fiber: 1.2, category: 'vegetables', source: 'nin' },
  { name: 'Cabbage', calories: 27, protein: 1.8, carbs: 4.6, fat: 0.1, fiber: 1.0, category: 'vegetables', source: 'nin' },
  { name: 'Carrot', calories: 48, protein: 0.9, carbs: 10.6, fat: 0.2, fiber: 1.2, category: 'vegetables', source: 'nin' },
  { name: 'Brinjal/Eggplant', calories: 24, protein: 1.4, carbs: 4.0, fat: 0.3, fiber: 1.3, category: 'vegetables', source: 'nin' },
  { name: 'Bhindi/Okra', calories: 35, protein: 1.9, carbs: 6.4, fat: 0.2, fiber: 1.2, category: 'vegetables', source: 'nin' },
  { name: 'Capsicum/Bell Pepper', calories: 24, protein: 1.3, carbs: 4.3, fat: 0.3, fiber: 1.1, category: 'vegetables', source: 'nin' },
  { name: 'Cucumber', calories: 13, protein: 0.4, carbs: 2.5, fat: 0.1, fiber: 0.4, category: 'vegetables', source: 'nin' },
  { name: 'Bottle Gourd (Lauki)', calories: 12, protein: 0.2, carbs: 2.5, fat: 0.1, fiber: 0.6, category: 'vegetables', source: 'nin' },
  { name: 'Bitter Gourd (Karela)', calories: 25, protein: 1.6, carbs: 4.2, fat: 0.2, fiber: 1.7, category: 'vegetables', source: 'nin' },

  // Fruits
  { name: 'Banana', calories: 116, protein: 1.2, carbs: 27.2, fat: 0.3, fiber: 0.4, sugar: 12.2, category: 'fruits', source: 'nin' },
  { name: 'Apple', calories: 59, protein: 0.2, carbs: 13.7, fat: 0.5, fiber: 1.0, sugar: 10.4, category: 'fruits', source: 'nin' },
  { name: 'Mango', calories: 74, protein: 0.6, carbs: 16.9, fat: 0.4, fiber: 0.7, sugar: 14.8, category: 'fruits', source: 'nin' },
  { name: 'Papaya', calories: 32, protein: 0.6, carbs: 7.2, fat: 0.1, fiber: 0.8, sugar: 5.9, category: 'fruits', source: 'nin' },
  { name: 'Orange', calories: 48, protein: 0.7, carbs: 10.9, fat: 0.2, fiber: 0.3, sugar: 8.5, category: 'fruits', source: 'nin' },
  { name: 'Grapes', calories: 71, protein: 0.5, carbs: 16.5, fat: 0.3, fiber: 0.6, sugar: 15.5, category: 'fruits', source: 'nin' },
  { name: 'Watermelon', calories: 26, protein: 0.2, carbs: 5.9, fat: 0.2, fiber: 0.2, sugar: 4.7, category: 'fruits', source: 'nin' },
  { name: 'Pomegranate', calories: 65, protein: 1.6, carbs: 14.5, fat: 0.1, fiber: 5.1, sugar: 10.0, category: 'fruits', source: 'nin' },
  { name: 'Guava', calories: 51, protein: 0.9, carbs: 11.2, fat: 0.3, fiber: 5.2, sugar: 8.9, category: 'fruits', source: 'nin' },
  { name: 'Chikoo/Sapota', calories: 98, protein: 0.7, carbs: 21.4, fat: 1.1, fiber: 2.6, sugar: 19.0, category: 'fruits', source: 'nin' },

  // Nuts & Seeds
  { name: 'Almonds (Badam)', calories: 609, protein: 20.8, carbs: 10.5, fat: 58.9, fiber: 1.7, category: 'snacks', source: 'nin' },
  { name: 'Cashew (Kaju)', calories: 596, protein: 21.2, carbs: 22.3, fat: 46.9, fiber: 1.3, category: 'snacks', source: 'nin' },
  { name: 'Peanuts (Moongfali)', calories: 567, protein: 25.3, carbs: 26.1, fat: 40.1, fiber: 3.1, category: 'snacks', source: 'nin' },
  { name: 'Walnuts (Akhrot)', calories: 687, protein: 15.6, carbs: 11.1, fat: 64.5, fiber: 1.9, category: 'snacks', source: 'nin' },
  { name: 'Coconut, Fresh', calories: 444, protein: 4.5, carbs: 13.0, fat: 41.6, fiber: 3.6, category: 'snacks', source: 'nin' },
  { name: 'Coconut, Dry', calories: 662, protein: 6.8, carbs: 18.4, fat: 62.3, fiber: 4.3, category: 'snacks', source: 'nin' },

  // Oils & Fats (per 100ml)
  { name: 'Mustard Oil', calories: 900, protein: 0, carbs: 0, fat: 100, category: 'dairy', source: 'nin' },
  { name: 'Groundnut Oil', calories: 900, protein: 0, carbs: 0, fat: 100, category: 'dairy', source: 'nin' },
  { name: 'Coconut Oil', calories: 900, protein: 0, carbs: 0, fat: 100, category: 'dairy', source: 'nin' },
  { name: 'Sunflower Oil', calories: 900, protein: 0, carbs: 0, fat: 100, category: 'dairy', source: 'nin' },
];

// COOKED FOODS - Calculated using yield factors from NIN raw data
// These are practical serving-based values
const COOKED_FOODS: FoodItem[] = [
  // Cooked Rice (Raw rice absorbs ~2.5x water)
  // 100g raw rice (356 cal) → ~300g cooked rice → ~120 cal per 100g cooked
  { name: 'Rice, Cooked (White)', calories: 130, protein: 2.4, carbs: 28, fat: 0.2, fiber: 0.3, category: 'cooked', servingSize: '100g cooked' },
  { name: 'Rice, Cooked (Brown)', calories: 123, protein: 2.7, carbs: 26, fat: 0.4, fiber: 1.2, category: 'cooked', servingSize: '100g cooked' },
  { name: 'Rice, 1 Bowl Cooked', calories: 200, protein: 4, carbs: 45, fat: 0.3, fiber: 0.5, category: 'cooked', servingSize: '1 bowl (150g)' },

  // Rotis & Breads (1 roti ~30-35g atta)
  { name: 'Roti/Chapati (1 piece)', calories: 80, protein: 2.5, carbs: 15, fat: 1.5, fiber: 0.6, category: 'cooked', servingSize: '1 roti (~30g)' },
  { name: 'Paratha Plain (1 piece)', calories: 150, protein: 3, carbs: 20, fat: 7, fiber: 1.2, category: 'cooked', servingSize: '1 paratha (~50g)' },
  { name: 'Paratha Aloo (1 piece)', calories: 200, protein: 4, carbs: 28, fat: 9, fiber: 2.5, category: 'cooked', servingSize: '1 paratha' },
  { name: 'Paratha Mooli/Radish (1 piece)', calories: 180, protein: 3.5, carbs: 24, fat: 8, fiber: 1.5, category: 'cooked', servingSize: '1 paratha' },
  { name: 'Mooli Paratha (1 piece)', calories: 180, protein: 3.5, carbs: 24, fat: 8, fiber: 1.5, category: 'cooked', servingSize: '1 paratha' },
  { name: 'Paratha Gobhi (1 piece)', calories: 190, protein: 4, carbs: 25, fat: 8, fiber: 3.2, category: 'cooked', servingSize: '1 paratha' },
  { name: 'Paratha Paneer (1 piece)', calories: 250, protein: 8, carbs: 22, fat: 15, fiber: 1.8, category: 'cooked', servingSize: '1 paratha' },
  { name: 'Paratha Methi (1 piece)', calories: 170, protein: 4, carbs: 22, fat: 7, fiber: 2, category: 'cooked', servingSize: '1 paratha' },
  { name: 'Paratha Pyaaz (1 piece)', calories: 175, protein: 3.5, carbs: 23, fat: 8, fiber: 2.8, category: 'cooked', servingSize: '1 paratha' },
  { name: 'Paratha Mix Veg (1 piece)', calories: 185, protein: 4, carbs: 24, fat: 8, fiber: 3.5, category: 'cooked', servingSize: '1 paratha' },
  { name: 'Laccha Paratha (1 piece)', calories: 200, protein: 4, carbs: 26, fat: 10, fiber: 1.5, category: 'cooked', servingSize: '1 paratha' },
  { name: 'Lachha Paratha (1 piece)', calories: 200, protein: 4, carbs: 26, fat: 10, fiber: 1.5, category: 'cooked', servingSize: '1 paratha' },
  { name: 'Thepla (1 piece)', calories: 100, protein: 3, carbs: 15, fat: 4, fiber: 1, category: 'cooked', servingSize: '1 thepla' },
  { name: 'Puri (1 piece)', calories: 100, protein: 2, carbs: 12, fat: 5, fiber: 0.8, category: 'cooked', servingSize: '1 puri' },
  { name: 'Naan (1 piece)', calories: 260, protein: 8, carbs: 45, fat: 5, fiber: 1.2, category: 'cooked', servingSize: '1 naan' },
  { name: 'Butter Naan (1 piece)', calories: 300, protein: 8, carbs: 45, fat: 9, fiber: 1.2, category: 'cooked', servingSize: '1 naan' },
  { name: 'Garlic Naan (1 piece)', calories: 280, protein: 8, carbs: 46, fat: 7, fiber: 1.3, category: 'cooked', servingSize: '1 naan' },
  { name: 'Kulcha (1 piece)', calories: 270, protein: 7, carbs: 42, fat: 8, fiber: 1.5, category: 'cooked', servingSize: '1 kulcha' },
  { name: 'Amritsari Kulcha (1 piece)', calories: 300, protein: 8, carbs: 40, fat: 12, fiber: 1.8, category: 'cooked', servingSize: '1 kulcha' },
  { name: 'Bhatura (1 piece)', calories: 200, protein: 4, carbs: 28, fat: 8, fiber: 1.2, category: 'cooked', servingSize: '1 bhatura' },
  { name: 'Makki Ki Roti (1 piece)', calories: 110, protein: 2, carbs: 20, fat: 3, fiber: 2, category: 'cooked', servingSize: '1 roti' },
  { name: 'Bajra Roti (1 piece)', calories: 100, protein: 3, carbs: 18, fat: 3, fiber: 2, category: 'cooked', servingSize: '1 roti' },
  { name: 'Jowar Roti (1 piece)', calories: 95, protein: 2.5, carbs: 17, fat: 2, fiber: 2, category: 'cooked', servingSize: '1 roti' },
  { name: 'Missi Roti (1 piece)', calories: 120, protein: 5, carbs: 18, fat: 3, fiber: 2, category: 'cooked', servingSize: '1 roti' },
  { name: 'Tandoori Roti (1 piece)', calories: 110, protein: 3, carbs: 20, fat: 2, fiber: 1.5, category: 'cooked', servingSize: '1 roti' },
  { name: 'Rumali Roti (1 piece)', calories: 90, protein: 3, carbs: 18, fat: 1, fiber: 1.2, category: 'cooked', servingSize: '1 roti' },

  // South Indian
  { name: 'Dosa Plain (1 piece)', calories: 120, protein: 3, carbs: 18, fat: 4, fiber: 1.2, category: 'cooked', servingSize: '1 dosa' },
  { name: 'Masala Dosa (1 piece)', calories: 200, protein: 4, carbs: 28, fat: 8, fiber: 2.5, category: 'cooked', servingSize: '1 dosa' },
  { name: 'Idli (1 piece)', calories: 40, protein: 2, carbs: 8, fat: 0.2, fiber: 0.8, category: 'cooked', servingSize: '1 idli' },
  { name: 'Vada (1 piece)', calories: 130, protein: 4, carbs: 12, fat: 7, fiber: 1.5, category: 'cooked', servingSize: '1 vada' },
  { name: 'Uttapam (1 piece)', calories: 180, protein: 5, carbs: 25, fat: 6, fiber: 2.2, category: 'cooked', servingSize: '1 uttapam' },
  { name: 'Upma (1 bowl)', calories: 200, protein: 5, carbs: 30, fat: 7, fiber: 2.0, category: 'cooked', servingSize: '1 bowl (150g)' },
  { name: 'Poha (1 bowl)', calories: 180, protein: 4, carbs: 32, fat: 5, fiber: 1.8, category: 'cooked', servingSize: '1 bowl (150g)' },

  // Cooked Dals (Raw dal absorbs ~2.5-3x water)
  { name: 'Dal, Cooked (1 bowl)', calories: 150, protein: 9, carbs: 22, fat: 3, fiber: 3, category: 'cooked', servingSize: '1 bowl (150g)' },
  { name: 'Dal Tadka (1 bowl)', calories: 180, protein: 10, carbs: 24, fat: 5, fiber: 3, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Dal Fry (1 bowl)', calories: 200, protein: 10, carbs: 25, fat: 6, fiber: 3, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Rajma Curry (1 bowl)', calories: 210, protein: 12, carbs: 30, fat: 5, fiber: 5, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Chole/Chana Masala (1 bowl)', calories: 240, protein: 11, carbs: 32, fat: 8, fiber: 5, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Kadhi (1 bowl)', calories: 120, protein: 4, carbs: 12, fat: 6, fiber: 1.5, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Sambar (1 bowl)', calories: 130, protein: 6, carbs: 18, fat: 4, fiber: 4, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Rasam (1 bowl)', calories: 40, protein: 2, carbs: 6, fat: 1, fiber: 1.2, category: 'cooked', servingSize: '1 bowl' },

  // Vegetable Dishes
  { name: 'Sabzi/Vegetable Curry (1 bowl)', calories: 120, protein: 3, carbs: 12, fat: 7, fiber: 4, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Palak Paneer (1 bowl)', calories: 280, protein: 12, carbs: 10, fat: 22, fiber: 3.5, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Paneer Butter Masala (1 bowl)', calories: 350, protein: 14, carbs: 15, fat: 26, fiber: 2.8, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Shahi Paneer (1 bowl)', calories: 320, protein: 13, carbs: 14, fat: 24, fiber: 2.5, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Aloo Gobi (1 bowl)', calories: 180, protein: 4, carbs: 25, fat: 8, fiber: 3.8, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Aloo Matar (1 bowl)', calories: 160, protein: 5, carbs: 22, fat: 6, fiber: 4.2, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Bhindi Fry (1 bowl)', calories: 130, protein: 3, carbs: 12, fat: 8, fiber: 5.5, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Baingan Bharta (1 bowl)', calories: 140, protein: 3, carbs: 15, fat: 8, fiber: 4.8, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Sarson Ka Saag (1 bowl)', calories: 150, protein: 5, carbs: 12, fat: 10, fiber: 4, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Mixed Veg Curry (1 bowl)', calories: 140, protein: 4, carbs: 14, fat: 8, category: 'cooked', servingSize: '1 bowl' },

  // Non-Veg Dishes
  { name: 'Chicken Curry (1 serving)', calories: 280, protein: 25, carbs: 8, fat: 17, category: 'cooked', servingSize: '1 serving (150g)' },
  { name: 'Butter Chicken (1 serving)', calories: 350, protein: 24, carbs: 12, fat: 24, category: 'cooked', servingSize: '1 serving' },
  { name: 'Chicken Biryani (1 plate)', calories: 450, protein: 22, carbs: 55, fat: 16, category: 'cooked', servingSize: '1 plate (300g)' },
  { name: 'Mutton Curry (1 serving)', calories: 320, protein: 26, carbs: 8, fat: 22, category: 'cooked', servingSize: '1 serving' },
  { name: 'Fish Curry (1 serving)', calories: 220, protein: 22, carbs: 6, fat: 12, category: 'cooked', servingSize: '1 serving' },
  { name: 'Egg Bhurji (2 eggs)', calories: 200, protein: 14, carbs: 4, fat: 15, category: 'cooked', servingSize: '2 eggs' },
  { name: 'Egg Curry (2 eggs)', calories: 250, protein: 14, carbs: 8, fat: 18, category: 'cooked', servingSize: '2 eggs' },
  { name: 'Omelette (2 eggs)', calories: 180, protein: 12, carbs: 2, fat: 14, category: 'cooked', servingSize: '2 eggs' },
  { name: 'Boiled Egg (1)', calories: 78, protein: 6, carbs: 1, fat: 5, category: 'cooked', servingSize: '1 egg' },

  // Dairy Servings
  { name: 'Milk, Buffalo (1 glass)', calories: 175, protein: 6.5, carbs: 7.5, fat: 13.2, sugar: 7.5, category: 'dairy', servingSize: '150ml' },
  { name: 'Milk, Cow (1 glass)', calories: 100, protein: 4.8, carbs: 6.6, fat: 6.2, sugar: 6.6, category: 'dairy', servingSize: '150ml' },
  { name: 'Milk, Toned (1 glass)', calories: 80, protein: 4.5, carbs: 6.9, fat: 4.5, sugar: 6.9, category: 'dairy', servingSize: '150ml' },
  { name: 'Curd/Dahi (1 bowl)', calories: 90, protein: 4.7, carbs: 4.5, fat: 6, sugar: 4.5, category: 'dairy', servingSize: '150g' },
  { name: 'Lassi Sweet (1 glass)', calories: 160, protein: 5, carbs: 24, fat: 5, sugar: 18, category: 'dairy', servingSize: '200ml' },
  { name: 'Lassi Salted (1 glass)', calories: 80, protein: 4, carbs: 6, fat: 4, sugar: 4, category: 'dairy', servingSize: '200ml' },
  { name: 'Buttermilk/Chaas (1 glass)', calories: 40, protein: 2, carbs: 4, fat: 2, sugar: 3, category: 'dairy', servingSize: '200ml' },
  { name: 'Paneer (50g)', calories: 133, protein: 9, carbs: 0.6, fat: 10.4, category: 'dairy', servingSize: '50g' },

  // Snacks
  { name: 'Samosa (1 piece)', calories: 250, protein: 4, carbs: 28, fat: 14, fiber: 2.5, category: 'snacks', servingSize: '1 samosa' },
  { name: 'Pakora/Bhajiya (5 pieces)', calories: 200, protein: 4, carbs: 18, fat: 13, fiber: 2.8, category: 'snacks', servingSize: '5 pieces' },
  { name: 'Vada Pav (1)', calories: 290, protein: 6, carbs: 40, fat: 12, fiber: 3.2, category: 'snacks', servingSize: '1 vada pav' },
  { name: 'Pav Bhaji (1 serving)', calories: 400, protein: 10, carbs: 55, fat: 16, fiber: 4.5, category: 'snacks', servingSize: '1 serving' },
  { name: 'Pani Puri (6 pieces)', calories: 180, protein: 3, carbs: 30, fat: 6, fiber: 2.5, sugar: 8, category: 'snacks', servingSize: '6 pieces' },
  { name: 'Bhel Puri (1 plate)', calories: 200, protein: 5, carbs: 35, fat: 5, fiber: 3.8, sugar: 6, category: 'snacks', servingSize: '1 plate' },
  { name: 'Momos Veg (6 pieces)', calories: 200, protein: 6, carbs: 30, fat: 6, fiber: 2.2, category: 'snacks', servingSize: '6 pieces' },
  { name: 'Momos Chicken (6 pieces)', calories: 250, protein: 12, carbs: 28, fat: 10, fiber: 2.0, category: 'snacks', servingSize: '6 pieces' },
  { name: 'Kachori (1 piece)', calories: 180, protein: 3, carbs: 22, fat: 9, fiber: 1.8, category: 'snacks', servingSize: '1 kachori' },

  // Beverages
  { name: 'Tea with Milk (1 cup)', calories: 50, protein: 2, carbs: 6, fat: 2, sugar: 4, category: 'beverages', servingSize: '150ml' },
  { name: 'Coffee with Milk (1 cup)', calories: 60, protein: 2, carbs: 7, fat: 2, sugar: 5, category: 'beverages', servingSize: '150ml' },
  { name: 'Black Coffee (1 cup)', calories: 5, protein: 0, carbs: 1, fat: 0, sugar: 0, category: 'beverages', servingSize: '150ml' },
  { name: 'Green Tea (1 cup)', calories: 2, protein: 0, carbs: 0, fat: 0, sugar: 0, category: 'beverages', servingSize: '150ml' },
  { name: 'Nimbu Pani (1 glass)', calories: 30, protein: 0, carbs: 8, fat: 0, sugar: 6, category: 'beverages', servingSize: '200ml' },
  { name: 'Coconut Water (1 glass)', calories: 45, protein: 2, carbs: 9, fat: 0, sugar: 7.0, category: 'beverages', servingSize: '200ml' },
  { name: 'Mango Shake (1 glass)', calories: 250, protein: 6, carbs: 45, fat: 6, fiber: 1.2, sugar: 35, category: 'beverages', servingSize: '250ml' },
  { name: 'Banana Shake (1 glass)', calories: 220, protein: 8, carbs: 35, fat: 6, sugar: 28, category: 'beverages', servingSize: '250ml' },

  // Sweets
  { name: 'Gulab Jamun (1 piece)', calories: 150, protein: 2, carbs: 20, fat: 7, sugar: 15, category: 'sweets', servingSize: '1 piece' },
  { name: 'Rasgulla (1 piece)', calories: 120, protein: 2, carbs: 22, fat: 3, sugar: 18, category: 'sweets', servingSize: '1 piece' },
  { name: 'Jalebi (1 piece)', calories: 150, protein: 1, carbs: 30, fat: 4, sugar: 22, category: 'sweets', servingSize: '1 piece' },
  { name: 'Ladoo Besan (1 piece)', calories: 180, protein: 3, carbs: 22, fat: 9, sugar: 16, category: 'sweets', servingSize: '1 piece' },
  { name: 'Ladoo Motichoor (1 piece)', calories: 150, protein: 2, carbs: 25, fat: 5, sugar: 18, category: 'sweets', servingSize: '1 piece' },
  { name: 'Barfi (1 piece)', calories: 150, protein: 3, carbs: 20, fat: 7, sugar: 14, category: 'sweets', servingSize: '1 piece' },
  { name: 'Kheer (1 bowl)', calories: 250, protein: 6, carbs: 40, fat: 8, sugar: 30, category: 'sweets', servingSize: '1 bowl (150g)' },
  { name: 'Halwa (1 serving)', calories: 300, protein: 4, carbs: 45, fat: 12, sugar: 32, category: 'sweets', servingSize: '1 serving' },
  { name: 'Gajar Halwa (1 bowl)', calories: 280, protein: 5, carbs: 38, fat: 12, sugar: 28, category: 'sweets', servingSize: '1 bowl' },

  // Protein Supplements
  { name: 'Whey Protein (1 scoop)', calories: 120, protein: 24, carbs: 3, fat: 2, category: 'protein', servingSize: '30g' },
  { name: 'Whey Protein (2 scoops)', calories: 240, protein: 48, carbs: 6, fat: 4, category: 'protein', servingSize: '60g' },
  { name: 'Soya Chunks, Cooked (1 bowl)', calories: 170, protein: 26, carbs: 16, fat: 1, category: 'protein', servingSize: '50g dry' },

  // More Breakfast Items
  { name: 'Cornflakes with Milk (1 bowl)', calories: 200, protein: 6, carbs: 40, fat: 3, fiber: 1.5, sugar: 15, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Oats with Milk (1 bowl)', calories: 250, protein: 10, carbs: 35, fat: 8, fiber: 5, sugar: 8, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Muesli with Milk (1 bowl)', calories: 280, protein: 8, carbs: 45, fat: 8, fiber: 4, sugar: 12, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Daliya/Broken Wheat (1 bowl)', calories: 150, protein: 5, carbs: 28, fat: 2, fiber: 4, sugar: 2, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Vermicelli/Sevai (1 bowl)', calories: 160, protein: 4, carbs: 30, fat: 4, fiber: 1.8, sugar: 3, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Aloo Puri (1 serving)', calories: 350, protein: 6, carbs: 45, fat: 16, fiber: 3.5, category: 'cooked', servingSize: '2 puri + sabzi' },
  { name: 'Bread Toast (2 slices)', calories: 140, protein: 4, carbs: 26, fat: 2, fiber: 1.8, category: 'cooked', servingSize: '2 slices' },
  { name: 'Bread Butter (2 slices)', calories: 200, protein: 4, carbs: 26, fat: 8, fiber: 1.8, category: 'cooked', servingSize: '2 slices' },
  { name: 'Bread Jam (2 slices)', calories: 180, protein: 4, carbs: 35, fat: 2, fiber: 1.8, sugar: 12, category: 'cooked', servingSize: '2 slices' },
  { name: 'Sandwich Veg (1)', calories: 200, protein: 6, carbs: 28, fat: 8, fiber: 2.5, category: 'cooked', servingSize: '1 sandwich' },
  { name: 'Sandwich Cheese (1)', calories: 280, protein: 10, carbs: 28, fat: 14, fiber: 2.2, category: 'cooked', servingSize: '1 sandwich' },
  { name: 'Grilled Sandwich (1)', calories: 250, protein: 8, carbs: 30, fat: 11, fiber: 2.8, category: 'cooked', servingSize: '1 sandwich' },

  // More Snacks & Street Food
  { name: 'Maggi (1 packet)', calories: 320, protein: 8, carbs: 48, fat: 12, fiber: 2.5, sugar: 3, category: 'snacks', servingSize: '1 packet' },
  { name: 'Instant Noodles (1 packet)', calories: 320, protein: 8, carbs: 48, fat: 12, fiber: 2.5, sugar: 3, category: 'snacks', servingSize: '1 packet' },
  { name: 'Chole Bhature (1 plate)', calories: 550, protein: 14, carbs: 60, fat: 28, fiber: 6, category: 'cooked', servingSize: '1 plate' },
  { name: 'Aloo Tikki (1 piece)', calories: 120, protein: 2, carbs: 18, fat: 5, category: 'snacks', servingSize: '1 tikki' },
  { name: 'Aloo Tikki Chole (1 plate)', calories: 350, protein: 10, carbs: 45, fat: 15, fiber: 8.5, category: 'snacks', servingSize: '1 plate' },
  { name: 'Dahi Bhalla (2 pieces)', calories: 200, protein: 6, carbs: 25, fat: 8, fiber: 3.2, category: 'snacks', servingSize: '2 pieces' },
  { name: 'Papdi Chaat (1 plate)', calories: 250, protein: 5, carbs: 35, fat: 10, fiber: 4.8, category: 'snacks', servingSize: '1 plate' },
  { name: 'Sev Puri (6 pieces)', calories: 180, protein: 4, carbs: 28, fat: 6, fiber: 3.5, category: 'snacks', servingSize: '6 pieces' },
  { name: 'Dahi Puri (6 pieces)', calories: 200, protein: 5, carbs: 30, fat: 7, fiber: 3.8, category: 'snacks', servingSize: '6 pieces' },
  { name: 'Ragda Pattice (1 plate)', calories: 280, protein: 8, carbs: 40, fat: 10, fiber: 6.2, category: 'snacks', servingSize: '1 plate' },
  { name: 'Dabeli (1)', calories: 200, protein: 4, carbs: 32, fat: 7, fiber: 4.5, category: 'snacks', servingSize: '1 dabeli' },
  { name: 'Dhokla (4 pieces)', calories: 180, protein: 6, carbs: 28, fat: 5, fiber: 2.8, category: 'snacks', servingSize: '4 pieces' },
  { name: 'Khandvi (1 serving)', calories: 150, protein: 5, carbs: 20, fat: 5, fiber: 1.8, category: 'snacks', servingSize: '1 serving' },
  { name: 'Fafda (5 pieces)', calories: 200, protein: 4, carbs: 25, fat: 10, fiber: 1.5, sugar: 2, category: 'snacks', servingSize: '5 pieces' },
  { name: 'Jalebi Fafda (1 plate)', calories: 350, protein: 5, carbs: 55, fat: 14, fiber: 2.5, sugar: 25, category: 'snacks', servingSize: '1 plate' },
  { name: 'Gathiya (50g)', calories: 250, protein: 6, carbs: 30, fat: 12, fiber: 1.8, category: 'snacks', servingSize: '50g' },
  { name: 'Namkeen/Mixture (50g)', calories: 250, protein: 5, carbs: 28, fat: 14, fiber: 2.2, category: 'snacks', servingSize: '50g' },
  { name: 'Murukku (4 pieces)', calories: 160, protein: 3, carbs: 22, fat: 7, fiber: 1.2, category: 'snacks', servingSize: '4 pieces' },
  { name: 'Chakli (3 pieces)', calories: 150, protein: 3, carbs: 20, fat: 7, fiber: 1.5, category: 'snacks', servingSize: '3 pieces' },
  { name: 'Mathri (4 pieces)', calories: 180, protein: 3, carbs: 20, fat: 10, fiber: 1.8, category: 'snacks', servingSize: '4 pieces' },

  // Fast Food
  { name: 'Pizza Slice (1)', calories: 250, protein: 10, carbs: 30, fat: 10, fiber: 2.5, category: 'snacks', servingSize: '1 slice' },
  { name: 'Burger Veg (1)', calories: 350, protein: 12, carbs: 45, fat: 14, fiber: 3.8, category: 'snacks', servingSize: '1 burger' },
  { name: 'Burger Chicken (1)', calories: 450, protein: 22, carbs: 40, fat: 22, fiber: 3.5, category: 'snacks', servingSize: '1 burger' },
  { name: 'French Fries (medium)', calories: 300, protein: 4, carbs: 40, fat: 14, fiber: 3.2, category: 'snacks', servingSize: 'medium' },
  { name: 'Fried Chicken (2 pieces)', calories: 400, protein: 30, carbs: 15, fat: 26, fiber: 1.5, category: 'snacks', servingSize: '2 pieces' },
  { name: 'Wrap/Roll Veg (1)', calories: 280, protein: 8, carbs: 35, fat: 12, fiber: 4.2, category: 'snacks', servingSize: '1 roll' },
  { name: 'Wrap/Roll Chicken (1)', calories: 350, protein: 18, carbs: 32, fat: 16, fiber: 3.8, category: 'snacks', servingSize: '1 roll' },
  { name: 'Frankie/Kathi Roll (1)', calories: 320, protein: 12, carbs: 35, fat: 14, fiber: 4.5, category: 'snacks', servingSize: '1 roll' },
  { name: 'Pasta (1 plate)', calories: 400, protein: 12, carbs: 60, fat: 12, fiber: 3.5, category: 'cooked', servingSize: '1 plate' },
  { name: 'Chowmein/Noodles (1 plate)', calories: 350, protein: 10, carbs: 50, fat: 12, fiber: 3.2, category: 'cooked', servingSize: '1 plate' },
  { name: 'Fried Rice (1 plate)', calories: 380, protein: 8, carbs: 55, fat: 14, fiber: 2.8, category: 'cooked', servingSize: '1 plate' },
  { name: 'Manchurian Dry (1 serving)', calories: 200, protein: 6, carbs: 25, fat: 9, fiber: 3.5, category: 'cooked', servingSize: '1 serving' },
  { name: 'Manchurian Gravy (1 bowl)', calories: 250, protein: 7, carbs: 28, fat: 12, fiber: 3.2, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Spring Roll (2 pieces)', calories: 180, protein: 4, carbs: 22, fat: 9, fiber: 2.8, category: 'snacks', servingSize: '2 pieces' },

  // Regional Dishes
  { name: 'Pongal (1 bowl)', calories: 200, protein: 6, carbs: 35, fat: 5, fiber: 2.5, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Bisibelebath (1 plate)', calories: 350, protein: 10, carbs: 55, fat: 10, fiber: 5.5, category: 'cooked', servingSize: '1 plate' },
  { name: 'Puliogare/Tamarind Rice (1 plate)', calories: 280, protein: 5, carbs: 50, fat: 7, fiber: 3.8, sugar: 8, category: 'cooked', servingSize: '1 plate' },
  { name: 'Lemon Rice (1 plate)', calories: 250, protein: 5, carbs: 48, fat: 5, fiber: 2.5, sugar: 3, category: 'cooked', servingSize: '1 plate' },
  { name: 'Curd Rice (1 bowl)', calories: 180, protein: 6, carbs: 32, fat: 4, fiber: 1.8, sugar: 2, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Veg Pulao (1 plate)', calories: 280, protein: 6, carbs: 48, fat: 8, fiber: 3.5, category: 'cooked', servingSize: '1 plate' },
  { name: 'Jeera Rice (1 plate)', calories: 230, protein: 5, carbs: 45, fat: 4, fiber: 2.2, category: 'cooked', servingSize: '1 plate' },
  { name: 'Khichdi (1 bowl)', calories: 200, protein: 8, carbs: 35, fat: 4, fiber: 3, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Dal Khichdi (1 bowl)', calories: 220, protein: 10, carbs: 38, fat: 4, fiber: 4, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Pav Bhaji (1 serving)', calories: 400, protein: 10, carbs: 55, fat: 16, fiber: 4.5, category: 'cooked', servingSize: '1 serving' },
  { name: 'Misal Pav (1 serving)', calories: 450, protein: 14, carbs: 55, fat: 18, fiber: 6, category: 'cooked', servingSize: '1 serving' },
  { name: 'Sabudana Khichdi (1 bowl)', calories: 250, protein: 4, carbs: 45, fat: 8, fiber: 1.2, category: 'cooked', servingSize: '1 bowl' },
  { name: 'Sabudana Vada (2 pieces)', calories: 200, protein: 3, carbs: 30, fat: 8, fiber: 1.5, category: 'snacks', servingSize: '2 pieces' },
];

// Combined database
export const FOOD_DATABASE: FoodItem[] = [...COOKED_FOODS, ...NIN_RAW_DATA];

// Helper function to search foods
export function searchFoods(query: string): FoodItem[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return COOKED_FOODS.slice(0, 20); // Return cooked foods when no query
  
  // Split query into words for multi-word matching
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 0);
  
  // Score-based search for better results
  const results = FOOD_DATABASE.map(food => {
    const name = food.name.toLowerCase();
    const nameWords = name.split(/[\s,()\/]+/).filter(w => w.length > 0);
    let score = 0;
    
    // Exact match gets highest score
    if (name === lowerQuery) {
      score = 100;
    }
    // Multi-word: check if ALL query words are found in name
    else if (queryWords.length > 1) {
      const allWordsMatch = queryWords.every(qw => 
        nameWords.some(nw => nw.startsWith(qw) || nw.includes(qw))
      );
      if (allWordsMatch) {
        // Higher score if words appear in order
        const inOrder = queryWords.every((qw, i) => {
          const foundIdx = nameWords.findIndex(nw => nw.startsWith(qw));
          return foundIdx >= i;
        });
        score = inOrder ? 85 : 70;
      }
    }
    // Single word: starts with query
    else if (name.startsWith(lowerQuery)) {
      score = 80;
    }
    // Any word in name starts with query
    else if (nameWords.some(word => word.startsWith(lowerQuery))) {
      score = 60;
    }
    // Contains query anywhere
    else if (name.includes(lowerQuery)) {
      score = 40;
    }
    // Category match
    else if (food.category.includes(lowerQuery)) {
      score = 20;
    }
    
    return { food, score };
  })
  .filter(r => r.score > 0)
  .sort((a, b) => b.score - a.score)
  .map(r => r.food)
  .slice(0, 15);

  return results;
}

// Helper function to get foods by category
export function getFoodsByCategory(category: FoodItem['category']): FoodItem[] {
  return FOOD_DATABASE.filter(food => food.category === category);
}

// Get all categories
export function getAllCategories(): FoodItem['category'][] {
  return ['cooked', 'dairy', 'protein', 'grains', 'vegetables', 'fruits', 'snacks', 'beverages', 'sweets'];
}
