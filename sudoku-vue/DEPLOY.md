# Deploy Instructions

## 🚀 GitHub Pages Deployment

### Option 1: Automatic Deployment (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click "Settings" → "Pages"
   - Under "Source", select "GitHub Actions"
   - The workflow will automatically deploy on every push to main

3. **Your app will be available at:**
   ```
   https://yourusername.github.io/sudoku-vue
   ```

### Option 2: Manual Deployment

1. **Build and deploy:**
   ```bash
   npm run deploy
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Select "Deploy from a branch"
   - Choose "gh-pages" branch
   - Select "/ (root)" folder

## 🌐 Alternative Hosting Options

### Vercel (Recommended for Vue apps)
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect Vue.js
3. Deploy with zero configuration

### Netlify
1. Connect your GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize: `firebase init hosting`
3. Build: `npm run build`
4. Deploy: `firebase deploy`

## 📝 Environment Variables

No environment variables needed for this project.

## 🔧 Build Commands

- **Development:** `npm run dev`
- **Build:** `npm run build`
- **Preview:** `npm run preview`
- **Deploy:** `npm run deploy`
