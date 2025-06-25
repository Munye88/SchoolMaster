import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initDatabase } from "./initDb";
import { seedDatabase } from "./seed";
import { seedSchools } from "./schoolSeed";
import { seedCompleteInstructors } from "./completeInstructorSeed";
import { ensureCompleteSchema } from "./migrations/ensure-complete-schema";

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
    
    // Initialize the database with migrations
    await initDatabase();
    
    // Seed the database with initial admin user
    await seedDatabase();
    
    // Seed schools first (required for instructor foreign keys)
    await seedSchools();
    
    // Seed instructors with complete data from database export
    await seedCompleteInstructors();
  } catch (error) {
    log(`Error initializing database: ${error}`);
  }
  
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
