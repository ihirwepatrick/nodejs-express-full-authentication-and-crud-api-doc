const express = require("express");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const config = require("config");
const User = require("../models/user.model.js");
const app = express();
const bcrypt = require("bcrypt");
app.use(express.json());

// Sample database
const users = [];

// Sign up endpoint
// Sign up endpoint
/**
 * @openapi
 * /user/api/signup:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                  type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       '201':
 *         description: User registered successfully
 *       '400':
 *         description: Bad request
 */
app.post("/api/signup", async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { name, email, password } = req.body;
  if (_.find(users, { email }))
    return res.status(400).send("User already registered.");

  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
  const userData = { name, email, password: hashedPassword };
  users.push(userData);
  const user = await User.create(userData);
  return res.status(201).send("User registered successfully.");
});

// Login endpoint
/**
 * @openapi
 * /user/api/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       '400':
 *         description: Invalid email or password
 *       '500':
 *         description: Internal Server Error
 */
app.post("/api/login", async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    console.log(user);

    const valid = await bcrypt.compare(password, user.password);

    if (!user || !valid) {
      console.log(user);
      return res.status(400).send("Invalid email or password.");
    }

    const token = jwt.sign({ email }, config.get("jwtSecret"));
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Protected route example
// Protected route example
/**
 * @openapi
 * /user/api/protected:
 *   get:
 *     tags: [Authentication]
 *     summary: This is the protected API, requires token to access
 *     responses:
 *       '200':
 *         description: Success
 *       '401':
 *         description: Unauthorized
 *     security:
 *       - BearerAuth: []
 */
app.get("/api/protected", (req, res) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    res.send(decoded);
  } catch (error) {
    res.status(400).send("Invalid token.");
  }
});

module.exports = app;
