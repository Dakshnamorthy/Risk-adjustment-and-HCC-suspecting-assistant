# CTS HCC Dashboard - Installation & Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 16 or higher ([Download](https://nodejs.org/))
- **npm**: Comes with Node.js (or use yarn/pnpm)
- **Git**: For version control ([Download](https://git-scm.com/))
- **Code Editor**: VS Code recommended ([Download](https://code.visualstudio.com/))

### Verify Installation
```bash
node --version    # Should be v16+
npm --version     # Should be 8+
git --version     # Any recent version
```

## 🚀 Installation Steps

### Step 1: Set Up the Project

```bash
# Navigate to your projects directory
cd ~/projects  # or your preferred location

# Create project directory
mkdir cts-hcc-dashboard
cd cts-hcc-dashboard

# Copy all project files to this directory
# (All files from the repository should be here)
```

### Step 2: Install Dependencies

```bash
# Install all required packages
npm install

# Or with yarn
yarn install

# Or with pnpm
pnpm install
```

This will install:
- React 18.2.0
- React Router v6
- Tailwind CSS
- Framer Motion (animations)
- Recharts (data visualization)
- Lucide React (icons)
- Vite (build tool)

**Installation time**: ~2-3 minutes (depending on internet speed)

### Step 3: Start Development Server

```bash
# Start the development server
npm run dev

# Or with yarn
yarn dev

# Or with pnpm
pnpm dev
```

**Output:**
```
  VITE v5.0.0  ready in 245 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

### Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You'll see the professional landing page with all features.

## 🔐 Test the Application

### Landing Page
- Explore the hero section with animated elements
- View feature cards
- Check testimonials and statistics
- Click "Get Started" or "Sign Up"

### Sign Up
1. Click "Sign Up" button
2. Enter your details:
   - First Name: `John`
   - Last Name: `Smith`
   - Email: `john@cts.com`
   - Organization: `CTS Healthcare`
3. Click "Continue"
4. Create password (minimum 8 characters):
   - Must contain uppercase
   - Must contain lowercase
   - Must contain number
5. Agree to terms and create account

### Sign In
1. Go back to landing page
2. Click "Sign In"
3. Enter credentials:
   - Email: `john@cts.com`
   - Password: (whatever you created)
4. Click "Sign In"

### Dashboard Exploration
After sign in, you'll see:
- **Dashboard**: KPI cards, charts, recent activities
- **Members**: Member list with search
- **HCC Suspecting**: Opportunity identification
- **Diagnosis Mapping**: ICD-10 to HCC codes
- **Documentation Gaps**: Missing documentation tracking
- **Review Queue**: Workflow management
- **Analytics**: Charts and trends
- **Reports**: Report generation
- **Alerts**: Notification system
- **Providers**: Provider performance
- **Encounters**: Encounter records
- **Claims**: Claims management
- **HCC Opportunities**: Revenue opportunities
- **Risk Stratification**: Member segmentation
- **Settings**: User preferences

## 🏗️ Build for Production

### Create Production Build

```bash
# Build optimized production files
npm run build

# Or with yarn
yarn build

# Or with pnpm
pnpm build
```

**Output:**
```
  ✓ built in 45.23s

dist/
├── assets/
│   ├── index-xxx.js (main bundle)
│   ├── index-xxx.css (styles)
│   └── vendor-xxx.js (dependencies)
├── index.html
└── vite.svg
```

### Preview Production Build Locally

```bash
npm run preview
```

Open `http://localhost:4173` to see the production build.

## 📦 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel deploy --prod
```

3. **Follow prompts** and select project settings

### Deploy to Netlify

1. **Build the project**
```bash
npm run build
```

2. **Install Netlify CLI**
```bash
npm i -g netlify-cli
```

3. **Deploy**
```bash
netlify deploy --prod --dir=dist
```

### Deploy to GitHub Pages

1. **Update vite.config.js**
```javascript
export default defineConfig({
  base: '/cts-hcc-dashboard/',
  // ... rest of config
})
```

2. **Build and push**
```bash
npm run build
git add dist
git commit -m "Deploy to GitHub Pages"
git push origin main
```

## 🛠️ Development

### Project Structure

```
cts-hcc-dashboard/
├── src/
│   ├── pages/              # Page components
│   │   ├── LandingPage.jsx
│   │   ├── SignIn.jsx
│   │   ├── SignUp.jsx
│   │   ├── Dashboard.jsx
│   │   └── ...14 more pages
│   ├── components/         # Shared components
│   │   └── DashboardLayout.jsx
│   ├── App.jsx            # Main app router
│   ├── index.css          # Global styles
│   └── main.jsx           # Entry point
├── index.html             # HTML template
├── package.json           # Dependencies
├── vite.config.js         # Vite config
├── tailwind.config.js     # Tailwind config
├── postcss.config.js      # PostCSS config
└── README.md              # Documentation
```

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Create production build
npm run preview   # Preview production build
```

### Key Technologies

| Technology | Purpose | Version |
|-----------|---------|---------|
| React | UI Library | 18.2.0 |
| React Router | Navigation | 6.20.0 |
| Vite | Build Tool | 5.0.0 |
| Tailwind CSS | Styling | 3.3.5 |
| Framer Motion | Animations | 10.16.0 |
| Recharts | Charts | 2.10.0 |
| Lucide React | Icons | 0.294.0 |

## 🔧 Troubleshooting

### Port 3000 Already in Use

```bash
# Find process on port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Use different port
npm run dev -- --port 3001
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Styling Not Applying

```bash
# Rebuild CSS
npm run build

# Or restart dev server
npm run dev
```

### Slow Performance

```bash
# Clear cache and rebuild
rm -rf dist
npm run build
npm run preview
```

### Cache Issues in Browser

1. **Clear browser cache**: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
2. **Hard reload**: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
3. **Open DevTools**: F12 and check Network tab
4. **Disable cache**: In DevTools > Settings > Network > Disable cache

## 📱 Browser Support

The application works on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔐 Security Notes

1. **Local Storage**: Session data is stored in localStorage (browser)
2. **Demo Auth**: Currently uses demo authentication
3. **HIPAA**: Implement HIPAA-compliant data handling before production
4. **HTTPS**: Always use HTTPS in production
5. **Environment Variables**: Store sensitive data in .env files

## 📞 Getting Help

### Common Issues

**Issue**: `npm: command not found`
- **Solution**: Node.js is not installed. Download from nodejs.org

**Issue**: Port 3000 in use
- **Solution**: Use `npm run dev -- --port 3001`

**Issue**: Blank page after sign in
- **Solution**: Check browser console (F12) for errors

**Issue**: Slow performance
- **Solution**: Restart dev server and clear browser cache

### Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org)

## 🎓 Next Steps

1. **Customize Branding**: Update logo and colors in CSS
2. **Connect Backend**: Replace mock data with API calls
3. **Implement Auth**: Connect to real authentication system
4. **Add Notifications**: Implement real notification system
5. **Deploy**: Choose hosting platform and deploy

---

**Ready to go!** 🚀 Happy coding!
