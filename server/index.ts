import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initDatabase } from "./initDb";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
    // Initialize the database
    await initDatabase();
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

  // Function to try listening on a port
  const startServer = (portToUse: number) => {
    server.listen({
      port: portToUse,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${portToUse}`);
    }).on('error', (e: NodeJS.ErrnoException) => {
      if (e.code === 'EADDRINUSE') {
        log(`Port ${portToUse} is already in use. Trying another port...`);
        // If 5000 is in use, try 5001. If 5001 is in use, try 3000
        const nextPort = portToUse === 5000 ? 5001 : (portToUse === 5001 ? 3000 : portToUse + 1);
        startServer(nextPort);
      } else {
        log(`Server error: ${e.message}`);
      }
    });
  };

  // Start with port 5000 (Replit expects this port)
  startServer(5000);
})();
