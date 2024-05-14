const { Router } = require("express");
const Product = require("../models/product.model.js");
const { pick } = require("lodash");
const jwt = require("jsonwebtoken");
const config = require("config");

const app = Router();

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     JWT:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 */

/**
 * @openapi
 * security:
 *   - JWT: []
 */

// get multiple products

/**
 * @openapi
 * /api/product/all:
 *   get:
 *     tags: [Products]
 *     description: Get all products
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
app.get("/all", async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json(products);
  } catch (error) {
    console.log(error);
    return res.status(404).send(error);
  }
});

//get single product by id

//get specific product by id

/**
 * @openapi
 * /api/product/{id}:
 *   get:
 *     tags: [Products]
 *     description: Get a product by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
app.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid token." });
  }
};

// Your existing login API
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

/// add new products api

/**
 * @openapi
 * /api/product/add:
 *   post:
 *     tags: [Products]
 *     description: Create a new product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Returns the created product.
 */
app.post("/add", verifyToken, async (req, res) => {
  try {
    const productData = pick(req.body, ["name", "price", "description"]);
    const product = await Product.create(productData);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// update an element

/**
 * @openapi
 * /api/product/update/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update a product by ID
 *     description: Update a product by providing its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product to update
 *         schema:
 *           type: string
 *     security:
 *       - JWT: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Add properties here based on your Product schema
 *     responses:
 *       '200':
 *         description: Product successfully updated
 *       '404':
 *         description: Product not found
 */
app.put("/api/product/update/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body);

    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    const updatedProduct = await Product.findById(id);
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete product

/**
 * @openapi
 * /api/product/delete/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product by ID
 *     description: Delete a product by providing its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product to delete
 *         schema:
 *           type: string
 *     security:
 *       - JWT: []
 *     responses:
 *       '200':
 *         description: Product successfully deleted
 *       '404':
 *         description: Product not found
 */
app.delete("/api/product/delete/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({ message: "Product Not Found" });
    }

    res.status(200).json({ message: "Product Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = app;
