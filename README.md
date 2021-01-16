<div align='center'>

# Koa Fast Router
---

[![Build Status][travis-img]][travis-url]
[![Coverage Status][coverage-img]][coverage-url]
[![NPM version][npm-badge]][npm-url]
[![Node.js Version][node-js-badge]][node-js-url]
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
[node-js-badge]: https://img.shields.io/node/v/koa-isomorphic-router.svg?style=flat
[node-js-url]: http://nodejs.org/download
[pr-welcoming-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat
[pr-welcoming-url]: https://github.com/koajs/koa/pull/new

[trek-router]: https://github.com/trekjs/router
[echo-router]: https://github.com/labstack/echo
[support-url]: https://github.com/koajs/3imed-jaberi/koa-isomorphic-router

<!-- ***************** -->

### The fastest elegant modern amiable Koa.js Router ⚡.

## `Features`

* 🦄 Based on top of [Trek Router][trek-router] which inspired by [Echo][echo-router]'s Router.
* 🚀 Faster than other Koa.js router solutions.
* 💅🏻 Express-style routing (`app.get`, `app.post`, `app.put`, `app.delete`, etc.)
* 🔥 Blaze and lightweight router.
* ⚖️ Tiny Bundle: 1.7 kB (gzip)
* 🪁 Named URL parameters.
* 🎯 Route middleware.
* 🥞 Support router layer middlewares.
* ❌ Support for `405 Method Not Allowed`.
* 📋 Responds to `OPTIONS` requests with allowed methods.
* 🧼 Support `trailing slash` and `fixed path` by automatic redirection.
* ✨ Asynchronous support (`async/await`).


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
  .get('/product/:id', async (ctx, next) => {
    ctx.status = 200
    ctx.body = { productId: ctx.params.id }
  })

app
  .use(router.routes());

app.listen(5050);
```


## `API`

### router.[method]|all(path, ...middlewares)

The [http methods](https://nodejs.org/api/http.html#http_http_methods) provide
the routing functionality in `router`.

Method middleware and handlers follow usual Koa middleware behavior,
except they will only be called when the method and path match the request.

```js
// handle a `GET` request
router
  .get('/', function (ctx, res) {
    ctx.set('Content-Type', 'text/plain; charset=utf-8')
    ctx.body = 'Hello World!'
  })
```

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
