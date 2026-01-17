import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api';
import { toast } from 'react-toastify';

/**
 * Authentication Store
 * Manages authentication state using Zustand with persistence
 */
const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,
            token: null,
            isAuthenticated: false,
            isSuperAdmin: false,
            isLoading: false,
            isRegistrationDesk: false,
            error: null,

            // Actions
            login: async (credentials) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await authApi.login(credentials);
                    console.log(response);
                    const { user, token } = response.data;

                    if (!user || !token) {
                        throw new Error('Invalid response from server');
                    }
                    // Store token in localStorage for interceptors

                    set((state) => ({
                        ...state,
                        user: user,
                        token: token,
                        isAuthenticated: true,
                        isSuperAdmin: user.role === 'super_admin',
                        isRegistrationDesk: user.role === 'registration_desk',
                        isLoading: false,
                        error: null
                    }));

                    localStorage.setItem('adminToken', token);
                    localStorage.setItem('userRole', user.role);
                    // Debug check
                    console.log('user role',user.role);

                    return { user, token };
                } catch (error) {
                                       

                    
                    localStorage.removeItem('adminToken');
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: error.message || 'Login failed'
                    });
                    throw error;
                }
            },

            logout: async () => {
                set({ isLoading: true });

                try {
                    // Call API logout (if needed)
                    // await authApi.logout();

                    // Clear local storage
                    localStorage.removeItem('adminToken');

                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null
                    });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error.message || 'Logout failed'
                    });

                    // Still clear state and storage on error
                    localStorage.removeItem('adminToken');
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false
                    });
                }
            },

            checkAuth: async () => {
                const token = localStorage.getItem('adminToken');

                // If no token in storage, user is not authenticated
                if (!token) {
                    set({ isAuthenticated: false, user: null, token: null });
                    return false;
                }

                set({ isLoading: true, token });

                try {
                    // Verify token validity with backend
                    const data = await authApi.verifyToken();

                    set({
                        user: data.user,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });

                    return true;
                } catch (error) {
                    // Token verification failed, clear auth state
                    localStorage.removeItem('adminToken');

                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: error.message || 'Session expired'
                    });

                    return false;
                }
            },

            checkSuperAdmin: async () => {
                try {
                    const response = await authApi.isSuperAdmin();
                    set({ isSuperAdmin: response.data.isSuperAdmin });
                    return true;
                } catch (error) {
                    set({ isSuperAdmin: false });
                    return false;
                }
            },
          

            getUser: async () => {
                try {
                    const response = await authApi.getUser();
                    set({ user: response.user });
                    return true;
                } catch (error) {
                    set({ user: null });
                    return false;
                }
            },

            clearError: () => set({ error: null })
        }),
        {
            name: 'auth-storage', // Storage key
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }) // Only persist these fields
        }
    )
);

export default useAuthStore; 