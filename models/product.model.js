const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "PLease enter product name"],
    },
    price: {
      type: Number,
      required: true,
      default: "Undefined",
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    image: {
      type: String,
      required: false,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
