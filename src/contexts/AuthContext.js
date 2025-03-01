import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiry, setSessionExpiry] = useState(null);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (mounted) {
          setUser(session?.user ?? null);
          setSessionExpiry(session?.expires_at ? new Date(session.expires_at) : null);
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setUser(null);
          setSessionExpiry(null);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setSessionExpiry(session?.expires_at ? new Date(session.expires_at) : null);
        setLoading(false);
      }
    });

    // Check session expiry periodically
    const checkSessionInterval = setInterval(() => {
      if (sessionExpiry && new Date() >= sessionExpiry) {
        supabase.auth.signOut();
      }
    }, 60000); // Check every minute

    return () => {
      mounted = false;
      subscription?.unsubscribe();
      clearInterval(checkSessionInterval);
    };
  }, [sessionExpiry]);

  const value = {
    signUp: async (email, password) => {
      try {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        return data;
      } catch (error) {
        throw new Error(`Sign up failed: ${error.message}`);
      }
    },
    signIn: async (email, password) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        if (error) throw error;
        return data;
      } catch (error) {
        throw new Error(`Sign in failed: ${error.message}`);
      }
    },
    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (error) {
        throw new Error(`Sign out failed: ${error.message}`);
      }
    },
    user,
    isAuthenticated: !!user && !!sessionExpiry && new Date() < sessionExpiry
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 