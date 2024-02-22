import { MAX_LEVELS } from "./constants";

/**
 * Returns true with a given probability.
 * @param probability Probability of returning true. Default is 0.5
 * @returns
 */
function randomTrue(probability = 0.5): boolean {
  return Math.random() < probability;
}
/**
 * Calculates the number of levels for a new node based on probability.
 * @param maxLevels The maximum number of levels to calculate. Default is 32
 * @returns The number of levels to be used for the new node
 */
export function calcluateLevels(maxLevels = MAX_LEVELS): number {
  let levels = 1;
  while (randomTrue() && levels < maxLevels) {
    levels++;
  }
  return levels;
}
