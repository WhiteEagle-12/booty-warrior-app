// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

Object.defineProperty(global, 'crypto', {
  value: {
    ...global.crypto,
    randomUUID: () => Math.random().toString(36).substring(2),
  },
  writable: true
});

jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    // Simulate a signed-in anonymous user
    callback({ uid: 'mock-user' });
    return jest.fn(); // return an unsubscribe function
  }),
  signInAnonymously: jest.fn(() => Promise.resolve({ user: { uid: 'mock-user' } })),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  onSnapshot: jest.fn((docRef, callback) => {
    // Simulate returning an empty document
    callback({ exists: () => false });
    return jest.fn(); // return an unsubscribe function
  }),
  setDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  arrayUnion: jest.fn(),
}));
