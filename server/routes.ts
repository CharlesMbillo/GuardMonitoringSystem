import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertGuardSchema, insertSiteSchema, insertPostSchema, insertShiftSchema, 
         insertAttendanceSchema, insertExceptionSchema } from "@shared/schema";
import { z } from "zod";

const clockInSchema = z.object({
  shiftId: z.string().uuid(),
  latitude: z.number(),
  longitude: z.number(),
  biometricScore: z.number().min(0).max(100),
});

const clockOutSchema = z.object({
  attendanceId: z.string().uuid(),
  latitude: z.number(),
  longitude: z.number(),
  biometricScore: z.number().min(0).max(100),
});

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Guard routes
  app.get("/api/guards", async (req, res) => {
    try {
      const guards = await storage.getGuards();
      res.json(guards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch guards" });
    }
  });

  app.post("/api/guards", async (req, res) => {
    try {
      const guardData = insertGuardSchema.parse(req.body);
      const guard = await storage.createGuard(guardData);
      
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "CREATE_GUARD",
        resource: "Guard",
        resourceId: guard.id,
        details: { guardData },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      
      res.status(201).json(guard);
    } catch (error) {
      res.status(400).json({ error: "Invalid guard data" });
    }
  });

  // Sites routes
  app.get("/api/sites", async (req, res) => {
    try {
      const sites = await storage.getSites();
      res.json(sites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sites" });
    }
  });

  app.post("/api/sites", async (req, res) => {
    try {
      const siteData = insertSiteSchema.parse(req.body);
      const site = await storage.createSite(siteData);
      
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "CREATE_SITE",
        resource: "Site",
        resourceId: site.id,
        details: { siteData },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      
      res.status(201).json(site);
    } catch (error) {
      res.status(400).json({ error: "Invalid site data" });
    }
  });

  // Posts routes
  app.get("/api/sites/:siteId/posts", async (req, res) => {
    try {
      const posts = await storage.getPostsBySite(req.params.siteId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(postData);
      
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "CREATE_POST",
        resource: "Post",
        resourceId: post.id,
        details: { postData },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ error: "Invalid post data" });
    }
  });

  // Shifts routes
  app.get("/api/shifts/active", async (req, res) => {
    try {
      const shifts = await storage.getActiveShifts();
      res.json(shifts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active shifts" });
    }
  });

  app.post("/api/shifts", async (req, res) => {
    try {
      const shiftData = insertShiftSchema.parse(req.body);
      const shift = await storage.createShift(shiftData);
      
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "CREATE_SHIFT",
        resource: "Shift",
        resourceId: shift.id,
        details: { shiftData },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      
      res.status(201).json(shift);
    } catch (error) {
      res.status(400).json({ error: "Invalid shift data" });
    }
  });

  // Attendance routes
  app.get("/api/attendance/today", async (req, res) => {
    try {
      const attendance = await storage.getTodaysAttendance();
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's attendance" });
    }
  });

  app.post("/api/attendance/clock-in", async (req, res) => {
    try {
      const clockInData = clockInSchema.parse(req.body);
      
      // Validate geofencing here (simplified for now)
      // In production, you'd check against the post's coordinates and geofence radius
      
      const attendanceData = {
        shiftId: clockInData.shiftId,
        guardId: req.user?.id!, // Should get guard ID from user
        clockInTime: new Date(),
        clockInLatitude: clockInData.latitude,
        clockInLongitude: clockInData.longitude,
        clockInBiometricScore: clockInData.biometricScore,
        status: clockInData.biometricScore >= 85 ? "verified" : "exception",
      };
      
      const attendance = await storage.createAttendance(attendanceData);
      
      // Create exception if biometric score is low
      if (clockInData.biometricScore < 85) {
        await storage.createException({
          attendanceId: attendance.id,
          type: "low_biometric_score",
          description: `Biometric match score ${clockInData.biometricScore}% below threshold`,
          severity: "medium",
        });
      }
      
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "CLOCK_IN",
        resource: "Attendance",
        resourceId: attendance.id,
        details: { clockInData },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      
      res.status(201).json(attendance);
    } catch (error) {
      res.status(400).json({ error: "Failed to clock in" });
    }
  });

  app.post("/api/attendance/clock-out", async (req, res) => {
    try {
      const clockOutData = clockOutSchema.parse(req.body);
      
      const updatedAttendance = await storage.updateAttendance(clockOutData.attendanceId, {
        clockOutTime: new Date(),
        clockOutLatitude: clockOutData.latitude,
        clockOutLongitude: clockOutData.longitude,
        clockOutBiometricScore: clockOutData.biometricScore,
      });
      
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "CLOCK_OUT",
        resource: "Attendance",
        resourceId: clockOutData.attendanceId,
        details: { clockOutData },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      
      res.json(updatedAttendance);
    } catch (error) {
      res.status(400).json({ error: "Failed to clock out" });
    }
  });

  // Exceptions routes
  app.get("/api/exceptions/pending", async (req, res) => {
    try {
      const exceptions = await storage.getPendingExceptions();
      res.json(exceptions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exceptions" });
    }
  });

  app.patch("/api/exceptions/:id", async (req, res) => {
    try {
      const { status, resolution } = req.body;
      const exception = await storage.updateException(req.params.id, {
        status,
        resolution,
        reviewedBy: req.user?.id,
        reviewedAt: new Date(),
      });
      
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "REVIEW_EXCEPTION",
        resource: "Exception",
        resourceId: req.params.id,
        details: { status, resolution },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      
      res.json(exception);
    } catch (error) {
      res.status(400).json({ error: "Failed to update exception" });
    }
  });

  // Audit logs routes
  app.get("/api/audit-logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getAuditLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  // Current user guard profile
  app.get("/api/my-guard-profile", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const guard = await storage.getGuardByUserId(req.user.id);
      if (!guard) {
        return res.status(404).json({ error: "Guard profile not found" });
      }
      
      res.json(guard);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch guard profile" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received:', data);

        // Handle different message types
        switch (data.type) {
          case 'subscribe':
            // Subscribe to specific updates (attendance, exceptions, etc.)
            ws.send(JSON.stringify({ type: 'subscribed', channel: data.channel }));
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    // Send initial connection message
    ws.send(JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() }));
  });

  // Broadcast updates to all connected clients
  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Example: broadcast attendance updates
  app.post("/api/broadcast/attendance-update", (req, res) => {
    broadcast({
      type: 'attendance_update',
      data: req.body,
      timestamp: new Date().toISOString()
    });
    res.json({ success: true });
  });

  return httpServer;
}
