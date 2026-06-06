import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import validator from "validator";


const createToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET)
}


//Route for user Login
const loginUser=async(req,res)=>{

    try{
        const {email,password}=req.body;

        const user=await userModel.findOne({email});

        if(!user){
            return res.json({success:false,message:"User doesnot exists"})
        }
        const isMatch=await bcrypt.compare(password,user.password)

        if(isMatch){
            const token=createToken(user._id)

            res.json({
                success: true,
                token,
                name: user.name,
                email: user.email
            })
        }
        else{
            res.json({success:false,message:"Invalid credentials"})
        }
    }
    catch(error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
}


// Route for user register
const registerUser= async(req,res)=>{
    try{
        
        const {name,email,password} =req.body;

        //checking user already exists or not
        const exists=await userModel.findOne({email});
        if(exists){
            return res.json({success:false,message:"User already exists"})
        }

        // validating email format and strong password
        if(!validator.isEmail(email)){
            return res.json({success:false,message:"please enter valid email"})
        }
        if(password.length<8){
            return res.json ({success:false, message:"please enter a strong password"})
        }

        //hashing user password
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt)

        const newUser=new userModel({
            name,
            email,
            password:hashedPassword
        })

        const user=await newUser.save()

        const token=createToken(user._id)

        res.json({
            success: true,
            token,
            name: user.name,
            email: user.email
        })

    }
    catch(error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

//Route for admin Login
const adminLogin = async (req, res) => {
  try {

    const { email, password } = req.body

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { id: email + password },
        process.env.JWT_SECRET
        );
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" })
    }

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message })
  }
}

// ================= ADDRESS FEATURES =================

//  ADD ADDRESS
const addAddress = async (req, res) => {
  try {

    const { address } = req.body

    console.log("BACKEND RECEIVED:", address) // 🔥 DEBUG

    const user = await userModel.findById(req.userId)

    let addresses = user.addresses || []

    addresses.push({
        firstName: address?.firstName || "",
        lastName: address?.lastName || "",
        street: address?.street || "",
        city: address?.city || "",
        state: address?.state || "",
        zipcode: address?.zipcode || "",
        country: address?.country || "",
        phone: address?.phone || "",
        isDefault: addresses.length === 0
    })

    const updatedUser = await userModel.findByIdAndUpdate(
      req.userId,
      { addresses },
      { returnDocument: 'after' }
    )

    console.log("SAVED:", updatedUser.addresses) // 🔥 DEBUG

    res.json({
      success: true,
      addresses: updatedUser.addresses
    })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

//  SET DEFAULT ADDRESS
const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.body
    const userId = req.userId

    const user = await userModel.findById(userId)

    user.addresses = user.addresses.map(addr => ({
      ...addr._doc,
      isDefault: addr._id.toString() === addressId
    }))

    await user.save()

    res.json({ success: true, addresses: user.addresses })

  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

//  DELETE ADDRESS
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.body
    const userId = req.userId

    const user = await userModel.findById(userId)

    user.addresses = user.addresses.filter(
      addr => addr._id.toString() !== addressId
    )

    await user.save()

    res.json({ success: true, addresses: user.addresses })

  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

const getAddresses = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId)

    res.json({
      success: true,
      addresses: user.addresses || []
    })

  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}
// get user profile
const getUserProfile = async (req, res) => {
  try {

    const user = await userModel.findById(req.userId).select("-password");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// update profile
const updateUserProfile = async (req, res) => {
  try {

    const { name, phone } = req.body;

    const user = await userModel.findByIdAndUpdate(
      req.userId,
      { name, phone },
      { new: true }
    );

    res.json({ success: true, user });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
export {
  loginUser,
  registerUser,
  adminLogin,
  addAddress,
  setDefaultAddress,
  deleteAddress,
  getAddresses,
  getUserProfile,
  updateUserProfile
}