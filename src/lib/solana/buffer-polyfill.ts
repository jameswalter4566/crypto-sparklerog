import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.global = window;
  
  console.log('Buffer polyfill initialized in buffer-polyfill.ts');
}