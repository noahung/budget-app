"use client";

import { useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';

interface ProfileData {
  currency?: string;
}

export function useCurrency() {
  const { user, firestore } = useFirebase();

  const profileDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid, 'profile', 'data') : null),
    [firestore, user]
  );

  const { data: profileData } = useDoc<ProfileData>(profileDocRef);

  return profileData?.currency || 'USD';
}
