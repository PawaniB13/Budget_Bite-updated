const foods = require('./foods');

function calculateBMR(profile) {
  const { weight, height, age, gender } = profile;
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

function calculateCalorieTarget(profile) {
  const bmr = calculateBMR(profile);
  const activityFactor = 1.375;
  const tdee = bmr * activityFactor;
  if (profile.goal === 'weight_loss') return Math.round(tdee - 500);
  if (profile.goal === 'weight_gain') return Math.round(tdee + 500);
  return Math.round(tdee);
}

function calculateProteinTarget(profile) {
  if (profile.goal === 'weight_gain') return Math.round(profile.weight * 1.8);
  if (profile.goal === 'weight_loss') return Math.round(profile.weight * 1.5);
  return Math.round(profile.weight * 1.2);
}

function generateDietPlan(profile, budgetPerDay, isVeg) {
  const calorieTarget = calculateCalorieTarget(profile);
  const proteinTarget = calculateProteinTarget(profile);

  const availableFoods = isVeg ? foods.filter(f => f.veg) : foods;

  // Split foods
  const carbs    = availableFoods.filter(f => f.category === 'carb');
  const proteins = availableFoods.filter(f => f.category === 'protein' || f.category === 'dairy');
  const others   = availableFoods.filter(f => f.category === 'fruit' || f.category === 'veggie');

  // Helper: random pick
  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  const plan = [];

  // Budget split for meals
  const mealBudget = {
    breakfast: budgetPerDay * 0.25,
    lunch:     budgetPerDay * 0.35,
    dinner:    budgetPerDay * 0.30,
    snacks:    budgetPerDay * 0.10
  };

  function createItem(food, budget) {
    const grams = Math.round((budget / food.costPer100g) * 100);
    return {
      food: food.name,
      emoji: food.emoji,
      grams,
      cost: Math.round(budget),
      calories: Math.round((grams / 100) * food.caloriesPer100g),
      protein: Math.round((grams / 100) * food.proteinPer100g),
    };
  }

  // 🍳 Breakfast
  plan.push({
    meal: "Breakfast",
    items: [
      createItem(pickRandom(carbs), mealBudget.breakfast * 0.6),
      createItem(pickRandom(proteins), mealBudget.breakfast * 0.4),
    ]
  });

  // 🍛 Lunch
  plan.push({
    meal: "Lunch",
    items: [
      createItem(pickRandom(carbs), mealBudget.lunch * 0.5),
      createItem(pickRandom(proteins), mealBudget.lunch * 0.3),
      createItem(pickRandom(others), mealBudget.lunch * 0.2),
    ]
  });

  // 🍽️ Dinner
  plan.push({
    meal: "Dinner",
    items: [
      createItem(pickRandom(carbs), mealBudget.dinner * 0.5),
      createItem(pickRandom(proteins), mealBudget.dinner * 0.3),
      createItem(pickRandom(others), mealBudget.dinner * 0.2),
    ]
  });

  // 🍌 Snacks
  plan.push({
    meal: "Snacks",
    items: [
      createItem(pickRandom(others), mealBudget.snacks)
    ]
  });

  // Calculate totals
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCost = 0;

  plan.forEach(meal => {
    meal.items.forEach(item => {
      totalCalories += item.calories;
      totalProtein += item.protein;
      totalCost += item.cost;
    });
  });

  const calScore     = Math.min(50, Math.round((totalCalories / calorieTarget) * 50));
  const proteinScore = Math.min(50, Math.round((totalProtein / proteinTarget) * 50));
  const nutritionScore = calScore + proteinScore;

  let warning = null;
  if (totalCalories < calorieTarget * 0.75) {
    warning = `With ₹${budgetPerDay}/day, ideal nutrition is not fully achievable.`;
  }

  return {
    meals: plan,
    totalCalories,
    totalProtein,
    totalCost,
    calorieTarget,
    proteinTarget,
    nutritionScore,
    warning,
  };
}

function analyzeMeal(mealText, profile) {
  const calorieTarget = calculateCalorieTarget(profile);
  const proteinTarget = calculateProteinTarget(profile);

  const mealLower = mealText.toLowerCase();
  let mealCalories = 0;
  let mealProtein  = 0;
  const matched = [];

  foods.forEach(food => {
    if (mealLower.includes(food.name.toLowerCase())) {
      const grams = 150;
      const cal   = Math.round((grams / 100) * food.caloriesPer100g);
      const prot  = Math.round((grams / 100) * food.proteinPer100g);
      mealCalories += cal;
      mealProtein  += prot;
      matched.push({ food: food.name, emoji: food.emoji, grams, calories: cal, protein: prot });
    }
  });

  const calStatus     = mealCalories < calorieTarget * 0.85 ? 'low'
                      : mealCalories > calorieTarget * 1.15  ? 'high' : 'adequate';
  const proteinStatus = mealProtein < proteinTarget * 0.85   ? 'low' : 'adequate';

  const suggestions = [];
  if (proteinStatus === 'low') {
    suggestions.push({ text: 'Add 50g peanuts (+₹5) to boost protein by ~13g', emoji: '🥜' });
    suggestions.push({ text: 'Add 1 egg (+₹8) for ~6g protein',                emoji: '🥚' });
  }
  if (calStatus === 'low') {
    suggestions.push({ text: 'Add 1 banana (+₹5) for ~90 extra calories',   emoji: '🍌' });
    suggestions.push({ text: 'Add 100g rice (+₹4) for ~130 extra calories', emoji: '🍚' });
  }

  return {
    matched,
    mealCalories,
    mealProtein,
    calorieTarget,
    proteinTarget,
    calStatus,
    proteinStatus,
    suggestions,
    nutritionScore: Math.min(100,
      Math.round((mealCalories / calorieTarget) * 50) +
      Math.round((mealProtein  / proteinTarget) * 50)
    ),
  };
}

module.exports = { calculateCalorieTarget, calculateProteinTarget, generateDietPlan, analyzeMeal };