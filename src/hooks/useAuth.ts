// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js'; // Import types directly
import { supabase } from '@/lib/supabase';


interface UseAuthHook {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const useAuth = (): UseAuthHook => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getInitialSession = async (): Promise<void> => {
      try {
        setLoading(true); // Ensure loading is true before fetching
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error fetching initial session:', error);
          // Handle error appropriately, e.g., display an error message
          return;
        }

        setSession(initialSession);
        
        setUser(initialSession?.user || null);
      } catch (error) { 
         if (error instanceof Error) {
    console.error('Unexpected error fetching initial session:', error.message);
  } else {
    console.error('Unexpected error fetching initial session:', error);
  }
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up a listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setLoading(false); 
      }
    );

    // Clean up the listener when the component unmounts
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return { user, session, loading };
};

export default useAuth;