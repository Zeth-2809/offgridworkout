'use strict';
window.OGW = window.OGW || {};

OGW.bodyTypes = [
  { id:'ectomorph', name:'Ectomorph', emoji:'🏃', desc:'Naturally slim, fast metabolism, hard to gain mass.',
    traits:['Slim build','Fast metabolism','Struggles to gain weight','Low body fat'],
    diet:{ protein:30, carbs:50, fat:20, calories:'+500 surplus', focus:'Caloric surplus with high carbs' }, plan:'mass' },
  { id:'mesomorph', name:'Mesomorph', emoji:'💪', desc:'Athletic build, gains muscle and loses fat relatively easily.',
    traits:['Athletic build','Responds well to training','Moderate metabolism','Naturally muscular'],
    diet:{ protein:35, carbs:40, fat:25, calories:'Maintenance ±200', focus:'Balanced macros, clean eating' }, plan:'athletic' },
  { id:'endomorph', name:'Endomorph', emoji:'🏋️', desc:'Larger frame, gains muscle and fat easily, slower metabolism.',
    traits:['Stocky build','Gains fat easily','Slow metabolism','Strong naturally'],
    diet:{ protein:40, carbs:25, fat:35, calories:'-300 deficit', focus:'High protein, low carb, high fat' }, plan:'cut' }
];

OGW.workoutPlans = {
  mass:    { name:'Mass Builder',         goal:'Build muscle mass',        sessions:4, rest:'60–90 sec', schedule:['Chest & Triceps','Back & Biceps','REST','Legs & Core','Shoulders & Arms','REST','REST'] },
  athletic:{ name:'Athletic Performance', goal:'Strength & conditioning',  sessions:5, rest:'45–60 sec', schedule:['Upper Power','Lower Power','REST','Upper Hypertrophy','Lower Hypertrophy','Conditioning','REST'] },
  cut:     { name:'Fat Burner',           goal:'Lose fat, keep muscle',    sessions:5, rest:'30–45 sec', schedule:['Full Body A','Cardio HIIT','Full Body B','Cardio Steady','Full Body C','Active REST','REST'] },
  home:    { name:'Home Warrior',         goal:'No equipment needed',      sessions:4, rest:'45 sec',    schedule:['Push Day','Pull Day','REST','Legs & Core','Full Body','REST','REST'] }
};

OGW.muscleGroups = [
  { id:'chest',     name:'Chest',     emoji:'💪', color:'#E8FF00' },
  { id:'back',      name:'Back',      emoji:'🔙', color:'#00FFB3' },
  { id:'shoulders', name:'Shoulders', emoji:'🏗️', color:'#FF6B6B' },
  { id:'arms',      name:'Arms',      emoji:'🦾', color:'#FFB347' },
  { id:'legs',      name:'Legs',      emoji:'🦵', color:'#B347FF' },
  { id:'core',      name:'Core',      emoji:'⚡', color:'#47C8FF' },
  { id:'cardio',    name:'Cardio',    emoji:'🏃', color:'#FF47B3' },
  { id:'home',      name:'Home',      emoji:'🏠', color:'#47FF8A' }
];

