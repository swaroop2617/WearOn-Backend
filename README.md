Backend API for E-commerce Application

This is the backend part of my e-commerce project. It is built using Node.js and handles product management, API routing, database connection, and image uploads.

About the Project

This backend provides REST APIs for managing products and handling server-side logic. It connects to a MongoDB database and supports features like adding products, fetching product data, and uploading images.

Tech Stack

Node.js
Express.js
MongoDB
Mongoose
Multer

Project Structure

api/ – contains API-related setup
config/ – database configuration
controllers/ – handles request logic
middleware/ – custom middleware functions
models/ – database schemas
routes/ – API routes
server.js – main server file

Features

Add new products
Fetch all products
Image upload handling using multer
Basic backend structure for scalable applications
MongoDB integration

Installation

Clone the repository

git clone <your-repo-link>

Navigate to the project folder

cd backend

Install dependencies

npm install

Running the Server

Start the server using

npm start

or

node server.js

The server will run on the specified port in your environment variables.

Environment Variables

Create a .env file in the root directory and add the following:

MONGO_URI=your_mongodb_connection_string
PORT=5000

API Endpoints

GET /api/products – Get all products
POST /api/products – Add a new product

Notes

This is a beginner-friendly backend project created to understand how server-side development works. It focuses on building REST APIs and connecting them with a database.

Future Improvements

Add authentication and authorization
Improve error handling
Add more API routes
Deploy the backend
