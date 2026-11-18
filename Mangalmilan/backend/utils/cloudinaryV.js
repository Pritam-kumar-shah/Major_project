
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import sharp from 'sharp'; 

dotenv.config(); 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const uploadOnCloudinary = async (localFilePath, folderName) => {
  if (!localFilePath) return null;

  let fileToUpload = localFilePath;
  let isImage = localFilePath.match(/\.(jpe?g|png)$/i); 
  let isVideo = localFilePath.match(/\.(mp4|mov|avi|webm|flv)$/i);

  try {
    if (isImage) {
      const optimizedPath = localFilePath.replace(/(\.\w+)$/, '_optimized$1');
      // Optimization process
      await sharp(localFilePath)
        .resize({ width: 1280, withoutEnlargement: true }) 
        .jpeg({ quality: 80 })         
        .png({ quality: 80 })          
        .toFile(optimizedPath);

      fileToUpload = optimizedPath;
    }

    let uploadOptions = {
        folder: folderName,
        resource_type: isVideo ? 'video' : 'auto', 
        max_file_size: 300 * 1024 * 1024, 
    };

    if (isVideo) {
        uploadOptions.eager_async = true; 
        uploadOptions.eager = [
            { quality: "auto:low" }
        ];
    }


    const response = await cloudinary.uploader.upload(fileToUpload, uploadOptions);

    console.log('✅ Cloudinary Upload Successful!');
    console.log('🌐 URL:', response.secure_url);
    console.log('🆔 Public ID:', response.public_id);

    const cleanupFile = async (filePath, attempts = 5) => { 
        for (let i = 0; i < attempts; i++) {
            try {
                await fs.unlink(filePath);
                return true;
            } catch (unlinkError) {
                if (unlinkError.code === 'EPERM' && i < attempts - 1) {
                    await delay(200 * (i + 1)); 
                } else {
                    throw unlinkError; 
                }
            }
        }
        return false;
    };

    try {
        let originalDeleted = await cleanupFile(localFilePath);
        let optimizedDeleted = true;

        if (isImage && fileToUpload !== localFilePath) {
            optimizedDeleted = await cleanupFile(fileToUpload);
        }

        if (originalDeleted && optimizedDeleted) {
            console.log(`🗑️ All local files removed`);
        } else {
            console.error('❌ EPERM/Unlink Error (Ignoring for Upload Success): Cleanup failed for local files even after retry.');
        }

    } catch (unlinkError) {
        console.error('❌ EPERM/Unlink Error (Ignoring for Upload Success):', unlinkError.message);
    }
    
    return response;

  } catch (error) {
    console.error('❌ Cloudinary Upload Error:', error.message);
    
    try { await fs.unlink(localFilePath); } catch {} 
    if (isImage && fileToUpload !== localFilePath) { try { await fs.unlink(fileToUpload); } catch {} }
    
    return null;
  }
};


const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId) return null;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log(`🔥 Deleted from Cloudinary: ${publicId}`);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary Deletion Error:', error.message);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
