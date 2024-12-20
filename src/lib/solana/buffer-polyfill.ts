import { Buffer } from 'buffer';

// Polyfill Buffer for the browser environment
window.Buffer = Buffer;