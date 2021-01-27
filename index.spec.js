const Koa = require('koa')
const request = require('supertest')
const assert = require('assert')
const FastRouter = require('.')
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

describe('koa-isomorphic-router', () => {
  describe('self', () => {
    it('should return a object', () => {
      assert.strictEqual(typeof new FastRouter(), 'object')
    })

    it('should not return private props/method', () => {
      assert.deepStrictEqual(
        Object.getOwnPropertyNames(FastRouter.prototype),
        [
          'constructor', 'get', 'post', 'put', 'patch',
          'delete', 'all', 'prefix', 'route', 'use', 'routes'
        ]
      )
    })
  })

  describe('http verbs/methods', () => {
    function createKoaApp (method, path) {
      // init
      const app = new Koa()
      const router = new FastRouter()

      // register a route
      router[method](path, (ctx) => {
        ctx.status = 200
        ctx.body = { msg: `${method} data` }
      })

      // add router middelware
      app.use(router.routes())

      return app
    }

    it('get method', (done) => {
      request(createKoaApp('get', '/test').listen())
        .get('/test')
        .expect('Content-Type', /json/)
        .expect(/get data/)
        .expect(200, done)
    })

    it('post method', (done) => {
      request(createKoaApp('post', '/test').listen())
        .post('/test')
        .expect('Content-Type', /json/)
        .expect(/post data/)
        .expect(200, done)
    })

    it('put method', (done) => {
      request(createKoaApp('put', '/test').listen())
        .put('/test')
        .expect('Content-Type', /json/)
        .expect(/put data/)
        .expect(200, done)
    })

    it('patch method', (done) => {
      request(createKoaApp('patch', '/test').listen())
        .patch('/test')
        .expect('Content-Type', /json/)
        .expect(/patch data/)
        .expect(200, done)
    })

    it('delete method', (done) => {
      request(createKoaApp('delete', '/test').listen())
        .delete('/test')
        .expect('Content-Type', /json/)
        .expect(/delete data/)
        .expect(200, done)
    })

    describe('all method', () => {
      const app = createKoaApp('all', '/test')

      METHODS.forEach((method) => {
        it(method.toLowerCase(), (done) => {
          request(app.listen())[method.toLowerCase()]('/test').expect(200, done())
        })
      })
    })
  })

  describe('favicon request', () => {
    function createKoaApp (method, path) {
      // init
      const app = new Koa()
      const router = new FastRouter()

      // register a route
      router[method](path, (ctx) => {
        ctx.status = 200
        ctx.body = { msg: `${method} data` }
      })

      // add router middelware
      app.use(router.routes())

      return app
    }

    it('should ignore the favicon request', (done) => {
      request(createKoaApp('get', '/test').listen())
        .get('/favicon.ico')
        .expect(404, done)
    })
  })

  describe('allow header field', () => {
    function createKoaApp (method, path, methods) {
      // init
      const app = new Koa()
      const router = new FastRouter()

      // register a route
      router[method](path, (ctx) => {
        ctx.status = 200
        ctx.body = { msg: `${method} data` }
      })

      methods.forEach(m => { router[m](path, () => {}) })

      // add router middelware
      app.use(router.routes())

      return app
    }

    it('should allow header funcs work', (done) => {
      request(createKoaApp(
        'get',
        'test',
        ['post', 'put', 'delete']
      ).listen()).get('/test').expect(200, done)
    })
  })

  describe('params', () => {
    function createKoaApp (method, path) {
      // init
      const app = new Koa()
      const router = new FastRouter()

      // register a route
      router[method](path, (ctx) => {
        ctx.status = 200
        ctx.body = { msg: `${method} data ${ctx.params ? ctx.params.state : ''}` }
      })

      // add router middelware
      app.use(router.routes())

      return app
    }

    it('should return a response with params', (done) => {
      request(createKoaApp('get', '/test/:state').listen())
        .get('/test/work')
        .expect(/get data work/)
        .expect(200, done)
    })
  })

  describe('trailing slash and fixed path', () => {
    function createKoaApp (method, path) {
      // init
      const app = new Koa()
      const router = new FastRouter()

      // register a route
      router[method](path, (ctx) => {
        ctx.status = 200
        ctx.body = { msg: `${method} data` }
      })

      // add router middelware
      app.use(router.routes())

      return app
    }

    it('should normalize the path and redirect to correct one', (done) => {
      request(createKoaApp('get', '//test/').listen())
        .get('//test')
        .expect(301)
        .expect('Location', '/test')
        .end(done)
    })
  })

  describe('options request', () => {
    function createKoaApp (method, path) {
      // init
      const app = new Koa()
      const router = new FastRouter()

      // register a route
      router[method](path, (ctx) => {
        ctx.status = 200
        ctx.body = { msg: `${method} data` }
      })

      // add router middelware
      app.use(router.routes())

      return app
    }

    it('should responds with allowed methods', (done) => {
      request(createKoaApp('get', '/test').listen())
        .options('/test')
        .expect('Allow', 'GET')
        .expect(204, done)
    })
  })

  describe('405 method not allowed', () => {
    function createKoaApp (method, path, throwObj) {
      // init
      const app = new Koa()
      const router = new FastRouter(throwObj)

      // register a route
      router[method](path, (ctx) => {
        ctx.status = 200
        ctx.body = { msg: `${method} data` }
      })

      // add router middelware
      app.use(router.routes())

      return app
    }

    it('should responds with method not allowed', (done) => {
      request(createKoaApp('get', '/test').listen())
        .post('/test')
        .expect(405, done)
    })

    it('should throw when passed throw eq true as instance arg', (done) => {
      request(createKoaApp('get', '/test', { throw: true }).listen())
        .post('/test')
        .expect(405, (err) => err ? done(err) : done())
    })

    it('should throw with custom function when passed as instance arg', (done) => {
      function methodNotAllowed () {
        const methodNotAllowedErr = new Error('Custom Method Not Allowed Error')
        methodNotAllowedErr.type = 'custom'
        methodNotAllowedErr.statusCode = 405
        methodNotAllowedErr.body = {
          error: 'Custom Method Not Allowed Error',
          statusCode: 405,
          otherStuff: true
        }

        return methodNotAllowedErr
      }

      request(createKoaApp('get', '/test', { throw: true, methodNotAllowed }).listen())
        .post('/test')
        .expect(405)
        .end((err) => err ? done(err) : done())
    })
  })

  describe('501 path not implemented', () => {
    function createKoaApp (method, path, throwObj) {
      // init
      const app = new Koa()
      const router = new FastRouter(throwObj)

      // register a route
      router[method](path, (ctx) => {
        ctx.status = 200
        ctx.body = { msg: `${method} data` }
      })

      // add router middelware
      app.use(router.routes())

      return app
    }

    it('should responds with path not implemented', (done) => {
      request(createKoaApp('get', '/test').listen())
        .get('/not-imp-test')
        .expect(501, done)
    })

    it('should throw when passed throw eq true as instance arg', (done) => {
      request(createKoaApp('get', '/test', { throw: true }).listen())
        .get('/not-imp-test')
        .expect(501)
        .end((err) => err ? done(err) : done())
    })

    it('should throw with custom function when passed as instance arg', (done) => {
      function notImplemented () {
        const pathNotImplementedErr = new Error('Custom Path Not Implemented Error')
        pathNotImplementedErr.type = 'custom'
        pathNotImplementedErr.statusCode = 501
        pathNotImplementedErr.body = {
          error: 'Custom Path Not Implemented Error',
          statusCode: 501,
          otherStuff: true
        }

        return pathNotImplementedErr
      }

      request(createKoaApp('get', '/test', { throw: true, notImplemented }).listen())
        .get('/not-imp-test')
        .expect(501)
        .end((err) => err ? done(err) : done())
    })
  })

  describe('cache', () => {
    function createKoaApp (method, path) {
      // init
      const app = new Koa()
      const router = new FastRouter()

      // register a route
      router[method](path, (ctx) => {
        ctx.status = 200
        ctx.body = { msg: `${method} data` }
      })

      // add router middelware
      app.use(router.routes())

      return app
    }

    it('should get request from the cache', (done) => {
      const app = createKoaApp('get', '/test')

      // no cached request.
      request(app.listen())
        .get('/test')
        .expect('Content-Type', /json/)
        .expect(/get/)
        .expect(200, () => {
          // cached request.
          request(app.listen())
            .get('/test')
            .expect('Content-Type', /json/)
            .expect(/get/)
            .expect(200, done)
        })
    })
  })

  describe('route method', () => {
    function createKoaApp (method, path) {
      // init
      const app = new Koa()
      const router = new FastRouter()

      // register a route
      router
        .route(path)[method]((ctx) => {
          ctx.status = 200
          ctx.body = { msg: `${method} data` }
        })

      // add router middelware
      app.use(router.routes())

      return app
    }

    it('should route method work', (done) => {
      request(createKoaApp('get', '/test').listen())
        .get('/test')
        .expect('Content-Type', /json/)
        .expect(/get/)
        .expect(200, done)
    })
  })

  describe('prefix as instance arg and method', () => {
    function createKoaApp (method, path, { prefix, useMethod }) {
      // init
      const app = new Koa()
      const router = new FastRouter(!useMethod ? { prefix } : undefined)

      // register a route
      router
        .prefix(useMethod ? prefix : undefined)[method](path, (ctx) => {
          ctx.status = 200
          ctx.body = { msg: `${method} data` }
        })

      // add router middelware
      app.use(router.routes())

      return app
    }

    // bad arg passed ==> don't use the prefix.

    it('should prefix instance arg work', (done) => {
      request(createKoaApp(
        'get',
        '/test',
        { prefix: '/preRoute', useMethod: false }
      ).listen())
        .get('/preRoute/test')
        .expect('Content-Type', /json/)
        .expect(/get/)
        .expect(200, done)
    })

    it('should prefix method work', (done) => {
      request(createKoaApp(
        'get',
        '/test',
        { prefix: '/preRoute', useMethod: true }
      ).listen())
        .get('/preRoute/test')
        .expect('Content-Type', /json/)
        .expect(/get/)
        .expect(200, done)
    })
  })

  describe('use method', () => {
    function createKoaApp (method, path, handler) {
      // init
      const app = new Koa()
      const router = new FastRouter()

      // register a route
      router
        .use(handler)[method](path, (ctx) => {
          ctx.status = 200
          ctx.body = { msg: `${method} data` }
        })

      // add router middelware
      app.use(router.routes())

      return app
    }

    it('should use method work with good arg', (done) => {
      const handler = (ctx, next) => {
        console.log('logger', ctx.status, ctx.path)
        return next
      }

      request(createKoaApp('get', 'test', handler).listen())
        .get('/test')
        .expect('Content-Type', /json/)
        .expect(/get/)
        .expect(200, done)
    })

    it('should use method throw with bad arg', () => {
      assert.throws(() => { createKoaApp('get', 'test', 'bad args') })
    })
  })
})
