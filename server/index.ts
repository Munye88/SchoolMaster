import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initDatabase } from "./initDb";
import { seedDatabase } from "./seed";
import { seedSchools } from "./schoolSeed";
import { seedCompleteInstructors } from "./completeInstructorSeed";
import { ensureCompleteSchema } from "./migrations/ensure-complete-schema";
import { ensureSchoolsExist } from "./migrations/ensure-schools-exist";
import { seedComprehensiveTestScores } from "./comprehensiveTestSeed";
import { pool } from "./db";
import { healthCheck } from "./health";

const app = express();
// Increase JSON body size limit to handle large base64 encoded images (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Ensure complete database schema for fresh deployments
    await ensureCompleteSchema();
    
    // CRITICAL PRODUCTION FIX: Repair schema before initialization
    const { fixProductionSchema } = await import('./productionSchemaFix');
    
    // FORCE schema fix on every startup for production environment
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER || process.env.RAILWAY_ENVIRONMENT;
    
    // PRODUCTION ENVIRONMENT DETECTION
    const isRenderProduction = process.env.RENDER || process.env.NODE_ENV === 'production';
    
    if (isRenderProduction) {
      log('🚨 RENDER PRODUCTION DETECTED: Force running comprehensive database repair...');
      
      // STEP 1: Use comprehensive production schema fix instead of manual SQL
      try {
        const { fixProductionSchema } = await import('./productionSchemaFix');
        log('🔧 Running production schema fix for Render environment...');
        await fixProductionSchema();
        log('✅ Production schema fix completed for Render');
      } catch (schemaError) {
        log('⚠️ Production schema fix error:', String(schemaError));
      }
      
      // STEP 3: Force comprehensive test seeding
      try {
        const { seedComprehensiveTestScores } = await import('./comprehensiveTestSeed');
        log('🔄 FORCE RESEEDING: Populating all test records...');
        await seedComprehensiveTestScores(true);
        log('✅ FORCE RESEED COMPLETE: All test records populated with valid foreign keys');
      } catch (seedError) {
        log('⚠️ Force reseed error:', String(seedError));
      }
      
    } else {
      // Standard schema fix for development
      log('🔧 Running standard production schema fix...');
      const schemaFixed = await fixProductionSchema();
      if (!schemaFixed) {
        log('🚨 Standard schema fix failed, continuing...');
      }
    }
    
    // Initialize the database with migrations
    await initDatabase();
    
    // Seed the database with initial admin user
    await seedDatabase();
    
    // Seed schools first (required for instructor foreign keys)
    await seedSchools();
    
    // PRODUCTION FIX: Skip problematic ensureSchoolsExist and use fixed schema
    // The productionSchemaFix already handles school creation properly
    log('📚 Skipping ensureSchoolsExist - using production schema fix instead');
    
    // Seed instructors with complete data from database export
    await seedCompleteInstructors();
    
    // Seed comprehensive test scores for all test categories
    await seedComprehensiveTestScores();
    
    // CRITICAL PRODUCTION VERIFICATION - Force reseed for Render deployment
    try {
      const { testScores } = await import('../shared/test-scores-schema');
      const { db } = await import('./db');
      const testCount = await db.select().from(testScores);
      log(`📊 PRODUCTION VERIFICATION: ${testCount.length} test records found in database`);
      
      // Always force reseed if production has insufficient data
      if (testCount.length < 7100) {
        log(`🚨 CRITICAL PRODUCTION ISSUE: Only ${testCount.length} test scores found, expected 7186`);
        log('🔄 FORCING COMPREHENSIVE PRODUCTION RESEED...');
        
        // Clear existing incomplete data first
        if (testCount.length > 0) {
          log('🗑️  Clearing incomplete test data before fresh seed...');
          await db.delete(testScores);
        }
        
        // Force comprehensive reseed with fresh data
        await seedComprehensiveTestScores(true);
        
        // Triple verification for production
        const recount = await db.select().from(testScores);
        log(`✅ PRODUCTION RESEED COMPLETE: ${recount.length} test records now available`);
        
        if (recount.length < 7000) {
          log('🆘 EMERGENCY: Production reseed failed, attempting secondary seed...');
          await seedComprehensiveTestScores(true);
          const finalCount = await db.select().from(testScores);
          log(`🔧 FINAL PRODUCTION COUNT: ${finalCount.length} test records`);
        }
      } else {
        log(`✅ PRODUCTION VERIFIED: ${testCount.length} test records confirmed`);
      }
    } catch (verifyError) {
      log(`🚨 CRITICAL ERROR verifying test scores: ${verifyError}`);
    }
  } catch (error) {
    log(`Error initializing database: ${error}`);
  }
  
  // Add health check endpoint for Render
  app.get('/api/health', healthCheck);
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT environment variable for production deployments like Render
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
  
  server.listen({
    port: port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
