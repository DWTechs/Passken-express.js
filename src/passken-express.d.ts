import type { Request, Response, NextFunction } from 'express';
import type { Options } from '@dwtechs/passken';
import type { MyResponse } from './interfaces';

// Extend Express Request interface globally
declare global {
  namespace Express {
    interface Request {
      isProtected?: boolean;
      decodedAccessToken?: any;
      decodedRefreshToken?: any;
    }
  }
}

declare function refresh(req: Request, res: MyResponse, next: NextFunction): Promise<void>;
declare function decodeAccess(req: Request, _res: Response, next: NextFunction): void;
declare function decodeRefresh(req: Request, _res: Response, next: NextFunction): Promise<void>;
declare function init(options: Options): void;
declare function compare(req: Request, res: MyResponse, next: NextFunction): void;
declare function create(req: Request, _res: Response, next: NextFunction): void;

export { 
  refresh,
  decodeAccess,
  decodeRefresh,
  init,
  compare,
  create,
};


