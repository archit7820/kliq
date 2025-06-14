
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

export function useAuthStatus() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (_event === 'INITIAL_SESSION') {
          setLoading(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return { session, user, loading };
}
