import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthSession } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; verificationCode?: string }>;
  loginWithGoogleToken: (credential: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogleCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  startGoogleOAuthPopup: () => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (code: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: (email?: string) => Promise<{ success: boolean; error?: string; verificationCode?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string; resetCode?: string; resetToken?: string }>;
  resetPassword: (payload: { token?: string; code?: string; newPassword: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => Promise<{ success: boolean; error?: string }>;
  fetchSessions: () => Promise<AuthSession[]>;
  revokeSessionById: (sessionId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'safe_jobs_shield_auth_token_v1';
const USER_STORAGE_KEY = 'safe_jobs_shield_user_v1';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const persistAuth = (newToken: string | null, newUser: User | null) => {
    setToken(newToken);
    setUser(newUser);
    try {
      if (newToken && newUser) {
        localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('LocalStorage error during auth persistence:', e);
    }
  };

  // Check current session on mount or token change
  useEffect(() => {
    let isMounted = true;
    async function verifyCurrentSession() {
      if (!token) {
        if (isMounted) {
          setIsLoading(false);
          setUser(null);
        }
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.authenticated && data.user) {
            setUser(data.user);
            try {
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
            } catch {}
          }
        } else {
          // Token expired or invalidated
          if (isMounted) {
            persistAuth(null, null);
          }
        }
      } catch (err) {
        console.warn('Network issue checking auth status, keeping cached user if available:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    verifyCurrentSession();
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Handle cross-origin OAuth messages from Google popup window
  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      // Validate origin if needed (allowing same origin and standard run.app domains)
      if (event.data?.type === 'GOOGLE_OAUTH_CODE') {
        const { code, error: oauthError } = event.data;
        if (oauthError) {
          setError(`Google Sign-In was cancelled or failed: ${oauthError}`);
          return;
        }
        if (code) {
          await loginWithGoogleCode(code);
        }
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  // 1. LOGIN
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || 'Failed to sign in. Please check your credentials.';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      persistAuth(data.token, data.user);
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Unable to connect to authentication service.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // 2. REGISTER
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || 'Registration failed. Please check your input.';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      persistAuth(data.token, data.user);
      return {
        success: true,
        verificationCode: data.verificationCode,
      };
    } catch (err: any) {
      const msg = err.message || 'Unable to complete registration.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // 3. GOOGLE GIS ID TOKEN LOGIN
  const loginWithGoogleToken = async (credential: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || 'Google authentication failed.';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      persistAuth(data.token, data.user);
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Google sign-in error.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // 4. GOOGLE AUTH CODE LOGIN
  const loginWithGoogleCode = async (code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || 'Google authorization failed.';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      persistAuth(data.token, data.user);
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Google authorization error.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // 5. START GOOGLE OAUTH POPUP
  const startGoogleOAuthPopup = async (): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    try {
      const res = await fetch('/api/auth/google/url');
      const data = await res.json();

      if (!data.configured || !data.url) {
        const msg = data.message || 'Google Client ID is not configured in environment variables.';
        setError(msg);
        return { success: false, error: msg };
      }

      // Open Google OAuth Provider URL directly in popup
      const width = 520;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.url,
        'google_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );

      if (!popup) {
        const msg = 'Please enable popups in your browser to sign in with Google.';
        setError(msg);
        return { success: false, error: msg };
      }

      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Failed to initialize Google Sign-In.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // 6. VERIFY EMAIL
  const verifyEmail = async (code: string, email?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code, email }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || 'Verification failed.';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (data.user) {
        setUser(data.user);
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        } catch {}
      }

      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Error during email verification.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // 7. RESEND VERIFICATION
  const resendVerification = async (email?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email: email || user?.email }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || 'Failed to resend code.';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      return { success: true, verificationCode: data.verificationCode };
    } catch (err: any) {
      const msg = err.message || 'Network error.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // 8. FORGOT PASSWORD
  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || 'Failed to request reset.';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      return {
        success: true,
        resetCode: data.resetCode,
        resetToken: data.resetToken,
      };
    } catch (err: any) {
      const msg = err.message || 'Error requesting password reset.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // 9. RESET PASSWORD
  const resetPassword = async (payload: { token?: string; code?: string; newPassword: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || 'Failed to reset password.';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (data.token && data.user) {
        persistAuth(data.token, data.user);
      }

      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Error updating password.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // 10. LOGOUT
  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (e) {
      console.warn('Logout endpoint failed, clearing local state:', e);
    } finally {
      persistAuth(null, null);
    }
  };

  // 11. UPDATE PROFILE
  const updateProfile = async (name: string) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Could not update profile' };
      }

      setUser(data.user);
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      } catch {}
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // 12. SESSIONS MANAGEMENT
  const fetchSessions = async (): Promise<AuthSession[]> => {
    if (!token) return [];
    try {
      const res = await fetch('/api/auth/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        return data.sessions || [];
      }
    } catch (err) {
      console.warn('Failed to fetch sessions:', err);
    }
    return [];
  };

  const revokeSessionById = async (sessionId: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        clearError,
        login,
        register,
        loginWithGoogleToken,
        loginWithGoogleCode,
        startGoogleOAuthPopup,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        logout,
        updateProfile,
        fetchSessions,
        revokeSessionById,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
