export const getImageUrl = (photo) => {
    if (!photo) return null;
    
    // If it's already a full URL, return it
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
        return photo;
    }
    
    // Base URL for your backend
    const baseUrl = 'https://kambeng-market.onrender.com';
    
    // If it starts with /storage/, add the base URL
    if (photo.startsWith('/storage/')) {
        return `${baseUrl}${photo}`;
    }
    
    // If it starts with storage/, add the base URL
    if (photo.startsWith('storage/')) {
        return `${baseUrl}/${photo}`;
    }
    
    // If it's a relative path, add storage prefix and base URL
    return `${baseUrl}/storage/${photo}`;
};