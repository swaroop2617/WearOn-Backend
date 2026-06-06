import mongoose from "mongoose";
import dotenv from "dotenv";
import productModel from "./models/productModel.js";
import { products } from "./productsData.js"; 
dotenv.config();

// connect DB
await mongoose.connect(process.env.MONGODB_URI);
console.log("DB Connected");

// convert your local images (IMPORTANT)
const seedProducts = async () => {
  try {

    const formattedProducts = products.map(item => ({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      subCategory: item.subCategory,
      sizes: item.sizes,
      bestseller: item.bestseller,
      image: ["https://via.placeholder.com/300"], // temp image
      date: item.date
    }));

    await productModel.insertMany(formattedProducts);

    console.log("🔥 All products inserted");
    process.exit();

  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seedProducts();