import express from "express";
const app = express();

//midleware
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
