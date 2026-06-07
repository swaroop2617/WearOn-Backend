import fs from "fs";
import { cloudinary } from "../config/cloudinary.js";
import productModel from "../models/productModel.js";
// add product function
const addProduct = async (req, res) => {
  try {

    if (!req.files || !req.files.image1) {
      return res.json({ success: false, message: "No image uploaded" });
    }

    const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

    const image1 = req.files.image1?.[0];
    const image2 = req.files.image2?.[0];
    const image3 = req.files.image3?.[0];
    const image4 = req.files.image4?.[0];

    console.log("FILES RECEIVED:", req.files);

    //  Upload + delete local file
    const images = await Promise.all(
        [image1, image2, image3, image4]
          .filter(Boolean)
          .map(async (file) => {
            const result = await cloudinary.uploader.upload(
              `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
              { folder: "cartly_products" }
            );
            return result.secure_url;
          })
      );

    const productData = {
      name,
      description,
      price: Number(price),
      category,
      subCategory,
      sizes: JSON.parse(sizes),
      bestseller: bestseller === "true",
      image: images,
      date: Date.now()
    };

    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "Product Added" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//function for list product
const listProduct=async(req,res)=>{
    try{
        const products=await productModel.find({});
        res.json({success:true,products})
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    
    }
}

//function for removing product
const removeProduct=async(req,res)=>{

    try{
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product Removed"})
    }
    catch(error){
        res.json({success:false,message:error.message})
    }

}

//function for single product Info
const singleProduct=async(req,res)=>{
    try{
        const {productId} =req.body
        const product=await productModel.findById(productId)
        res.json({success:true,product})
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

export {listProduct,addProduct,removeProduct,singleProduct}
