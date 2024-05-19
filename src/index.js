import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Sequelize } from "sequelize";
import { createReadStream } from "fs";
import parse from "csv-parse";
import User from "./models/user.js";

const app = express();
const secretKey = "your_secret_key";

app.use(bodyParser.json());

// Database connection
const sequelize = new Sequelize(require("./config/config").development);

// Sincronizar la base de datos y pre-crear el usuario admin
sequelize.sync().then(async () => {
  const admin = await User.findOne({ where: { email: "admin@codeable.com" } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash("adminpassword", 10);
    await User.create({
      name: "Admin",
      email: "admin@codeable.com",
      password: hashedPassword,
      role: "admin",
    });
  }
  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
});
