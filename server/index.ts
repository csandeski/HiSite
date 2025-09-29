import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Production configuration checks
if (process.env.NODE_ENV === 'production') {
  // Check critical environment variables
  if (!process.env.DATABASE_URL) {
    console.error('[CRITICAL] DATABASE_URL is not set in production!');
    console.error('[CRITICAL] This will cause database connection failures');
  } else {
    console.log('[CONFIG] DATABASE_URL is configured');
  }
  
  if (!process.env.SESSION_SECRET) {
    console.warn('[WARNING] SESSION_SECRET is not set, using default (insecure for production)');
  } else {
    console.log('[CONFIG] SESSION_SECRET is configured');
  }
  
  if (!process.env.VIPERPAY_API_KEY) {
    console.warn('[WARNING] VIPERPAY_API_KEY is not set, payments will not work');
  } else {
    console.log('[CONFIG] VIPERPAY_API_KEY is configured');
  }
  
  console.log('[CONFIG] Running in PRODUCTION mode');
  console.log('[CONFIG] PORT:', process.env.PORT || '5000');
  console.log('[CONFIG] FRONTEND_URL:', process.env.FRONTEND_URL || 'not set');
  console.log('[CONFIG] COOKIE_DOMAIN:', process.env.COOKIE_DOMAIN || 'not set');
}

// Trust proxy - REQUIRED for Railway and other HTTPS proxies
// This ensures Express knows it's behind a proxy and handles secure cookies correctly
app.set('trust proxy', 1);

// CORS configuration for production
// This allows the frontend to communicate with the API from different domains
const corsOptions: cors.CorsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.FRONTEND_URL || true) // Set FRONTEND_URL in production or allow all origins
    : true, // Allow all origins in development
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Increase JSON payload limit to 10mb to handle PIX QR code images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Configure session store
const PgSession = connectPgSimple(session);

// Session configuration with production-specific logging
const sessionConfig = {
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'user_sessions',
    createTableIfMissing: true,
    // Add error handler for session store
    errorLog: (error: any) => {
      console.error('[SESSION_STORE] Database error:', error);
    }
  }),
  secret: process.env.SESSION_SECRET || 'radioplay-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax', // 'none' for cross-site in production
    domain: process.env.COOKIE_DOMAIN || undefined // Optional: set if you need specific domain
  }
};

// Log session configuration in production
if (process.env.NODE_ENV === 'production') {
  console.log('[SESSION_CONFIG] Cookie settings:', {
    secure: sessionConfig.cookie.secure,
    httpOnly: sessionConfig.cookie.httpOnly,
    sameSite: sessionConfig.cookie.sameSite,
    domain: sessionConfig.cookie.domain,
    maxAge: sessionConfig.cookie.maxAge
  });
}

app.use(session(sessionConfig));

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
      
      // Log session info for debugging in production
      if (process.env.NODE_ENV === 'production' && path.includes('points')) {
        logLine += ` [Session: ${req.sessionID?.substring(0, 8)}... User: ${req.session?.userId || 'anonymous'}]`;
      }
      
      // Don't log large responses (like PIX images) to avoid memory issues
      if (capturedJsonResponse) {
        // Check if response contains large data (like base64 images)
        const jsonStr = JSON.stringify(capturedJsonResponse);
        if (jsonStr.length < 500) {
          logLine += ` :: ${jsonStr}`;
        } else {
          // Log a summary for large responses
          logLine += ` :: [Response too large - ${Math.round(jsonStr.length / 1024)}KB]`;
        }
        
        // Log errors in detail for production debugging
        if (res.statusCode >= 400 && capturedJsonResponse.error) {
          console.error(`[API_ERROR] ${req.method} ${path}:`, {
            status: res.statusCode,
            error: capturedJsonResponse.error,
            details: capturedJsonResponse.details,
            userId: req.session?.userId,
            sessionId: req.sessionID,
            timestamp: new Date().toISOString()
          });
        }
      }

      if (logLine.length > 120) {
        logLine = logLine.slice(0, 119) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
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

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
