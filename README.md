# Backend API for E-commerce Application

This is the backend part of my e-commerce project built using Node.js and Express. It handles server-side logic, database operations, and API endpoints for managing products.

## About the Project

This backend provides REST APIs to manage products and connect with a MongoDB database. It includes features like adding products, fetching product details, and handling image uploads.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Multer

## Project Structure

- api/ - API related setup
- config/ - Database configuration
- controllers/ - Business logic
- middleware/ - Custom middleware
- models/ - Database schemas
- routes/ - API routes
- server.js - Entry point of the application

## Features

- Add new products
- Get all products
- Image upload support using multer
- Structured backend architecture
- MongoDB database integration

## Installation

Clone the repository

git clone <your-repository-link>

Go to the project folder

cd backend

Install dependencies

npm install

## Running the Server

Start the server using

npm start

or

node server.js

## Environment Variables

Create a .env file in the root directory and add the following variables

MONGO_URI=your_mongodb_connection_string  
PORT=5000  

## API Endpoints

GET /api/products - Fetch all products  
POST /api/products - Add a new product  

## Notes

This is a beginner-level backend project created to understand how backend development works using Node.js and MongoDB.

## Future Improvements

- Add authentication and authorization
- Improve error handling
- Add more API endpoints
- Deploy the application
