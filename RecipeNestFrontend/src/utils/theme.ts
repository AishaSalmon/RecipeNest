//This file contains the utility for managing the application theme.
// It provides functions to get the saved theme from localStorage, apply the theme to the document body, and save the selected theme back to localStorage.

export function getSavedTheme(): string { // It retrieves the saved theme from local storage and returns it. If no theme is saved, it applies a default theme of light.
    return localStorage.getItem("theme") || "light";
}

export function applyTheme(theme: string): void { //It applies the specified theme (current or new) to the entire application body and removes the old theme class.
   document.body.classList.remove("light", "dark");
   document.body.classList.add(theme);
}

export function saveTheme(theme: string): void { //It saves the specified theme to local storage for persistence across sessions.
    localStorage.setItem("theme", theme);
}