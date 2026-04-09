const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");

async function runIndexTest() {
    try {
        // ─── Connect to MongoDB ────────────────────────────────
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected for Index Testing\n");

        // ─── Step 1: Create Indexes ────────────────────────────
        console.log("=== CREATING INDEXES ===\n");

        // Single field index on name
        await User.collection.createIndex({ name: 1 });
        console.log("✅ Single field index on 'name' created");

        // Compound index on email and age
        await User.collection.createIndex({ email: 1, age: -1 });
        console.log("✅ Compound index on 'email' and 'age' created");

        // Multikey index on hobbies
        await User.collection.createIndex({ hobbies: 1 });
        console.log("✅ Multikey index on 'hobbies' created");

        // Text index on bio
        await User.collection.createIndex({ bio: "text" });
        console.log("✅ Text index on 'bio' created");

        // Hashed index on userId
        await User.collection.createIndex({ userId: "hashed" });
        console.log("✅ Hashed index on 'userId' created");

        // TTL index on createdAt (auto-delete after 30 days)
        await User.collection.createIndex(
            { createdAt: 1 },
            { expireAfterSeconds: 2592000 }
        );
        console.log("✅ TTL index on 'createdAt' created (expires after 30 days)");

        // ─── Step 2: List All Indexes ──────────────────────────
        console.log("\n=== ALL INDEXES ===\n");
        const indexes = await User.collection.indexes();
        indexes.forEach((idx, i) => {
            console.log(`Index ${i + 1}:`, JSON.stringify(idx.key), idx.name);
        });

        // ─── Step 3: Insert Sample Data ────────────────────────
        console.log("\n=== INSERTING SAMPLE DATA ===\n");

        // Clear existing data first
        await User.deleteMany({});
        console.log("Cleared existing data");

        const sampleUsers = [
            {
                name: "Alice Johnson",
                email: "alice@example.com",
                age: 28,
                hobbies: ["reading", "swimming"],
                bio: "Software developer with a passion for open source projects",
                userId: "USR001"
            },
            {
                name: "Bob Smith",
                email: "bob@example.com",
                age: 35,
                hobbies: ["gaming", "cooking", "hiking"],
                bio: "Full stack developer who loves building scalable applications",
                userId: "USR002"
            },
            {
                name: "Charlie Brown",
                email: "charlie@example.com",
                age: 22,
                hobbies: ["reading", "photography"],
                bio: "Junior developer interested in machine learning and AI",
                userId: "USR003"
            },
            {
                name: "Diana Prince",
                email: "diana@example.com",
                age: 30,
                hobbies: ["swimming", "traveling", "cooking"],
                bio: "Backend engineer specialized in database optimization",
                userId: "USR004"
            },
            {
                name: "Eve Williams",
                email: "eve@example.com",
                age: 26,
                hobbies: ["gaming", "reading"],
                bio: "Cloud architect with expertise in distributed systems",
                userId: "USR005"
            }
        ];

        await User.insertMany(sampleUsers);
        console.log(`✅ Inserted ${sampleUsers.length} sample users\n`);

        // ─── Step 4: Test Queries with explain() ───────────────
        console.log("=== QUERY PERFORMANCE ANALYSIS ===\n");

        // Test 1: Single field index — find by name
        console.log("--- Test 1: Find by name (Single Field Index) ---");
        const nameResult = await User.find({ name: "Alice Johnson" })
            .explain("executionStats");
        const nameStats = nameResult[0]?.executionStats || nameResult.executionStats;
        console.log("  Stage:", nameStats.executionStages?.stage || "N/A");
        console.log("  Keys examined:", nameStats.totalKeysExamined);
        console.log("  Docs examined:", nameStats.totalDocsExamined);
        console.log("  Execution time (ms):", nameStats.executionTimeMillis);
        console.log();

        // Test 2: Compound index — filter by email and age
        console.log("--- Test 2: Filter by email & age (Compound Index) ---");
        const compoundResult = await User.find({
            email: "bob@example.com",
            age: { $gt: 25 }
        }).explain("executionStats");
        const compoundStats = compoundResult[0]?.executionStats || compoundResult.executionStats;
        console.log("  Keys examined:", compoundStats.totalKeysExamined);
        console.log("  Docs examined:", compoundStats.totalDocsExamined);
        console.log("  Execution time (ms):", compoundStats.executionTimeMillis);
        console.log();

        // Test 3: Multikey index — find by hobby
        console.log("--- Test 3: Find by hobby (Multikey Index) ---");
        const hobbyResult = await User.find({ hobbies: "reading" })
            .explain("executionStats");
        const hobbyStats = hobbyResult[0]?.executionStats || hobbyResult.executionStats;
        console.log("  Keys examined:", hobbyStats.totalKeysExamined);
        console.log("  Docs examined:", hobbyStats.totalDocsExamined);
        console.log("  Execution time (ms):", hobbyStats.executionTimeMillis);
        console.log();

        // Test 4: Text index — search bio
        console.log("--- Test 4: Text search on bio (Text Index) ---");
        const textResult = await User.find({ $text: { $search: "developer" } })
            .explain("executionStats");
        const textStats = textResult[0]?.executionStats || textResult.executionStats;
        console.log("  Keys examined:", textStats.totalKeysExamined);
        console.log("  Docs examined:", textStats.totalDocsExamined);
        console.log("  Execution time (ms):", textStats.executionTimeMillis);
        console.log();

        // Test 5: Filter by age > 25
        console.log("--- Test 5: Age > 25 query ---");
        const ageResult = await User.find({ age: { $gt: 25 } })
            .explain("executionStats");
        const ageStats = ageResult[0]?.executionStats || ageResult.executionStats;
        console.log("  Keys examined:", ageStats.totalKeysExamined);
        console.log("  Docs examined:", ageStats.totalDocsExamined);
        console.log("  Execution time (ms):", ageStats.executionTimeMillis);
        console.log();

        console.log("=== INDEX TESTING COMPLETE ===");

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("\nMongoDB Disconnected");
    }
}

runIndexTest();
