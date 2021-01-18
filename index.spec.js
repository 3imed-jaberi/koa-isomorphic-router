const Koa = require('koa')
const request = require('supertest')
const should = require('should')
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const fastRouter = require('.')

describe('koa-fast-router', () => {
  it('should return a object', () => {
    should.equal(typeof fastRouter(), 'object')
  })

  describe('http verbs/methods', () => {
    it('get method', done => {
      const app = createKoaApp('get')

      request(app.listen())
        .get('/test')
        .expect('Content-Type', /json/)
        .expect(/get/)
        .expect(200, done)
    })

    it('post method', done => {
      const app = createKoaApp('post')

      request(app.listen())
        .post('/test')
        .expect('Content-Type', /json/)
        .expect(/post/)
        .expect(200, done)
    })

    it('put method', done => {
      const app = createKoaApp('put')

      request(app.listen())
        .put('/test')
        .expect('Content-Type', /json/)
        .expect(/put/)
        .expect(200, done)
    })

    it('delete method', done => {
      const app = createKoaApp('delete')

      request(app.listen())
        .delete('/test')
        .expect('Content-Type', /json/)
        .expect(/delete/)
        .expect(200, done)
    })

    it('option method ~ support', done => {
      const app = createKoaApp('get')

      request(app.listen())
        .options('/test')
        .expect('Allow', 'GET')
        .expect(204, done)
    })

    describe('all method', () => {
      const app = createKoaApp('all')

      METHODS.forEach((method) => {
        //
        method = method.toLowerCase()

        it(method, (done) => {
          request(app.listen())[method]('/test').expect(200, done())
        })
      })
    })
  })

  it('params', done => {
    const app = createKoaApp('get', null, true)

    request(app.listen())
      .get('/test/work')
      .expect(/get data work/)
      .expect(200, done)
  })

  it('support trailing slash and fixed path', done => {
    const app = createKoaApp('get', '/test//work/', false)

    request(app.listen())
      .get('/test//work/')
      .expect(301)
      .expect('Location', '/test/work')
      .end(done)
  })

  it('405 method not allowed', done => {
    const app = createKoaApp('get')

    request(app.listen())
      .search('/test/work')
      .expect(405, done)
  })

  it('allow header funcs', done => {
    const app = createKoaApp('get', null, false, ['post', 'put', 'delete'])

    request(app.listen())
      .get('/test')
      .expect(200, done)
  })

  it('cache test', done => {
    const app = createKoaApp('get')

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

// util
function createKoaApp (method, path, params, methods) {
  // init
  const app = new Koa()
  const router = fastRouter()

  // register a route
  router[method](path || params ? '/test/:state' : '/test', (ctx) => {
    ctx.status = 200
    const msg = path
      ? `${method} data`
      : `${method} data ${params ? ctx.params.state : ''}`
    ctx.body = { msg }
  })

  if (methods) {
    methods.forEach(m => {
      router[m](path || params ? '/test/:state' : '/test', (ctx) => {})
    })
  }

  // add router middelware
  app
    .use(router.routes())

  return app
}
