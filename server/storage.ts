import { type User, type InsertUser, type Site, type InsertSite, type Post, type InsertPost, 
         type Guard, type InsertGuard, type Shift, type InsertShift, type Attendance, 
         type InsertAttendance, type Exception, type InsertException, type AuditLog, 
         type InsertAuditLog, users, sites, posts, guards, shifts, attendance, 
         exceptions, auditLogs } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Sites
  getSites(): Promise<Site[]>;
  createSite(site: InsertSite): Promise<Site>;
  getSite(id: string): Promise<Site | undefined>;
  
  // Posts
  getPostsBySite(siteId: string): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  
  // Guards
  getGuards(): Promise<Guard[]>;
  getGuardsBySite(siteId: string): Promise<Guard[]>;
  getGuardByUserId(userId: string): Promise<Guard | undefined>;
  createGuard(guard: InsertGuard): Promise<Guard>;
  updateGuard(id: string, guard: Partial<InsertGuard>): Promise<Guard | undefined>;
  
  // Shifts
  getActiveShifts(): Promise<Shift[]>;
  getShiftsByDate(date: Date): Promise<Shift[]>;
  createShift(shift: InsertShift): Promise<Shift>;
  updateShift(id: string, shift: Partial<InsertShift>): Promise<Shift | undefined>;
  
  // Attendance
  getAttendanceByShift(shiftId: string): Promise<Attendance | undefined>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, attendance: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  getTodaysAttendance(): Promise<Attendance[]>;
  
  // Exceptions
  getPendingExceptions(): Promise<Exception[]>;
  createException(exception: InsertException): Promise<Exception>;
  updateException(id: string, exception: Partial<InsertException>): Promise<Exception | undefined>;
  
  // Audit Logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getSites(): Promise<Site[]> {
    return db.select().from(sites).where(eq(sites.isActive, true));
  }

  async createSite(site: InsertSite): Promise<Site> {
    const [newSite] = await db
      .insert(sites)
      .values(site)
      .returning();
    return newSite;
  }

  async getSite(id: string): Promise<Site | undefined> {
    const [site] = await db.select().from(sites).where(eq(sites.id, id));
    return site || undefined;
  }

  async getPostsBySite(siteId: string): Promise<Post[]> {
    return db.select().from(posts).where(and(
      eq(posts.siteId, siteId),
      eq(posts.isActive, true)
    ));
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db
      .insert(posts)
      .values(post)
      .returning();
    return newPost;
  }

  async getGuards(): Promise<Guard[]> {
    return db.select().from(guards).where(eq(guards.isActive, true));
  }

  async getGuardsBySite(siteId: string): Promise<Guard[]> {
    return db.select().from(guards).where(and(
      eq(guards.siteId, siteId),
      eq(guards.isActive, true)
    ));
  }

  async getGuardByUserId(userId: string): Promise<Guard | undefined> {
    const [guard] = await db.select().from(guards).where(eq(guards.userId, userId));
    return guard || undefined;
  }

  async createGuard(guard: InsertGuard): Promise<Guard> {
    const [newGuard] = await db
      .insert(guards)
      .values(guard)
      .returning();
    return newGuard;
  }

  async updateGuard(id: string, guard: Partial<InsertGuard>): Promise<Guard | undefined> {
    const [updatedGuard] = await db
      .update(guards)
      .set(guard)
      .where(eq(guards.id, id))
      .returning();
    return updatedGuard || undefined;
  }

  async getActiveShifts(): Promise<Shift[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return db.select().from(shifts).where(and(
      gte(shifts.scheduledStart, today),
      lte(shifts.scheduledStart, tomorrow)
    ));
  }

  async getShiftsByDate(date: Date): Promise<Shift[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return db.select().from(shifts).where(and(
      gte(shifts.scheduledStart, startOfDay),
      lte(shifts.scheduledStart, endOfDay)
    ));
  }

  async createShift(shift: InsertShift): Promise<Shift> {
    const [newShift] = await db
      .insert(shifts)
      .values(shift)
      .returning();
    return newShift;
  }

  async updateShift(id: string, shift: Partial<InsertShift>): Promise<Shift | undefined> {
    const [updatedShift] = await db
      .update(shifts)
      .set(shift)
      .where(eq(shifts.id, id))
      .returning();
    return updatedShift || undefined;
  }

  async getAttendanceByShift(shiftId: string): Promise<Attendance | undefined> {
    const [attendanceRecord] = await db.select().from(attendance)
      .where(eq(attendance.shiftId, shiftId));
    return attendanceRecord || undefined;
  }

  async createAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const [newAttendance] = await db
      .insert(attendance)
      .values(attendanceData)
      .returning();
    return newAttendance;
  }

  async updateAttendance(id: string, attendanceData: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const [updatedAttendance] = await db
      .update(attendance)
      .set(attendanceData)
      .where(eq(attendance.id, id))
      .returning();
    return updatedAttendance || undefined;
  }

  async getTodaysAttendance(): Promise<Attendance[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return db.select().from(attendance).where(and(
      gte(attendance.createdAt, today),
      lte(attendance.createdAt, tomorrow)
    ));
  }

  async getPendingExceptions(): Promise<Exception[]> {
    return db.select().from(exceptions).where(eq(exceptions.status, "pending"))
      .orderBy(desc(exceptions.createdAt));
  }

  async createException(exception: InsertException): Promise<Exception> {
    const [newException] = await db
      .insert(exceptions)
      .values(exception)
      .returning();
    return newException;
  }

  async updateException(id: string, exception: Partial<InsertException>): Promise<Exception | undefined> {
    const [updatedException] = await db
      .update(exceptions)
      .set(exception)
      .where(eq(exceptions.id, id))
      .returning();
    return updatedException || undefined;
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [newLog] = await db
      .insert(auditLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return db.select().from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
