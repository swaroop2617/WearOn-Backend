import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDb from '../config/mongodb.js'
import { connectCloudinary } from '../config/cloudinary.js'
import userRouter from '../routes/userRoute.js'
import productRouter from '../routes/productRoute.js'
import cartRouter from '../routes/cartRoute.js'
import orderRouter from '../routes/orderRoute.js'
import dashboardRoutes from '../routes/dashboardRoutes.js'

const app = express()

// DB + Cloudinary
connectDb()
connectCloudinary()

// Middleware
app.use(express.json())
app.use(cors())

// Routes
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/orders', orderRouter)
app.use('/api/dashboard', dashboardRoutes)

app.get('/', (req, res) => {
  res.send("API Running")
})

export default app