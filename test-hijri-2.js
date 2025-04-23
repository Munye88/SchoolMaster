import * as Hijri from 'hijri-js';

console.log('Available methods on Hijri:', Object.keys(Hijri));

// Initialize must be used first
if (Hijri.initialize) {
  const initialized = Hijri.initialize();
  console.log('Initialized Hijri:', initialized);
  console.log('Available methods on initialized:', Object.keys(initialized));
}

// Try with default
if (Hijri.default) {
  console.log('Using default:');
  const defaultInstance = Hijri.default;
  console.log('Methods on default:', Object.keys(defaultInstance));
  
  // Try with toHijri
  if (defaultInstance.toHijri) {
    const result = defaultInstance.toHijri('2025/4/23');
    console.log('toHijri result:', result);
  }
}

// Try with HijriJs
if (Hijri.HijriJs) {
  console.log('Using HijriJs:');
  const hijriJs = Hijri.HijriJs;
  console.log('Methods on HijriJs:', Object.keys(hijriJs));
  
  // Try with gregorianToHijri
  if (hijriJs.gregorianToHijri) {
    const result = hijriJs.gregorianToHijri('2025/4/23');
    console.log('gregorianToHijri result:', result);
  }
}