import { LevelTheme } from '../types';

const MESSAGES = {
  default: [
    "Cookie is ready for a well-deserved nap on the sofa.",
    "What a good boy! Time for endless belly rubs.",
    "Cookie wagged his tail the whole way home!",
    "Dreaming of chasing squirrels in his sleep...",
    "The perfect adventure for a little spaniel.",
    "Cookie's ears were flapping in the wind! So majestic.",
    "A wonderful run, followed by a long snooze.",
    "Cookie is the bravest little dog in the world."
  ],
  highScore: [
    "Wow! Cookie ran further than ever before! Zoomies!",
    "A new record! Cookie is the fastest pup in town.",
    "Zoomies activated! That was an incredible run!",
    "Unstoppable! Cookie has infinite energy today.",
    "That was marathon-level running from a tiny dog!"
  ],
  highTreats: [
    "So many treats! Cookie's tummy is going to be full.",
    "Jackpot! Cookie found all the snacks hidden in the world.",
    "Delicious! That was a tasty adventure for sure.",
    "Cookie collected enough treats to share (but he won't).",
    "Crunch crunch! All those bones were delicious."
  ],
  [LevelTheme.NEIGHBORHOOD]: [
    "Cookie said hello to all the neighbors on the way.",
    "The mailman didn't stand a chance against Cookie's speed.",
    "Successfully inspected every fire hydrant in the block.",
    "The neighborhood cats are watching from the fences, impressed.",
    "Home is where the dog bed is."
  ],
  [LevelTheme.PARK]: [
    "Cookie made so many new friends at the park!",
    "The grass felt great on Cookie's paws.",
    "So many smells, so little time!",
    "Cookie is the king of the dog park today.",
    "Chasing pigeons and having a blast!"
  ],
  [LevelTheme.LAKESIDE]: [
    "Splish splash! Cookie loves the water.",
    "A little wet, but very happy!",
    "Cookie chased the ducks (but didn't catch any).",
    "Sand in the paws means it was a good day.",
    "The lake breeze felt amazing in Cookie's fur."
  ]
};

export const generateCozyMessage = (
  score: number, 
  treats: number, 
  theme: LevelTheme
): string => {
  // Start with default messages
  let candidates = [...MESSAGES.default];
  
  // Add high score messages if score is good
  if (score > 1000) {
    candidates = [...candidates, ...MESSAGES.highScore];
  }
  
  // Add treat messages if treats were collected
  if (treats > 8) {
    candidates = [...candidates, ...MESSAGES.highTreats];
  }
  
  // Add theme specific messages
  if (MESSAGES[theme]) {
    candidates = [...candidates, ...MESSAGES[theme]];
  }

  // Pick one random message
  return candidates[Math.floor(Math.random() * candidates.length)];
};