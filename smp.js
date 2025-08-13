/**
 * Stable Marriage Problem (SMP) Algorithm Implementation
 * 
 * This module implements the Gale-Shapley algorithm and related utilities
 * for solving the Stable Marriage Problem, along with metrics computation
 * and conflict analysis functions.
 */

/**
 * Generate participant IDs for both groups
 * @param {number} n - Number of participants per group
 * @returns {Object} Object with arrays groupA and groupB containing participant IDs
 */
export function generateParticipants(n) {
    const groupA = Array.from({ length: n }, (_, i) => `A${i + 1}`);
    const groupB = Array.from({ length: n }, (_, i) => `B${i + 1}`);
    return { groupA, groupB };
}

/**
 * Generate random preferences for all participants
 * @param {Array} groupA - Array of group A participant IDs
 * @param {Array} groupB - Array of group B participant IDs
 * @returns {Object} Object with prefsA and prefsB preference maps
 */
export function generateRandomPreferences(groupA, groupB) {
    const prefsA = {};
    const prefsB = {};
    
    // Generate preferences for group A (each A member ranks all B members)
    groupA.forEach(a => {
        prefsA[a] = [...groupB].sort(() => Math.random() - 0.5);
    });
    
    // Generate preferences for group B (each B member ranks all A members)
    groupB.forEach(b => {
        prefsB[b] = [...groupA].sort(() => Math.random() - 0.5);
    });
    
    return { prefsA, prefsB };
}

/**
 * Get the rank/preference index of partner for a given person
 * @param {string} person - The person whose preferences to check
 * @param {string} partner - The partner to find the rank for
 * @param {Object} preferences - The preferences object
 * @returns {number} The rank (0-based index) of the partner in person's preference list
 */
function getRank(person, partner, preferences) {
    const prefs = preferences[person];
    if (!prefs) return -1;
    return prefs.indexOf(partner);
}

/**
 * Check if person prefers newPartner over currentPartner
 * @param {string} person - The person making the comparison
 * @param {string} newPartner - The new potential partner
 * @param {string} currentPartner - The current partner
 * @param {Object} preferences - The preferences object
 * @returns {boolean} True if person prefers newPartner over currentPartner
 */
function prefers(person, newPartner, currentPartner, preferences) {
    const rankNew = getRank(person, newPartner, preferences);
    const rankCurrent = getRank(person, currentPartner, preferences);
    return rankNew !== -1 && rankCurrent !== -1 && rankNew < rankCurrent;
}

/**
 * Run the Gale-Shapley algorithm
 * @param {Object} prefsA - Preferences for group A members
 * @param {Object} prefsB - Preferences for group B members
 * @returns {Object} Object containing matching and proposal counts
 */
export function runGaleShapley(prefsA, prefsB) {
    const groupA = Object.keys(prefsA);
    const groupB = Object.keys(prefsB);
    
    // Initialize data structures
    const matching = {}; // Will store A->B and B->A mappings
    const proposalCounts = {}; // Track how many proposals each A member has made
    const freeA = new Set(groupA); // Set of free A members
    
    // Initialize proposal counts
    groupA.forEach(a => {
        proposalCounts[a] = 0;
    });
    
    // Main algorithm loop
    while (freeA.size > 0) {
        // Get an arbitrary free A member
        const a = freeA.values().next().value;
        
        // Check if A has exhausted all preferences
        if (proposalCounts[a] >= groupB.length) {
            freeA.delete(a);
            continue;
        }
        
        // Get A's next preferred B member
        const b = prefsA[a][proposalCounts[a]];
        proposalCounts[a]++;
        
        // If B is free, engage them
        if (!matching[b]) {
            matching[a] = b;
            matching[b] = a;
            freeA.delete(a);
        } else {
            // B is already matched, check if B prefers A over current partner
            const currentPartner = matching[b];
            if (prefers(b, a, currentPartner, prefsB)) {
                // B prefers A, so break current engagement and engage with A
                matching[a] = b;
                matching[b] = a;
                freeA.delete(a);
                freeA.add(currentPartner);
                delete matching[currentPartner];
            }
            // If B doesn't prefer A, A remains free and will try next preference
        }
    }
    
    return { matching, proposalCounts };
}

