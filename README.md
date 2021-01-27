<div align='center'>

# Koa Isomorphic Router
---

[![Build Status][travis-img]][travis-url]
[![Coverage Status][coverage-img]][coverage-url]
[![NPM version][npm-badge]][npm-url]
![Code Size][code-size-badge]
[![License][license-badge]][license-url]
[![PR's Welcome][pr-welcoming-badge]][pr-welcoming-url]

</div>

<!-- ***************** -->

[travis-img]: https://travis-ci.org/3imed-jaberi/koa-isomorphic-router.svg?branch=master
[travis-url]: https://travis-ci.org/3imed-jaberi/koa-isomorphic-router
[coverage-img]: https://coveralls.io/repos/github/3imed-jaberi/koa-isomorphic-router/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/3imed-jaberi/koa-isomorphic-router?branch=master
[npm-badge]: https://img.shields.io/npm/v/koa-isomorphic-router.svg?style=flat
[npm-url]: https://www.npmjs.com/package/koa-isomorphic-router
[license-badge]: https://img.shields.io/badge/license-MIT-green.svg?style=flat
[license-url]: https://github.com/3imed-jaberi/koa-isomorphic-router/blob/master/LICENSE
[code-size-badge]: https://img.shields.io/github/languages/code-size/3imed-jaberi/koa-isomorphic-router
[pr-welcoming-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat
[pr-welcoming-url]: https://github.com/koajs/koa/pull/new

[trek-router]: https://github.com/trekjs/router
[echo-router]: https://github.com/labstack/echo
[support-url]: https://github.com/koajs/3imed-jaberi/koa-isomorphic-router
[path-to-regexp]: https://github.com/pillarjs/path-to-regexp
[route-recognizer]: https://github.com/tildeio/route-recognizer
[route-trie]: https://github.com/zensh/route-trie
[routington]: https://github.com/pillarjs/routington

[trek-router-benchmarks-url]: https://github.com/trekjs/router#benchmarks
[fastify-benchmarks-url]: https://github.com/fastify/benchmarks#benchmarks
[405-501-warn]: https://github.com/3imed-jaberi/koa-isomorphic-router/blob/master/index.js#L204
[trek-router-405-501-warn]: https://github.com/trekjs/router/issues/23

<!-- ***************** -->

### The fastest elegant modern amiable Koa.js Router ⚡.


## `Features`

* 🦄 Based on top of [Trek Router][trek-router] which inspired by [Echo][echo-router]'s Router.
* 🚀 Faster than other Koa.js router solutions.
* 💅🏻 Express-style routing (`app.get`, `app.post`, `app.put`, `app.delete`, etc.)
* 🔥 Blaze and lightweight router.
* ⚖️ Tiny Bundle: less than 2.5kB (gzip)
* 🪁 Named URL parameters.
* 🎯 Route middleware.
* 🥞 Support router layer middlewares.
* 📋 Responds to `OPTIONS` requests with allowed methods.
* ⛔️ Support for `405 Method Not Allowed`.
* ❌ Support for `501 Path Not Implemented`.
* 🧼 Support `trailing slash` and `fixed path` by automatic redirection.
* ✨ Asynchronous support (`async/await`).
* 🎉 TypeScript support.

### `Note`

Currently, this modules support `405 Method Not Allowed` 
and `501 Path Not Implemented` for 'static' routes only 
as you can see [here][405-501-warn].

As soon as possible when we get response [here][trek-router-405-501-warn]
will support 'param' and 'match-any' routes.


## `Benchmarks`

All Koa router solutions depend on [path-to-regexp][] when our solution 
relies on the [trek-router][] which has the best performance and not over 
the [path-to-regexp][] only also on others such as ([route-recognizer][], 
[route-trie][], [routington][] ...etc).

- [x] See trek-router [benchmarks][trek-router-benchmarks-url] <small>(`trek-router` better perf. than `path-to-regexp`)</small>. <br />
- [x] See fastify [benchmarks][fastify-benchmarks-url] <small>(`koa-isomorphic-router` better perf. than `koa-router`)</small>.


## `Installation`

```bash
# npm
$ npm install koa-isomorphic-router
# yarn
$ yarn add koa-isomorphic-router
```


## `Usage`

This is a practical example of how to use.

```javascript
const Koa = require('koa')
const Router = require('koa-isomorphic-router')

const app = new Koa()
const router = Router()

router
  .get('/product/:id', (ctx, next) => {
    ctx.body = { productId: ctx.params.id }
  })

app.use(router.routes());

app.listen(5050);
```


## `API`

### new Router(options?)

Create a new router.

| Param | Type  | Description |
| ---   | ---   | ---         |
| [options] | `Object` |  |
| [options.prefix] | `String` | prefix router paths |
| [options.throw] | `Boolean` | throw error instead of setting status and header |
| [options.notImplemented] | `function` | throw the returned value in place of the default NotImplemented error |
| [options.methodNotAllowed] | `function` | throw the returned value in place of the default MethodNotAllowed error |

### router.get|post|put|patch|delete|all(path, ...middlewares)

The http methods provide the routing functionality in `router`.

Method middleware and handlers follow usual Koa middleware behavior,
except they will only be called when the method and path match the request.

```js
// handle a GET / request.
router.get('/', (ctx) => { ctx.body = 'Hello World!' })
```

### router.prefix(prePath)

Route paths can be prefixed at the router level:

```js
// handle a GET /prePath/users request.
router
  .prefix('/prePath')
  .get('/users', (ctx) => { ctx.body = 'Hello World!' })
```

### router.route(path)

Lookup route with given path.

```js
// handle a GET /users request.
router
  .route('/users')
  .get((ctx) => { ctx.body = 'Hello World!' })
```

### router.use(...middlewares)

Use given middleware(s). Currently, use middleware(s) for all paths of router isntance.

### router.routes()

Returns router middleware which handle a route matching the request.


## `Support`

If you have any problem or suggestion please open an issue [here][support-url].


## `Call for Maintainers/Contributors`

This module is a attempt to craft an isomorphic fast Router, from/to Koa.js 
community. So, don't hesitate to offer your help ❤️.


## `Contributors`

| Name            | Website                         |
| --------------- | ------------------------------- |
| **Imed Jaberi** | <https://www.3imed-jaberi.com/> |


#### License
---

[MIT](LICENSE) &copy;	[Imed Jaberi](https://github.com/3imed-jaberi)
