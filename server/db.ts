import { and, desc, eq, gte, like, lte, or, sql, gt, isNull, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  musicianProfiles,
  listings,
  availability,
  bookings,
  payments,
  reviews,
  settings,
  activityLogs,
  emailVerificationTokens,
  musicianVerificationDocuments,
  InsertMusicianProfile,
  InsertListing,
  InsertAvailability,
  InsertBooking,
  InsertPayment,
  InsertReview,
  InsertActivityLog,
  InsertEmailVerificationToken,
  InsertMusicianVerificationDocument,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "phone", "loginMethod", "profilePhoto"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
      values.status = "approved";
      updateSet.status = "approved";
    }
    if (user.status !== undefined) {
      values.status = user.status;
      updateSet.status = user.status;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByPhone(phone: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserWithPassword(data: {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role?: "user" | "musician" | "admin";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Generate a unique openId for in-app users
  const openId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  const result = await db.insert(users).values({
    openId,
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    password: data.password,
    loginMethod: "email",
    role: data.role || "user",
    status: "pending",
    lastSignedIn: new Date(),
  });
  
  return result[0].insertId;
}

export async function updateUserPassword(userId: number, hashedPassword: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserRole(userId: number, role: "user" | "musician" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function updateUserStatus(userId: number, status: "pending" | "approved" | "suspended") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ status }).where(eq(users.id, userId));
}

export async function getPendingUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(eq(users.status, "pending")).orderBy(desc(users.createdAt));
}

export async function getAllUsers(role?: "user" | "musician" | "admin") {
  const db = await getDb();
  if (!db) return [];
  if (role) {
    return db.select().from(users).where(eq(users.role, role)).orderBy(desc(users.createdAt));
  }
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// ==================== MUSICIAN PROFILE QUERIES ====================

export async function createMusicianProfile(data: InsertMusicianProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(musicianProfiles).values(data);
  return result[0].insertId;
}

export async function getMusicianProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(musicianProfiles).where(eq(musicianProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getMusicianProfileById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(musicianProfiles).where(eq(musicianProfiles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateMusicianProfile(userId: number, data: Partial<InsertMusicianProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(musicianProfiles).set(data).where(eq(musicianProfiles.userId, userId));
}

export async function getAllMusicians(filters?: { genre?: string; location?: string; search?: string }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.genre) {
    conditions.push(eq(musicianProfiles.genre, filters.genre));
  }
  if (filters?.location) {
    conditions.push(like(musicianProfiles.location, `%${filters.location}%`));
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(musicianProfiles.stageName, `%${filters.search}%`),
        like(musicianProfiles.bio, `%${filters.search}%`)
      )
    );
  }

  const query = db
    .select({
      profile: musicianProfiles,
      user: users,
    })
    .from(musicianProfiles)
    .innerJoin(users, eq(musicianProfiles.userId, users.id))
    .where(and(eq(users.status, "approved"), ...conditions))
    .orderBy(desc(musicianProfiles.rating));

  return query;
}

export async function addStrikeToMusician(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(musicianProfiles)
    .set({ strikes: sql`${musicianProfiles.strikes} + 1` })
    .where(eq(musicianProfiles.userId, userId));
}

// ==================== LISTING QUERIES ====================

export async function createListing(data: InsertListing) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(listings).values(data);
  return result[0].insertId;
}

export async function getListingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getListingsByMusicianId(musicianId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(listings).where(eq(listings.musicianId, musicianId)).orderBy(desc(listings.createdAt));
}

export async function updateListing(id: number, data: Partial<InsertListing>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(listings).set(data).where(eq(listings.id, id));
}

export async function deleteListing(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(listings).set({ isActive: false }).where(eq(listings.id, id));
}

// ==================== AVAILABILITY QUERIES ====================

export async function setAvailability(data: InsertAvailability) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db
    .select()
    .from(availability)
    .where(and(eq(availability.musicianId, data.musicianId), eq(availability.date, data.date)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(availability)
      .set({ isAvailable: data.isAvailable, startTime: data.startTime, endTime: data.endTime })
      .where(eq(availability.id, existing[0].id));
    return existing[0].id;
  } else {
    const result = await db.insert(availability).values(data);
    return result[0].insertId;
  }
}

export async function getAvailabilityByMusicianId(musicianId: number, startDate?: string, endDate?: string) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(availability.musicianId, musicianId)];
  if (startDate) conditions.push(gte(availability.date, startDate));
  if (endDate) conditions.push(lte(availability.date, endDate));

  return db.select().from(availability).where(and(...conditions)).orderBy(availability.date);
}

export async function checkAvailability(musicianId: number, date: string) {
  const db = await getDb();
  if (!db) return true;

  const result = await db
    .select()
    .from(availability)
    .where(and(eq(availability.musicianId, musicianId), eq(availability.date, date)))
    .limit(1);

  if (result.length === 0) return true;
  return result[0].isAvailable;
}

