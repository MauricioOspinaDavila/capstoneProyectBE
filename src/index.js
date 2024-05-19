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

app.use(express.json());

app.get(
  "/",

  (_req, res) => {
    res.json({ message: "Hello World" });
  }
);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
