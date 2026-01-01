import { Types } from 'mongoose';

/**
 * Builds a query that matches userId as both ObjectId and string for backward compatibility
 * @param userId - User ID as string
 * @returns MongoDB query object with $or condition
 */
export function buildUserIdQuery(userId: string): any {
  if (!userId) {
    throw new Error('UserId is required');
  }
  
  try {
    const userIdObj = new Types.ObjectId(userId);
    // Return query that matches both ObjectId and string formats
    // Note: MongoDB will match ObjectId fields against both ObjectId and string values
    return {
      $or: [
        { userId: userIdObj },
        { userId: userId }
      ]
    };
  } catch (e) {
    // If userId is not a valid ObjectId format, just use string
    return { userId: userId };
  }
}

/**
 * Converts a string ID to MongoDB ObjectId
 * @param id - ID as string
 * @returns MongoDB ObjectId
 */
export function toObjectId(id: string): Types.ObjectId {
  return new Types.ObjectId(id);
}

/**
 * Converts an array of string IDs to MongoDB ObjectIds
 * @param ids - Array of IDs as strings
 * @returns Array of MongoDB ObjectIds
 */
export function toObjectIds(ids: string[]): Types.ObjectId[] {
  return ids.map(id => new Types.ObjectId(id));
}

/**
 * Builds a query with _id and userId conditions
 * @param id - Document ID as string
 * @param userId - User ID as string
 * @returns MongoDB query object
 */
export function buildIdAndUserIdQuery(id: string, userId: string): any {
  return {
    _id: toObjectId(id),
    ...buildUserIdQuery(userId)
  };
}

