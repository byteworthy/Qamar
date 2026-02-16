/**
 * Manual verification script for recitation checker
 * Run with: npx ts-node --esm client/services/hifz/__tests__/recitation-checker.manual-test.ts
 */

import { checkRecitation } from '../recitation-checker';

console.log('=== Recitation Checker Manual Tests ===\n');

// Test 1: Perfect match
console.log('Test 1: Perfect match with diacritics');
const result1 = checkRecitation(
  1,
  1,
  'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
);
console.log(`Score: ${result1.score}%, Accuracy: ${result1.accuracy}`);
console.log(`Word Results:`, result1.wordResults);
console.log();

// Test 2: Perfect match without diacritics
console.log('Test 2: Perfect match (normalized - no diacritics)');
const result2 = checkRecitation(
  1,
  1,
  'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  'بسم الله الرحمن الرحيم'
);
console.log(`Score: ${result2.score}%, Accuracy: ${result2.accuracy}`);
console.log(`All words correct:`, result2.wordResults.every(w => w.isCorrect));
console.log();

// Test 3: One mistake
console.log('Test 3: One word incorrect (الرحمن -> الكريم)');
const result3 = checkRecitation(
  1,
  1,
  'بسم الله الرحمن الرحيم',
  'بسم الله الكريم الرحيم'
);
console.log(`Score: ${result3.score}%, Accuracy: ${result3.accuracy.toFixed(2)}`);
console.log(`Word Results:`, result3.wordResults.map(w => ({ expected: w.expected, actual: w.actual, correct: w.isCorrect })));
console.log();

// Test 4: Empty transcription
console.log('Test 4: Empty transcription (user said nothing)');
const result4 = checkRecitation(
  1,
  1,
  'بسم الله الرحمن الرحيم',
  ''
);
console.log(`Score: ${result4.score}%, Accuracy: ${result4.accuracy}`);
console.log(`Word count: ${result4.wordResults.length}`);
console.log();

// Test 5: User skipped a word
console.log('Test 5: User skipped a word (الرحمن)');
const result5 = checkRecitation(
  1,
  1,
  'بسم الله الرحمن الرحيم',
  'بسم الله الرحيم'
);
console.log(`Score: ${result5.score}%, Accuracy: ${result5.accuracy.toFixed(2)}`);
console.log(`Word Results:`, result5.wordResults.map(w => ({ expected: w.expected, actual: w.actual, correct: w.isCorrect })));
console.log();

console.log('=== All tests completed ===');