OGW.exercises = [
  { id:'bench-press',     muscle:'chest',     name:'Bench Press',       type:'Compound',  level:'Beginner',   sets:'4', reps:'8–12', rest:'90 sec',
    desc:'Lie flat on bench, grip bar slightly wider than shoulders. Lower bar to mid-chest, press back up. Keep feet flat, natural arch.',
    tips:['Retract shoulder blades','Bar path slightly diagonal','2 sec on the way down'], svg:'default_figure' },
  { id:'incline-press',   muscle:'chest',     name:'Incline DB Press',  type:'Compound',  level:'Beginner',   sets:'3', reps:'10–12', rest:'75 sec',
    desc:'Set bench 30–45°. Press dumbbells from upper-chest level, elbows at 45°. Focus on upper chest contraction.',
    tips:['Dont flare elbows wide','Touch dumbbells at top','Slow negative'], svg:'default_figure' },
  { id:'push-up',         muscle:'chest',     name:'Push-Up',           type:'Compound',  level:'Beginner',   sets:'3', reps:'15–20', rest:'45 sec',
    desc:'Hands slightly wider than shoulders, body straight. Lower chest to 1 inch from floor, press up explosively.',
    tips:['Engage core throughout','Dont let hips sag','Wide=chest, narrow=triceps'], svg:'pushup' },
  { id:'cable-fly',       muscle:'chest',     name:'Cable Fly',         type:'Isolation', level:'Intermediate',sets:'3', reps:'12–15', rest:'60 sec',
    desc:'Stand between cables at shoulder height. Bring handles together in a hugging arc. Squeeze chest at peak.',
    tips:['Slight forward lean','Dont lock elbows','Feel stretch at bottom'], svg:'default_figure' },
  { id:'pull-up',         muscle:'back',      name:'Pull-Up',           type:'Compound',  level:'Intermediate',sets:'4', reps:'5–10', rest:'90 sec',
    desc:'Hang from bar overhand. Pull elbows down until chin clears bar. Control descent fully.',
    tips:['Initiate with lats','No swinging','Dead hang between reps'], svg:'pullup' },
  { id:'barbell-row',     muscle:'back',      name:'Barbell Row',       type:'Compound',  level:'Beginner',   sets:'4', reps:'8–10', rest:'90 sec',
    desc:'Hinge at hips, back flat. Pull bar to lower ribs, elbows close. Squeeze upper back at top.',
    tips:['Keep back flat','Pull to belly button','Brace core'], svg:'deadlift' },
  { id:'lat-pulldown',    muscle:'back',      name:'Lat Pulldown',      type:'Compound',  level:'Beginner',   sets:'4', reps:'10–12', rest:'75 sec',
    desc:'Overhand wide grip. Pull bar to upper chest, elbows pointing down, slight lean back.',
    tips:['Depress scapula first','No momentum','Full stretch at top'], svg:'pullup' },
  { id:'deadlift',        muscle:'back',      name:'Deadlift',          type:'Compound',  level:'Intermediate',sets:'4', reps:'5–6', rest:'120 sec',
    desc:'Bar over mid-foot. Drive floor away keeping bar close. Lock out hips at top.',
    tips:['Learn form before adding weight','Bar stays close to shins','Smooth initiation'], svg:'deadlift' },
  { id:'ohp',             muscle:'shoulders', name:'Overhead Press',    type:'Compound',  level:'Beginner',   sets:'4', reps:'8–10', rest:'90 sec',
    desc:'Bar at collarbone. Press overhead until arms fully extended.',
    tips:['Brace core hard','Dont hyperextend back','Grip slightly wider than shoulders'], svg:'default_figure' },
  { id:'lateral-raise',   muscle:'shoulders', name:'Lateral Raise',     type:'Isolation', level:'Beginner',   sets:'4', reps:'12–15', rest:'45 sec',
    desc:'Hold dumbbells at sides. Raise arms to shoulder height. Lead with elbows. Lower slowly.',
    tips:['Slight forward lean','Lighter weight, strict form','Pause at top'], svg:'default_figure' },
  { id:'barbell-curl',    muscle:'arms',      name:'Barbell Curl',      type:'Isolation', level:'Beginner',   sets:'4', reps:'10–12', rest:'60 sec',
    desc:'Underhand grip. Curl to chin, squeeze bicep. Lower under control — full extension.',
    tips:['Elbows fixed at sides','Full range of motion','Slow negative'], svg:'default_figure' },
  { id:'skull-crusher',   muscle:'arms',      name:'Skull Crusher',     type:'Isolation', level:'Intermediate',sets:'3', reps:'10–12', rest:'60 sec',
    desc:'Lie on bench, bar extended. Bend elbows lowering bar toward forehead. Extend back.',
    tips:['Upper arms stationary','EZ bar for wrist comfort','Great mass builder'], svg:'default_figure' },
  { id:'tricep-pushdown', muscle:'arms',      name:'Tricep Pushdown',   type:'Isolation', level:'Beginner',   sets:'3', reps:'12–15', rest:'45 sec',
    desc:'Cable at head height. Push bar down until arms fully extended. Elbows stay at sides.',
    tips:['Keep elbows pinned','Full extension','Slow return'], svg:'default_figure' },
  { id:'squat',           muscle:'legs',      name:'Barbell Squat',     type:'Compound',  level:'Beginner',   sets:'4', reps:'8–10', rest:'120 sec',
    desc:'Bar on upper traps, feet shoulder-width. Squat until thighs parallel. Drive through heels.',
    tips:['Chest up, core braced','Knees track over toes','King of all exercises'], svg:'squat' },
  { id:'rdl',             muscle:'legs',      name:'Romanian Deadlift', type:'Compound',  level:'Intermediate',sets:'4', reps:'10–12', rest:'90 sec',
    desc:'Slight knee bend, hinge forward, bar slides down legs. Feel hamstring stretch.',
    tips:['Back stays flat','Feel the hamstring stretch','Dont round lower back'], svg:'deadlift' },
  { id:'lunge',           muscle:'legs',      name:'Walking Lunge',     type:'Compound',  level:'Beginner',   sets:'3', reps:'12 each', rest:'60 sec',
    desc:'Step forward, lower back knee toward floor. Front thigh parallel to floor.',
    tips:['Keep torso upright','Big step forward','Add dumbbells to progress'], svg:'squat' },
  { id:'calf-raise',      muscle:'legs',      name:'Calf Raise',        type:'Isolation', level:'Beginner',   sets:'4', reps:'15–20', rest:'45 sec',
    desc:'Stand on edge of step. Rise onto toes high. Lower heels below step for full stretch.',
    tips:['Full range of motion','Slow and controlled','Calves love high reps'], svg:'default_figure' },
  { id:'plank',           muscle:'core',      name:'Plank',             type:'Isometric', level:'Beginner',   sets:'3', reps:'30–60s', rest:'45 sec',
    desc:'Forearms on floor, body straight from head to heels. Breathe normally throughout.',
    tips:['Dont let hips sag or rise','Squeeze glutes','Build time gradually'], svg:'plank' },
  { id:'crunch',          muscle:'core',      name:'Crunch',            type:'Isolation', level:'Beginner',   sets:'3', reps:'15–20', rest:'45 sec',
    desc:'Lie on back, knees bent. Crunch upper body up. Lower slowly. Short range of motion.',
    tips:['Dont pull on neck','Exhale as you crunch','Feel abs contract'], svg:'default_figure' },
  { id:'leg-raise',       muscle:'core',      name:'Leg Raise',         type:'Compound',  level:'Intermediate',sets:'3', reps:'10–15', rest:'60 sec',
    desc:'Lie flat or hang. Raise legs to 90° using lower abs. Control the descent.',
    tips:['Posterior pelvic tilt at top','Bend knees if too hard','Great lower abs'], svg:'default_figure' },
  { id:'hiit',            muscle:'cardio',    name:'HIIT Sprint',       type:'Cardio',    level:'Intermediate',sets:'8', reps:'20s ON / 10s OFF', rest:'See protocol',
    desc:'All-out sprint 20 seconds. Rest 10 seconds. 8 rounds = 4 minutes. Best fat-burning protocol.',
    tips:['TRUE all-out effort','Scale to jogging if needed','Do after weights or separate'], svg:'default_figure' },
  { id:'burpee',          muscle:'cardio',    name:'Burpee',            type:'Full Body', level:'Intermediate',sets:'4', reps:'10', rest:'60 sec',
    desc:'Squat, kick to plank, push-up, jump back, jump up with arms overhead.',
    tips:['Modify by stepping','Ultimate full-body move','Add tuck jump for intensity'], svg:'pushup' },
  { id:'home-pushup',     muscle:'home',      name:'Push-Up Variations',type:'Push',      level:'Beginner',   sets:'4', reps:'15–20', rest:'45 sec',
    desc:'Wide (chest), narrow (triceps), decline (upper chest), incline (lower chest). All variations count.',
    tips:['Knee → Standard → Diamond → Archer','No equipment needed','Matches gym results'], svg:'pushup' },
  { id:'home-squat',      muscle:'home',      name:'Bodyweight Squat',  type:'Squat',     level:'Beginner',   sets:'4', reps:'20', rest:'45 sec',
    desc:'Feet shoulder-width, squat deep. Add jump for plyometric. Single-leg for advanced.',
    tips:['Go below parallel','Add pause at bottom','Pistol squat = ultimate goal'], svg:'squat' },
  { id:'home-glute',      muscle:'home',      name:'Glute Bridge',      type:'Hip Hinge', level:'Beginner',   sets:'4', reps:'15–20', rest:'45 sec',
    desc:'Lie on back, knees bent. Drive hips up, squeeze glutes hard at top. Hold 1–2 seconds.',
    tips:['Single leg = 2x harder','Add weight for progression','Great glute activator'], svg:'default_figure' }
];

