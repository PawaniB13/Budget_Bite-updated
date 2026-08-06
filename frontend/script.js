// ==================== STATE ====================
let currentUser = null;
let users = JSON.parse(localStorage.getItem('bb_users')) || {};
let foods = [];
let selectedPeriod = 'daily';

// ==================== FOOD DATA ====================
const FOODS = [
    {"name": "Rice (cooked, 100g)", "calories": 130, "protein": 2.7, "cost": 4, "veg": true, "fibre": 0.4},
    {"name": "Roti (1 medium)", "calories": 80, "protein": 2.5, "cost": 2, "veg": true, "fibre": 1.2},
    {"name": "Dal (1 bowl, 150g)", "calories": 150, "protein": 8, "cost": 8, "veg": true, "fibre": 3.5},
    {"name": "Egg (1 boiled)", "calories": 70, "protein": 6, "cost": 6, "veg": false, "fibre": 0},
    {"name": "Milk (1 glass, 200ml)", "calories": 120, "protein": 8, "cost": 10, "veg": true, "fibre": 0},
    {"name": "Banana (1 medium)", "calories": 90, "protein": 1.1, "cost": 5, "veg": true, "fibre": 2.6},
    {"name": "Peanuts (30g)", "calories": 170, "protein": 7.5, "cost": 10, "veg": true, "fibre": 2.4},
    {"name": "Paneer (50g)", "calories": 150, "protein": 10, "cost": 25, "veg": true, "fibre": 0},
    {"name": "Chicken breast (100g cooked)", "calories": 165, "protein": 31, "cost": 40, "veg": false, "fibre": 0},
    {"name": "Curd (1 bowl, 150g)", "calories": 100, "protein": 4, "cost": 8, "veg": true, "fibre": 0},
    {"name": "Mixed Vegetable Sabzi (1 bowl)", "calories": 80, "protein": 2, "cost": 12, "veg": true, "fibre": 3.8},
    {"name": "Apple (1 medium)", "calories": 52, "protein": 0.3, "cost": 8, "veg": true, "fibre": 2.4},
    {"name": "Chickpeas (100g cooked)", "calories": 164, "protein": 9, "cost": 15, "veg": true, "fibre": 7.6},
    {"name": "Oats (40g)", "calories": 150, "protein": 5, "cost": 12, "veg": true, "fibre": 4},
    {"name": "Almonds (20g)", "calories": 115, "protein": 4, "cost": 20, "veg": true, "fibre": 2.5}
];

// Meal-slot classifications
const BREAKFAST_FOODS = ["Oats", "Milk", "Banana", "Egg", "Almonds", "Apple"];
const LUNCH_FOODS = ["Rice", "Roti", "Dal", "Chicken", "Paneer", "Chickpeas", "Mixed Vegetable", "Curd"];
const DINNER_FOODS = ["Roti", "Dal", "Mixed Vegetable", "Curd", "Chickpeas", "Paneer", "Chicken"];

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    foods = FOODS;
    checkAuth();
    document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
    setTimeout(() => { document.getElementById('loadingScreen').style.display = 'none'; }, 2000);
});

// ==================== AUTH ====================
function togglePwd(id, btn) {
    const inp = document.getElementById(id);
    const isText = inp.type === 'text';
    inp.type = isText ? 'password' : 'text';
    btn.querySelector('i').className = isText ? 'fas fa-eye' : 'fas fa-eye-slash';
}

function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!username || !password) { alert('Please fill all fields.'); return; }
    if (users[username] && users[username].password === password) {
        currentUser = users[username];
        localStorage.setItem('bb_current', JSON.stringify(currentUser));
        showProfileSetup();
    } else {
        showError('loginForm', 'Invalid username or password.');
    }
}

function handleSignup() {
    const name = document.getElementById('signupName').value.trim();
    const username = document.getElementById('signupUsername').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;
    if (!name || !username || !password) { alert('Please fill all fields.'); return; }
    if (username.includes(' ')) { showError('signupForm', 'Username cannot contain spaces.'); return; }
    if (users[username]) { showError('signupForm', 'Username already taken. Try another.'); return; }
    users[username] = { name, username, password, profile: null };
    localStorage.setItem('bb_users', JSON.stringify(users));
    currentUser = users[username];
    localStorage.setItem('bb_current', JSON.stringify(currentUser));
    showProfileSetup();
}

