import { boolean, decimal, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Users table - Extended for Gigbook with role-based access
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  password: varchar("password", { length: 255 }), // hashed password for in-app auth
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "musician", "admin"]).default("user").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "suspended"]).default("pending").notNull(),
  profilePhoto: text("profilePhoto"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Musician profiles - Extended info for musicians
 */
export const musicianProfiles = mysqlTable("musician_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  stageName: varchar("stageName", { length: 255 }),
  bio: text("bio"),
  genre: varchar("genre", { length: 100 }),
  location: varchar("location", { length: 255 }),
  experienceYears: int("experienceYears").default(0),
  coverPhoto: text("coverPhoto"),
  portfolio: json("portfolio").$type<string[]>(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalReviews: int("totalReviews").default(0),
  totalGigs: int("totalGigs").default(0),
  strikes: int("strikes").default(0),
  verified: boolean("verified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Listings - Services offered by musicians
 */
export const listings = mysqlTable("listings", {
  id: int("id").autoincrement().primaryKey(),
  musicianId: int("musicianId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  priceType: mysqlEnum("priceType", ["per_hour", "per_event", "per_day"]).default("per_event").notNull(),
  duration: int("duration"), // in minutes
  photos: json("photos").$type<string[]>(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Availability - Musician available dates/times
 */
export const availability = mysqlTable("availability", {
  id: int("id").autoincrement().primaryKey(),
  musicianId: int("musicianId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD format
  startTime: varchar("startTime", { length: 5 }), // HH:MM format, null = full day
  endTime: varchar("endTime", { length: 5 }), // HH:MM format, null = full day
  isAvailable: boolean("isAvailable").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Bookings - User bookings for musician services
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  musicianId: int("musicianId").notNull(),
  listingId: int("listingId").notNull(),
  eventDate: varchar("eventDate", { length: 10 }).notNull(), // YYYY-MM-DD
  eventTime: varchar("eventTime", { length: 5 }).notNull(), // HH:MM
  eventEndTime: varchar("eventEndTime", { length: 5 }), // HH:MM
  venueName: varchar("venueName", { length: 255 }),
  venueAddress: text("venueAddress"),
  specialRequests: text("specialRequests"),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", [
    "pending_approval", // Waiting for admin approval
    "approved", // Admin approved, waiting for musician
    "confirmed", // Musician accepted
    "rejected", // Musician rejected
    "cancelled_user", // User cancelled
    "cancelled_musician", // Musician cancelled
    "completed", // Event completed
    "disputed" // Issue reported
  ]).default("pending_approval").notNull(),
  cancelledAt: timestamp("cancelledAt"),
  cancelledBy: mysqlEnum("cancelledBy", ["user", "musician", "admin"]),
  cancellationReason: text("cancellationReason"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Payments - Payment records for bookings
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  userId: int("userId").notNull(),
  musicianId: int("musicianId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).notNull(),
  musicianPayout: decimal("musicianPayout", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", [
    "pending", // Payment initiated
    "escrow", // Payment held in escrow
    "released", // Payment released to musician
    "refunded", // Full refund to user
    "partial_refund", // Partial refund (penalty applied)
    "failed" // Payment failed
  ]).default("pending").notNull(),
  penaltyAmount: decimal("penaltyAmount", { precision: 10, scale: 2 }).default("0.00"),
  penaltyReason: text("penaltyReason"),
  refundAmount: decimal("refundAmount", { precision: 10, scale: 2 }).default("0.00"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  transactionId: varchar("transactionId", { length: 255 }),
  escrowAt: timestamp("escrowAt"),
  releasedAt: timestamp("releasedAt"),
  refundedAt: timestamp("refundedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Reviews - User reviews for musicians
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull().unique(),
  userId: int("userId").notNull(),
  musicianId: int("musicianId").notNull(),
  rating: int("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Settings - Platform configuration
 */
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Activity logs - Track important actions
 */
export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }),
  entityId: int("entityId"),
  details: json("details").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type MusicianProfile = typeof musicianProfiles.$inferSelect;
export type InsertMusicianProfile = typeof musicianProfiles.$inferInsert;

export type Listing = typeof listings.$inferSelect;
export type InsertListing = typeof listings.$inferInsert;

export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = typeof availability.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

export type MusicianVerificationDocument = typeof musicianVerificationDocuments.$inferSelect;
export type InsertMusicianVerificationDocument = typeof musicianVerificationDocuments.$inferInsert;


/**
 * Musician Verification Documents - For musician identity verification
 */
export const musicianVerificationDocuments = mysqlTable("musician_verification_documents", {
  id: int("id").autoincrement().primaryKey(),
  musicianId: int("musicianId").notNull(),
  documentType: mysqlEnum("documentType", ["id", "portfolio", "certificate"]).notNull(),
  documentUrl: text("documentUrl").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  rejectionReason: text("rejectionReason"),
  adminFeedback: text("adminFeedback"), // detailed feedback from admin
  verifiedBy: int("verifiedBy"), // admin user id
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Email Verification Tokens - For email verification during registration
 */
export const emailVerificationTokens = mysqlTable("email_verification_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  code: varchar("code", { length: 6 }).notNull(), // 6-digit verification code
  expiresAt: timestamp("expiresAt").notNull(),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type InsertEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;
