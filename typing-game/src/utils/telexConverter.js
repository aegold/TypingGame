/**
 * Simple Vietnamese Telex Converter
 * Converts Telex input to Vietnamese characters
 */

// Basic Telex rules - chỉ những rule cơ bản nhất
const TELEX_RULES = {
  // Vowels
  aa: "â",
  aw: "ă",
  ee: "ê",
  oo: "ô",
  ow: "ơ",
  uw: "ư",

  // Consonants
  dd: "đ",

  // Uppercase versions
  AA: "Â",
  AW: "Ă",
  EE: "Ê",
  OO: "Ô",
  OW: "Ơ",
  UW: "Ư",
  DD: "Đ",
};

// Tone marks
const TONE_MARKS = {
  f: "grave", // huyền: à
  s: "acute", // sắc: á
  r: "hook", // hỏi: ả
  x: "tilde", // ngã: ã
  j: "dot", // nặng: ạ
  F: "grave",
  S: "acute",
  R: "hook",
  X: "tilde",
  J: "dot",
};

// Vietnamese vowels that can receive tone marks
const VOWELS_WITH_TONES = {
  a: ["a", "á", "à", "ả", "ã", "ạ"],
  ă: ["ă", "ắ", "ằ", "ẳ", "ẵ", "ặ"],
  â: ["â", "ấ", "ầ", "ẩ", "ẫ", "ậ"],
  e: ["e", "é", "è", "ẻ", "ẽ", "ẹ"],
  ê: ["ê", "ế", "ề", "ể", "ễ", "ệ"],
  i: ["i", "í", "ì", "ỉ", "ĩ", "ị"],
  o: ["o", "ó", "ò", "ỏ", "õ", "ọ"],
  ô: ["ô", "ố", "ồ", "ổ", "ỗ", "ộ"],
  ơ: ["ơ", "ớ", "ờ", "ở", "ỡ", "ợ"],
  u: ["u", "ú", "ù", "ủ", "ũ", "ụ"],
  ư: ["ư", "ứ", "ừ", "ử", "ữ", "ự"],
  y: ["y", "ý", "ỳ", "ỷ", "ỹ", "ỵ"],
  // Uppercase
  A: ["A", "Á", "À", "Ả", "Ã", "Ạ"],
  Ă: ["Ă", "Ắ", "Ằ", "Ẳ", "Ẵ", "Ặ"],
  Â: ["Â", "Ấ", "Ầ", "Ẩ", "Ẫ", "Ậ"],
  E: ["E", "É", "È", "Ẻ", "Ẽ", "Ẹ"],
  Ê: ["Ê", "Ế", "Ề", "Ể", "Ễ", "Ệ"],
  I: ["I", "Í", "Ì", "Ỉ", "Ĩ", "Ị"],
  O: ["O", "Ó", "Ò", "Ỏ", "Õ", "Ọ"],
  Ô: ["Ô", "Ố", "Ồ", "Ổ", "Ỗ", "Ộ"],
  Ơ: ["Ơ", "Ớ", "Ờ", "Ở", "Ỡ", "Ợ"],
  U: ["U", "Ú", "Ù", "Ủ", "Ũ", "Ụ"],
  Ư: ["Ư", "Ứ", "Ừ", "Ử", "Ữ", "Ự"],
  Y: ["Y", "Ý", "Ỳ", "Ỷ", "Ỹ", "Ỵ"],
};

/**
 * Apply tone mark to a vowel
 * @param {string} vowel - The base vowel
 * @param {string} tone - The tone type (grave, acute, hook, tilde, dot)
 * @returns {string} - The vowel with tone mark
 */
function applyTone(vowel, tone) {
  if (!VOWELS_WITH_TONES[vowel]) {
    return vowel;
  }

  const toneIndex = {
    grave: 2, // à
    acute: 1, // á
    hook: 3, // ả
    tilde: 4, // ã
    dot: 5, // ạ
  };

  const index = toneIndex[tone];
  if (!index) return vowel;

  return VOWELS_WITH_TONES[vowel][index] || vowel;
}

/**
 * Find the main vowel in a word for tone application
 * @param {string} word - The word to analyze
 * @returns {number} - Index of the main vowel
 */
function findMainVowelIndex(word) {
  const vowels = Object.keys(VOWELS_WITH_TONES);
  const vowelPositions = [];

  // Find all vowel positions
  for (let i = 0; i < word.length; i++) {
    if (vowels.includes(word[i])) {
      vowelPositions.push(i);
    }
  }

  if (vowelPositions.length === 0) return -1;
  if (vowelPositions.length === 1) return vowelPositions[0];

  // Simple rule: apply tone to first vowel
  return vowelPositions[0];
}

/**
 * Convert Telex input to Vietnamese
 * @param {string} input - The Telex input
 * @returns {string} - The Vietnamese output
 */
export function convertTelex(input) {
  if (!input) return "";

  let result = input;

  // Step 1: Convert vowels and consonants
  Object.entries(TELEX_RULES).forEach(([telex, vietnamese]) => {
    const regex = new RegExp(telex, "g");
    result = result.replace(regex, vietnamese);
  });

  // Step 2: Apply tone marks
  Object.entries(TONE_MARKS).forEach(([toneChar, toneType]) => {
    const regex = new RegExp(`([^\\s]*?)${toneChar}`, "g");
    result = result.replace(regex, (match, word) => {
      const mainVowelIndex = findMainVowelIndex(word);
      if (mainVowelIndex === -1) return match;

      const vowel = word[mainVowelIndex];
      const newVowel = applyTone(vowel, toneType);

      return (
        word.substring(0, mainVowelIndex) +
        newVowel +
        word.substring(mainVowelIndex + 1)
      );
    });
  });

  return result;
}

