// Polyfill for Buffer in React Native
import { Buffer } from 'buffer';

global.Buffer = Buffer;
