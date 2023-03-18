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
