// src/hooks/useAuth.js
import { useAuth as useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
    return useAuthContext();
};