OGW.foods = [
  { id:'chicken-breast', name:'Chicken Breast',   cat:'protein', emoji:'🍗', per100:{ cal:165, p:31,  c:0,   f:3.6 }},
  { id:'salmon',         name:'Salmon',           cat:'protein', emoji:'🐟', per100:{ cal:208, p:20,  c:0,   f:13  }},
  { id:'eggs',           name:'Whole Eggs',       cat:'protein', emoji:'🥚', per100:{ cal:155, p:13,  c:1.1, f:11  }},
  { id:'tuna',           name:'Tuna (canned)',    cat:'protein', emoji:'🐠', per100:{ cal:116, p:26,  c:0,   f:1   }},
  { id:'beef-lean',      name:'Lean Beef',        cat:'protein', emoji:'🥩', per100:{ cal:250, p:26,  c:0,   f:15  }},
  { id:'turkey',         name:'Turkey Breast',    cat:'protein', emoji:'🦃', per100:{ cal:135, p:30,  c:0,   f:1   }},
  { id:'greek-yogurt',   name:'Greek Yogurt',     cat:'protein', emoji:'🥛', per100:{ cal:59,  p:10,  c:3.6, f:0.4 }},
  { id:'cottage-cheese', name:'Cottage Cheese',   cat:'protein', emoji:'🧀', per100:{ cal:98,  p:11,  c:3.4, f:4.3 }},
  { id:'whey',           name:'Whey Protein',     cat:'protein', emoji:'💊', per100:{ cal:380, p:80,  c:8,   f:4   }},
  { id:'shrimp',         name:'Shrimp',           cat:'protein', emoji:'🦐', per100:{ cal:99,  p:24,  c:0,   f:0.3 }},
  { id:'rice-white',     name:'White Rice',       cat:'carbs',   emoji:'🍚', per100:{ cal:130, p:2.7, c:28,  f:0.3 }},
  { id:'rice-brown',     name:'Brown Rice',       cat:'carbs',   emoji:'🟫', per100:{ cal:123, p:2.6, c:26,  f:1   }},
  { id:'oats',           name:'Rolled Oats',      cat:'carbs',   emoji:'🌾', per100:{ cal:389, p:17,  c:66,  f:7   }},
  { id:'sweet-potato',   name:'Sweet Potato',     cat:'carbs',   emoji:'🍠', per100:{ cal:86,  p:1.6, c:20,  f:0.1 }},
  { id:'banana',         name:'Banana',           cat:'carbs',   emoji:'🍌', per100:{ cal:89,  p:1.1, c:23,  f:0.3 }},
  { id:'pasta',          name:'Pasta (cooked)',   cat:'carbs',   emoji:'🍝', per100:{ cal:131, p:5,   c:25,  f:1.1 }},
  { id:'bread',          name:'Whole Wheat Bread',cat:'carbs',   emoji:'🍞', per100:{ cal:247, p:13,  c:41,  f:3.4 }},
  { id:'quinoa',         name:'Quinoa',           cat:'carbs',   emoji:'🌿', per100:{ cal:120, p:4.4, c:22,  f:1.9 }},
  { id:'broccoli',       name:'Broccoli',         cat:'veggies', emoji:'🥦', per100:{ cal:34,  p:2.8, c:7,   f:0.4 }},
  { id:'spinach',        name:'Spinach',          cat:'veggies', emoji:'🥬', per100:{ cal:23,  p:2.9, c:3.6, f:0.4 }},
  { id:'cucumber',       name:'Cucumber',         cat:'veggies', emoji:'🥒', per100:{ cal:15,  p:0.7, c:3.6, f:0.1 }},
  { id:'tomato',         name:'Tomato',           cat:'veggies', emoji:'🍅', per100:{ cal:18,  p:0.9, c:3.9, f:0.2 }},
  { id:'pepper',         name:'Bell Pepper',      cat:'veggies', emoji:'🫑', per100:{ cal:31,  p:1,   c:6,   f:0.3 }},
  { id:'kale',           name:'Kale',             cat:'veggies', emoji:'🥗', per100:{ cal:49,  p:4.3, c:9,   f:0.9 }},
  { id:'asparagus',      name:'Asparagus',        cat:'veggies', emoji:'🌱', per100:{ cal:20,  p:2.2, c:3.9, f:0.1 }},
  { id:'avocado',        name:'Avocado',          cat:'fats',    emoji:'🥑', per100:{ cal:160, p:2,   c:9,   f:15  }},
  { id:'olive-oil',      name:'Olive Oil',        cat:'fats',    emoji:'🫙', per100:{ cal:884, p:0,   c:0,   f:100 }},
  { id:'almonds',        name:'Almonds',          cat:'fats',    emoji:'🌰', per100:{ cal:579, p:21,  c:22,  f:50  }},
  { id:'peanut-butter',  name:'Peanut Butter',    cat:'fats',    emoji:'🥜', per100:{ cal:588, p:25,  c:20,  f:50  }},
  { id:'walnuts',        name:'Walnuts',          cat:'fats',    emoji:'🪨', per100:{ cal:654, p:15,  c:14,  f:65  }},
  { id:'coconut-oil',    name:'Coconut Oil',      cat:'fats',    emoji:'🥥', per100:{ cal:862, p:0,   c:0,   f:100 }}
];

