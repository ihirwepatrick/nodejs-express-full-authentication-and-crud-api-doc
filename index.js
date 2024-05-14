const express = require("express");
const app = express();
const mongodb = require("./models/mongodb");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const productController = require("./controllers/productController");
const swaggerDoc = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const userController = require("./controllers/userController");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Docs",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
    ],
    paths: {
      "/api/product": {},
    },
  },
  apis: ["./controllers/*.js"], // files containing annotations as above
};

const specs = swaggerJsdoc(options);
dotenv.config();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// get content from the db

app.use("/api/product", productController);
app.use("/user", userController);
//db connection online
mongodb();
app.listen(3000, () => {
  console.log("Server is running on port 3000");

  app.use("/doc", swaggerDoc.serve, swaggerDoc.setup(specs));
});
