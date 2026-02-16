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
  realName: varchar("realName", { length: 255 }), // Private, not shown to customers
  bio: text("bio"),
  genre: varchar("genre", { length: 100 }),
  languages: json("languages").$type<string[]>(), // ["Melayu", "English", "Mandarin"]
  location: varchar("location", { length: 255 }),
  travelRadius: int("travelRadius").default(0), // km
  travelFee: decimal("travelFee", { precision: 10, scale: 2 }), // RM per km or flat
  socialLinks: json("socialLinks").$type<{ instagram?: string; tiktok?: string; youtube?: string }>(),
  experienceYears: int("experienceYears").default(0),
  coverPhoto: text("coverPhoto"),
  portfolio: json("portfolio").$type<string[]>(),
  // Line-up & Skills
  lineupType: varchar("lineupType", { length: 50 }), // Solo, Duo, Band
  members: json("members").$type<Array<{ name: string; instrument: string }>>(),
  skills: json("skills").$type<string[]>(), // ["emcee", "DJ add-on", "acoustic"]
  setlist: json("setlist").$type<string[]>(), // Typical 10-20 songs
  // Equipment & Rider
  ownSoundSystem: boolean("ownSoundSystem").default(false),
  equipment: json("equipment").$type<string[]>(), // ["mic", "DI box", "monitor", "mixer"]
  venueRequirements: json("venueRequirements").$type<{ stageSizeMin?: string; powerSupply?: string; soundcheckDuration?: string }>(),
  techRider: text("techRider"), // PDF URL
  // Stats
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
  genre: varchar("genre", { length: 100 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  priceType: mysqlEnum("priceType", ["per_hour", "per_event", "per_day"]).default("per_event").notNull(),
  duration: int("duration"), // in minutes
  photos: json("photos").$type<string[]>(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Packages - Service packages offered by musicians
 */
export const packages = mysqlTable("packages", {
  id: int("id").autoincrement().primaryKey(),
  musicianId: int("musicianId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  eventType: varchar("eventType", { length: 100 }), // Wedding, Corporate, Birthday, etc.
  duration: int("duration").notNull(), // Total duration in minutes
  sets: int("sets").default(1), // Number of sets
  breakTime: int("breakTime").default(0), // Break time in minutes
  basePrice: decimal("basePrice", { precision: 10, scale: 2 }).notNull(),
  inclusions: json("inclusions").$type<string[]>(), // ["sound system", "request songs"]
  addOns: json("addOns").$type<Array<{ name: string; price: string }>>(), // [{name: "Extra 30 min", price: "200"}]
  rules: json("rules").$type<{
    overtimeRate?: string; // Per 30 min
    depositPercent?: number; // e.g., 30
    minLeadTime?: number; // Days, e.g., 7
    weekendOnly?: boolean;
  }>(),
  isPopular: boolean("isPopular").default(false),
  isBestValue: boolean("isBestValue").default(false),
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

/**
 * Conversations - Chat conversations between users and musicians
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  userId: int("userId").notNull(), // Customer
  musicianId: int("musicianId").notNull(),
  lastMessageAt: timestamp("lastMessageAt"),
  lastMessagePreview: text("lastMessagePreview"), // For list display
  unreadByUser: int("unreadByUser").default(0),
  unreadByMusician: int("unreadByMusician").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Messages - Individual chat messages
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(), // User or Musician
  senderRole: mysqlEnum("senderRole", ["user", "musician"]).notNull(),
  content: text("content").notNull(),
  attachmentUrl: text("attachmentUrl"), // Optional file/image attachment
  attachmentType: varchar("attachmentType", { length: 50 }), // image, document, etc
  isRead: boolean("isRead").default(false),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;


/**
 * Xendit Invoices - For tracking payment invoices
 */
export const xenditInvoices = mysqlTable("xendit_invoices", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  xenditInvoiceId: varchar("xenditInvoiceId", { length: 255 }).notNull().unique(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  commissionAmount: decimal("commissionAmount", { precision: 12, scale: 2 }).notNull(),
  musicianPayoutAmount: decimal("musicianPayoutAmount", { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["PENDING", "PAID", "EXPIRED", "FAILED"]).default("PENDING").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }), // FPX, CARD, EWALLET, etc
  invoiceUrl: text("invoiceUrl"),
  paidAt: timestamp("paidAt"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Xendit Payouts - For tracking musician payouts
 */
export const xenditPayouts = mysqlTable("xendit_payouts", {
  id: int("id").autoincrement().primaryKey(),
  musicianId: int("musicianId").notNull(),
  xenditPayoutId: varchar("xenditPayoutId", { length: 255 }).notNull().unique(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["PENDING", "PROCESSING", "COMPLETED", "FAILED"]).default("PENDING").notNull(),
  bankCode: varchar("bankCode", { length: 50 }),
  bankAccountNumber: varchar("bankAccountNumber", { length: 50 }),
  bankAccountHolder: varchar("bankAccountHolder", { length: 255 }),
  failureCode: varchar("failureCode", { length: 100 }),
  failureMessage: text("failureMessage"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Musician Bank Accounts - For storing musician payout bank details
 */
export const musicianBankAccounts = mysqlTable("musician_bank_accounts", {
  id: int("id").autoincrement().primaryKey(),
  musicianId: int("musicianId").notNull().unique(),
  bankCode: varchar("bankCode", { length: 50 }).notNull(),
  bankAccountNumber: varchar("bankAccountNumber", { length: 50 }).notNull(),
  bankAccountHolder: varchar("bankAccountHolder", { length: 255 }).notNull(),
  isVerified: boolean("isVerified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type XenditInvoice = typeof xenditInvoices.$inferSelect;
export type InsertXenditInvoice = typeof xenditInvoices.$inferInsert;
export type XenditPayout = typeof xenditPayouts.$inferSelect;
export type InsertXenditPayout = typeof xenditPayouts.$inferInsert;
export type MusicianBankAccount = typeof musicianBankAccounts.$inferSelect;
export type InsertMusicianBankAccount = typeof musicianBankAccounts.$inferInsert;
export type Package = typeof packages.$inferSelect;
export type InsertPackage = typeof packages.$inferInsert;
