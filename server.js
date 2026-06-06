import express from 'express'
import cors from 'cors'
import 'dotenv/config' 
import connectDb from './config/mongodb.js';
import {connectCloudinary} from './config/cloudinary.js';
import userRouter from "./routes/userRoute.js"
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import dashboardRoutes from "./routes/dashboardRoutes.js";

//App Config
const app=express()
const port=process.env.PORT || 4000;
connectDb()
connectCloudinary();

//Middlewares
app.use(express.json())
app.use(cors())

//Api end points
app.use('/api/user',userRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/orders',orderRouter)
app.use("/api/dashboard", dashboardRoutes);

app.get('/', (req,res)=>{
    res.send("API working")
})

app.listen(port, () => {
  console.log("Server running on port " + port);
});