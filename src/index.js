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

// Endpoint para login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user)
    return res.status(400).json({ message: "Email o contraseña incorrectos" });
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.status(400).json({ message: "Email o contraseña incorrectos" });

  const token = jwt.sign({ id: user.id, role: user.role }, secretKey);
  res.json({ token });
});

// Endpoint para carga de datos
app.post(
  "/upload",
  authenticateToken,
  authorizeAdmin,
  upload.single("file"),
  async (req, res) => {
    const file = req.file.path;
    const results = [];
    const errors = [];

    createReadStream(file)
      .pipe(parse({ columns: true }))
      .on("data", (data) => {
        const { name, email, age } = data;
        const errorDetails = {};
        if (!name) errorDetails.name = "El campo 'name' no puede estar vacío.";
        if (!email || !email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/))
          errorDetails.email = "El formato del campo 'email' es inválido.";
        if (age && (!Number.isInteger(+age) || +age <= 0))
          errorDetails.age = "El campo 'age' debe ser un número positivo.";

        if (Object.keys(errorDetails).length) {
          errors.push({ row: results.length + 1, details: errorDetails });
        } else {
          results.push(data);
        }
      })
      .on("end", async () => {
        const successfulRecords = [];
        for (const record of results) {
          try {
            const user = await User.create(record);
            successfulRecords.push(user);
          } catch (error) {
            errors.push({
              row: results.indexOf(record) + 1,
              details: error.errors.map((e) => e.message),
            });
          }
        }
        res.json({
          ok: true,
          data: {
            success: successfulRecords,
            errors: errors,
          },
        });
      });
  }
);

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
