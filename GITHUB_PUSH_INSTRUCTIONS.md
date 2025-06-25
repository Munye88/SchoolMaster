# GitHub Push & Render Deployment Instructions

## Step 1: Prepare for GitHub Push
```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit with deployment message
git commit -m "Production deployment: Fixed instructor API, database schema, and dashboard centering"

# Add your GitHub remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy to Render
1. Go to render.com dashboard
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
   - `SENDGRID_API_KEY`: Your SendGrid API key

## Step 3: Verify Deployment
After deployment, check:
- https://YOUR_APP.onrender.com/api/instructors (should return 73 instructors)
- Dashboard loads and displays correctly
- All instructor profiles accessible

## Auto-Deployment Setup
The ensureCompleteSchema() function runs automatically on startup and will:
- Create all missing database tables
- Add any missing columns to existing tables
- Set proper defaults for status fields
- Ensure data integrity across deployments