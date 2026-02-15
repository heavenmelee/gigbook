import { z } from "zod";
import bcrypt from "bcryptjs";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { sdk } from "./_core/sdk";
import * as db from "./db";
import { isLegitimateEmail, getDisposableEmailError } from "./utils/email-validator";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    
    register: publicProcedure
      .input(z.object({
        name: z.string().min(2, "Nama mesti sekurang-kurangnya 2 aksara"),
        email: z.string().email("Email tidak sah"),
        password: z.string().min(6, "Password mesti sekurang-kurangnya 6 aksara"),
        role: z.enum(["user", "musician"]).default("user"),
      }))
      .mutation(async ({ ctx, input }) => {
        // Validate email is not from disposable provider
        if (!isLegitimateEmail(input.email)) {
          throw new Error(getDisposableEmailError());
        }
        
        // Check if email already exists
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new Error("Email sudah didaftarkan");
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(input.password, 10);
        
        // Create user
        const userId = await db.createUserWithPassword({
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: input.role,
        });
        
        // Get the created user
        const user = await db.getUserById(userId);
        if (!user) throw new Error("Gagal mencipta akaun");
        
        // Create musician profile if role is musician
        if (input.role === "musician") {
          await db.createMusicianProfile({ userId });
        }
        
        // Create session token
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });
        
        // Set cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        
        return {
          success: true,
          sessionToken,
          user: {
            id: user.id,
            openId: user.openId,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
          },
        };
      }),
    
    login: publicProcedure
      .input(z.object({
        email: z.string().email("Email tidak sah"),
        password: z.string().min(1, "Password diperlukan"),
      }))
      .mutation(async ({ ctx, input }) => {
        // Find user by email
        const user = await db.getUserByEmail(input.email);
        if (!user) {
          throw new Error("Email atau password tidak sah");
        }
        
        // Check password
        if (!user.password) {
          throw new Error("Akaun ini tidak mempunyai password. Sila gunakan kaedah login lain.");
        }
        
        const isValidPassword = await bcrypt.compare(input.password, user.password);
        if (!isValidPassword) {
          throw new Error("Email atau password tidak sah");
        }
        
        // Update last signed in
        await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });
        
        // Create session token
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });
        
        // Set cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        
        return {
          success: true,
          sessionToken,
          user: {
            id: user.id,
            openId: user.openId,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
          },
        };
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    sendVerificationCode: protectedProcedure.mutation(async ({ ctx }) => {
      const { token, code } = await db.createEmailVerificationToken(ctx.user.id, ctx.user.email || "");
      console.log(`[Email] Verification code for ${ctx.user.email}: ${code}`);
      return { success: true, code };
    }),

    verifyEmail: protectedProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const verified = await db.verifyEmailToken(ctx.user.id, input.code);
        if (!verified) {
          throw new Error("Kod verifikasi tidak sah atau telah tamat tempoh");
        }
        return { success: true };
      }),

    isEmailVerified: protectedProcedure.query(async ({ ctx }) => {
      return db.isEmailVerified(ctx.user.id);
    })
  }),

  user: router({
    updateRole: protectedProcedure
      .input(z.object({ role: z.enum(["user", "musician"]) }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserRole(ctx.user.id, input.role);
        if (input.role === "musician") {
          const existing = await db.getMusicianProfileByUserId(ctx.user.id);
          if (!existing) {
            await db.createMusicianProfile({ userId: ctx.user.id });
          }
        }
        return { success: true };
      }),

    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserById(ctx.user.id);
    }),

    updateProfile: protectedProcedure
      .input(z.object({ name: z.string().optional(), phone: z.string().optional(), profilePhoto: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertUser({ openId: ctx.user.openId, ...input });
        return { success: true };
      }),
  }),

  musician: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return db.getMusicianProfileByUserId(ctx.user.id);
    }),

    updateProfile: protectedProcedure
      .input(z.object({
        stageName: z.string().optional(),
        bio: z.string().optional(),
        genre: z.string().optional(),
        location: z.string().optional(),
        experienceYears: z.number().optional(),
        coverPhoto: z.string().optional(),
        portfolio: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateMusicianProfile(ctx.user.id, input);
        return { success: true };
      }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
      return db.getMusicianStats(ctx.user.id);
    }),

    getListings: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getMusicianProfileByUserId(ctx.user.id);
      if (!profile) return [];
      return db.getListingsByMusicianId(profile.id);
    }),

    createListing: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.string().optional(),
        genre: z.string().optional(),
        price: z.string(),
        priceType: z.enum(["per_hour", "per_event", "per_day"]).default("per_event"),
        duration: z.number().optional(),
        photos: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getMusicianProfileByUserId(ctx.user.id);
        if (!profile) throw new Error("Musician profile not found");
        const id = await db.createListing({ ...input, musicianId: profile.id });
        return { id };
      }),

    updateListing: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        genre: z.string().optional(),
        price: z.string().optional(),
        priceType: z.enum(["per_hour", "per_event", "per_day"]).optional(),
        duration: z.number().optional(),
        photos: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateListing(id, data);
        return { success: true };
      }),

    deleteListing: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteListing(input.id);
        return { success: true };
      }),

    getAvailability: protectedProcedure
      .input(z.object({ startDate: z.string().optional(), endDate: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        const profile = await db.getMusicianProfileByUserId(ctx.user.id);
        if (!profile) return [];
        return db.getAvailabilityByMusicianId(profile.id, input.startDate, input.endDate);
      }),

    setAvailability: protectedProcedure
      .input(z.object({ date: z.string(), isAvailable: z.boolean(), startTime: z.string().optional(), endTime: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getMusicianProfileByUserId(ctx.user.id);
        if (!profile) throw new Error("Musician profile not found");
        await db.setAvailability({ ...input, musicianId: profile.id });
        return { success: true };
      }),

    getBookings: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getMusicianProfileByUserId(ctx.user.id);
      if (!profile) return [];
      return db.getBookingsByMusicianId(profile.id);
    }),

    acceptBooking: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateBookingStatus(input.bookingId, "confirmed");
        await db.logActivity({ action: "booking_accepted", entityType: "booking", entityId: input.bookingId });
        return { success: true };
      }),

    rejectBooking: protectedProcedure
      .input(z.object({ bookingId: z.number(), reason: z.string().optional() }))
      .mutation(async ({ input }) => {
        await db.updateBookingStatus(input.bookingId, "rejected");
        return { success: true };
      }),

    completeBooking: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateBookingStatus(input.bookingId, "completed", { completedAt: new Date() });
        const booking = await db.getBookingById(input.bookingId);
        if (booking) {
          const profile = await db.getMusicianProfileById(booking.musicianId);
          if (profile) {
            await db.updateMusicianProfile(profile.userId, { totalGigs: (profile.totalGigs || 0) + 1 });
          }
        }
        return { success: true };
      }),

    getEarnings: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getMusicianProfileByUserId(ctx.user.id);
      if (!profile) return [];
      return db.getPaymentsByMusicianId(profile.id);
    }),

    uploadDocument: protectedProcedure
      .input(z.object({
        documentType: z.enum(["id", "portfolio", "certificate"]),
        documentUrl: z.string().url(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "musician") throw new Error("Unauthorized");
        const profile = await db.getMusicianProfileByUserId(ctx.user.id);
        if (!profile) throw new Error("Musician profile not found");
        const documentId = await db.uploadMusicianDocument({
          musicianId: profile.id,
          documentType: input.documentType,
          documentUrl: input.documentUrl,
        });
        await db.logActivity({ userId: ctx.user.id, action: "document_uploaded", entityType: "document", entityId: documentId });
        return { success: true, documentId };
      }),

    getDocuments: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "musician") throw new Error("Unauthorized");
      const profile = await db.getMusicianProfileByUserId(ctx.user.id);
      if (!profile) return [];
      return db.getMusicianDocuments(profile.id);
    }),

    isVerified: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "musician") throw new Error("Unauthorized");
      const profile = await db.getMusicianProfileByUserId(ctx.user.id);
      if (!profile) return false;
      return db.isMusicianVerified(profile.id);
    }),
  }),

  browse: router({
    getMusicians: publicProcedure
      .input(z.object({ genre: z.string().optional(), location: z.string().optional(), search: z.string().optional() }))
      .query(async ({ input }) => {
        return db.getAllMusicians(input);
      }),

    getMusicianById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const profile = await db.getMusicianProfileById(input.id);
        if (!profile) return null;
        const user = await db.getUserById(profile.userId);
        const listings = await db.getListingsByMusicianId(profile.id);
        const reviews = await db.getReviewsByMusicianId(profile.id);
        return { profile, user, listings, reviews };
      }),

    getListingById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getListingById(input.id);
      }),

    checkAvailability: publicProcedure
      .input(z.object({ musicianId: z.number(), date: z.string() }))
      .query(async ({ input }) => {
        return db.checkAvailability(input.musicianId, input.date);
      }),

    getMusicianAvailability: publicProcedure
      .input(z.object({ musicianId: z.number(), startDate: z.string().optional(), endDate: z.string().optional() }))
      .query(async ({ input }) => {
        return db.getAvailabilityByMusicianId(input.musicianId, input.startDate, input.endDate);
      }),
  }),

  booking: router({
    create: protectedProcedure
      .input(z.object({
        musicianId: z.number(),
        listingId: z.number(),
        eventDate: z.string(),
        eventTime: z.string(),
        eventEndTime: z.string().optional(),
        venueName: z.string().optional(),
        venueAddress: z.string().optional(),
        specialRequests: z.string().optional(),
        totalAmount: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const isAvailable = await db.checkAvailability(input.musicianId, input.eventDate);
        if (!isAvailable) throw new Error("Musician is not available on this date");

        const bookingId = await db.createBooking({ ...input, userId: ctx.user.id, status: "pending_approval" });

        const commissionRate = Number(await db.getSetting("commission_rate")) || 10;
        const amount = parseFloat(input.totalAmount);
        const commission = (amount * commissionRate) / 100;
        const musicianPayout = amount - commission;

        await db.createPayment({
          bookingId,
          userId: ctx.user.id,
          musicianId: input.musicianId,
          amount: input.totalAmount,
          commission: commission.toFixed(2),
          musicianPayout: musicianPayout.toFixed(2),
          status: "escrow",
          escrowAt: new Date(),
        });

        await db.setAvailability({ musicianId: input.musicianId, date: input.eventDate, isAvailable: false });
        await db.logActivity({ userId: ctx.user.id, action: "booking_created", entityType: "booking", entityId: bookingId });

        return { bookingId };
      }),

    getMyBookings: protectedProcedure.query(async ({ ctx }) => {
      return db.getBookingsByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const booking = await db.getBookingById(input.id);
        if (!booking) return null;
        const payment = await db.getPaymentByBookingId(input.id);
        const listing = await db.getListingById(booking.listingId);
        const musicianProfile = await db.getMusicianProfileById(booking.musicianId);
        const musicianUser = musicianProfile ? await db.getUserById(musicianProfile.userId) : null;
        return { booking, payment, listing, musicianProfile, musicianUser };
      }),

    cancel: protectedProcedure
      .input(z.object({ bookingId: z.number(), reason: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const booking = await db.getBookingById(input.bookingId);
        if (!booking) throw new Error("Booking not found");

        const isMusician = ctx.user.role === "musician";
        const cancelledBy = isMusician ? "musician" as const : "user" as const;

        const eventDate = new Date(booking.eventDate + "T" + booking.eventTime);
        const now = new Date();
        const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        const isLastMinute = hoursUntilEvent <= 72;

        await db.updateBookingStatus(input.bookingId, isMusician ? "cancelled_musician" : "cancelled_user", {
          cancelledBy,
          cancellationReason: input.reason,
          cancelledAt: new Date(),
        });

        const payment = await db.getPaymentByBookingId(input.bookingId);
        if (payment && isLastMinute) {
          const penaltyKey = isMusician ? "musician_cancel_penalty_72h" : "user_cancel_penalty_72h";
          const penaltyRate = Number(await db.getSetting(penaltyKey)) || (isMusician ? 30 : 20);
          const penaltyAmount = (parseFloat(payment.amount) * penaltyRate) / 100;
          const refundAmount = parseFloat(payment.amount) - penaltyAmount;

          await db.updatePaymentStatus(payment.id, "partial_refund", {
            penaltyAmount: penaltyAmount.toFixed(2),
            penaltyReason: `Last minute cancellation (within 72 hours) by ${cancelledBy}`,
            refundAmount: refundAmount.toFixed(2),
            refundedAt: new Date(),
          });

          if (isMusician) {
            await db.addStrikeToMusician(ctx.user.id);
            const profile = await db.getMusicianProfileByUserId(ctx.user.id);
            const maxStrikes = Number(await db.getSetting("max_strikes")) || 3;
            if (profile && (profile.strikes || 0) >= maxStrikes) {
              await db.updateUserStatus(ctx.user.id, "suspended");
            }
          }
        } else if (payment) {
          await db.updatePaymentStatus(payment.id, "refunded", { refundAmount: payment.amount, refundedAt: new Date() });
        }

        await db.setAvailability({ musicianId: booking.musicianId, date: booking.eventDate, isAvailable: true });
        return { success: true };
      }),

    addReview: protectedProcedure
      .input(z.object({ bookingId: z.number(), rating: z.number().min(1).max(5), comment: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const booking = await db.getBookingById(input.bookingId);
        if (!booking) throw new Error("Booking not found");
        if (booking.status !== "completed") throw new Error("Can only review completed bookings");
        await db.createReview({ bookingId: input.bookingId, userId: ctx.user.id, musicianId: booking.musicianId, rating: input.rating, comment: input.comment });
        return { success: true };
      }),
  }),

  admin: router({
    getStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return db.getAdminStats();
    }),

    getPendingUsers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return db.getPendingUsers();
    }),

    approveUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        await db.updateUserStatus(input.userId, "approved");
        await db.logActivity({ userId: ctx.user.id, action: "user_approved", entityType: "user", entityId: input.userId });
        return { success: true };
      }),

    suspendUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        await db.updateUserStatus(input.userId, "suspended");
        return { success: true };
      }),

    getAllUsers: protectedProcedure
      .input(z.object({ role: z.enum(["user", "musician", "admin"]).optional() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return db.getAllUsers(input.role);
      }),

    deleteUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        if (input.userId === ctx.user.id) throw new Error("Tidak boleh delete akaun sendiri");
        await db.deleteUser(input.userId);
        await db.logActivity({ userId: ctx.user.id, action: "user_deleted", entityType: "user", entityId: input.userId });
        return { success: true };
      }),

    getPendingBookings: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return db.getPendingApprovalBookings();
    }),

    approveBooking: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        await db.updateBookingStatus(input.bookingId, "approved");
        await db.logActivity({ userId: ctx.user.id, action: "booking_approved", entityType: "booking", entityId: input.bookingId });
        return { success: true };
      }),

    rejectBooking: protectedProcedure
      .input(z.object({ bookingId: z.number(), reason: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        await db.updateBookingStatus(input.bookingId, "rejected");
        const payment = await db.getPaymentByBookingId(input.bookingId);
        if (payment) {
          await db.updatePaymentStatus(payment.id, "refunded", { refundAmount: payment.amount, refundedAt: new Date() });
        }
        return { success: true };
      }),

    getAllBookings: protectedProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return db.getAllBookings(input.status);
      }),

    getEscrowPayments: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return db.getEscrowPayments();
    }),

    releasePayment: protectedProcedure
      .input(z.object({ paymentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        await db.updatePaymentStatus(input.paymentId, "released", { releasedAt: new Date() });
        await db.logActivity({ userId: ctx.user.id, action: "payment_released", entityType: "payment", entityId: input.paymentId });
        return { success: true };
      }),

    getAllPayments: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return db.getAllPayments();
    }),

    getSettings: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return db.getAllSettings();
    }),

    updateSetting: protectedProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        await db.updateSetting(input.key, input.value);
        return { success: true };
      }),

    getRecentActivity: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return db.getRecentActivity();
    }),

    getPendingVerificationDocuments: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return db.getPendingVerificationDocuments();
    }),

    approveMusicianDocument: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        await db.approveMusicianDocument(input.documentId, ctx.user.id);
        await db.logActivity({ userId: ctx.user.id, action: "document_approved", entityType: "document", entityId: input.documentId });
        return { success: true };
      }),

    rejectMusicianDocument: protectedProcedure
      .input(z.object({ documentId: z.number(), reason: z.string(), feedback: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        await db.rejectMusicianDocument(input.documentId, ctx.user.id, input.reason, input.feedback);
        await db.logActivity({ userId: ctx.user.id, action: "document_rejected", entityType: "document", entityId: input.documentId });
        return { success: true };
      }),
  }),

  payment: router({
    // Save musician bank account for payouts
    saveBankAccount: protectedProcedure
      .input(z.object({
        bankCode: z.string(),
        accountNumber: z.string(),
        accountHolderName: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "musician") throw new Error("Unauthorized");
        await db.saveMusicianBankAccount({
          musicianId: ctx.user.id,
          bankCode: input.bankCode,
          bankAccountNumber: input.accountNumber,
          bankAccountHolder: input.accountHolderName,
        });
        return { success: true };
      }),

    // Get musician bank account
    getBankAccount: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "musician") throw new Error("Unauthorized");
        const account = await db.getMusicianBankAccount(ctx.user.id);
        return account?.[0] || null;
      }),

    // Create payment invoice for booking
    createBookingInvoice: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        amount: z.number(),
        commissionPercentage: z.number(),
        description: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "user") throw new Error("Unauthorized");
        
        const { createInvoice } = await import("./services/xendit");
        const invoiceResult = await createInvoice({
          bookingId: input.bookingId,
          userId: ctx.user.id,
          musicianId: 0, // Will be set from booking
          amount: input.amount,
          commissionPercentage: input.commissionPercentage,
          description: input.description,
        });

        // Save to database
        await db.createXenditInvoice({
          bookingId: input.bookingId,
          xenditInvoiceId: invoiceResult.xenditInvoiceId,
          status: "PENDING",
          amount: String(input.amount),
          commissionAmount: String(invoiceResult.commissionAmount),
          musicianPayoutAmount: String(invoiceResult.musicianPayoutAmount),
          expiresAt: invoiceResult.expiresAt,
        });

        return invoiceResult;
      }),

    // Get payment status
    getPaymentStatus: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .query(async ({ ctx, input }) => {
        const payment = await db.getPaymentByBookingId(input.bookingId);
        if (!payment) return null;
        return payment;
      }),

    // Admin: Get all pending payouts
    getPendingPayouts: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return db.getPendingPayouts();
      }),

    // Admin: Get completed payouts
    getCompletedPayouts: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return db.getCompletedPayouts();
      }),
  }),

});

export type AppRouter = typeof appRouter;
