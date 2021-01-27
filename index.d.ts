/* ====================== USAGE ======================
    import * as Router from "koa-isomorphic-router";
    const router = new Router();
 ===================================================== */

import * as Koa from "koa";

declare namespace Router {
    export interface IRouterOptions {
        /**
         * prefix for all routes.
         */
        prefix?: string;
        /**
         * throw error instead of setting status and header
         */
        throw?: boolean;
        /**
         * throw the returned value in place of the default NotImplemented error
         */
        notImplemented?: () => any;
        /**
         * throw the returned value in place of the default MethodNotAllowed error
         */
        methodNotAllowed?: () => any;
    }

    export type IMiddleware<StateT = any, CustomT = {}> = Koa.Middleware<StateT, CustomT>
}
 
declare class Router<StateT = any, CustomT = {}> {
    /**
     * Create a new router.
     */
    constructor(options?: Router.IRouterOptions);

    /**
     * HTTP get method
     */
    get(
        path?: string,
        ...middlewares: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;

    /**
     * HTTP post method
     */
    post(
        path?: string,
        ...middlewares: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;

    /**
     * HTTP put method
     */
    put(
        path?: string,
        ...middlewares: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;

    /**
     * HTTP patch method
     */
    patch(
        path?: string,
        ...middlewares: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;

    /**
     * HTTP delete method
     */
    delete(
        path?: string,
        ...middlewares: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;

    /**
     * Register route with all methods.
     */
    all(
        path?: string,
        ...middlewares: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;

    /**
     * Set the path prefix for a Router instance that was already initialized.
     */
    prefix(prefix: string): Router<StateT, CustomT>;

    /**
     * Lookup route with given `path`.
     */
    route(path: string): Router<StateT, CustomT>;

    /**
     * Use given middleware.
     */
    use(...middleware: Array<Router.IMiddleware<StateT, CustomT>>): Router<StateT, CustomT>;

    /**
     * Returns router middleware which dispatches a route matching the request.
     */
    routes(): Router.IMiddleware<StateT, CustomT>;
}

export = Router;
