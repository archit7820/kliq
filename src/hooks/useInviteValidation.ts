
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useInviteValidation = (inviteCode: string, enabled: boolean = true) => {
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  const [checkingInvite, setCheckingInvite] = useState(false);

  useEffect(() => {
    if (!enabled || !inviteCode.trim()) {
      setInviteValid(null);
      return;
    }
    
    setCheckingInvite(true);
    
    const timeout = setTimeout(async () => {
      try {
        const searchCode = inviteCode.trim().toUpperCase();
        console.log("Validating invite code:", searchCode);
        
        const { data, error } = await supabase
          .from("profiles")
          .select("referral_code, id, username")
          .eq("referral_code", searchCode)
          .maybeSingle();
        
        console.log("Invite validation result:", { data, error, searchCode });
        
        if (error) {
          console.error("Error validating invite code:", error);
          setInviteValid(false);
        } else if (data) {
          console.log("Valid invite code found for user:", data.username || data.id);
          setInviteValid(true);
        } else {
          console.log("No user found with referral code:", searchCode);
          setInviteValid(false);
        }
      } catch (err) {
        console.error("Exception validating invite code:", err);
        setInviteValid(false);
      }
      setCheckingInvite(false);
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [inviteCode, enabled]);

  return { inviteValid, checkingInvite };
};
