import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ForgotPasswordInput, SignInInput, SignUpInput, User } from './models';
import { forgotPassword, signIn, signOut, signUp } from './repository';
import { getUserFromModel } from './utils';
import PocketBase from 'pocketbase';

interface AuthContextData {
  isAuthenticated: boolean;
  isVerified: boolean;
  user?: User;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => void;
  forgotPassword: (input: ForgotPasswordInput) => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextData>({
  isAuthenticated: false,
  isVerified: false,
  signIn: Promise.resolve,
  signUp: Promise.resolve,
  signOut: () => {},
  forgotPassword: Promise.resolve,
});

export function useAuthentication() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: React.ReactNode;
  client: PocketBase;
  allowUnverifiedUsers?: boolean;
  onSignIn?: (user: User | undefined) => void;
  onSignUp?: () => void;
  onSignOut?: () => void;
  onForgotPassword?: () => void;
}

export function AuthProvider({
  children,
  client,
  allowUnverifiedUsers = false,
  onSignIn,
  onSignUp,
  onSignOut,
  onForgotPassword,
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

    onSignUp && onSignUp();
  }, []);

  const signOutHandler = useCallback(() => {
    signOut(client);
    setUser(getUserFromModel(client));
    onSignOut && onSignOut();
  }, []);

  const forgotPasswordHandler = useCallback(async (input: ForgotPasswordInput) => {
    await forgotPassword(input, client);

    onForgotPassword && onForgotPassword();
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
      forgotPassword: forgotPasswordHandler,
    }),
    [user, signInHandler, signUpHandler, signOutHandler]
  );

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
}
