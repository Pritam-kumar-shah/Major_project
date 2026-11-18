
import mongoose from "mongoose";

const MediaLikeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", 
            required: true
        },
        mediaId: {
            type: mongoose.Schema.Types.ObjectId, 
            required: true
        }
    },
    { timestamps: true }
);

MediaLikeSchema.index({ user: 1, mediaId: 1 }, { unique: true });

const MediaLike = mongoose.model("MediaLike", MediaLikeSchema);
export default MediaLike;