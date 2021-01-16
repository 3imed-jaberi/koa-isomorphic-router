/*!
 * koa-fast-router
 *
 *
 * Copyright(c) 2021 Imed Jaberi
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 */
const { METHODS } = require('http')
const FastRouter = require('trek-router')
const koaCompose = require('koa-compose')

/**
 * Expose `Router()`.
 */
module.exports = Router

/**
 * Fast Router for Koa.js.
 *
 * @api public
 */
function Router () {
  // init vars.
  const fastRouter = new FastRouter()
  const koaFastRouter = {}
  const store = {
    allowHeader: [
      { path: '', methods: [] }
    ]
    // ===> Related to 501 Not Imp. <=== //
    // paths: []
  }

  // normalize the path by remove all trailing slash.
  function normalizePath (path) {
    path = path.replace(/\/\/+/g, '/')
    if (path !== '/' && path.slice(-1) === '/') {
      path = path.slice(0, -1)
    }

    return path
  }

  // ===> Related to 501 Not Imp. <=== //
  // ignore favicon request.
  // source: https://github.com/3imed-jaberi/koa-no-favicon/blob/master/index.js
  // check if exist favicon pattern.
  // function isFavicon(path) {
  //   return /\/favicon\.?(jpe?g|png|ico|gif)?$/i.test(path)
  // }

  // get allow header for specific path.
  function getAllowHeaderTuple (path) {
    return store.allowHeader.find(allow => allow.path === path)
  }

  // register method as allow header filed.
  function allowHeader (path, method) {
    // allow header.
    const allow = getAllowHeaderTuple(path)

    // if this path added at the 1st time.
    if (!allow) {
      store.allowHeader.push({ path, methods: [method] })
      return
    }

    // this path was added.
    store.allowHeader = [
      ...store.allowHeader,
      {
        path,
        methods: [
          // unique val array
          ...new Set([...allow.methods, method])
        ]
      }
    ]
  }

  // register route with specific method.
  function on (method, path, ...middlewares) {
    // normalize the path.
    path = normalizePath(path)
    // register method as allow header filed
    allowHeader(path, method)
    // store.allowHeader.push(method)

    // ===> Related to 501 Not Imp. <=== //
    // register all paths inside the store.
    // store.paths.push(path)

    fastRouter.add(method, path, koaCompose(middlewares))
    return koaFastRouter
  }

  // register route with all methods.
  function all (path, ...middlewares) {
    return on(METHODS.map(method => method.toLowerCase()), path, ...middlewares)
  }

  // append registers methods to koaFastRouter.
  koaFastRouter.on = on
  koaFastRouter.all = all

  // create `router.verbs()` methods, where
  // *verb* is one of the HTTP verbs such
  // as `router.get()` or `router.post()`.
  METHODS.forEach((method) => {
    koaFastRouter[method.toLowerCase()] = (path, ...middlewares) => on(method, path, ...middlewares)
  })

  // router middleware which handle a route matching the request.
  koaFastRouter.routes = () => async (ctx, next) => {
    // normalize the path.
    const path = normalizePath(ctx.path)

    // have slashs ~ solve trailing slash.
    if (path !== ctx.path) {
      ctx.response.status = 301
      ctx.redirect(`${path}${ctx.search}`)
      return
    }

    // find route inside the routes stack.
    const route = fastRouter.find(ctx.method, ctx.path)

    // ===> Need More Word Here <=== //
    // if not exist the current path inside
    // the registred paths ~ 501 Not Implemented.
    // if (!isFavicon(path) && !store.paths.find(p => p === path)) {
    //   ctx.throw(501, `"${ctx.path}" not implemented.`)
    // }

    // if exit route.
    // extract the handler func and the params array.
    const [handler, routeParams] = route

    // check the handler func isn't defined ~ 405 Method Not Allowed.
    if (!handler) {
      // OPTIONS support
      if (ctx.method === 'OPTIONS') {
        ctx.status = 204
        ctx.set('Allow', getAllowHeaderTuple(path).methods.join(', '))
        ctx.body = ''
        return
      }

      ctx.throw(405, `"${ctx.method}" is not allowed in "${ctx.path}"`)
    }

    // check if the route params isn't empty array.
    if (routeParams.length > 0) {
      // parse the params if exist
      // from [{name: 'msg', value: 'hello world!' }]
      // to {msg: 'hello world!'}.
      const params = {}
      routeParams.forEach(({ name: key, value }) => { params[key] = value })

      // append params to ctx and ctx.request.
      ctx.params = ctx.request.params = params
    }

    // wait the handler.
    await handler(ctx)

    await next()
  }

  return koaFastRouter
}