function showError(formId, msg) {
    const form = document.getElementById(formId);
    let err = form.querySelector('.error-msg');
    if (!err) { err = document.createElement('div'); err.className = 'error-msg'; err.style.cssText = 'color:#ff6b6b;font-size:0.85rem;margin-top:0.5rem;text-align:center;'; form.appendChild(err); }
    err.textContent = msg;
    setTimeout(() => { if (err.parentNode) err.parentNode.removeChild(err); }, 3000);
}

function checkAuth() {
    const saved = localStorage.getItem('bb_current');
    if (saved) {
        currentUser = JSON.parse(saved);
        showProfileSetup();
    } else {
        showSection('authSection');
    }
}

function showLogin() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('signupForm').classList.remove('active');
}

function showSignup() {
    document.getElementById('signupForm').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('bb_current');
    showSection('authSection');
}

// ==================== PROFILE ====================
function handleProfile() {
    const age = parseInt(document.getElementById('age').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseInt(document.getElementById('height').value);
    const gender = document.getElementById('gender').value;
    const goal = document.getElementById('goal').value;
    const dietPref = document.getElementById('dietPref').value;
    const activity = parseFloat(document.getElementById('activity').value);
    const monthlyBudget = parseInt(document.getElementById('monthlyBudget').value);

    if (!age || !weight || !height || !gender || !goal || !dietPref || !activity || !monthlyBudget) {
        alert('Please fill all profile fields.'); return;
    }

    currentUser.profile = { age, weight, height, gender, goal, dietPref, activity, monthlyBudget };
    users[currentUser.username] = currentUser;
    localStorage.setItem('bb_users', JSON.stringify(users));
    localStorage.setItem('bb_current', JSON.stringify(currentUser));
    showDashboard();
}

function showProfileSetup() {
    if (!currentUser.profile) {
        showSection('profileSection');
    } else {
        showDashboard();
    }
}

// ==================== SECTIONS ====================
function showSection(id) {
    ['authSection','profileSection','dashboard','dietGenerator','dietImprover'].forEach(s => {
        const el = document.getElementById(s);
        el.classList.add('hidden');
        el.classList.remove('active');
        el.style.display = '';
    });
    const target = document.getElementById(id);
    target.classList.remove('hidden');
    if (id === 'dashboard') {
        target.style.display = 'flex';
    } else {
        target.style.display = '';
        setTimeout(() => target.classList.add('active'), 10);
    }
}

// ==================== DASHBOARD ====================
function showDashboard() {
    populateDashboard();
    showSection('dashboard');
    showDashboardView('overview');
}

function populateDashboard() {
    const p = currentUser.profile;
    document.getElementById('sidebarName').textContent = currentUser.name;
    document.getElementById('sidebarHandle').textContent = '@' + currentUser.username;
    document.getElementById('sidebarAvatar').textContent = currentUser.name[0].toUpperCase();

    const bmr = calcBMR();
    const tdee = calcTDEE();
    const bmi = (p.weight / Math.pow(p.height / 100, 2)).toFixed(1);
    const dailyBudget = (p.monthlyBudget / 30).toFixed(0);
    const proteinGoal = Math.round(p.weight * 1.2);

    // KPI Overview
    document.getElementById('kpi-calories').textContent = tdee;
    document.getElementById('kpi-protein').textContent = proteinGoal + 'g';
    document.getElementById('kpi-budget').textContent = '₹' + dailyBudget;
    document.getElementById('kpi-bmi').textContent = bmi;
    document.getElementById('bmi-category').textContent = getBMICategory(parseFloat(bmi));

    // Macro bars
    const carbGoal = Math.round((tdee * 0.5) / 4);
    const fatGoal = Math.round((tdee * 0.25) / 9);
    document.getElementById('macroBars').innerHTML = `
        ${macroBand('Carbs', carbGoal, 'g', '#ffd93d', 70)}
        ${macroBand('Protein', proteinGoal, 'g', '#4ecdc4', 60)}
        ${macroBand('Fat', fatGoal, 'g', '#ff6b6b', 45)}
        ${macroBand('Fibre', 30, 'g', '#a29bfe', 50)}
    `;

    // Health score ring
    const hs = getHealthScore(parseFloat(bmi), p);
    document.getElementById('overviewHealthScore').innerHTML = `
        <div class="hs-ring">
            <svg viewBox="0 0 120 120" width="120" height="120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#1e2535" stroke-width="12"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="url(#hsGrad)" stroke-width="12"
                    stroke-linecap="round" stroke-dasharray="314"
                    stroke-dashoffset="${314 - (314 * hs.score / 100)}"
                    transform="rotate(-90 60 60)"/>
                <defs>
                    <linearGradient id="hsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#ff6b6b"/>
                        <stop offset="100%" stop-color="#4ecdc4"/>
                    </linearGradient>
                </defs>
            </svg>
            <div class="hs-inner"><span>${hs.score}</span><small>/ 100</small></div>
        </div>
        <div class="hs-label">${hs.label}</div>
        <div class="hs-desc">${hs.desc}</div>
    `;

    // Health View
    const ibw = p.gender === 'male' ? (50 + 2.3 * ((p.height / 2.54) - 60)).toFixed(1) : (45.5 + 2.3 * ((p.height / 2.54) - 60)).toFixed(1);
    document.getElementById('h-bmr').textContent = bmr;
    document.getElementById('h-tdee').textContent = tdee;
    document.getElementById('h-bmi').textContent = bmi + ' – ' + getBMICategory(parseFloat(bmi));
    document.getElementById('h-ibw').textContent = ibw + ' kg';

    document.getElementById('nutrientGoals').innerHTML = [
        { name: 'Calories', val: tdee + ' kcal', color: '#ff6b6b' },
        { name: 'Protein', val: proteinGoal + 'g', color: '#4ecdc4' },
        { name: 'Carbohydrates', val: carbGoal + 'g', color: '#ffd93d' },
        { name: 'Fat', val: fatGoal + 'g', color: '#a29bfe' },
        { name: 'Fibre', val: '25–30g', color: '#00b894' },
        { name: 'Water', val: '2–3 litres', color: '#74b9ff' },
    ].map(n => `
        <div class="nutrient-item">
            <div class="nutrient-left">
                <div class="nutrient-dot" style="background:${n.color}"></div>
                <span class="nutrient-name">${n.name}</span>
            </div>
            <span class="nutrient-val">${n.val}</span>
        </div>
    `).join('');

    const insights = getHealthInsights(parseFloat(bmi), p, tdee);
    document.getElementById('healthInsights').innerHTML = insights.map(i => `
        <div class="insight-item"><i class="fas fa-${i.icon}"></i><span>${i.text}</span></div>
    `).join('');

    document.getElementById('wellnessGoals').innerHTML = [
        { icon: 'tint', color: '#74b9ff', label: 'Daily Water', val: '2.5 L' },
        { icon: 'moon', color: '#a29bfe', label: 'Sleep', val: '7–8 hrs' },
        { icon: 'walking', color: '#00b894', label: 'Steps', val: '8,000+' },
        { icon: 'apple-alt', color: '#ffd93d', label: 'Fruits/Veg', val: '5 servings' },
        { icon: 'clock', color: '#ff6b6b', label: 'Meal Gaps', val: '3–4 hrs' },
        { icon: 'ban', color: '#fd79a8', label: 'Junk Food', val: '< once/wk' },
    ].map(w => `
        <div class="wellness-item">
            <i class="fas fa-${w.icon}" style="color:${w.color}"></i>
            <h5>${w.label}</h5>
            <strong>${w.val}</strong>
        </div>
    `).join('');

    // Workout View
    const burnGoal = Math.round(tdee * 0.2);
    document.getElementById('w-burn').textContent = burnGoal + ' kcal';
    document.getElementById('workoutList').innerHTML = getWorkouts(p).map(w => `
        <div class="workout-item">
            <div class="workout-item-icon" style="background:rgba(${w.rgb},0.15);color:rgb(${w.rgb})"><i class="fas fa-${w.icon}"></i></div>
            <div class="workout-item-info"><h5>${w.name}</h5><span>${w.duration} • ${w.burn} kcal burn</span></div>
            <span class="workout-item-badge" style="background:rgba(${w.rgb},0.15);color:rgb(${w.rgb})">${w.level}</span>
        </div>
    `).join('');

    document.getElementById('workoutNutrition').innerHTML = `
        <div class="wn-section">
            <h5><i class="fas fa-bolt"></i> Pre-Workout (30 min before)</h5>
            <div class="wn-items">
                ${['1 Banana + 1 glass water', p.profile?.dietPref === 'veg' ? 'Oats with milk' : 'Egg + toast', 'Handful of almonds (light energy)'].map(i => `<div class="wn-item">${i}</div>`).join('')}
            </div>
        </div>
        <div class="wn-section">
            <h5><i class="fas fa-redo"></i> Post-Workout (within 1 hr)</h5>
            <div class="wn-items">
                ${[p.profile?.dietPref !== 'veg' ? 'Chicken breast + rice' : 'Paneer + dal + roti', 'Curd with banana', 'Protein-rich dal with roti'].map(i => `<div class="wn-item">${i}</div>`).join('')}
            </div>
        </div>
    `;

    // Budget View
    const perMeal = (parseFloat(dailyBudget) / 3).toFixed(0);
    document.getElementById('b-monthly').textContent = '₹' + p.monthlyBudget;
    document.getElementById('b-daily').textContent = '₹' + dailyBudget;
    document.getElementById('b-per-meal').textContent = '₹' + perMeal;

    document.getElementById('budgetBreakdown').innerHTML = [
        { icon: 'sun', label: 'Breakfast budget', val: '₹' + Math.round(parseFloat(dailyBudget) * 0.25) },
        { icon: 'cloud-sun', label: 'Lunch budget', val: '₹' + Math.round(parseFloat(dailyBudget) * 0.4) },
        { icon: 'moon', label: 'Dinner budget', val: '₹' + Math.round(parseFloat(dailyBudget) * 0.35) },
        { icon: 'calendar-alt', label: 'Weekly food budget', val: '₹' + (parseFloat(dailyBudget) * 7).toFixed(0) },
    ].map(b => `
        <div class="bb-item">
            <div class="bb-left"><i class="fas fa-${b.icon}"></i>${b.label}</div>
            <span class="bb-val">${b.val}</span>
        </div>
    `).join('');

    document.getElementById('savingsTips').innerHTML = [
        'Buy dal, rice & oats in bulk to save 20–30%.',
        'Seasonal vegetables cost 40% less than off-season.',
        'Home-cooked eggs are cheapest high-protein option at ₹6/egg.',
        'Peanuts offer the best protein-per-rupee ratio.',
        'Plan meals for the week to avoid impulse purchases.',
    ].map(t => `<div class="tip-item"><i class="fas fa-lightbulb"></i><span>${t}</span></div>`).join('');
}

function macroBand(name, goal, unit, color, pct) {
    return `
        <div class="macro-bar-item">
            <div class="macro-bar-label">
                <span>${name}</span>
                <span>${goal}${unit} / day</span>
            </div>
            <div class="macro-bar-track">
                <div class="macro-bar-fill" style="width:${pct}%;background:${color}"></div>
            </div>
        </div>
    `;
}

function showDashboardView(view) {
    document.querySelectorAll('.dash-view').forEach(v => { v.classList.remove('active-view'); });
    document.getElementById('view-' + view).classList.add('active-view');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const titles = { overview: 'Overview', health: 'Health Analytics', workout: 'Workout Planner', budget: 'Budget Tracker' };
    const subs = { overview: 'Your daily nutrition snapshot', health: 'Body composition & targets', workout: 'Fitness & activity plan', budget: 'Food cost breakdown' };
    document.getElementById('pageTitle').textContent = titles[view] || 'Dashboard';
    document.getElementById('pageSub').textContent = subs[view] || '';
}

// ==================== CALCULATIONS ====================
function calcBMR() {
    const p = currentUser.profile;
    let bmr;
    if (p.gender === 'male') {
        bmr = 88.362 + (13.397 * p.weight) + (4.799 * p.height) - (5.677 * p.age);
    } else {
        bmr = 447.593 + (9.247 * p.weight) + (3.098 * p.height) - (4.330 * p.age);
    }
    return Math.round(bmr);
}

function calcTDEE() {
    const p = currentUser.profile;
    let tdee = calcBMR() * p.activity;
    switch (p.goal) {
        case 'loss': tdee *= 0.85; break;
        case 'gain': tdee *= 1.15; break;
    }
    return Math.round(tdee);
}

function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

function getHealthScore(bmi, p) {
    let score = 70;
    if (bmi >= 18.5 && bmi < 25) score += 20;
    else if (bmi >= 25 && bmi < 30) score += 5;
    if (p.activity >= 1.55) score += 10;
    else if (p.activity >= 1.375) score += 5;
    score = Math.min(100, score);
    const labels = { 90: ['Excellent', 'Outstanding health profile'], 75: ['Good', 'Room for small improvements'], 0: ['Fair', 'Focus on nutrition & activity'] };
    for (const [thresh, [label, desc]] of Object.entries(labels).sort((a,b) => b[0]-a[0])) {
        if (score >= thresh) return { score, label, desc };
    }
    return { score, label: 'Fair', desc: 'Let\'s work on improving this!' };
}

function getHealthInsights(bmi, p, tdee) {
    const insights = [];
    if (bmi < 18.5) insights.push({ icon: 'exclamation-triangle', text: 'You are underweight. Increase calorie intake by 300–500 kcal/day.' });
    else if (bmi >= 25 && bmi < 30) insights.push({ icon: 'exclamation-circle', text: 'Slightly overweight. Aim for a 300–500 kcal daily deficit.' });
    else if (bmi >= 30) insights.push({ icon: 'exclamation-circle', text: 'BMI indicates obesity. Consult a nutritionist for a personalised plan.' });
    else insights.push({ icon: 'check-circle', text: 'Your BMI is in the healthy range. Maintain your current lifestyle.' });

    if (p.goal === 'loss') insights.push({ icon: 'arrow-down', text: `Target ${tdee} kcal/day. Create deficit through diet + exercise.` });
    if (p.goal === 'gain') insights.push({ icon: 'arrow-up', text: `Target ${tdee} kcal/day. Prioritise protein (${Math.round(p.weight*1.6)}g/day) for muscle gain.` });
    if (p.dietPref === 'veg') insights.push({ icon: 'leaf', text: 'Vegetarians: combine dal + rice for complete amino acids. Include paneer daily.' });
    insights.push({ icon: 'clock', text: 'Eat every 3–4 hours. Avoid skipping meals to keep metabolism active.' });
    return insights;
}

function getWorkouts(p) {
    const base = [
        { name: 'Brisk Walking', icon: 'walking', duration: '30 min', burn: 180, level: 'Easy', rgb: '78,205,196' },
        { name: 'Yoga / Stretching', icon: 'spa', duration: '30 min', burn: 120, level: 'Easy', rgb: '162,155,254' },
        { name: 'Bodyweight HIIT', icon: 'dumbbell', duration: '25 min', burn: 280, level: 'Medium', rgb: '255,107,107' },
        { name: 'Cycling', icon: 'bicycle', duration: '45 min', burn: 320, level: 'Medium', rgb: '253,203,110' },
        { name: 'Swimming', icon: 'swimmer', duration: '45 min', burn: 380, level: 'Hard', rgb: '116,185,255' },
    ];
    if (p.goal === 'loss') return [base[0], base[2], base[3], base[4]];
    if (p.goal === 'gain') return [base[2], base[0], base[1]];
    return base.slice(0, 4);
}

// ==================== DIET GENERATOR ====================
function setPeriod(period) {
    selectedPeriod = period;
    document.getElementById('btn-daily').classList.toggle('active', period === 'daily');
    document.getElementById('btn-weekly').classList.toggle('active', period === 'weekly');
    updateBudgetPreview();
}

function updateBudgetPreview() {
    const val = parseInt(document.getElementById('budget').value) || 0;
    if (!val) { document.getElementById('budgetPreview').textContent = ''; return; }
    const daily = selectedPeriod === 'daily' ? val : (val / 7).toFixed(0);
    document.getElementById('budgetPreview').textContent =
        selectedPeriod === 'weekly'
            ? `₹${val} per week = ₹${daily}/day → ₹${Math.round(daily/3)} per meal`
            : `₹${val}/day → ₹${Math.round(val/3)} per meal`;
}

document.addEventListener('DOMContentLoaded', () => {
    const budgetInput = document.getElementById('budget');
    if (budgetInput) budgetInput.addEventListener('input', updateBudgetPreview);
});

function showDietGenerator() {
    showSection('dietGenerator');
    document.getElementById('dietResult').classList.add('hidden');
}

function showDietImprover() {
    showSection('dietImprover');
    document.getElementById('improveResult').classList.add('hidden');
}

function handleDietGenerate() {
    const budget = parseInt(document.getElementById('budget').value);
    if (!budget || budget < 20) { alert('Please enter a valid budget (min ₹20).'); return; }
    document.getElementById('generateText').style.opacity = '0';
    document.getElementById('loadingDots').classList.remove('hidden');
    setTimeout(() => generateDietPlan(budget, selectedPeriod === 'daily'), 1800);
}

function generateDietPlan(budget, isDaily) {
    const dailyBudget = isDaily ? budget : Math.round(budget / 7);
    const tdee = calcTDEE();
    const pref = currentUser.profile.dietPref;
    const available = foods.filter(f => pref === 'veg' ? f.veg : true);

    // Budget allocation: BF 25%, Lunch 40%, Dinner 35%
    const bfBudget = Math.round(dailyBudget * 0.25);
    const lunchBudget = Math.round(dailyBudget * 0.40);
    const dinnerBudget = Math.round(dailyBudget * 0.35);

    const bfFoods = available.filter(f => BREAKFAST_FOODS.some(b => f.name.includes(b)));
    const lunchFoods = available.filter(f => LUNCH_FOODS.some(b => f.name.includes(b)));
    const dinnerFoods = available.filter(f => DINNER_FOODS.some(b => f.name.includes(b)));

    const breakfast = pickMeals(bfFoods, bfBudget, 3);
    const lunch = pickMeals(lunchFoods, lunchBudget, 4);
    const dinner = pickMeals(dinnerFoods, dinnerBudget, 3);

    displayDietPlan({ breakfast, lunch, dinner }, tdee, dailyBudget);
}

function pickMeals(pool, budget, maxItems) {
    const sorted = [...pool].sort((a, b) => (b.protein / b.cost) - (a.protein / a.cost));
    const plan = [];
    let rem = budget;
    for (const food of sorted) {
        if (rem >= food.cost && plan.length < maxItems) {
            plan.push({ ...food });
            rem -= food.cost;
        }
    }
    return plan;
}

function displayDietPlan({ breakfast, lunch, dinner }, tdee, dailyBudget) {
    document.getElementById('loadingDots').classList.add('hidden');
    document.getElementById('generateText').style.opacity = '1';

    const all = [...breakfast, ...lunch, ...dinner];
    const totalCals = all.reduce((s, f) => s + f.calories, 0);
    const totalProt = all.reduce((s, f) => s + f.protein, 0).toFixed(1);
    const totalCost = all.reduce((s, f) => s + f.cost, 0);

    // Score
    const calScore = Math.min(100, (totalCals / tdee) * 100);
    const varScore = new Set(all.map(f => f.name)).size >= 5 ? 25 : 10;
    const score = Math.round(Math.min(100, calScore * 0.75 + varScore));

    // Animate score arc
    const arc = document.getElementById('scoreArc');
    const offset = 314 - (314 * score / 100);
    arc.style.transition = 'stroke-dashoffset 1s ease';
    arc.setAttribute('stroke-dashoffset', offset);
    document.getElementById('scoreValue').textContent = score;
    document.getElementById('scoreLabel').textContent = score >= 80 ? 'Excellent Plan!' : score >= 60 ? 'Good Plan' : 'Decent Start';
    document.getElementById('scoreDesc').textContent = `${totalCals} kcal of ${tdee} kcal target covered`;
    document.getElementById('scorePills').innerHTML = [
        { label: `${breakfast.length} breakfast items`, cls: 'good' },
        { label: `${lunch.length} lunch items`, cls: 'good' },
        { label: score >= 70 ? 'Balanced macros' : 'Needs protein', cls: score >= 70 ? 'good' : 'warn' },
    ].map(p => `<span class="score-pill ${p.cls}">${p.label}</span>`).join('');

    // Render meal sections
    renderMealSection('breakfast', breakfast, '#ffd93d');
    renderMealSection('lunch', lunch, '#4ecdc4');
    renderMealSection('dinner', dinner, '#a29bfe');

    // Update meal stats headers
    setMealStats('bf', breakfast);
    setMealStats('lunch', lunch);
    setMealStats('dinner', dinner);

    // Totals
    document.getElementById('totalCalories').textContent = totalCals;
    document.getElementById('totalProtein').textContent = totalProt + 'g';
    document.getElementById('totalCost').textContent = '₹' + totalCost;
    document.getElementById('requiredCalories').textContent = tdee;

    // Alternatives
    const alts = generateAlternatives([...breakfast, ...lunch, ...dinner]);
    document.getElementById('alternativesList').innerHTML = alts.map(a => `
        <div class="alt-item">
            <span>${a.replace}</span>
            <span><strong>${a.add}</strong> (₹${a.cost} · ${a.nutrition})</span>
        </div>
    `).join('') || '<div class="alt-item"><span>Your plan looks great! No major swaps needed.</span></div>';

    document.getElementById('dietResult').classList.remove('hidden');
    document.getElementById('dietResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderMealSection(slot, items, color) {
    const listId = slot === 'bf' ? 'breakfastItems' : slot + 'Items';
    const actualListId = slot === 'breakfast' ? 'breakfastItems' : slot + 'Items';
    const el = document.getElementById(actualListId);
    if (!items.length) {
        el.innerHTML = `<div class="meal-food-item"><span style="color:var(--text3);font-size:0.85rem">Budget too low for this meal slot.</span></div>`;
        return;
    }
    el.innerHTML = items.map(f => `
        <div class="meal-food-item">
            <div class="mfi-left">
                <div class="mfi-dot" style="background:${color}"></div>
                <div>
                    <div class="mfi-name">${f.name}</div>
                    <div class="mfi-macros">${f.calories} kcal · ${f.protein}g protein</div>
                </div>
            </div>
            <span class="mfi-cost">₹${f.cost}</span>
        </div>
    `).join('');
}

function setMealStats(slot, items) {
    const statsId = slot + 'Stats';
    const kcal = items.reduce((s, f) => s + f.calories, 0);
    const cost = items.reduce((s, f) => s + f.cost, 0);
    const el = document.getElementById(statsId);
    if (el) el.innerHTML = `
        <div class="meal-stats-inner">
            <span class="ms-chip"><i class="fas fa-fire"></i> ${kcal} kcal</span>
            <span class="ms-chip"><i class="fas fa-rupee-sign"></i> ₹${cost}</span>
        </div>
    `;
}

function generateAlternatives(plan) {
    const alts = [];
    const pref = currentUser.profile.dietPref;
    if (plan.some(p => p.name.includes('Rice')) && !plan.some(p => p.name.includes('Roti'))) {
        alts.push({ replace: 'Swap: Rice → 2 Roti', add: '2 Roti', cost: 4, nutrition: 'more fibre' });
    }
    if (pref === 'veg' && !plan.some(p => p.name.includes('Paneer'))) {
        alts.push({ replace: 'Add: Protein boost', add: '50g Paneer', cost: 25, nutrition: '+10g protein' });
    }
    if (!plan.some(p => p.name.includes('Banana'))) {
        alts.push({ replace: 'Add: Quick energy', add: '1 Banana', cost: 5, nutrition: '+90 kcal, potassium' });
    }
    if (!plan.some(p => p.name.includes('Curd'))) {
        alts.push({ replace: 'Add: Probiotics', add: 'Curd bowl', cost: 8, nutrition: '+4g protein, gut health' });
    }
    return alts;
}

function generateNewPlan() {
    document.getElementById('dietResult').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== DIET IMPROVER ====================
function handleDietImprove() {
    const mealText = document.getElementById('currentMeal').value.trim().toLowerCase();
    if (!mealText) { alert('Please describe your meal.'); return; }

    const tdee = calcTDEE();
    let totalCals = 0, totalProt = 0, totalFibre = 0, totalCost = 0;

    foods.forEach(food => {
        const keyword = food.name.toLowerCase().split(' ')[0];
        if (mealText.includes(keyword) || mealText.includes(food.name.toLowerCase().split('(')[0].trim())) {
            totalCals += food.calories;
            totalProt += food.protein;
            totalFibre += (food.fibre || 0);
            totalCost += food.cost;
        }
    });

    if (totalCals === 0) { totalCals = 300; totalProt = 8; totalFibre = 5; totalCost = 30; }

    const calPct = Math.min(100, (totalCals / (tdee * 0.35)) * 100);
    const protPct = Math.min(100, (totalProt / (currentUser.profile.weight * 0.4)) * 100);
    const fibrePct = Math.min(100, (totalFibre / 8) * 100);
    const dailyBudget = currentUser.profile.monthlyBudget / 30;
    const costPct = Math.min(100, (totalCost / (dailyBudget * 0.35)) * 100);

    setGauge('caloriesBar', 'caloriesStatus', calPct, totalCals + ' kcal');
    setGauge('proteinBar', 'proteinStatus', protPct, totalProt.toFixed(1) + 'g protein');
    setGauge('fibreBar', 'fibreStatus', fibrePct, totalFibre.toFixed(1) + 'g fibre');
    setGauge('costBar', 'costStatus', costPct, '₹' + totalCost + ' est.');

    const suggestions = [];
    if (totalProt < currentUser.profile.weight * 0.3) {
        suggestions.push({ text: 'Add Peanuts (30g) → +7.5g protein for just ₹10', icon: 'plus-circle' });
        suggestions.push({ text: 'Include an egg or paneer for complete protein', icon: 'plus-circle' });
    }
    if (totalCals < tdee * 0.25) {
        suggestions.push({ text: 'Meal is calorie-light. Add a banana (+₹5, +90 kcal)', icon: 'bolt' });
        suggestions.push({ text: 'Include a glass of milk (+₹10, +120 kcal)', icon: 'bolt' });
    }
    if (totalFibre < 5) {
        suggestions.push({ text: 'Add vegetables or chickpeas for more fibre', icon: 'leaf' });
    }
    if (suggestions.length === 0) {
        suggestions.push({ text: 'This meal looks well-balanced! Keep it up.', icon: 'check-circle' });
    }

    document.getElementById('suggestionsList').innerHTML = suggestions.map(s => `
        <div class="suggestion-item">
            <span>${s.text}</span>
            <i class="fas fa-${s.icon}" style="color:var(--accent2)"></i>
        </div>
    `).join('');

    document.getElementById('improveResult').classList.remove('hidden');
    document.getElementById('improveResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setGauge(barId, statusId, pct, label) {
    const bar = document.getElementById(barId);
    const status = document.getElementById(statusId);
    bar.className = 'gauge-fill ' + (pct < 40 ? 'low' : pct < 80 ? 'adequate' : 'high');
    bar.style.width = Math.max(5, pct) + '%';
    status.textContent = label + ' · ' + (pct < 40 ? 'Low' : pct < 80 ? 'Adequate' : 'Good');
}