// ==================== BOOKING QUERIES ====================

export async function createBooking(data: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bookings).values(data);
  return result[0].insertId;
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBookingsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
}

export async function getBookingsByMusicianId(musicianId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).where(eq(bookings.musicianId, musicianId)).orderBy(desc(bookings.createdAt));
}

export async function getPendingApprovalBookings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).where(eq(bookings.status, "pending_approval")).orderBy(desc(bookings.createdAt));
}

export async function getAllBookings(status?: string) {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return db
      .select()
      .from(bookings)
      .where(eq(bookings.status, status as any))
      .orderBy(desc(bookings.createdAt));
  }
  return db.select().from(bookings).orderBy(desc(bookings.createdAt));
}

export async function updateBookingStatus(
  id: number,
  status: string,
  additionalData?: { cancelledBy?: "user" | "musician" | "admin"; cancellationReason?: string; cancelledAt?: Date; completedAt?: Date }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(bookings)
    .set({ status: status as any, ...additionalData })
    .where(eq(bookings.id, id));
}

// ==================== PAYMENT QUERIES ====================

export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(payments).values(data);
  return result[0].insertId;
}

export async function getPaymentByBookingId(bookingId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(payments).where(eq(payments.bookingId, bookingId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPaymentsByMusicianId(musicianId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.musicianId, musicianId)).orderBy(desc(payments.createdAt));
}

export async function updatePaymentStatus(
  id: number,
  status: string,
  additionalData?: {
    escrowAt?: Date;
    releasedAt?: Date;
    refundedAt?: Date;
    penaltyAmount?: string;
    penaltyReason?: string;
    refundAmount?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(payments)
    .set({ status: status as any, ...additionalData })
    .where(eq(payments.id, id));
}

export async function getEscrowPayments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.status, "escrow")).orderBy(desc(payments.createdAt));
}

export async function getAllPayments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).orderBy(desc(payments.createdAt));
}

// ==================== REVIEW QUERIES ====================

export async function createReview(data: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(reviews).values(data);

  const musicianReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.musicianId, data.musicianId));

  const avgRating = musicianReviews.reduce((sum, r) => sum + r.rating, 0) / musicianReviews.length;

  await db
    .update(musicianProfiles)
    .set({
      rating: avgRating.toFixed(2),
      totalReviews: musicianReviews.length,
    })
    .where(eq(musicianProfiles.userId, data.musicianId));

  return result[0].insertId;
}

export async function getReviewsByMusicianId(musicianId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.musicianId, musicianId)).orderBy(desc(reviews.createdAt));
}

// ==================== SETTINGS QUERIES ====================

export async function getSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(settings).where(eq(settings.settingKey, key)).limit(1);
  return result.length > 0 ? result[0].settingValue : undefined;
}

export async function updateSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(settings).set({ settingValue: value }).where(eq(settings.settingKey, key));
}

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(settings);
}

// ==================== ACTIVITY LOG QUERIES ====================

export async function logActivity(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(activityLogs).values(data);
}

export async function getRecentActivity(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
}

// ==================== STATS QUERIES ====================

export async function getAdminStats() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, totalMusicians: 0, pendingApprovals: 0, totalBookings: 0, totalRevenue: "0" };

  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [musicianCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, "musician"));
  const [pendingCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.status, "pending"));
  const [bookingCount] = await db.select({ count: sql<number>`count(*)` }).from(bookings);
  const [revenue] = await db
    .select({ total: sql<string>`COALESCE(SUM(commission), 0)` })
    .from(payments)
    .where(eq(payments.status, "released"));

  return {
    totalUsers: userCount.count,
    totalMusicians: musicianCount.count,
    pendingApprovals: pendingCount.count,
    totalBookings: bookingCount.count,
    totalRevenue: revenue.total || "0",
  };
}

export async function getMusicianStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalEarnings: "0", pendingPayouts: "0", upcomingGigs: 0, totalGigs: 0 };

  const profile = await getMusicianProfileByUserId(userId);
  if (!profile) return { totalEarnings: "0", pendingPayouts: "0", upcomingGigs: 0, totalGigs: 0 };

  const [earnings] = await db
    .select({ total: sql<string>`COALESCE(SUM(musicianPayout), 0)` })
    .from(payments)
    .where(and(eq(payments.musicianId, profile.id), eq(payments.status, "released")));

  const [pending] = await db
    .select({ total: sql<string>`COALESCE(SUM(musicianPayout), 0)` })
    .from(payments)
    .where(and(eq(payments.musicianId, profile.id), eq(payments.status, "escrow")));

  const today = new Date().toISOString().split("T")[0];
  const [upcoming] = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(and(eq(bookings.musicianId, profile.id), eq(bookings.status, "confirmed"), gte(bookings.eventDate, today)));

  const [total] = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(and(eq(bookings.musicianId, profile.id), eq(bookings.status, "completed")));

  return {
    totalEarnings: earnings.total || "0",
    pendingPayouts: pending.total || "0",
    upcomingGigs: upcoming.count,
    totalGigs: total.count,
  };
}


