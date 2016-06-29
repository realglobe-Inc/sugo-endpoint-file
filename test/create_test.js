/**
 * Test case for create.
 * Runs with mocha.
 */
'use strict'

const create = require('../lib/create.js')
const co = require('co')
const sgServer = require('sg-server')
const apemanrequest = require('apemanrequest')
const apemansleep = require('apemansleep')
const apemanport = require('apemanport')
const assert = require('assert')
const fs = require('fs')

describe('create', () => {
  let server, baseUrl
  let request = apemanrequest.create()
  let sleep = apemansleep.create()
  let dirname = `${__dirname}/../tmp/testing-files`

  before(() => co(function * () {
    let endpoint = create(dirname, {})
    assert.ok(endpoint)
    let port = yield apemanport.find()
    server = sgServer({
      endpoints: {
        '/foo/bar/:filename': endpoint
      }
    })
    baseUrl = `http://localhost:${port}`
    yield server.listen(port)
  }))

  after(() => co(function * () {
    yield sleep.sleep(10)
    yield server.close()
  }))

  it('Create a file', () => co(function * () {
    let { body, statusCode } = yield request({
      method: 'POST',
      url: `${baseUrl}/foo/bar/my-json-01.json`,
      json: true,
      body: {
        data: {
          type: 'files',
          id: 'hoge',
          attributes: {
            content: JSON.stringify({
              foo: 'bar'
            }, null, 2)
          }
        }
      }
    })
    assert.ok(body)
    assert.equal(statusCode, 200)
    assert.ok(
      fs.existsSync(`${dirname}/my-json-01.json`)
    )
    assert.deepEqual(require(`${dirname}/my-json-01.json`), {
      foo: 'bar'
    })
  }))

  it('Get the file', () => co(function * () {
    let { body, statusCode } = yield request({
      method: 'GET',
      url: `${baseUrl}/foo/bar/my-json-01.json?encode=utf8`
    })
    assert.ok(body)
    assert.equal(statusCode, 200)
    let { content } = body.data.attributes
    assert.ok(content)
  }))

  it('Update the file', () => co(function * () {
    let { body, statusCode } = yield request({
      method: 'PATCH',
      url: `${baseUrl}/foo/bar/my-json-01.json?encode=utf8`,
      json: true,
      body: {
        data: {
          type: 'files',
          id: 'hoge',
          attributes: {
            content: JSON.stringify({
              foo: 'baz'
            }, null, 2)
          }
        }
      }
    })
    assert.ok(body)
    assert.equal(statusCode, 200)
    let { size } = body.data.attributes
    assert.ok(size)
  }))

  it('Destroy the file', () => co(function * () {
    let { body, statusCode } = yield request({
      method: 'DELETE',
      url: `${baseUrl}/foo/bar/my-json-01.json?encode=utf8`,
      json: true
    })
    assert.ok(body)
    assert.equal(statusCode, 200)
    let { count } = body.meta
    assert.equal(count, 1)
  }))
})

/* global describe, before, after, it */
