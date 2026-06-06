import express from "express";
import { addAddress, setDefaultAddress, deleteAddress,getAddresses } from '../controllers/userController.js'
import { loginUser,registerUser,adminLogin } from "../controllers/userController.js";
import auth from '../middleware/auth.js'
import { getUserProfile } from "../controllers/userController.js";
import { updateUserProfile } from "../controllers/userController.js";


const userRouter=express.Router();

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/admin',adminLogin)
userRouter.post('/add-address', auth, addAddress)
userRouter.post('/set-default-address', auth, setDefaultAddress)
userRouter.post('/delete-address', auth, deleteAddress)
userRouter.post('/get-addresses', auth, getAddresses)
userRouter.post('/profile', auth, getUserProfile)
userRouter.post('/update-profile', auth, updateUserProfile)

export default userRouter;
