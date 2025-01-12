import type { Request, Response, NextFunction } from 'express';
interface MyResponse extends Response {
    rows: any[];
}
declare function compare(req: Request, res: MyResponse, next: NextFunction): void;
declare function create(req: Request, _res: Response, next: NextFunction): void;
declare const _default: {
    compare: typeof compare;
    create: typeof create;
};
export default _default;

