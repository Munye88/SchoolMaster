# GitHub Deployment Guide for samselt.com

## Critical Files to Push

### Frontend Changes
```
client/src/pages/TestTrackerSimple.tsx
client/src/pages/Reports.tsx
```

### Backend Changes
```
server/index.ts
server/routes.ts
server/comprehensiveTestSeed.ts
server/test-scores-api.ts
```

### Configuration Files
```
render.yaml
package.json
```

## Git Commands Sequence

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Fix test tracker and reports for production - 7186 authentic records"

# Push to main branch
git push origin main
```

## Render Auto-Deploy Process

1. **GitHub Webhook Triggers**: Render detects push to main branch
2. **Build Process**: Installs dependencies and builds frontend
3. **Database Setup**: Runs migrations and seeds test scores
4. **Health Check**: Verifies /api/health endpoint responds

## Production Verification Steps

### 1. Check Test Scores API
```bash
curl https://samselt.com/api/test-scores | jq '. | length'
# Expected: 7186
```

### 2. Verify Reports Dashboard
```bash
curl https://samselt.com/api/reports/dashboard
# Expected: Real instructor/student statistics
```

### 3. Test Force Reseed (if needed)
```bash
curl -X POST https://samselt.com/api/test-scores/force-reseed
# Expected: {"success": true}
```

## Expected Production Results

- **Test Tracker**: Displays 7186 authentic test records with month/cycle navigation
- **Reports Section**: Three functional tabs (Attendance, Evaluation, Performance)
- **Dashboard**: Real-time statistics from authentic database
- **All Data**: Authentic instructor and student records maintained

## Troubleshooting Commands

If issues persist after deployment:

```bash
# Check build logs in Render dashboard
# Verify environment variables are set
# Monitor database connection status
# Check application startup logs
```

## Post-Deployment Validation

1. Login to samselt.com
2. Navigate to Test Tracker - verify 7186 records display
3. Check Reports section - confirm three tabs work
4. Verify dashboard shows authentic statistics
5. Test month/cycle navigation functionality

The deployment should resolve the issue where updates work on Replit but not on the production render website.