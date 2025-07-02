const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
require("dotenv").config();

async function createAdminUser() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Kiểm tra xem admin đã tồn tại chưa
    const existingAdmin = await User.findOne({ username: "admin1" });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      return;
    }

    // Tạo password hash
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("admin123", saltRounds);

    // Tạo admin user
    const adminUser = new User({
      username: "admin1",
      password: hashedPassword,
      isAdmin: true,
      totalScore: 0
    });

    await adminUser.save();
    console.log("Admin user created successfully!");
    console.log("Username: admin1");
    console.log("Password: admin123");
    console.log("Please change the password after first login!");

  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser }; 