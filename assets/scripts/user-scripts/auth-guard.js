// Authentication utility functions.

export function getCurrentUser() {
    const userJson = sessionStorage.getItem('currentUser');
    try {
        return JSON.parse(userJson);
    } catch (e) {
        return null;
    }
}

export function isLoggedIn() {
    return getCurrentUser() !== null;
}
