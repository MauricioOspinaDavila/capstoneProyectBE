import { Sequelize, DataTypes } from "sequelize";
import { development } from "../config/config.js";

const sequelize = new Sequelize(development);

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: true,
        min: 1,
      },
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "user",
    },
  },
  {
    tableName: "users",
  }
);

export default User;
