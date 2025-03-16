export const setAuthToken = (token: string) => {
    window.localStorage.setItem('authToken', token);
};

export const getAuthToken = () => {
    return window.localStorage.getItem('authToken');
};

export const removeAuthToken = () => {
    window.localStorage.removeItem('authToken');
};