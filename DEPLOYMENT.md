# Deployment Guide - GOVCIO-SAMS ELT System

## GitHub Repository Setup

### 1. Create GitHub Repository
1. Go to GitHub and create a new repository
2. Name it: `govcio-sams-elt-system`
3. Set it to private (recommended for enterprise use)
4. Don't initialize with README (we have one)

### 2. Connect Local Repository
```bash
git remote add origin https://github.com/yourusername/govcio-sams-elt-system.git
git branch -M main
git push -u origin main
```

## Production Deployment Options

### Option 1: Render.com (Recommended)
1. **Connect GitHub Repository**
   - Go to Render.com dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Build Settings**
   ```
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Set Environment Variables**
   ```
   DATABASE_URL=your-postgresql-connection-string
   SESSION_SECRET=your-session-secret-key
   OPENAI_API_KEY=your-openai-api-key
   NODE_ENV=production
   ```

4. **Database Setup**
   - Create PostgreSQL database on Render
   - Run migrations: `npm run db:push`
   - Seed initial data if needed

### Option 2: Railway
1. **Deploy from GitHub**
   - Connect Railway to your GitHub repository
   - Auto-deploy from main branch

2. **Environment Variables**
   - Set same variables as Render option
   - Railway provides PostgreSQL addon

### Option 3: Vercel + External Database
1. **Deploy Frontend**
   - Connect Vercel to GitHub repository
   - Automatic deployments from main branch

2. **Database Options**
   - Neon (PostgreSQL)
   - Supabase
   - AWS RDS

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Session Security
SESSION_SECRET=your-super-secure-session-secret

# AI Services (Optional)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Email Service (Optional)
SENDGRID_API_KEY=SG.your-sendgrid-key

# Application
NODE_ENV=production
PORT=5000
```

## Database Migration

### Automatic Migration (Recommended)
The application automatically handles database setup on startup:
- Creates tables if they don't exist
- Runs necessary migrations
- Seeds initial data (schools, admin user)

### Manual Migration
```bash
# Push schema to database
npm run db:push

# Generate migration files (if needed)
npm run db:generate

# Apply migrations
npm run db:migrate
```

## Initial Setup After Deployment

### 1. Admin Account
Default admin credentials:
- Username: `munye88`
- Password: `admin123`

**Important:** Change the password immediately after first login.

### 2. School Setup
The system comes with three pre-configured schools:
- KFNA (King Fahd Naval Academy)
- NFS East (Naval Flight School East)
- NFS West (Naval Flight School West)

### 3. Data Import
All instructor data (73 records) and student data (5 records) are preserved and will be available immediately after deployment.

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files to repository
- Use secure session secrets (minimum 32 characters)
- Rotate API keys regularly

### 2. Database Security
- Use SSL connections for database
- Regular backups
- Access control and monitoring

### 3. Application Security
- HTTPS only in production
- Rate limiting on API endpoints
- Input validation and sanitization

## Performance Optimization

### 1. Database
- Connection pooling enabled
- Query optimization
- Proper indexing

### 2. Frontend
- Build optimization with Vite
- Asset compression
- Lazy loading components

### 3. Caching
- API response caching
- Static asset caching
- Browser caching headers

## Monitoring and Maintenance

### 1. Health Checks
Application includes built-in health check endpoints:
- `/health` - Application status
- `/api/health` - API status

### 2. Logging
- Comprehensive error logging
- API request logging
- Database query logging

### 3. Backup Strategy
- Daily database backups
- File storage backups
- Configuration backups

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL format
   - Check network connectivity
   - Ensure database exists

2. **Build Failures**
   - Check Node.js version (requires 18+)
   - Verify all dependencies installed
   - Check TypeScript compilation

3. **API Errors**
   - Verify environment variables
   - Check database migrations
   - Review error logs

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.

## Support and Updates

### Version Control
- Use semantic versioning
- Tag releases in GitHub
- Maintain changelog

### Updates
1. Test changes in development
2. Create pull request
3. Deploy to staging
4. Deploy to production

## Contact Information

For deployment support:
- Review GitHub issues
- Check documentation
- Contact system administrator

---

**Note:** This deployment guide assumes familiarity with Git, GitHub, and cloud deployment platforms. Ensure all team members have appropriate access and training before production deployment.