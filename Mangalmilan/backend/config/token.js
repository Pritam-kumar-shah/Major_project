
import jwt from 'jsonwebtoken';

export const genToken = (userId) => {
  try {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
    return token;
  } catch (error) {
    console.error(`Error generating token for userId: ${userId}`, error);
    
    throw new Error('Token generation failed.');
  }
}