/**
 * Find all blocking pairs in the current matching
 * @param {Object} matching - Current matching (bidirectional mapping)
 * @param {Object} prefsA - Preferences for group A members
 * @param {Object} prefsB - Preferences for group B members
 * @returns {Array} Array of blocking pairs
 */
export function findBlockingPairs(matching, prefsA, prefsB) {
    const blockingPairs = [];
    const groupA = Object.keys(prefsA);
    const groupB = Object.keys(prefsB);
    
    // Check every possible A-B pair
    for (const a of groupA) {
        for (const b of groupB) {
            // Skip if this is the current matching
            if (matching[a] === b) continue;
            
            const aCurrentPartner = matching[a];
            const bCurrentPartner = matching[b];
            
            // Check if A prefers B over their current partner
            // and B prefers A over their current partner
            const aPrefers = !aCurrentPartner || prefers(a, b, aCurrentPartner, prefsA);
            const bPrefers = !bCurrentPartner || prefers(b, a, bCurrentPartner, prefsB);
            
            if (aPrefers && bPrefers) {
                blockingPairs.push({ a, b });
            }
        }
    }
    
    return blockingPairs;
}

/**
 * Compute various metrics for the matching
 * @param {Object} matching - Current matching (bidirectional mapping)
 * @param {Object} prefsA - Preferences for group A members
 * @param {Object} prefsB - Preferences for group B members
 * @param {Array} blockingPairs - Array of blocking pairs
 * @param {string} proposerSide - Which side was the proposer ('A' or 'B')
 * @returns {Object} Object containing various metrics
 */
export function computeMetrics(matching, prefsA, prefsB, blockingPairs, proposerSide = 'A') {
    const groupA = Object.keys(prefsA);
    const groupB = Object.keys(prefsB);
    const n = groupA.length;
    
    // Stability Score: 1 - (blocking pairs / total possible pairs)
    const totalPossiblePairs = n * n;
    const stabilityScore = 1 - (blockingPairs.length / totalPossiblePairs);
    
    // Calculate happiness scores (lower rank = higher happiness)
    const aHappiness = groupA.map(a => {
        const partner = matching[a];
        if (!partner) return n; // Worst possible score if unmatched
        return getRank(a, partner, prefsA) + 1; // 1-based ranking
    });
    
    const bHappiness = groupB.map(b => {
        const partner = matching[b];
        if (!partner) return n; // Worst possible score if unmatched
        return getRank(b, partner, prefsB) + 1; // 1-based ranking
    });
    
    // Average happiness (lower is better, so we invert it)
    const avgAHappiness = aHappiness.reduce((sum, h) => sum + h, 0) / n;
    const avgBHappiness = bHappiness.reduce((sum, h) => sum + h, 0) / n;
    const avgHappiness = (avgAHappiness + avgBHappiness) / 2;
    
    // Convert to satisfaction scores (higher is better)
    const avgASatisfaction = (n + 1 - avgAHappiness) / n;
    const avgBSatisfaction = (n + 1 - avgBHappiness) / n;
    const avgSatisfaction = (avgASatisfaction + avgBSatisfaction) / 2;
    
    // Proposer vs Receiver satisfaction
    const proposerSatisfaction = proposerSide === 'A' ? avgASatisfaction : avgBSatisfaction;
    const receiverSatisfaction = proposerSide === 'A' ? avgBSatisfaction : avgASatisfaction;
    
    return {
        stabilityScore,
        avgHappiness: avgSatisfaction, // Renamed to match UI expectations
        avgASatisfaction,
        avgBSatisfaction,
        proposerSatisfaction,
        receiverSatisfaction,
        aHappinessScores: aHappiness,
        bHappinessScores: bHappiness
    };
}

