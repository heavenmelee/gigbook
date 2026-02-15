import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { users, musicianProfiles, listings, packages } from "../drizzle/schema";

/**
 * Seed script to add test musicians to database
 * Run with: NODE_ENV=development npx tsx server/seed.ts
 */
export async function seedMusicians() {
  const database = await getDb();
  if (!database) {
    console.error("Database not available");
    return;
  }

  try {
    // Test musicians data
    const testMusicians = [
      {
        user: {
          name: "Rani Siti",
          email: "rani@gigbook.my",
          phone: "+60123456789",
          role: "musician" as const,
          status: "approved" as const,
          openId: "test-rani-" + Date.now(),
          loginMethod: "email",
        },
        profile: {
          stageName: "Rani Siti",
          realName: "Siti Rani Binti Ahmad",
          bio: "Professional vocalist with 8 years experience in weddings and corporate events. Specializing in Malay, English, and Mandarin songs.",
          genre: "Pop/Dangdut",
          languages: ["Melayu", "English", "Mandarin"],
          location: "Kuala Lumpur",
          travelRadius: 50,
          travelFee: "2.50",
          experienceYears: 8,
          lineupType: "Solo",
          skills: ["vocal", "emcee"],
          ownSoundSystem: true,
          equipment: ["wireless mic", "monitor", "DI box"],
          rating: "4.8",
          totalReviews: 24,
          totalGigs: 45,
          verified: true,
        },
        listings: [
          {
            title: "Solo Vocal Performance",
            description: "Professional vocal performance for weddings, corporate events, and private functions",
            category: "Vocal",
            genre: "Pop/Dangdut",
            price: "800",
            priceType: "per_event" as const,
            duration: 180,
          },
          {
            title: "Emcee & Vocal Combo",
            description: "Emcee services combined with vocal performance",
            category: "Emcee",
            genre: "Pop/Dangdut",
            price: "1200",
            priceType: "per_event" as const,
            duration: 240,
          },
        ],
        packages: [
          {
            name: "Wedding Deluxe",
            eventType: "Wedding",
            duration: 240,
            sets: 2,
            breakTime: 30,
            basePrice: "1500",
            inclusions: ["sound system", "2 sets", "request songs", "emcee"],
            rules: { overtimeRate: "300", depositPercent: 30, minLeadTime: 14, weekendOnly: false },
          },
          {
            name: "Corporate Event",
            eventType: "Corporate",
            duration: 180,
            sets: 1,
            breakTime: 0,
            basePrice: "1000",
            inclusions: ["sound system", "professional attire", "request songs"],
            rules: { overtimeRate: "250", depositPercent: 50, minLeadTime: 7 },
          },
        ],
      },
      {
        user: {
          name: "DJ Aziz",
          email: "aziz@gigbook.my",
          phone: "+60187654321",
          role: "musician" as const,
          status: "approved" as const,
          openId: "test-aziz-" + Date.now(),
          loginMethod: "email",
        },
        profile: {
          stageName: "DJ Aziz",
          realName: "Muhammad Aziz bin Hassan",
          bio: "Professional DJ with 10 years experience. Specializing in weddings, parties, and corporate events. Latest equipment and music library.",
          genre: "Electronic/Dance",
          languages: ["Melayu", "English"],
          location: "Petaling Jaya",
          travelRadius: 80,
          travelFee: "3.00",
          experienceYears: 10,
          lineupType: "Solo",
          skills: ["DJ", "music production"],
          ownSoundSystem: true,
          equipment: ["CDJ", "mixer", "turntables", "sound system", "lighting"],
          rating: "4.9",
          totalReviews: 31,
          totalGigs: 52,
          verified: true,
        },
        listings: [
          {
            title: "Professional DJ Services",
            description: "Complete DJ service with modern equipment and extensive music library",
            category: "DJ",
            genre: "Electronic/Dance",
            price: "1000",
            priceType: "per_event" as const,
            duration: 300,
          },
        ],
        packages: [
          {
            name: "Wedding Reception DJ",
            eventType: "Wedding",
            duration: 360,
            sets: 1,
            breakTime: 0,
            basePrice: "2000",
            inclusions: ["professional equipment", "lighting", "sound system", "MC coordination"],
            rules: { overtimeRate: "400", depositPercent: 40, minLeadTime: 21 },
          },
        ],
      },
      {
        user: {
          name: "Band Harmoni",
          email: "harmoni@gigbook.my",
          phone: "+60156789012",
          role: "musician" as const,
          status: "approved" as const,
          openId: "test-harmoni-" + Date.now(),
          loginMethod: "email",
        },
        profile: {
          stageName: "Harmoni Band",
          realName: "Harmoni Band Group",
          bio: "4-piece live band performing pop, rock, and traditional Malaysian music. Perfect for weddings and corporate events.",
          genre: "Pop/Rock",
          languages: ["Melayu", "English"],
          location: "Shah Alam",
          travelRadius: 60,
          travelFee: "5.00",
          experienceYears: 7,
          lineupType: "Band",
          members: [
            { name: "Farah", instrument: "Vocals" },
            { name: "Ravi", instrument: "Guitar" },
            { name: "Zain", instrument: "Bass" },
            { name: "Amir", instrument: "Drums" },
          ],
          skills: ["live band", "backing vocals"],
          ownSoundSystem: true,
          equipment: ["PA system", "stage lights", "monitors"],
          rating: "4.7",
          totalReviews: 18,
          totalGigs: 35,
          verified: true,
        },
        listings: [
          {
            title: "4-Piece Live Band",
            description: "Full live band with vocals, guitar, bass, and drums",
            category: "Band",
            genre: "Pop/Rock",
            price: "2500",
            priceType: "per_event" as const,
            duration: 240,
          },
        ],
        packages: [
          {
            name: "Wedding Live Band",
            eventType: "Wedding",
            duration: 300,
            sets: 2,
            breakTime: 30,
            basePrice: "3000",
            inclusions: ["4 musicians", "sound system", "lighting", "2 sets"],
            rules: { overtimeRate: "600", depositPercent: 50, minLeadTime: 28 },
          },
        ],
      },
    ];

    // Insert musicians
    for (const musician of testMusicians) {
      try {
        // Check if user already exists
        const existingUser = await database
          .select()
          .from(users)
          .where(eq(users.email, musician.user.email))
          .limit(1);

        if (existingUser.length > 0) {
          console.log(`User ${musician.user.email} already exists, skipping...`);
          continue;
        }

        // Insert user
        const userResult = await database.insert(users).values(musician.user);
        const userId = userResult[0].insertId;
        console.log(`✓ Created user: ${musician.user.name} (ID: ${userId})`);

        // Insert musician profile
        await database.insert(musicianProfiles).values({
          userId,
          ...musician.profile,
        });
        console.log(`✓ Created profile: ${musician.profile.stageName}`);

        // Insert listings
        for (const listing of musician.listings) {
          await database.insert(listings).values({
            musicianId: userId,
            ...listing,
          });
          console.log(`  ✓ Added listing: ${listing.title}`);
        }

        // Insert packages
        for (const pkg of musician.packages) {
          await database.insert(packages).values({
            musicianId: userId,
            ...pkg,
          });
          console.log(`  ✓ Added package: ${pkg.name}`);
        }
      } catch (error) {
        console.error(`Error creating musician:`, error);
      }
    }

    console.log("\n✅ Seed completed!");
  } catch (error) {
    console.error("Seed error:", error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedMusicians().then(() => process.exit(0));
}
