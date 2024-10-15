import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
const baseUrl = process.env.MONGODB || '127.0.0.1:27017';

export const connectToDatabase = async () => {
    try {
        await mongoose.connect(`${baseUrl}`);
        console.log("MongoDB connected using mongoose");
    } catch (err) {
        console.log(err);
    }
}
