import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
const hasValidConfig = process.env.CLOUDINARY_CLOUD_NAME && 
                      process.env.CLOUDINARY_API_KEY && 
                      process.env.CLOUDINARY_API_SECRET &&
                      process.env.CLOUDINARY_API_SECRET.length > 30; // API secrets should be 40+ chars

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('⚠️  Cloudinary configuration missing - using local file storage for uploads');
} else if (!hasValidConfig) {
  console.warn('⚠️  Cloudinary API secret appears incomplete - using local file storage for uploads');
  console.warn('   (API secrets should be 40+ characters)');
} else {
  console.log('✅ Cloudinary configured with cloud_name:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('✅ Cloudinary API key set:', process.env.CLOUDINARY_API_KEY ? '***' : 'missing');
  console.log('✅ Cloudinary API secret set:', process.env.CLOUDINARY_API_SECRET ? '***' : 'missing');
}

export { cloudinary, hasValidConfig };

// Create Cloudinary storage for multer
export const createCloudinaryStorage = (folder: string = 'products') => {
  if (!hasValidConfig) {
    throw new Error('Cloudinary not properly configured');
  }
  
  return new CloudinaryStorage({
    cloudinary,
    params: async (req: any, file: any) => {
      return {
        folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
      };
    },
  } as any);
};

export default cloudinary;