/**
 * Apply a suggested change to preferences
 * @param {Object} suggestion - The suggestion object containing target, action, and indices
 * @param {Object} prefsA - Preferences for group A members
 * @param {Object} prefsB - Preferences for group B members
 * @returns {Object} Updated preferences
 */
export function applySuggestion(suggestion, prefsA, prefsB) {
    const { target, action, indices } = suggestion;
    
    // Create deep copies to avoid mutating original preferences
    const newPrefsA = JSON.parse(JSON.stringify(prefsA));
    const newPrefsB = JSON.parse(JSON.stringify(prefsB));
    
    if (action === 'swap' && indices && indices.length === 2) {
        const [i, j] = indices;
        
        if (target.startsWith('A') && newPrefsA[target]) {
            // Swap elements in group A preferences
            const prefs = newPrefsA[target];
            if (i < prefs.length && j < prefs.length) {
                [prefs[i], prefs[j]] = [prefs[j], prefs[i]];
            }
        } else if (target.startsWith('B') && newPrefsB[target]) {
            // Swap elements in group B preferences
            const prefs = newPrefsB[target];
            if (i < prefs.length && j < prefs.length) {
                [prefs[i], prefs[j]] = [prefs[j], prefs[i]];
            }
        }
    }
    
    return { prefsA: newPrefsA, prefsB: newPrefsB };
}

/**
 * Analyze preferences and matching to generate insights
 * @param {Object} matching - Current matching
 * @param {Object} prefsA - Preferences for group A members
 * @param {Object} prefsB - Preferences for group B members
 * @param {Array} blockingPairs - Array of blocking pairs
 * @param {Object} metrics - Computed metrics
 * @returns {Object} Analysis insights
 */
export function analyzeMatching(matching, prefsA, prefsB, blockingPairs, metrics) {
    const groupA = Object.keys(prefsA);
    const groupB = Object.keys(prefsB);
    const n = groupA.length;
    
    // Find very unhappy participants (ranked their partner in bottom 25%)
    const unhappyThreshold = Math.ceil(n * 0.75);
    const unhappyA = groupA.filter(a => {
        const partner = matching[a];
        if (!partner) return true;
        return getRank(a, partner, prefsA) >= unhappyThreshold;
    });
    
    const unhappyB = groupB.filter(b => {
        const partner = matching[b];
        if (!partner) return true;
        return getRank(b, partner, prefsB) >= unhappyThreshold;
    });
    
    // Analyze proposer advantage
    const proposerAdvantage = metrics.proposerSatisfaction - metrics.receiverSatisfaction;
    
    // Count blocking pairs involving each participant
    const blockingPairCounts = {};
    groupA.concat(groupB).forEach(p => {
        blockingPairCounts[p] = 0;
    });
    
    blockingPairs.forEach(({ a, b }) => {
        blockingPairCounts[a]++;
        blockingPairCounts[b]++;
    });
    
    return {
        unhappyA,
        unhappyB,
        proposerAdvantage,
        blockingPairCounts,
        hasBlockingPairs: blockingPairs.length > 0,
        isStable: blockingPairs.length === 0
    };
}

/**
 * Generate suggestions for improving the matching
 * @param {Object} matching - Current matching
 * @param {Object} prefsA - Preferences for group A members
 * @param {Object} prefsB - Preferences for group B members
 * @param {Array} blockingPairs - Array of blocking pairs
 * @param {Object} analysis - Analysis insights
 * @returns {Array} Array of suggestion objects
 */
