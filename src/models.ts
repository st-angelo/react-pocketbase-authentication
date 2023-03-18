export type User = {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  collectionId: string;
};

export type SignInInput = {
  usernameOrEmail: string;
  password: string;
};

export type SignUpInput = {
  name: string;
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
};

export type ForgotPasswordInput = {
  email: string;
};
