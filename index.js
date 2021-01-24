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

/**
 * Some utils funcs.
 *
 * @api private
 */

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
 * Fast and isomorphic Router for Koa.js.
 *
 * @api public
 */

class Router {
  // init Router.
  constructor (options = {}) {
    // init attributes.
    this.fastRouter = new FastRouter()
    this.METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    this.routePrefix = typeof options.prefix === 'string' ? options.prefix : '/'
    this.routePath = undefined
    this.middlewaresStore = []
    this.cache = hashlruCache(1000)
    this.allowHeaderStore = [{ path: '', methods: [] }]

    // `router.verbs()` methods, where *verb* is one of the HTTP verbs.
    this.METHODS.forEach((method) => { this[method.toLowerCase()] = this.on.bind(this, method) })

    // `router.all()` method >> register route with all methods.
    this.all = this.on.bind(this, this.METHODS.map(method => method.toLowerCase()))
  }

  // register route with specific method.
  on (method, path, ...middlewares) {
    // handle the path arg when passed as middleware.
    if (typeof path !== 'string') {
      middlewares = [path, ...middlewares]
      path = this.routePath
    }

    // normalize the path.
    path = normalizePath(this.routePrefix + path)

    // register path with method(s) to re-use as allow header filed.
    // allow header.
    const allow = getAllowHeaderTuple(this.allowHeaderStore, path)

    // stock to allow header store with unique val array.
    this.allowHeaderStore = [
      ...this.allowHeaderStore,
      { path, methods: !allow ? [method] : [...new Set([...allow.methods, method])] }
    ]

    // register to route to the trek-router stack.
    this.fastRouter.add(method, path, koaCompose(middlewares))

    // give access to other method after use the current one.
    return this
  }

  // add prefix to route path.
  prefix (prefix) {
    this.routePrefix = typeof prefix === 'string' ? prefix : '/'
    return this
  }

  // give access to write once the path of route.
  route (path) {
    // update the route-path.
    this.routePath = path

    // give access to other method after use the current one.
    return this
  }

  // use given middleware, if and only if, a route is matched.
  use (...middlewares) {
    // check middlewares.
    if (middlewares.some(mw => typeof mw !== 'function')) {
      throw new TypeError('".use()" requires a middleware(s) function(s)')
    }

    // add the current middlewares to the store.
    this.middlewaresStore = [...this.middlewaresStore, ...middlewares]

    // give access to other method after use the current one.
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
        // - 501: the current path isn't exist inside the router stack.
        // - 405: the current path is exist inside the router stack with diff method than requested.
        // - remove the throwing decision and use `option.throw`.
        // - make the throw way more flexible by pass `option.methodNotAllowed` func for 405
        // and `option.notImplemented` for 501 and make example with `@hapi/boom` methods.

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

      // wait to all middlewares stored by the `use` method.
      await Promise.all(this.middlewaresStore)

      // wait the handler.
      await handler(ctx)
    }
  }
}

/**
 * Expose `Router()`.
 */

module.exports = Router
