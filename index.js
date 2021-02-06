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
 * Symbol(s) used to set some attributes and methods as private.
 *
 * @api private
 */

// attributes.
const fastRouter = Symbol('@@fastRouter$$')
const METHODS = Symbol('@@METHODS$$')
const throws = Symbol('@@throws$$')
const methodNotAllowed = Symbol('@@methodNotAllowed$$')
const notImplemented = Symbol('@@notImplemented$$')
const routePrefix = Symbol('@@routePrefix$$')
const routePath = Symbol('@@routePath$$')
const middlewaresStore = Symbol('@@middlewaresStore$$')
const cache = Symbol('@@cache$$')
const allowHeaderStore = Symbol('@@allowHeaderStore$$')

// methods.
const on = Symbol('@@on$$')
const getAllowHeaderTuple = Symbol('@@getAllowHeaderTuple$$')
const normalizePath = Symbol('@@normalizePath$$')

/**
 * Fast and isomorphic Router for Koa.js.
 *
 * @api public
 */

class Router {
  // init Router.
  constructor (options = {}) {
    // init attributes.
    this[fastRouter] = new FastRouter()
    this[METHODS] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    this[throws] = typeof options.throw === 'boolean' ? options.throw : false
    this[methodNotAllowed] = options.methodNotAllowed
    this[notImplemented] = options.notImplemented
    this[routePrefix] = typeof options.prefix === 'string' ? options.prefix : '/'
    this[routePath] = undefined
    this[middlewaresStore] = []
    this[cache] = hashlruCache(1000)
    this[allowHeaderStore] = [] // [{ path: '', methods: [] }]
  }

  // normalize the path by remove all trailing slash.
  [normalizePath] (path) {
    path = path.replace(/\/\/+/g, '/')
    if (path !== '/' && path.slice(-1) === '/') {
      path = path.slice(0, -1)
    }

    return path
  }

  // get allow header for specific path.
  [getAllowHeaderTuple] (path) {
    return this[allowHeaderStore].find(allow => allow.path === path)
  }

  // register route with specific method.
  [on] (method, path, ...middlewares) {
    // handle the path arg when passed as middleware.
    if (typeof path !== 'string') {
      middlewares = [path, ...middlewares]
      path = this[routePath]
    }

    // normalize the path.
    path = this[normalizePath](this[routePrefix] + path)

    // register path with method(s) to re-use as allow header filed.
    // allow header.
    const allow = this[getAllowHeaderTuple](path)

    // stock to allow header store with unique val array.
    this[allowHeaderStore] = [...new Map([
      ...this[allowHeaderStore],
      { path, methods: !allow ? [method] : [...new Set([...allow.methods, method])] }
    ].map(item => [item.path, item])).values()]

    // register to route to the trek-router stack.
    this[fastRouter].add(method, path, koaCompose(middlewares))

    // give access to other method after use the current one.
    return this
  }

  // register route with get method.
  get (path, ...middlewares) {
    return this[on]('GET', path, ...middlewares)
  }

  // register route with post method.
  post (path, ...middlewares) {
    return this[on]('POST', path, ...middlewares)
  }

  // register route with put method.
  put (path, ...middlewares) {
    return this[on]('PUT', path, ...middlewares)
  }

  // register route with patch method.
  patch (path, ...middlewares) {
    return this[on]('PATCH', path, ...middlewares)
  }

  // register route with delete method.
  delete (path, ...middlewares) {
    return this[on]('DELETE', path, ...middlewares)
  }

  // `router.all()` method >> register route with all methods.
  all (path, ...middlewares) {
    return this[on](this[METHODS], path, ...middlewares)
  }

  // add prefix to route path.
  prefix (prefix) {
    this[routePrefix] = typeof prefix === 'string' ? prefix : this[routePrefix]
    return this
  }

  // give access to write once the path of route.
  route (path) {
    // update the route-path.
    this[routePath] = path

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
    this[middlewaresStore] = [...this[middlewaresStore], ...middlewares]

    // give access to other method after use the current one.
    return this
  }

  // router middleware which handle a route matching the request.
  routes () {
    return async (ctx) => {
      // normalize the path.
      const path = this[normalizePath](ctx.path)

      // ignore favicon request.
      // src: https://github.com/3imed-jaberi/koa-no-favicon/blob/master/index.js
      if (/\/favicon\.?(jpe?g|png|ico|gif)?$/i.test(ctx.path)) { return }

      // init route matched var.
      let route

      // have slashs ~ solve trailing slash.
      if (path !== ctx.path) {
        ctx.response.status = 301
        ctx.redirect(`${path}${ctx.search}`)
        return
      }

      // generate the cache key.
      const requestCacheKey = `${ctx.method}_${ctx.path}`
      // get the route from the cache.
      route = this[cache].get(requestCacheKey)

      // if the current request not cached.
      if (!route) {
        // find route inside the routes stack.
        route = this[fastRouter].find(ctx.method, ctx.path)
        // put the matched route inside the cache.
        this[cache].set(requestCacheKey, route)
      }

      // extract the handler func and the params array.
      const [handler, routeParams] = route

      // check the handler func isn't defined.
      if (!handler) {
        // warning: need more work with trek-router for support 'param' and 'match-any' route.

        // get methods exist on allow header.
        const allowHeaderFiled = this[getAllowHeaderTuple](path)

        if (allowHeaderFiled) {
          // if `OPTIONS` request responds with allowed methods.
          if (ctx.method === 'OPTIONS') {
            ctx.status = 204
            ctx.set('Allow', allowHeaderFiled.methods.join(', '))
            ctx.body = ''
            return
          }

          // support 405 method not allowed.
          if (this[throws]) {
            throw typeof this[methodNotAllowed] === 'function'
              ? this[methodNotAllowed]()
              : (() => {
                const notAllowedError = new Error(`"${ctx.method}" is not allowed in "${ctx.path}".`)
                notAllowedError.statusCode = 405

                return notAllowedError
              })()
          }

          ctx.status = 405
          ctx.set('Allow', allowHeaderFiled.methods.join(', '))
          ctx.body = `"${ctx.method}" is not allowed in "${ctx.path}".`
          return
        }

        // suport 501 path not implemented.
        if (this[throws]) {
          throw typeof this[notImplemented] === 'function'
            ? this[notImplemented]()
            : (() => {
              const notImplError = new Error(`"${ctx.path}" not implemented.`)
              notImplError.statusCode = 501

              return notImplError
            })()
        }

        ctx.status = 501
        ctx.set('Allow', '')
        ctx.body = `"${ctx.path}" not implemented.`
        return
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
      await Promise.all(this[middlewaresStore])

      // wait the handler.
      await handler(ctx)
    }
  }
}

/**
 * Expose `Router`.
 */

module.exports = Router