export function generateSuggestions(matching, prefsA, prefsB, blockingPairs, analysis) {
    const suggestions = [];
    const { blockingPairCounts, unhappyA, unhappyB } = analysis;
    
    // Find participants most involved in blocking pairs
    const mostProblematic = Object.entries(blockingPairCounts)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([participant, _]) => participant);
    
    // Generate swap suggestions for problematic participants
    mostProblematic.forEach(participant => {
        const isGroupA = participant.startsWith('A');
        const prefs = isGroupA ? prefsA[participant] : prefsB[participant];
        
        if (!prefs || prefs.length < 2) return;
        
        // Try swapping adjacent pairs, especially involving current partner
        const currentPartner = matching[participant];
        const currentRank = currentPartner ? getRank(participant, currentPartner, isGroupA ? prefsA : prefsB) : -1;
        
        for (let i = 0; i < prefs.length - 1; i++) {
            // Prioritize swaps that might improve current partner's ranking
            if (currentRank !== -1 && Math.abs(i - currentRank) > 2) continue;
            
            const suggestion = {
                target: participant,
                action: 'swap',
                indices: [i, i + 1],
                rationale: `May reduce blocking pairs involving ${participant}`,
                expectedDelta: estimateImpact(participant, [i, i + 1], matching, prefsA, prefsB)
            };
            
            suggestions.push(suggestion);
            if (suggestions.length >= 3) break;
        }
    });
    
    // If no blocking pairs but unhappy participants, suggest swaps for very unhappy ones
    if (blockingPairs.length === 0 && (unhappyA.length > 0 || unhappyB.length > 0)) {
        const veryUnhappy = [...unhappyA, ...unhappyB].slice(0, 2);
        
        veryUnhappy.forEach(participant => {
            const isGroupA = participant.startsWith('A');
            const prefs = isGroupA ? prefsA[participant] : prefsB[participant];
            
            if (!prefs || prefs.length < 2) return;
            
            // Suggest moving preferred partners higher
            for (let i = 1; i < Math.min(3, prefs.length); i++) {
                const suggestion = {
                    target: participant,
                    action: 'swap',
                    indices: [i - 1, i],
                    rationale: `May improve happiness for ${participant}`,
                    expectedDelta: estimateImpact(participant, [i - 1, i], matching, prefsA, prefsB)
                };
                
                suggestions.push(suggestion);
                if (suggestions.length >= 3) break;
            }
        });
    }
    
    return suggestions.slice(0, 3); // Return max 3 suggestions
}

/**
 * Estimate the impact of a suggested change
 * @param {string} target - The participant whose preferences will change
 * @param {Array} indices - The indices to swap
 * @param {Object} matching - Current matching
 * @param {Object} prefsA - Current preferences for group A
 * @param {Object} prefsB - Current preferences for group B
 * @returns {Object} Estimated delta in metrics
 */
function estimateImpact(target, indices, matching, prefsA, prefsB) {
    // Simple heuristic: estimate based on how the change affects current partner ranking
    const isGroupA = target.startsWith('A');
    const prefs = isGroupA ? prefsA[target] : prefsB[target];
    const currentPartner = matching[target];
    
    if (!currentPartner || !prefs) {
        return { stability: 0, avgHappiness: 0 };
    }
    
    const currentRank = getRank(target, currentPartner, isGroupA ? prefsA : prefsB);
    const [i, j] = indices;
    
    // Calculate rank change if current partner is involved in the swap
    let rankDelta = 0;
    if (currentRank === i) {
        rankDelta = j - i;
    } else if (currentRank === j) {
        rankDelta = i - j;
    }
    
    // Estimate happiness delta (negative rank delta means better ranking)
    const happinessDelta = -rankDelta * 0.1; // Rough estimate
    
    // Estimate stability delta (very rough heuristic)
    const stabilityDelta = Math.abs(rankDelta) > 0 ? Math.random() * 0.2 - 0.1 : 0;
    
    return {
        stability: Number(stabilityDelta.toFixed(2)),
        avgHappiness: Number(happinessDelta.toFixed(2))
    };
}