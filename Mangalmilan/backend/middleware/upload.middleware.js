// middleware/upload.js

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// सुनिश्चित करें कि 'uploads' फ़ोल्डर मौजूद है
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // अस्थायी रूप से 'uploads' फ़ोल्डर में स्टोर करें
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        // फ़ाइल का नाम (जैसे: vendorID-timestamp.jpg)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        // हमने req.body.vendorId को सीधे एक्सेस करने के लिए req.body को बाद में multer से पहले पार्स करना होगा,
        // लेकिन सुरक्षित रूप से हम केवल timestamp का उपयोग करेंगे।
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 200 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and videos are allowed'), false);
        }
    }
});

export default upload;