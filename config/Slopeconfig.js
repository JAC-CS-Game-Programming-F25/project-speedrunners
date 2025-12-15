/**
 * Slope Configuration for Height-Based Collision
 * 
 * Each slope tile stores 16 height values (one per pixel column).
 * Height values range from 0 (no ground) to 16 (full height).
 */
export const SlopeHeights = {
    // Flat ground (full solid tile)
    FLAT: [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
    
    // ============ GOING UP (Left to Right) ============
    // Smoother curves - each step is 0.5-1 pixel difference max
    
    // Gentle slope - piece 1 (0 -> 8, very gradual)
    GENTLE_UP_1: [1, 2, 2, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 8, 8],
    
    // Gentle slope - piece 2 (8 -> 16)
    GENTLE_UP_2: [8, 8, 9, 9, 10, 10, 11, 11, 12, 13, 13, 14, 15, 15, 16, 16],
    
    // Medium slope (4 -> 16 in one tile)
    MEDIUM_UP_1: [4, 5, 6, 7, 8, 9, 10, 10, 11, 12, 13, 14, 14, 15, 16, 16],
    
    // Medium slope - piece 2 (8 -> 16)
    MEDIUM_UP_2: [8, 8, 9, 10, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16],
    
    // Steep slope (4 -> 16)
    STEEP_UP: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 14, 15, 15, 16, 16],
    
    // Very gentle slopes - 4 piece set for long ramps
    VERY_GENTLE_UP_1: [1, 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    VERY_GENTLE_UP_2: [4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8],
    VERY_GENTLE_UP_3: [8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 12, 12, 12],
    VERY_GENTLE_UP_4: [12, 12, 13, 13, 13, 14, 14, 14, 15, 15, 15, 16, 16, 16, 16, 16],
    
    // Transition piece (nearly flat at top)
    UP_TOP_TRANSITION: [12, 12, 13, 13, 14, 14, 14, 15, 15, 15, 16, 16, 16, 16, 16, 16],
    
    // ============ GOING DOWN (Left to Right) ============
    // Mirror of going up - smooth decreasing values
    
    // Gentle slope down - piece 1 (16 -> 8)
    GENTLE_DOWN_1: [16, 16, 15, 15, 14, 14, 13, 13, 12, 11, 11, 10, 9, 9, 8, 8],
    
    // Gentle slope down - piece 2 (8 -> 1)
    GENTLE_DOWN_2: [8, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1],
    
    // Medium slope down (16 -> 4 in one tile)
    MEDIUM_DOWN_1: [16, 16, 15, 14, 14, 13, 12, 11, 10, 10, 9, 8, 7, 6, 5, 4],
    
    // Medium slope down - piece 2 (16 -> 8)
    MEDIUM_DOWN_2: [16, 16, 15, 15, 14, 14, 13, 12, 12, 11, 10, 10, 9, 9, 8, 8],
    
    // Steep slope down (16 -> 4)
    STEEP_DOWN: [16, 16, 15, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 5, 4],
    
    // Very gentle slopes down
    VERY_GENTLE_DOWN_1: [16, 16, 16, 16, 15, 15, 15, 14, 14, 14, 13, 13, 13, 12, 12, 12],
    VERY_GENTLE_DOWN_2: [12, 12, 12, 11, 11, 11, 10, 10, 10, 9, 9, 9, 8, 8, 8, 8],
    VERY_GENTLE_DOWN_3: [8, 8, 8, 7, 7, 7, 6, 6, 6, 5, 5, 5, 4, 4, 4, 4],
    VERY_GENTLE_DOWN_4: [4, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1],
    
    // Transition piece (starts flat, then drops)
    DOWN_TOP_TRANSITION: [16, 16, 16, 16, 16, 16, 15, 15, 15, 14, 14, 14, 13, 13, 12, 12],
};

export const SlopeTileMapping = {
    // ============ GOING UP (Left to Right) ============
    2305: 'VERY_GENTLE_UP_1',
    2306: 'VERY_GENTLE_UP_2',
    2307: 'UP_TOP_TRANSITION',
    
    2224: 'GENTLE_UP_1',
    2225: 'GENTLE_UP_2',
    
    2142: 'MEDIUM_UP_1',
    2143: 'MEDIUM_UP_2',
    
    2060: 'STEEP_UP',
    2061: 'STEEP_UP',
    
    3386: 'GENTLE_UP_2',
    
    // NEW SLOPE - GOING UP
    6191: 'STEEP_UP',
    6273: 'MEDIUM_UP_1',
    6274: 'MEDIUM_UP_2',
    6355: 'GENTLE_UP_1',
    6356: 'GENTLE_UP_2',
    6438: 'VERY_GENTLE_UP_1',
    
    // ============ GOING DOWN (Left to Right) ============
    3365: 'DOWN_TOP_TRANSITION',
    3366: 'VERY_GENTLE_DOWN_1',
    
    3452: 'MEDIUM_DOWN_1',
    3453: 'MEDIUM_DOWN_2',
    
    3538: 'STEEP_DOWN',
    3539: 'GENTLE_DOWN_2',
    
    // NEW SLOPE - GOING DOWN
    5867: 'VERY_GENTLE_DOWN_1',
    5868: 'VERY_GENTLE_DOWN_2',
    5869: 'GENTLE_DOWN_1',
    5954: 'GENTLE_DOWN_2',
    6040: 'MEDIUM_DOWN_1',
    6041: 'MEDIUM_DOWN_2',
};

export function getSlopeHeights(tileId) {
    const slopeType = SlopeTileMapping[tileId];
    if (slopeType && SlopeHeights[slopeType]) {
        return SlopeHeights[slopeType];
    }
    return null;
}

export function isSlopeTile(tileId) {
    return SlopeTileMapping.hasOwnProperty(tileId);
}