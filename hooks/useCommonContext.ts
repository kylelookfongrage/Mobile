import React from 'react'
import { GenerateMealResult } from '../data';
import { Tier } from '../aws/models';
import { User } from '@supabase/supabase-js';
import { Database } from '../types/Database';

interface CommonIds {
    sub: string;
    setSub: React.Dispatch<React.SetStateAction<string>>;
    username: string;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    userId: string;
    setUserId: React.Dispatch<React.SetStateAction<string>>;
    progressId: string;
    setProgressId: React.Dispatch<React.SetStateAction<string>>;
    subscribed: boolean;
    setSubscribed: React.Dispatch<React.SetStateAction<boolean>>;
    currentIngredietId: null | string;
    setCurrentIngredietId: React.Dispatch<React.SetStateAction<string | null>>;
    aiResult: GenerateMealResult | null;
    setAiResult: React.Dispatch<React.SetStateAction<GenerateMealResult | null>>;
    signedInWithEmail: boolean;
    setSignedInWithEmail: React.Dispatch<React.SetStateAction<boolean>>;
    hasSubscribedBefore: boolean;
    setHasSubscribedBefore: React.Dispatch<React.SetStateAction<boolean>>;
    status: {pt: boolean, fp: boolean};
    setStatus: React.Dispatch<React.SetStateAction<{pt: boolean, fp: boolean}>>;
    user: null | User,
    setUser: (u: User | null) => void;
    profile: Database['public']['Tables']['user']['Row'] | null,
    setProfile: (x: Database['public']['Tables']['user']['Row']) => void;
  }

export const CommonContext = React.createContext<CommonIds>({
    sub: '',
    setSub: () => {},
    username: '',
    setUsername: () => {},
    userId: '',
    setUserId: () => {},
    progressId: '',
    setProgressId: () => {},
    subscribed: false,
    setSubscribed: () => {},
    aiResult: null,
    setAiResult: () => {},
    currentIngredietId: null,
    setCurrentIngredietId: () => {},
    signedInWithEmail: true,
    setSignedInWithEmail: () => {},
    hasSubscribedBefore: false,
    setHasSubscribedBefore: () => {},
    status: {pt: false, fp: false},
    setStatus: () => {},
    user: null, setUser: () => {}, profile: null,
    setProfile: () => {}

})
export const useCommonAWSIds = () => React.useContext<CommonIds>(CommonContext)