import { User } from './models';
import PocketBase from 'pocketbase';

export const getUserFromModel = (client: PocketBase) => {
  if (!client.authStore.isValid || !client.authStore.model) return;

  const model = client.authStore.model;

  return {
    id: model.id,
    username: model.username,
    email: model.email,
    name: model.name,
    avatar: model.avatar,
    isVerified: model.verified,
    collectionId: model.collectionId,
  } as User;
};

export const generateUsername = (name: string) => {
  const _name = name.split(' ').join('');
  const id = crypto.randomUUID().substring(0, 8);
  return `${_name.slice(0, 5)}${id}`.toLowerCase();
};
