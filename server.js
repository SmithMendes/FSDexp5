const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const User = require("./models/User");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// ─── MongoDB Connection ────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// ─── CREATE — POST /addUser ────────────────────────────────────
app.post("/addUser", async (req, res) => {
    try {
        const user = new User(req.body);
        const savedUser = await user.save();

        res.json({
            message: "User added successfully",
            data: savedUser
        });
    } catch (error) {
        res.status(500).json({
            message: "Error adding user",
            error: error.message
        });
    }
});

// ─── READ — GET /users ─────────────────────────────────────────
app.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── UPDATE — PUT /updateUser/:id ──────────────────────────────
app.put("/updateUser/:id", async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json({
            message: "User updated successfully",
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating user",
            error: error.message
        });
    }
});

// ─── DELETE — DELETE /deleteUser/:id ───────────────────────────
app.delete("/deleteUser/:id", async (req, res) => {
    try {
        const result = await User.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── QUERYING & FILTERING ──────────────────────────────────────

// Search users by name
app.get("/users/search", async (req, res) => {
    try {
        const { name } = req.query;
        const users = await User.find({ name: new RegExp(name, "i") });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Filter by age > 25
app.get("/users/age", async (req, res) => {
    try {
        const users = await User.find({ age: { $gt: 25 } });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Filter by email and age
app.get("/users/filter", async (req, res) => {
    try {
        const { email, age } = req.query;
        const filter = {};
        if (email) filter.email = email;
        if (age) filter.age = { $gte: Number(age) };
        const users = await User.find(filter);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Find users by hobbies
app.get("/users/hobbies", async (req, res) => {
    try {
        const { hobby } = req.query;
        const users = await User.find({ hobbies: hobby });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Text search on bio
app.get("/users/bio", async (req, res) => {
    try {
        const { search } = req.query;
        const users = await User.find({ $text: { $search: search } });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sort by age (ascending)
app.get("/users/sort", async (req, res) => {
    try {
        const users = await User.find().sort({ age: 1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── Start Server ──────────────────────────────────────────────
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
