/**
 * Slope Configuration for Height-Based Collision
 * 
 * Each slope tile stores 16 height values (one per pixel column).
 * Height values range from 0 (no ground) to 16 (full height).
 * 
 * To adjust slopes: modify the height arrays below.
 * To change tile IDs: update SlopeTileMapping when you change tilesets.
 */

/**
 * Slope height arrays - these define the shape of slopes
 * Each array has 16 values representing ground height at each x position (0-15)
 */
export const SlopeHeights = {
    // Flat ground (full solid tile)
    FLAT: [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
    
    // ============ GOING UP (Left to Right) ============
    // Height INCREASES from left to right (player climbs)
    // Lower numbers = less solid = surface is LOWER
    // Higher numbers = more solid = surface is HIGHER
    
    // Gentle slope - piece 1 (starts low, goes up gradually)
    GENTLE_UP_1: [2, 3, 3, 4, 5, 5, 6, 7, 7, 8, 8, 9, 9, 10, 10, 10],
    
    // Gentle slope - piece 2 (continues from 10, ends at 16)
    GENTLE_UP_2: [10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 16, 16],
    
    // Medium slope (2 -> 16 in one tile - steeper)
    MEDIUM_UP_1: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 16],
    
    // Medium slope - piece 2 (8 -> 16)
    MEDIUM_UP_2: [8, 9, 9, 10, 11, 11, 12, 13, 13, 14, 15, 15, 16, 16, 16, 16],
    
    // Steep slope (2 -> 16 quickly)
    STEEP_UP: [2, 4, 5, 7, 8, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 16],
    
    // Very gentle slopes - for long gradual ramps
    VERY_GENTLE_UP_1: [2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 6, 6],
    VERY_GENTLE_UP_2: [6, 6, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10, 10, 10, 10],
    VERY_GENTLE_UP_3: [10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13],
    VERY_GENTLE_UP_4: [13, 13, 14, 14, 14, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16],
    
    // Transition piece (nearly flat, slight rise)
    UP_TOP_TRANSITION: [13, 13, 14, 14, 14, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16],
    
    // ============ GOING DOWN (Left to Right) ============
    // Height DECREASES from left to right (player descends)
    
    // Gentle slope down - piece 1 (16 -> 10)
    GENTLE_DOWN_1: [16, 16, 16, 15, 15, 14, 14, 13, 13, 12, 12, 11, 11, 10, 10, 10],
    
    // Gentle slope down - piece 2 (10 -> 2)
    GENTLE_DOWN_2: [10, 10, 9, 9, 8, 8, 7, 7, 6, 5, 5, 4, 4, 3, 3, 2],
    
    // Medium slope down (16 -> 2 in one tile)
    MEDIUM_DOWN_1: [16, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2],
    
    // Medium slope down - piece 2 (16 -> 8)
    MEDIUM_DOWN_2: [16, 16, 16, 15, 15, 14, 13, 13, 12, 11, 11, 10, 9, 9, 8, 8],
    
    // Steep slope down (16 -> 2)
    STEEP_DOWN: [16, 16, 16, 15, 14, 13, 12, 11, 10, 8, 7, 5, 4, 3, 2, 2],
    
    // Very gentle slopes down
    VERY_GENTLE_DOWN_1: [16, 16, 16, 16, 15, 15, 15, 14, 14, 14, 13, 13, 13, 13, 13, 13],
    VERY_GENTLE_DOWN_2: [13, 13, 13, 12, 12, 12, 11, 11, 10, 10, 10, 10, 10, 10, 10, 10],
    
    // Transition piece (starts flat, then drops)
    DOWN_TOP_TRANSITION: [16, 16, 16, 16, 16, 16, 16, 15, 15, 15, 14, 14, 14, 13, 13, 13],
};

/**
 * MAP YOUR TILE IDs TO SLOPE TYPES HERE
 * 
 * Going Up tiles: 2305, 2306, 2307, 2224, 2225, 2142, 2143, 2060, 2061, 3386
 * Going Down tiles: 3365, 3366, 3628, 3452, 3453, 3538, 3539
 * 
 * NOTE: You may need to adjust these mappings based on how your tiles
 * actually look in the tileset. These are initial guesses.
 */
export const SlopeTileMapping = {
    // ============ GOING UP (Left to Right) ============
    // Arranged from lowest to highest in the slope
    2305: 'VERY_GENTLE_UP_1',      // First piece (lowest)
    2306: 'VERY_GENTLE_UP_2',      // Second piece
    2307: 'UP_TOP_TRANSITION',     // Transition to flat
    
    2224: 'GENTLE_UP_1',           // Gentle slope start
    2225: 'GENTLE_UP_2',           // Gentle slope end
    
    2142: 'MEDIUM_UP_1',           // Medium slope start
    2143: 'MEDIUM_UP_2',           // Medium slope end
    
    2060: 'STEEP_UP',              // Steep slope piece 1
    2061: 'STEEP_UP',              // Steep slope piece 2
    
    3386: 'GENTLE_UP_2',           // Additional up slope piece
    
    // ============ GOING DOWN (Left to Right) ============
    // Arranged from highest to lowest in the slope
    3365: 'DOWN_TOP_TRANSITION',   // Start of descent
    3366: 'VERY_GENTLE_DOWN_1',    // Gentle start
    
    5869: 'GENTLE_DOWN_1',         // Gentle slope top (was 3628)
    
    3452: 'MEDIUM_DOWN_1',         // Medium slope start
    3453: 'MEDIUM_DOWN_2',         // Medium slope end
    
    3538: 'STEEP_DOWN',            // Steep slope piece 1
    3539: 'GENTLE_DOWN_2',         // Slope bottom piece
};

/**
 * Helper function to get height array for a tile ID
 * @param {number} tileId 
 * @returns {number[]|null} Height array or null if not a slope
 */
export function getSlopeHeights(tileId) {
    const slopeType = SlopeTileMapping[tileId];
    if (slopeType && SlopeHeights[slopeType]) {
        return SlopeHeights[slopeType];
    }
    return null;
}

/**
 * Check if a tile ID is a slope tile
 * @param {number} tileId 
 * @returns {boolean}
 */
export function isSlopeTile(tileId) {
    return SlopeTileMapping.hasOwnProperty(tileId);
}