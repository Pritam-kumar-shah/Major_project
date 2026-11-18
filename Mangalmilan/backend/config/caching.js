/**
 * Sets necessary caching headers for static assets (images, CSS, JS).
 * यह फ़ंक्शन ब्राउज़र को बताता है कि फ़ाइलों को कब तक कैशे में रखना है।
 * * @param {import('express').Response} res - Express response object.
 * @param {string} path - The path of the file being served (फ़ाइल का नाम).
 */
export const setStaticFileHeaders = (res, path) => {
    // ---------------------- Images Caching (1 Year) ----------------------
    // uploaded images (जैसे: JPG, PNG) अक्सर नहीं बदलते हैं, इसलिए इन्हें
    // aggressive (आक्रामक) तरीके से कैशे किया जाता है।
    if (path.endsWith('.jpg') || path.endsWith('.png') || path.endsWith('.webp') || path.endsWith('.jpeg')) {
        // max-age=31536000 seconds = 1 Year.
        // 'immutable' बताता है कि फ़ाइल कभी नहीं बदलेगी (अगर बदलनी हो तो filename बदलें)।
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        
    } 
    // ---------------------- Build Assets Caching (30 Days) ----------------------
    // Code files (JS/CSS) अक्सर बदलते हैं जब आप नया डिप्लॉय करते हैं, इसलिए इन्हें 
    // कम समय के लिए कैशे करते हैं।
    else if (path.endsWith('.js') || path.endsWith('.css')) {
        // max-age=2592000 seconds = 30 Days.
        res.setHeader('Cache-Control', 'public, max-age=2592000'); 
    }
    
    // Note: अगर कोई फ़ाइल ऊपर के किसी भी कंडीशन से मैच नहीं करती है, 
    // तो डिफ़ॉल्ट Express.js सेटिंग्स लागू होंगी (आमतौर पर 'no-cache')।
};