const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Middleware to check token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *", [email, hashedPassword]);
    // Exclude password from the response
    const user = result.rows[0];
    delete user.password;
    res.status(201).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (await bcrypt.compare(password, user.password)) {
        const accessToken = jwt.sign({ email: user.email, id: user.id }, process.env.SECRET_KEY);
        res.json({ accessToken });
      } else {
        res.send("Password incorrect");
      }
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Logout
// JWT-based authentication typically doesn't require a server-side logout feature,
// as the token is stored client-side. To "logout", the client should discard the token.
// Implementing token blacklist or refresh token mechanisms can manage session control.

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
