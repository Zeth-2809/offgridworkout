# OFFGRIDWORKOUT
### Your offline fitness trainer — no internet needed after install

---

## What's inside this app

| Section | Features |
|---|---|
| 🏋️ Gym Workouts | 25+ exercises, filter by muscle group, SVG form guides, coaching tips, 1-tap logging |
| 🏠 Home Training | No-equipment exercises with full guides |
| 🥗 Body Type & Diet | Ectomorph / Mesomorph / Endomorph plans, macro targets, meal plan |
| 🧮 Meal Calculator | 30+ foods, build any meal, real-time calorie + macro counter, save meals |
| ⚡ BMR Calculator | Mifflin-St Jeor formula, TDEE, macro split, personalised advice |
| 📈 Progress Tracker | Log sessions, monthly calendar, streak tracking, AI suggestions |

---

## INSTALL ON ANDROID (5 minutes, free)

### Step 1 — Host on GitHub Pages

1. Go to **github.com** → Sign up (free)
2. Click **New repository** → Name: `offgridworkout` → Public → **Create**
3. Click **Add file → Upload files** → drag all files from this folder → **Commit changes**
4. Go to **Settings → Pages → Source: main branch** → **Save**
5. Your app is live at: `https://YOUR_USERNAME.github.io/offgridworkout/`

### Step 2 — Install on Android

1. Open **Chrome** on your Android phone
2. Go to your GitHub Pages URL above
3. Tap the **3-dot menu (⋮)** → **"Add to Home Screen"** → **Add**
4. App icon appears on your home screen — tap it to open
5. Works **100% offline** after first load — all data saved on your phone

### Step 3 — Convert to real APK (optional)

1. Go to **pwabuilder.com**
2. Enter your GitHub Pages URL
3. Click **Android** → **Download Package**
4. You get an `.apk` file you can install directly on Android

---

## INSTALL ON iOS (iPhone/iPad)

1. Open **Safari** (must be Safari, not Chrome) on iPhone
2. Go to your GitHub Pages URL
3. Tap the **Share button** (box with arrow) → **"Add to Home Screen"**
4. App appears on home screen and works offline

---

## File structure

```
offgridworkout/
├── index.html      — App shell, all 6 pages
├── style.css       — Mobile-first CSS, dark + light mode
├── app.js          — All logic, localStorage, navigation
├── data.js         — All exercises, foods, plans (offline data)
├── sw.js           — Service worker (offline caching)
├── manifest.json   — Makes it installable as an app
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

---

## All data stored locally

Every piece of data — sessions logged, meals saved, body type, BMR results, measurements — is stored in your phone's **localStorage**. No account needed. No internet needed. No server. Your data never leaves your device.

---

## Customise the app

**Add your own exercises:**
In `data.js`, add to the `OGW.exercises` array:
```js
{ id:'my-exercise', muscle:'chest', name:'My Exercise', type:'Compound', level:'Beginner',
  sets:'3', reps:'10–12', rest:'60 sec',
  desc:'Description here.', tips:['Tip 1','Tip 2'], svg:'default_figure' }
```

**Add your own foods:**
In `data.js`, add to the `OGW.foods` array:
```js
{ id:'my-food', name:'My Food', cat:'protein', emoji:'🍖',
  per100:{ cal:200, p:25, c:0, f:8 } }
```

**Change colours:**
Edit the `:root` variables at the top of `style.css`

---

## Publish to Google Play Store

1. Deploy to GitHub Pages first
2. Go to **pwabuilder.com** → enter your URL → Android → Download
3. This gives you a signed `.aab` file
4. Go to **play.google.com/console** ($25 one-time fee)
5. Create new app → Upload `.aab` → Submit for review (2–3 days)

---

*Built offline-first. No tracking. No ads. No account. Just training.*
