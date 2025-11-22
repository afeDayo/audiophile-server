import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (imagePath) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: "audiophile",
    });
    return result;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

export default cloudinary;
