import type { Request, Response, NextFunction } from 'express';
import type { Options } from '@dwtechs/passken';
interface MyResponse extends Response {
    rows?: any[];
    password?: string;
    pwd?: string;
}
declare function init(options: Options): void;
declare function compare(req: Request, res: MyResponse, next: NextFunction): void;
declare function create(req: Request, _res: Response, next: NextFunction): void;
declare const _default: {
    init: typeof init;
    compare: typeof compare;
    create: typeof create;
};
export default _default;

