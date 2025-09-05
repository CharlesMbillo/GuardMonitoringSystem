import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, decimal, jsonb, uuid, index, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("guard"), // guard, supervisor, hr, admin
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`NOW()`),
});

export const sites = pgTable("sites", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  geofenceRadius: integer("geofence_radius").notNull().default(100), // meters
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  siteId: uuid("site_id").notNull().references(() => sites.id),
  name: text("name").notNull(),
  description: text("description"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`),
});

export const guards = pgTable("guards", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  employeeId: text("employee_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number"),
  siteId: uuid("site_id").references(() => sites.id),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  biometricData: jsonb("biometric_data"), // encrypted fingerprint templates
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`),
});

export const shifts = pgTable("shifts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  guardId: uuid("guard_id").notNull().references(() => guards.id),
  postId: uuid("post_id").notNull().references(() => posts.id),
  scheduledStart: timestamp("scheduled_start").notNull(),
  scheduledEnd: timestamp("scheduled_end").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, active, completed, cancelled
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`),
});

export const attendance = pgTable("attendance", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  shiftId: uuid("shift_id").notNull().references(() => shifts.id),
  guardId: uuid("guard_id").notNull().references(() => guards.id),
  clockInTime: timestamp("clock_in_time"),
  clockOutTime: timestamp("clock_out_time"),
  clockInLatitude: real("clock_in_latitude"),
  clockInLongitude: real("clock_in_longitude"),
  clockOutLatitude: real("clock_out_latitude"),
  clockOutLongitude: real("clock_out_longitude"),
  clockInBiometricScore: integer("clock_in_biometric_score"),
  clockOutBiometricScore: integer("clock_out_biometric_score"),
  status: text("status").notNull().default("pending"), // pending, verified, exception
  notes: text("notes"),
  verifiedBy: uuid("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`),
}, (table) => ({
  shiftIdx: index("attendance_shift_idx").on(table.shiftId),
  guardIdx: index("attendance_guard_idx").on(table.guardId),
}));

export const exceptions = pgTable("exceptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  attendanceId: uuid("attendance_id").notNull().references(() => attendance.id),
  type: text("type").notNull(), // late_arrival, geofence_violation, low_biometric_score, absent
  description: text("description").notNull(),
  severity: text("severity").notNull().default("medium"), // low, medium, high
  status: text("status").notNull().default("pending"), // pending, reviewed, resolved, dismissed
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: uuid("resource_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  result: text("result").notNull().default("success"), // success, failure
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`),
}, (table) => ({
  userIdx: index("audit_logs_user_idx").on(table.userId),
  createdIdx: index("audit_logs_created_idx").on(table.createdAt),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  guards: many(guards),
  auditLogs: many(auditLogs),
}));

export const sitesRelations = relations(sites, ({ many }) => ({
  posts: many(posts),
  guards: many(guards),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  site: one(sites, {
    fields: [posts.siteId],
    references: [sites.id],
  }),
  shifts: many(shifts),
}));

export const guardsRelations = relations(guards, ({ one, many }) => ({
  user: one(users, {
    fields: [guards.userId],
    references: [users.id],
  }),
  site: one(sites, {
    fields: [guards.siteId],
    references: [sites.id],
  }),
  shifts: many(shifts),
  attendance: many(attendance),
}));

export const shiftsRelations = relations(shifts, ({ one, many }) => ({
  guard: one(guards, {
    fields: [shifts.guardId],
    references: [guards.id],
  }),
  post: one(posts, {
    fields: [shifts.postId],
    references: [posts.id],
  }),
  attendance: many(attendance),
}));

export const attendanceRelations = relations(attendance, ({ one, many }) => ({
  shift: one(shifts, {
    fields: [attendance.shiftId],
    references: [shifts.id],
  }),
  guard: one(guards, {
    fields: [attendance.guardId],
    references: [guards.id],
  }),
  verifier: one(users, {
    fields: [attendance.verifiedBy],
    references: [users.id],
  }),
  exceptions: many(exceptions),
}));

export const exceptionsRelations = relations(exceptions, ({ one }) => ({
  attendance: one(attendance, {
    fields: [exceptions.attendanceId],
    references: [attendance.id],
  }),
  reviewer: one(users, {
    fields: [exceptions.reviewedBy],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSiteSchema = createInsertSchema(sites).omit({
  id: true,
  createdAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});

export const insertGuardSchema = createInsertSchema(guards).omit({
  id: true,
  createdAt: true,
});

export const insertShiftSchema = createInsertSchema(shifts).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export const insertExceptionSchema = createInsertSchema(exceptions).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Site = typeof sites.$inferSelect;
export type InsertSite = z.infer<typeof insertSiteSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Guard = typeof guards.$inferSelect;
export type InsertGuard = z.infer<typeof insertGuardSchema>;
export type Shift = typeof shifts.$inferSelect;
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Exception = typeof exceptions.$inferSelect;
export type InsertException = z.infer<typeof insertExceptionSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
