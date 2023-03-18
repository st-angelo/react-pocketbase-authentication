import { ForgotPasswordInput, SignInInput, SignUpInput } from './models';
import PocketBase from 'pocketbase';
import { generateUsername } from './utils';

export const signIn = async (input: SignInInput, client: PocketBase) => {
  await client.collection('users').authWithPassword(input.email, input.password);
};

export const signUp = async (input: SignUpInput, client: PocketBase) => {
  const username = generateUsername(input.name);
  await client.collection('users').create({ username, ...input });
  await client.collection('users').requestVerification(input.email);
};

export const signOut = (client: PocketBase) => {
  client.authStore.clear();
};

export const forgotPassword = async (input: ForgotPasswordInput, client: PocketBase) => {
  await client.collection('users').requestPasswordReset(input.email);
};
