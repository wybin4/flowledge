export const generateRandomId = () => {
    return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};