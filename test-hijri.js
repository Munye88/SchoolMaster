import * as Hijri from 'hijri-js';

console.log('Available methods in Hijri module:');
console.log(Object.keys(Hijri));

// Try converting a date
const testDate = new Date(2025, 3, 23); // April 23, 2025
console.log('Test date:', testDate);
try {
  if (Hijri.gregorianToHijri) {
    console.log('Using gregorianToHijri:');
    const result = Hijri.gregorianToHijri('2025/4/23');
    console.log(result);
  }
  
  if (Hijri.toHijri) {
    console.log('Using toHijri:');
    const result = Hijri.toHijri('2025/4/23');
    console.log(result);
  }
} catch (error) {
  console.error('Error:', error.message);
}