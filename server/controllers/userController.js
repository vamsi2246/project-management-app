const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ✅ Signup Controller
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "supersecretkey", {
      expiresIn: "7d",
    });

    res.status(201).json({ message: "User created successfully", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during signup" });
  }
};

// ✅ Signin Controller
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
};


// ✅ Update User Controller
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.user; // Assumes middleware populates req.user
    const { name, phone, country, city, zipCode, notifications, preferences } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        phone,
        country,
        city,
        zipCode,
        notifications,
        preferences,
        profilePic: req.body.profilePic, // Base64 string
        ...(req.body.password && { password: await bcrypt.hash(req.body.password, 10) })
      },
    });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Server error during update" });
  }
};

// ✅ Search Users Controller
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query } }, // Case-insensitive by default in some DBs, but Prisma depends on provider
          { email: { contains: query } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true
      },
      take: 5
    });

    res.json(users);
  } catch (err) {
    console.error("Error searching users:", err);
    res.status(500).json({ message: "Server error during search" });
  }
};

// ✅ Get All Users Controller
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true
      }
    });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error fetching users" });
  }
};