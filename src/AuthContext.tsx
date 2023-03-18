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
  allowUnverifiedUsers?: boolean;
  onSignUp?: (user: User | undefined) => void;
  onSignIn?: (user: User | undefined) => void;
  onSignOut?: () => void;
}

export function AuthProvider({
  children,
  client,
  allowUnverifiedUsers = false,
  onSignUp,
  onSignIn,
  onSignOut,
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

    onSignIn && onSignIn(fromModel);

    if (!fromModel?.isVerified && !allowUnverifiedUsers) {
      signOut(client);
      return;
    }

    setUser(fromModel);
  }, []);

  const signUpHandler = useCallback(async (input: SignUpInput) => {
    await signUp(input, client);

    const fromModel = getUserFromModel(client);

    onSignUp && onSignUp(fromModel);

    if (!fromModel?.isVerified && !allowUnverifiedUsers) {
      signOut(client);
      return;
    }

    setUser(fromModel);
  }, []);

  const signOutHandler = useCallback(() => {
    signOut(client);
    setUser(getUserFromModel(client));
    onSignOut && onSignOut();
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