OGW.mealPlans = {
  mass:[
    { meal:'Breakfast',  items:[{id:'oats',g:100},{id:'banana',g:120},{id:'whey',g:30},{id:'almonds',g:30}]},
    { meal:'Snack',      items:[{id:'greek-yogurt',g:200},{id:'bread',g:60}]},
    { meal:'Lunch',      items:[{id:'rice-white',g:200},{id:'chicken-breast',g:200},{id:'broccoli',g:100},{id:'olive-oil',g:10}]},
    { meal:'Pre-Workout',items:[{id:'banana',g:100},{id:'oats',g:50}]},
    { meal:'Dinner',     items:[{id:'pasta',g:200},{id:'beef-lean',g:150},{id:'spinach',g:80},{id:'olive-oil',g:15}]},
    { meal:'Before Bed', items:[{id:'cottage-cheese',g:200},{id:'peanut-butter',g:30}]}
  ],
  cut:[
    { meal:'Breakfast',  items:[{id:'eggs',g:150},{id:'spinach',g:80},{id:'tomato',g:100}]},
    { meal:'Snack',      items:[{id:'greek-yogurt',g:150},{id:'cucumber',g:100}]},
    { meal:'Lunch',      items:[{id:'sweet-potato',g:150},{id:'chicken-breast',g:200},{id:'broccoli',g:150}]},
    { meal:'Pre-Workout',items:[{id:'tuna',g:100},{id:'rice-brown',g:80}]},
    { meal:'Dinner',     items:[{id:'salmon',g:180},{id:'asparagus',g:150},{id:'quinoa',g:100}]},
    { meal:'Snack',      items:[{id:'cottage-cheese',g:150},{id:'almonds',g:20}]}
  ],
  athletic:[
    { meal:'Breakfast',  items:[{id:'oats',g:80},{id:'eggs',g:200},{id:'banana',g:100}]},
    { meal:'Snack',      items:[{id:'greek-yogurt',g:200},{id:'almonds',g:25}]},
    { meal:'Lunch',      items:[{id:'rice-brown',g:150},{id:'turkey',g:180},{id:'kale',g:80},{id:'avocado',g:60}]},
    { meal:'Pre-Workout',items:[{id:'banana',g:120},{id:'whey',g:25}]},
    { meal:'Dinner',     items:[{id:'sweet-potato',g:200},{id:'salmon',g:160},{id:'broccoli',g:120},{id:'olive-oil',g:10}]},
    { meal:'Before Bed', items:[{id:'cottage-cheese',g:180},{id:'walnuts',g:25}]}
  ]
};

