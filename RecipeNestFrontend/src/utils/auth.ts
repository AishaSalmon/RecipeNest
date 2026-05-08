// This file contains utility functions for handling authentication tokens in the application.
// It provides the function to save, retrieve, and clear the JWT authentication token from local storage as used in this application

const TOKEN_KEY = "recipenest_token";

export function saveAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// It also allows to generate the appropriate headers for authenticated API requests.
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}
