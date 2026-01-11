import { users, sellers } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: users;
      seller?: sellers & { shop?: any };
    }
  }
}

export {};