/**
 * Check if current input matches target word
 * @param {string} targetWord - The target Vietnamese word
 * @param {string} currentInput - The current Telex input
 * @returns {object} - Match result
 */
export function checkMatch(targetWord, currentInput) {
  const currentVietnamese = convertTelex(currentInput);
  const isComplete = currentVietnamese === targetWord;
  const isValid = targetWord.startsWith(currentVietnamese);

  return {
    currentVietnamese,
    targetWord,
    currentInput,
    isComplete,
    isValid,
    progress: currentVietnamese.length / targetWord.length,
  };
}

// Telex sequences for Vietnamese characters (for typing game)
const TELEX_SEQUENCES = {
  // Basic vowels with tones
  á: ["a", "s"],
  à: ["a", "f"],
  ả: ["a", "r"],
  ã: ["a", "x"],
  ạ: ["a", "j"],

  é: ["e", "s"],
  è: ["e", "f"],
  ẻ: ["e", "r"],
  ẽ: ["e", "x"],
  ẹ: ["e", "j"],

  í: ["i", "s"],
  ì: ["i", "f"],
  ỉ: ["i", "r"],
  ĩ: ["i", "x"],
  ị: ["i", "j"],

  ó: ["o", "s"],
  ò: ["o", "f"],
  ỏ: ["o", "r"],
  õ: ["o", "x"],
  ọ: ["o", "j"],

  ú: ["u", "s"],
  ù: ["u", "f"],
  ủ: ["u", "r"],
  ũ: ["u", "x"],
  ụ: ["u", "j"],

  ý: ["y", "s"],
  ỳ: ["y", "f"],
  ỷ: ["y", "r"],
  ỹ: ["y", "x"],
  ỵ: ["y", "j"],

  // Special vowels
  â: ["a", "a"],
  ă: ["a", "w"],
  ê: ["e", "e"],
  ô: ["o", "o"],
  ơ: ["o", "w"],
  ư: ["u", "w"],

  // Special vowels with tones
  ấ: ["a", "a", "s"],
  ầ: ["a", "a", "f"],
  ẩ: ["a", "a", "r"],
  ẫ: ["a", "a", "x"],
  ậ: ["a", "a", "j"],

  ắ: ["a", "w", "s"],
  ằ: ["a", "w", "f"],
  ẳ: ["a", "w", "r"],
  ẵ: ["a", "w", "x"],
  ặ: ["a", "w", "j"],

  ế: ["e", "e", "s"],
  ề: ["e", "e", "f"],
  ể: ["e", "e", "r"],
  ễ: ["e", "e", "x"],
  ệ: ["e", "e", "j"],

  ố: ["o", "o", "s"],
  ồ: ["o", "o", "f"],
  ổ: ["o", "o", "r"],
  ỗ: ["o", "o", "x"],
  ộ: ["o", "o", "j"],

  ớ: ["o", "w", "s"],
  ờ: ["o", "w", "f"],
  ở: ["o", "w", "r"],
  ỡ: ["o", "w", "x"],
  ợ: ["o", "w", "j"],

  ứ: ["u", "w", "s"],
  ừ: ["u", "w", "f"],
  ử: ["u", "w", "r"],
  ữ: ["u", "w", "x"],
  ự: ["u", "w", "j"],

  // Consonant
  đ: ["d", "d"],

  // Basic characters (no conversion needed)
  a: ["a"],
  b: ["b"],
  c: ["c"],
  d: ["d"],
  e: ["e"],
  f: ["f"],
  g: ["g"],
  h: ["h"],
  i: ["i"],
  j: ["j"],
  k: ["k"],
  l: ["l"],
  m: ["m"],
  n: ["n"],
  o: ["o"],
  p: ["p"],
  q: ["q"],
  r: ["r"],
  s: ["s"],
  t: ["t"],
  u: ["u"],
  v: ["v"],
  w: ["w"],
  x: ["x"],
  y: ["y"],
  z: ["z"],
};

/**
 * Get Telex key sequence for a Vietnamese character
 * @param {string} vietnameseChar - Vietnamese character (á, à, ê, etc.)
 * @returns {string[]} - Array of keys to press ['a', 's']
 */
export function getTelexSequence(vietnameseChar) {
  return TELEX_SEQUENCES[vietnameseChar] || [vietnameseChar];
}

/**
 * Get the next key to press in sequence
 * @param {string} targetChar - Target character 'á'
 * @param {number} currentIndex - Current position in sequence (0, 1, 2...)
 * @returns {string|null} - Next key to press or null if complete
 */
export function getNextKey(targetChar, currentIndex) {
  const sequence = getTelexSequence(targetChar);
  return currentIndex < sequence.length ? sequence[currentIndex] : null;
}

/**
 * Get progress info for character typing
 * @param {string} targetChar - Target character
 * @param {string[]} pressedKeys - Keys pressed so far
 * @returns {object} - Progress information
 */
export function getCharacterProgress(targetChar, pressedKeys) {
  const targetSequence = getTelexSequence(targetChar);
  const currentInput = pressedKeys.join("");
  const currentResult = convertTelex(currentInput);

  return {
    targetChar,
    targetSequence,
    pressedKeys,
    currentInput,
    currentResult,
    isComplete: currentResult === targetChar,
    progress: pressedKeys.length / targetSequence.length,
    nextKey: getNextKey(targetChar, pressedKeys.length),
  };
}

// Export default object
export default {
  convertTelex,
  checkMatch,
  getTelexSequence,
  getNextKey,
  getCharacterProgress,
};
