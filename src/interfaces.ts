import type { Response } from 'express';

export interface MyResponse extends Response {
  rows?: object[];
  password?: string;
  pwd?: string;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      isProtected?: boolean;
      user?: {
        id: number;
        [key: string]: any;
      };
      decodedAccessToken?: any;
      decodedRefreshToken?: any;
    }
  }
}