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

// Middleware para autenticación
const authenticateToken = (req, res, next) => {
  const token =
    req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Middleware para autorización
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") return res.sendStatus(403);
  next();
};

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