OGW.calcBMR = function(w, h, a, s) {
  return s === 'male' ? (10*w + 6.25*h - 5*a + 5) : (10*w + 6.25*h - 5*a - 161);
};

OGW.activityMults = [
  { label:'Sedentary (no exercise)',           val:1.2   },
  { label:'Light (1–3 days/week)',             val:1.375 },
  { label:'Moderate (3–5 days/week)',          val:1.55  },
  { label:'Very active (6–7 days/week)',       val:1.725 },
  { label:'Athlete / physical job',            val:1.9   }
];

OGW.svgFigures = {
  pushup:`<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg"><circle cx="168" cy="22" r="11" fill="currentColor"/><line x1="168" y1="33" x2="125" y2="52" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="125" y1="52" x2="35" y2="52" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="125" y1="52" x2="100" y2="72" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="100" y1="72" x2="35" y2="72" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="35" y1="52" x2="25" y2="72" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="168" y1="33" x2="174" y2="52" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><text x="10" y="88" fill="currentColor" font-size="8" opacity="0.5">PUSH-UP — body straight</text></svg>`,
  squat:`<svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="16" r="13" fill="currentColor"/><line x1="100" y1="29" x2="100" y2="68" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="78" y1="44" x2="128" y2="44" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="100" y1="68" x2="68" y2="98" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="100" y1="68" x2="132" y2="98" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="68" y1="98" x2="62" y2="118" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="132" y1="98" x2="138" y2="118" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="52" y1="118" x2="78" y2="118" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="122" y1="118" x2="148" y2="118" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><text x="55" y="130" fill="currentColor" font-size="8" opacity="0.5">SQUAT — thighs parallel</text></svg>`,
  deadlift:`<svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="14" r="12" fill="currentColor"/><line x1="100" y1="26" x2="100" y2="72" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="72" y1="48" x2="128" y2="48" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="100" y1="72" x2="76" y2="106" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="100" y1="72" x2="124" y2="106" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="76" y1="106" x2="70" y2="120" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="124" y1="106" x2="130" y2="120" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="28" y1="97" x2="172" y2="97" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><circle cx="28" cy="97" r="9" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="172" cy="97" r="9" fill="none" stroke="currentColor" stroke-width="3"/><text x="50" y="128" fill="currentColor" font-size="8" opacity="0.5">DEADLIFT — flat back</text></svg>`,
  pullup:`<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><line x1="15" y1="10" x2="185" y2="10" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><circle cx="100" cy="34" r="12" fill="currentColor"/><line x1="100" y1="46" x2="100" y2="88" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="72" y1="56" x2="128" y2="56" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="80" y1="18" x2="72" y2="56" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="120" y1="18" x2="128" y2="56" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="100" y1="88" x2="80" y2="122" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="100" y1="88" x2="120" y2="122" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><text x="48" y="136" fill="currentColor" font-size="8" opacity="0.5">PULL-UP — chin above bar</text></svg>`,
  plank:`<svg viewBox="0 0 200 85" xmlns="http://www.w3.org/2000/svg"><circle cx="163" cy="20" r="11" fill="currentColor"/><line x1="163" y1="31" x2="25" y2="52" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><line x1="25" y1="52" x2="18" y2="68" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="163" y1="31" x2="168" y2="52" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="168" y1="52" x2="162" y2="68" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><text x="12" y="82" fill="currentColor" font-size="8" opacity="0.5">PLANK — body straight, hold</text></svg>`,
  default_figure:`<svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="18" r="14" fill="currentColor"/><line x1="100" y1="32" x2="100" y2="78" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="64" y1="52" x2="136" y2="52" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="100" y1="78" x2="76" y2="112" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="100" y1="78" x2="124" y2="112" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="76" y1="112" x2="70" y2="126" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="124" y1="112" x2="130" y2="126" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`
};

OGW.getSVG = function(k) {
  const m = {pushup:'pushup',squat:'squat',deadlift:'deadlift',pullup:'pullup',plank:'plank'};
  return OGW.svgFigures[m[k]] || OGW.svgFigures.default_figure;
};
