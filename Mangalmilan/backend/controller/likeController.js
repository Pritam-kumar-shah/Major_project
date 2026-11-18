
import MediaLike from '../models/MediaLike.js';
import PortfolioAlbum from '../models/PortfolioAlbum.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';       
import mongoose from 'mongoose';


export const toggleMediaLike = asyncHandler(async (req, res) => {
    const userId = req.user._id; 
    const { mediaId } = req.params; 

    if (!mongoose.Types.ObjectId.isValid(mediaId)) {
        throw new ApiError(400, "Invalid media ID.");
    }

    const mediaIdObj = new mongoose.Types.ObjectId(mediaId);
    let message, isLiked, newLikeCount;
    
    const existingLike = await MediaLike.findOne({ user: userId, mediaId: mediaIdObj });


    if (existingLike) {
        await existingLike.deleteOne();
        
        const updatedAlbum = await PortfolioAlbum.findOneAndUpdate(
            { 
                'media._id': mediaIdObj,
                'media.likeCount': { $gt: 0 }  
            },
            { $inc: { 'media.$.likeCount': -1 } }, 
            { new: true }
        );

        if (!updatedAlbum) {
            
             newLikeCount = 0;
        } else {
             newLikeCount = updatedAlbum.media.id(mediaId).likeCount;
        }

        message = "Media unliked successfully.";
        isLiked = false;
        
    } else {

        try {
            await MediaLike.create({
                user: userId,
                mediaId: mediaIdObj
            });
            
            const updatedAlbum = await PortfolioAlbum.findOneAndUpdate(
                { 'media._id': mediaIdObj },
                { $inc: { 'media.$.likeCount': 1 } },
                { new: true }
            );

            if (!updatedAlbum) {
                throw new ApiError(404, "Media item not found in any portfolio.");
            }
            
            newLikeCount = updatedAlbum.media.id(mediaId).likeCount;
            message = "Media liked successfully.";
            isLiked = true;

        } catch (error) {
            if (error.code === 11000) {
                throw new ApiError(409, "You have already liked this media item.");
            }
            throw error; 
        }
    }

    res.status(200).json({
        success: true,
        message: message,
        mediaId: mediaId,
        newLikeCount: newLikeCount,
        isLiked: isLiked
    });
});