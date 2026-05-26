import { getCandidat } from "@/lib/actions/getCandidat";
import { signOut, useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";

export function useCandidat() {
  const [candidat, setCandidat] = useState<any>();

  const { data: session } = useSession();

  const getCandidatF = async () => {
    if (session?.user?.id) {
      const c = await getCandidat(session?.user?.id);
      setCandidat(c || null);
    }
    return null;
  };

  const handleSignOut = async () => {
    await signOut();
    // router.push("/auth/recruteur/login");
    window.location.reload();
    setCandidat(null);
  };

  useEffect(() => {
    getCandidatF();
  }, [session]);

  return { candidat, handleSignOut };
}