// ==================== USER MANAGEMENT ====================

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete related data first
  await db.delete(musicianProfiles).where(eq(musicianProfiles.userId, userId));
  await db.delete(listings).where(eq(listings.musicianId, userId));
  await db.delete(bookings).where(eq(bookings.userId, userId));
  await db.delete(bookings).where(eq(bookings.musicianId, userId));
  await db.delete(payments).where(eq(payments.userId, userId));
  await db.delete(reviews).where(eq(reviews.userId, userId));
  await db.delete(reviews).where(eq(reviews.musicianId, userId));
  
  // Finally delete the user
  await db.delete(users).where(eq(users.id, userId));
}


// ==================== EMAIL VERIFICATION ====================

export async function createEmailVerificationToken(userId: number, email: string): Promise<{ token: string; code: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Generate 6-digit code and token
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const token = require("crypto").randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  await db.insert(emailVerificationTokens).values({
    userId,
    email,
    token,
    code,
    expiresAt,
  });
  
  return { token, code };
}

export async function verifyEmailToken(userId: number, code: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const token = await db
    .select()
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.userId, userId),
        eq(emailVerificationTokens.code, code),
        gt(emailVerificationTokens.expiresAt, new Date()),
        isNull(emailVerificationTokens.verifiedAt)
      )
    )
    .limit(1);
  
  if (token.length === 0) return false;
  
  // Mark as verified
  await db
    .update(emailVerificationTokens)
    .set({ verifiedAt: new Date() })
    .where(eq(emailVerificationTokens.id, token[0].id));
  
  // Update user email_verified status
  await db
    .update(users)
    .set({ updatedAt: new Date() })
    .where(eq(users.id, userId));
  
  return true;
}

export async function isEmailVerified(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const verified = await db
    .select()
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.userId, userId),
        isNotNull(emailVerificationTokens.verifiedAt)
      )
    )
    .limit(1);
  
  return verified.length > 0;
}

export async function getUnverifiedEmailTokens(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.userId, userId),
        isNull(emailVerificationTokens.verifiedAt),
        gt(emailVerificationTokens.expiresAt, new Date())
      )
    );
}


// ==================== MUSICIAN VERIFICATION DOCUMENTS ====================

export async function uploadMusicianDocument(data: InsertMusicianVerificationDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(musicianVerificationDocuments).values(data);
  return result[0].insertId;
}

export async function getMusicianDocuments(musicianId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(musicianVerificationDocuments)
    .where(eq(musicianVerificationDocuments.musicianId, musicianId))
    .orderBy(desc(musicianVerificationDocuments.createdAt));
}

export async function getMusicianDocumentsByStatus(status: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(musicianVerificationDocuments)
    .where(eq(musicianVerificationDocuments.status, status))
    .orderBy(desc(musicianVerificationDocuments.createdAt));
}

export async function approveMusicianDocument(documentId: number, adminId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const doc = await db
    .select()
    .from(musicianVerificationDocuments)
    .where(eq(musicianVerificationDocuments.id, documentId))
    .limit(1);
  
  if (doc.length === 0) throw new Error("Document not found");
  
  await db
    .update(musicianVerificationDocuments)
    .set({
      status: "approved",
      verifiedBy: adminId,
      verifiedAt: new Date(),
    })
    .where(eq(musicianVerificationDocuments.id, documentId));
  
  // Check if all required documents are approved
  const musicianId = doc[0].musicianId;
  const allDocs = await db
    .select()
    .from(musicianVerificationDocuments)
    .where(eq(musicianVerificationDocuments.musicianId, musicianId));
  
  const requiredTypes: Array<"id" | "portfolio" | "certificate"> = ["id", "portfolio"];
  const approvedDocs = allDocs.filter(d => d.status === "approved").map(d => d.documentType);
  
  if (requiredTypes.every(type => approvedDocs.includes(type))) {
    // Mark musician as verified
    await db
      .update(musicianProfiles)
      .set({ verified: true })
      .where(eq(musicianProfiles.userId, musicianId));
  }
}

export async function rejectMusicianDocument(documentId: number, adminId: number, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(musicianVerificationDocuments)
    .set({
      status: "rejected",
      rejectionReason: reason,
      verifiedBy: adminId,
      verifiedAt: new Date(),
    })
    .where(eq(musicianVerificationDocuments.id, documentId));
}

export async function getPendingVerificationDocuments() {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(musicianVerificationDocuments)
    .where(eq(musicianVerificationDocuments.status, "pending"))
    .orderBy(desc(musicianVerificationDocuments.createdAt));
}

export async function isMusicianVerified(musicianId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const profile = await db
    .select()
    .from(musicianProfiles)
    .where(eq(musicianProfiles.userId, musicianId))
    .limit(1);
  
  return profile.length > 0 && profile[0].verified === true;
}
