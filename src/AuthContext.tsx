import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SignInInput, SignUpInput, User } from './models';
import { signIn, signOut, signUp } from './repository';
import { getUserFromModel } from './utils';
import PocketBase from 'pocketbase';

interface AuthContextData {
  isAuthenticated: boolean;
  isVerified: boolean;
  user?: User;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = React.createContext<AuthContextData>({
  isAuthenticated: false,
  isVerified: false,
  signIn: Promise.resolve,
  signUp: Promise.resolve,
  signOut: () => {},
});

export function useAuthentication() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: React.ReactNode;
  client: PocketBase;
  onSignUp?: () => void;
  onSignInUnverified?: () => void;
}

export function AuthProvider({
  children,
  client,
  onSignUp,
  onSignInUnverified,
}: AuthProviderProps) {
  const [user, setUser] = useState<User>();

  // Set initial model from authStore

  useEffect(() => {
    setUser(getUserFromModel(client));
  }, []);

  //#region Handlers

  const signInHandler = useCallback(async (input: SignInInput) => {
    await signIn(input, client);

    const fromModel = getUserFromModel(client);
    if (!fromModel?.isVerified) {
      onSignInUnverified && onSignInUnverified();
      signOut(client);
      return;
    }

    setUser(fromModel);
  }, []);

  const signUpHandler = useCallback(async (input: SignUpInput) => {
    await signUp(input, client);

    const fromModel = getUserFromModel(client);
    if (!fromModel?.isVerified) {
      onSignUp && onSignUp();
      signOut(client);
      return;
    }

    setUser(fromModel);
  }, []);

  const signOutHandler = useCallback(() => {
    signOut(client);
    setUser(getUserFromModel(client));
  }, []);

  //#endregion

  const data = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      isVerified: user?.isVerified ?? false,
      user,
      signIn: signInHandler,
      signUp: signUpHandler,
      signOut: signOutHandler,
    }),
    [user, signInHandler, signUpHandler, signOutHandler]
  );

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
}
