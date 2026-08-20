# CTS HCC Dashboard - Quick Start Guide

## ⚡ Get Running in 5 Minutes

### Step 1: Install Dependencies (1 min)
```bash
npm install
```

### Step 2: Start Development Server (1 min)
```bash
npm run dev
```

### Step 3: Open in Browser (1 min)
```
http://localhost:3000
```

### Step 4: Explore the App (2 min)

## 🔐 Demo Credentials

**Sign Up with any credentials**
- Email: `user@cts.com`
- Password: `Test@12345` (or anything with uppercase, lowercase, number)

**Or Sign In**
- Email: `user@cts.com`
- Password: `Test@12345`

## 🗺️ Navigation Guide

### Main Dashboard Areas

```
Landing Page
    ↓
Sign Up / Sign In
    ↓
Dashboard (Home)
    ├── 🏠 Dashboard - Main overview with KPIs
    ├── 👥 Members - Search and manage members
    ├── 🔍 HCC Suspecting - Find opportunities
    ├── 🧬 Diagnosis Mapping - ICD-10 codes
    ├── 📋 Documentation Gaps - Track issues
    ├── 📝 Review Queue - Approve submissions
    ├── 📊 Analytics - View data & trends
    ├── 📑 Reports - Generate reports
    ├── ⚡ Alerts - View notifications
    ├── 👨‍⚕️ Providers - Provider performance
    ├── 📁 Encounters - Visit records
    ├── 🧾 Claims - Claims data
    ├── 🎯 HCC Opportunities - Revenue items
    ├── 📈 Risk Stratification - Risk levels
    └── ⚙️ Settings - User preferences
```

## 💡 Key Features to Try

### 1. Dashboard
- View KPI cards (Members, Risk Score, Capture Rate)
- Check charts (Risk trends, HCC distribution)
- Browse recent activities

### 2. Members Page
- Use search box to find members
- View member risk scores
- Click member names to see details
- Check documentation gaps

### 3. HCC Suspecting
- See suspected opportunities
- Check confidence scores
- Filter by priority
- Review evidence

### 4. Analytics
- View HCC trends chart
- Check provider performance
- See risk distribution

### 5. Settings
- Update profile information
- Manage notifications
- Change password
- View security options

## 🎨 Interface Features

### Search Bar
Located in sidebar - search for members, HCC codes, or conditions

### Filter Buttons
Click filter icon to narrow results by:
- Priority (High/Medium/Low)
- Status (Active/Pending/Resolved)
- Date range
- Category

### Data Tables
All tables include:
- Hover effects (row highlight)
- Click for details
- Column sorting
- Pagination

### Charts
Interactive charts with:
- Hover tooltips
- Legend toggle
- Responsive sizing
- Smooth animations

### Sidebar
- Click items to navigate
- Collapse sidebar with arrow button
- Search for quick access

## 📱 Mobile View

The app works on mobile with:
- Collapsible menu
- Touch-friendly buttons
- Scrollable tables
- Responsive layout

**Open on mobile**: Visit same URL on phone/tablet

## 🚀 Next Steps

### To Customize

1. **Change Colors**
   - Edit `src/index.css`
   - Update `tailwind.config.js`

2. **Modify Logo**
   - Replace in `DashboardLayout.jsx`
   - Update `LandingPage.jsx`

3. **Add Company Name**
   - Search for "CTS" in all files
   - Replace with your company name

### To Add Data

1. Replace mock data in page files
2. Add API calls using fetch or axios
3. Update data fetching logic

### To Deploy

```bash
# Build for production
npm run build

# Option 1: Deploy to Vercel
vercel deploy --prod

# Option 2: Deploy to Netlify
netlify deploy --prod --dir=dist

# Option 3: Deploy to GitHub Pages
# (see INSTALLATION.md for details)
```

## 🆘 Troubleshooting

### "npm: command not found"
→ Install Node.js from nodejs.org

### "Port 3000 in use"
→ Run: `npm run dev -- --port 3001`

### "Blank page after login"
→ Check browser console (F12) for errors

### "Styles not showing"
→ Restart dev server: `Ctrl+C` then `npm run dev`

### "Slow performance"
→ Clear cache: `Ctrl+Shift+Delete` → Clear all

## 📚 Full Documentation

- **README.md** - Complete feature guide
- **INSTALLATION.md** - Detailed setup
- **PROJECT_SUMMARY.md** - Technical overview

## 🎯 Common Tasks

### Change Page Title
Edit `index.html`

### Modify Navigation Items
Edit `src/components/DashboardLayout.jsx`

### Update Colors
Edit `src/index.css` or `tailwind.config.js`

### Change Font
Edit `tailwind.config.js`

### Add New Page
1. Create file in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation item in `DashboardLayout.jsx`

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main router and auth |
| `src/components/DashboardLayout.jsx` | Sidebar & layout |
| `src/pages/Dashboard.jsx` | Main dashboard |
| `tailwind.config.js` | Styling config |
| `package.json` | Dependencies |
| `index.html` | HTML template |

## 📊 Test Data

All pages include realistic test data:
- 10,000+ members
- 200+ providers
- 1,000+ HCCs
- Monthly trends
- Performance metrics

## 🎬 Demo Flow

1. **Start**: Click "Get Started" on landing
2. **Sign Up**: Create account (any email/password)
3. **Dashboard**: View KPIs and charts
4. **Members**: Search and filter members
5. **Opportunities**: See HCC suggestions
6. **Settings**: Update preferences
7. **Sign Out**: Logout from menu

## 🏁 You're Ready!

Everything is set up and ready to use. Start exploring the application and customize as needed.

**Questions?** Check README.md or INSTALLATION.md

Happy coding! 🚀
