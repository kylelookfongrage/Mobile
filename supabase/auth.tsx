import {
    AppleAuthenticationScope,
    signInAsync,
  } from "expo-apple-authentication";
  import {
    CryptoDigestAlgorithm,
    digestStringAsync,
  } from "expo-crypto";
//@ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "./index";
import * as WebBrowser from 'expo-web-browser'
import { useEffect } from 'react';
import { AuthChangeEvent, User } from "@supabase/supabase-js";
  
  /**
   * Initiates the auth flow for the native Apple Sign In.
   * Returns the token and nonce that will later be passed
   * to Supabase to complete the sign in.
   */
  export async function initiateAppleSignIn() {
    const rawNonce = uuidv4();
    const hashedNonce = await digestStringAsync(
      CryptoDigestAlgorithm.SHA256,
      rawNonce,
    );
  
    const credential = await signInAsync({
      requestedScopes: [
        AppleAuthenticationScope.FULL_NAME,
        AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
  
    const token = credential.identityToken;
    if (!token) throw new Error("No id token");
  
    return { token, nonce: rawNonce };
  }



export function useAppleLogin(){
  const signInWithApple = async () => {
    try {
      const { token, nonce } = await initiateAppleSignIn();
      const { error, data } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token,
          nonce,
      });

  } catch (error) {

  }
  }
  return {signInWithApple}
}


export const useGoogleSignIn = () => {

    useEffect(() => {
        WebBrowser.warmUpAsync()
        return () => {
            WebBrowser.coolDownAsync()
        }
    }, [])

    const loginWithGoogle = async () => {
        const { data } = await supabase.auth.signInWithOAuth({
            provider: 'google', options: {
                redirectTo: 'ragepersonalhealth://login',
            }
        })
        let url = data.url
        if (url) {
            const result = await WebBrowser.openAuthSessionAsync(url, 'ragepersonalhealth://login', { showInRecents: true })
            //@ts-ignore
            let params = extractParamsFromUrl(result?.url)
            if (params?.access_token && params.refresh_token) {
                const res = await supabase.auth.setSession({access_token: params.access_token, refresh_token: params.refresh_token })
            }
        }

    }

    const extractParamsFromUrl = (url: string) => {
        if (!url) return null;
        const params = new URLSearchParams(url.split("#")[1]);
        const data = {
            access_token: params.get("access_token"),
            expires_in: parseInt(params.get("expires_in") || "0"),
            refresh_token: params.get("refresh_token"),
            token_type: params.get("token_type"),
            provider_token: params.get("provider_token"),
        };

        return data;
    };


    return { loginWithGoogle }

};

export function useSignOut(){
  const signOut = async () => {
    await supabase.auth.signOut()
  }
  return {signOut}
}


export function useEmailSignIn(){
  const login = async (email: string, password: string) => {
      try {
          const res = await supabase.auth.signInWithPassword({email, password})
          if (res.error) throw Error(res.error.message)
      } catch (e: any) {
          console.log(e)
      }
  }
  const register = async (email: string, password: string, confirmPassword: string) => {
      await supabase.auth.signUp({email, password})
  }
  // const forgotPassword = async (email: string) => {
  //     await supabase.auth.resetPasswordForEmail()
  // }
  return {login, register}
}



export function useAuthListener(callback: (event: AuthChangeEvent, user: User) => void){
  useEffect(() => {
    let sub = supabase.auth.onAuthStateChange((e, s) => {
      if (s?.user) {
        callback(e, s.user)
      }
    })
    return () => sub.data?.subscription?.unsubscribe()
  }, [])
}