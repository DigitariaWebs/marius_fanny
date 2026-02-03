import dotenv from 'dotenv';
dotenv.config();
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'DEFINED' : 'UNDEFINED');
if (process.env.MONGODB_URI) {
    console.log('MONGODB_URI starts with:', process.env.MONGODB_URI.substring(0, 15));
}
