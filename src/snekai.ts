import { ISnek } from "./Game";

/**
 * The below is a path for a hamiltonian path on a 8x8 grid.
 * >>>>>>>v
 * ^v<<<<<<
 * ^>>>>>>v
 * ^v<<<<<<
 * ^>>>>>>v
 * ^v<<<<<<
 * ^>>>>>>v
 * ^<<<<<<<
 */
const hamiltonian = [
  1, 2, 3, 4, 5, 6, 7, 15, 0, 17, 9, 10, 11, 12, 13, 14, 8, 18, 19, 20, 21, 22,
  23, 31, 16, 33, 25, 26, 27, 28, 29, 30, 24, 34, 35, 36, 37, 38, 39, 47, 32,
  49, 41, 42, 43, 44, 45, 46, 40, 50, 51, 52, 53, 54, 55, 63, 48, 56, 57, 58,
  59, 60, 61, 62,
];

//precomputed tables
const cycleStep: number[] = [];
const neighbors: number[][] = [];

//this is used to prevent reallocating memory
const snek_mask: boolean[] = [];

//precompute & initialize
((): void => {
  let k = 0;
  let step = 0;
  while (hamiltonian[k] != 0) {
    cycleStep[k] = step;
    step++;
    k = hamiltonian[k];
  }
  cycleStep[k] = step;

  for (let i = 0; i < 64; i++) {
    neighbors[i] = [-1, -1, -1, -1];
    if (i % 8 !== 0) neighbors[i][0] = i - 1;
    if (i % 8 !== 7) neighbors[i][1] = i + 1;
    if (Math.floor(i / 8) !== 0) neighbors[i][2] = i - 8;
    if (Math.floor(i / 8) !== 7) neighbors[i][3] = i + 8;
  }

  for (let i = 0; i < 64; i++) {
    snek_mask[i] = false;
  }
})();

/**
 * Computes next position for the snek
 * @param {ISnek} snek ISnek object
 * @param {number} food index of food
 * @returns {number} next position
 */
export function snekAI(snek: ISnek, food: number): number {
  const head = snek.x[snek.length - 1];

  //copy the snek mask
  for (let i = 0; i < 64; i++) {
    snek_mask[i] = snek.x_mask[i];
  }

  //remove tail
  snek_mask[snek.x[0]] = false;

  // find the cycle step of the food
  let foodStep = cycleStep[food];

  // step of the head
  const headStep = cycleStep[head];

  // step of the tail
  const tailStep = cycleStep[snek.x[0]];

  // look at neighbors of head and get their cycle steps
  const neighborSteps = [-1, -1, -1, -1];
  for (let i = 0; i < 4; i++) {
    const neighbor = neighbors[head][i];
    if (neighbor !== -1 && !snek_mask[neighbor]) {
      neighborSteps[i] = cycleStep[neighbor];
    }
  }

  // is there food in the remaining cycle?
  const doOp = foodStep > headStep;

  // if there is no food in the remaining cycle
  // or we already filled most of the board
  // just do regular Hamiltonian path

  if (snek.length > 32) {
    return hamiltonian[head];
  }

  // find the neighbor with the largest step
  // that is valid
  let maxStep = 0;
  let maxStepIndex = -1;
  for (let i = 0; i < 4; i++) {
    const step = neighborSteps[i];

    // if not, set a ghost food at the cycle reset
    if (!doOp) foodStep = 63;

    // we must never backtrack
    const isValid = step > headStep;

    // tail protection - don't go after the tail
    const tailProtection =
      (tailStep < headStep && step < tailStep) ||
      (tailStep > headStep && step > tailStep);

    const foodProtection = step <= foodStep;

    if (
      step > maxStep &&
      step !== -1 &&
      isValid &&
      !tailProtection &&
      foodProtection
    ) {
      maxStep = neighborSteps[i];
      maxStepIndex = neighbors[head][i];
    }
  }

  // if there is no valid neighbor,
  // fall back to Hamiltonian path
  if (maxStepIndex === -1) {
    return hamiltonian[head];
  }
  // use the picked neighbor
  return maxStepIndex;
}
