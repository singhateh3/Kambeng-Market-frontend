// src/utils/imageUtils.js

export const getImageUrl = (photo) => {
    if (!photo) return null;
    
    // If it's already a full URL, return it
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
        return photo;
    }
    
    const baseUrl = 'https://kambeng-market.onrender.com';
    
    // Clean the photo path
    let cleanPhoto = photo;
    
    // Remove any leading slashes
    if (cleanPhoto.startsWith('/')) {
        cleanPhoto = cleanPhoto.substring(1);
    }
    
    // If it already contains storage/, use it directly
    if (cleanPhoto.includes('storage/')) {
        return `${baseUrl}/${cleanPhoto}`;
    }
    
    // If it starts with products/, add storage prefix
    if (cleanPhoto.startsWith('products/')) {
        return `${baseUrl}/storage/${cleanPhoto}`;
    }
    
    // Default: add storage prefix
    return `${baseUrl}/storage/${cleanPhoto}`;
};