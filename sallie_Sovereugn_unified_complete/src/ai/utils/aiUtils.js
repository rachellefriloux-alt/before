// aiUtils.js
// Utility functions for Sallie AI modules

export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
