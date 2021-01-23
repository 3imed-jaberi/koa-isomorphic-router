/*!
 * koa-isomorphic-router
 *
 *
 * Copyright(c) 2021 Imed Jaberi
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 */
const FastRouter = require('trek-router')
const koaCompose = require('koa-compose')
const hashlruCache = require('hashlru')

// normalize the path by remove all trailing slash.
function normalizePath (path) {
  path = path.replace(/\/\/+/g, '/')
  if (path !== '/' && path.slice(-1) === '/') {
    path = path.slice(0, -1)
  }

  return path
}

// get allow header for specific path.
function getAllowHeaderTuple (allowHeaderStore, path) {
  return allowHeaderStore.find(allow => allow.path === path)
}

/**
 * Fast Router for Koa.js.
 *
 * @api public
 */
class Router {
  // init Router.
  constructor (options = {}) {
    this.fastRouter = new FastRouter()
    this.METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    this._prefix = typeof options.prefix === 'string' ? options.prefix : '/'
    this.cache = hashlruCache(1000)
    this.allowHeaderStore = [{ path: '', methods: [] }]

    // `router.verbs()` methods, where *verb* is one of the HTTP verbs.
    this.METHODS.forEach((method) => {
      this[method.toLowerCase()] = this.on.bind(this, method)
    })

    // `router.all()` method >> register route with all methods.
    this.all = this.on.bind(this, this.METHODS.map(method => method.toLowerCase()))
  }

  // register route with specific method.
  on (method, path, ...middlewares) {
    // normalize the path.
    path = normalizePath(this._prefix + path)

    // register path with method(s) to re-use as allow header filed.
    // allow header.
    const allow = getAllowHeaderTuple(this.allowHeaderStore, path)

    // stock to allow header store.
    this.allowHeaderStore = [
      ...this.allowHeaderStore,
      {
        path,
        methods: (
          // allow header.
          !allow
            // if this path added at the 1st time.
            ? [method]
            // this path was added prev.
            // unique val array.
            : [...new Set([...allow.methods, method])]
        )
      }
    ]

    // register to route to the trek-router stack.
    this.fastRouter.add(method, path, koaCompose(middlewares))

    return this
  }

  // prefix method
  prefix (prefix) {
    // add prefix.
    this._prefix = typeof prefix === 'string' ? prefix : '/'
    return this
  }

  // router middleware which handle a route matching the request.
  routes () {
    return async (ctx, next) => {
      // normalize the path.
      const path = normalizePath(ctx.path)
      // init route matched var.
      let route

      // have slashs ~ solve trailing slash.
      if (path !== ctx.path) {
        ctx.response.status = 301
        ctx.redirect(`${path}${ctx.search}`)
        return
      }

      // if `OPTIONS` request responds with allowed methods.
      if (ctx.method === 'OPTIONS') {
        ctx.status = 204
        ctx.set('Allow', getAllowHeaderTuple(this.allowHeaderStore, path).methods.join(', '))
        ctx.body = ''
        return
      }

      // generate the cache key.
      const requestCacheKey = `${ctx.method}_${ctx.path}`
      // get the route from the cache.
      route = this.cache.get(requestCacheKey)

      // if the current request not cached.
      if (!route) {
        // find route inside the routes stack.
        route = this.fastRouter.find(ctx.method, ctx.path)
        // put the matched route inside the cache.
        this.cache.set(requestCacheKey, route)
      }

      // extract the handler func and the params array.
      const [handler, routeParams] = route

      // check the handler func isn't defined.
      if (!handler) {
        // warning: need more work with trek-router.
        // 501 if not exist the current path inside router stack.
        // 405 if exist the current path inside the router stack but with diff method than requested.

        // the current version support the path not impl. as method not allowed.
        // support 405 method not allowed.
        ctx.throw(405, `"${ctx.method}" is not allowed in "${ctx.path}".`)

        // suport 501 not implemented.
        // ctx.throw(501, `"${ctx.path}" not implemented.`)
      }

      // check if the route params isn't empty array.
      if (routeParams.length > 0) {
        // parse the params if exist.
        const params = {}
        routeParams.forEach(({ name: key, value }) => { params[key] = value })

        // append params to ctx and ctx.request.
        ctx.params = ctx.request.params = params
      }

      // wait the handler.
      await handler(ctx)
    }
  }
}

/**
 * Expose `Router()`.
 */
module.exports = Router
