import path from "path";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import fs from "fs"; 
import { promisify } from "util"; 
import mime from "mime-types"; 

dotenv.config();

// --- Cloudinary Configuration ---
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const unlinkFile = promisify(fs.unlink);

// --- Upload Helper with Auto-Unlink ---
export const uploadToCloudinary = async (filePath, folder = "vendor_portfolio") => {
    if (!filePath) throw new Error("File path is required for upload.");
    
    const fileMimeType = mime.lookup(filePath);
    const isVideo = fileMimeType && fileMimeType.startsWith('video');
    const isImage = fileMimeType && fileMimeType.startsWith('image');
    
    // Limits in bytes
    const MAX_IMAGE_SIZE = 20 * 1024 * 1024;  // 20 MB
    const MAX_VIDEO_SIZE = 300 * 1024 * 1024; // 300 MB

    
    try {
        const stats = fs.statSync(filePath);
        const currentMaxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
        
        if (stats.size > currentMaxSize) {
            const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
            throw new Error(`File size (${sizeInMB}MB) exceeds the limit of ${currentMaxSize / (1024 * 1024)}MB for ${isImage ? 'image' : 'video/file'}.`);
        }
    } catch (statError) {
        throw new Error("Could not read local file for size check.");
    }


    const normalizedPath = filePath.split(path.sep).join("/");
    console.log("Uploading to Cloudinary:", normalizedPath);

    let result;
    try {
        // Cloudinary Upload Options
        const uploadOptions = {
            folder,
            resource_type: isVideo ? "video" : "auto", // Video ke liye explicit type set karna behtar
            quality: "auto",
            fetch_format: "auto",
            
            // 🎯 NEW: Conditional max size limits apply hote hain Cloudinary par
            max_file_size: isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE, 
        };

        // Video ke liye Asynchronous processing
        if (isVideo) {
            // Large video files ke liye asynchronous processing enable karein
            uploadOptions.eager_async = true;
            uploadOptions.eager = [
                { quality: "auto:low" } 
            ];
        }

        // 3. Upload to Cloudinary
        result = await cloudinary.v2.uploader.upload(normalizedPath, uploadOptions);

        console.log("✅ Upload success:", result.secure_url);
        
        // 4. 🗑️ Delete the file from the local folder
        await unlinkFile(filePath); 
        console.log(`🗑️ Local file deleted: ${filePath}`);

        return { 
            url: result.secure_url, 
            public_id: result.public_id, 
            resource_type: result.resource_type 
        };
        
    } catch (err) {
        // 5. Error Handling: Ensure file is deleted even if upload fails
        try {
             if (fs.existsSync(filePath)) {
                await unlinkFile(filePath);
                console.log(`🗑️ Local file deleted after failed upload attempt: ${filePath}`);
             }
        } catch(unlinkErr) {
            console.error("❌ Failed to delete local file:", unlinkErr.message);
        }
        
        console.error("❌ Cloudinary upload failed:", err.message);
        throw new Error("Upload failed. Please try again. " + err.message); // Cloudinary error message bhi bhej de user ko
    }
};

// --- Delete helper (Remains the same) ---
export const deleteFileFromCloudinary = async (publicId, resourceType = "image") => {
// ... (code remains the same)
};

export const uploadPortfolioMedia = (filePath) => uploadToCloudinary(filePath, "vendor_portfolio");

// Export configured Cloudinary instance
export default cloudinary.v2;