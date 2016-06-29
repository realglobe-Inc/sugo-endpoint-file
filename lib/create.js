/**
 * Endpoint to handle files
 * @function sugoEndpointFile
 * @param {string} dirname - Directory name of files path
 * @param {object} [options] - Optional settings.
 * @returns {function} - Defined app function.
 */

'use strict'

const co = require('co')
const path = require('path')
const { existsAsync, readFileAsync, writeFileAsync, statAsync, unlinkAsync, mkdirpAsync } = require('apemanfs')
const debug = require('debug')('sugo:endpoint:file')

/** @lends sugoEndpointFile */
function create (dirname, options = {}) {
  dirname = path.resolve(dirname)

  let locks = {}

  return [
    co.wrap(function * validate (ctx, next) {
      let { data } = ctx.request.body
      let { params } = ctx
      let filename = path.resolve(dirname, params.filename)
      let traversal = filename.indexOf(dirname) !== 0
      ctx.state = Object.assign(ctx.state || {}, {
        filename, data
      })
      if (traversal) {
        ctx.status = 400
        ctx.body = {
          errors: [ create.traversalError() ]
        }
        return
      }
      locks[ filename ] = true
      yield next()
      locks[ filename ] = false
    }),
    {
      /**
       * Description of this middleware.
       */
      $desc: 'Endpoint to handle files.',
      /** Create a file */
      'POST': co.wrap(function * middleware (ctx) {
        debug('handle')
        let { filename, data } = ctx.state
        yield mkdirpAsync(path.dirname(filename))
        let { content } = data.attributes
        yield writeFileAsync(filename, content)
        let { size } = yield statAsync(filename)
        ctx.body = {
          data: {
            type: 'files',
            attributes: { size }
          }
        }
      }),
      /** Get file content */
      'GET': co.wrap(function * middleware (ctx) {
        debug('handle')
        let { filename } = ctx.state
        let { encode } = ctx.query
        let exists = yield existsAsync(filename)
        if (!exists) {
          ctx.status = 404
          return
        }
        let content = yield readFileAsync(filename, encode || 'utf8')
        let { size } = yield statAsync(filename)
        ctx.body = {
          data: {
            type: 'files',
            attributes: { content, size }
          }
        }
      }),
      /** Update the file */
      'PATCH': co.wrap(function * middleware (ctx) {
        debug('handle')
        let { filename, data } = ctx.state
        let exists = yield existsAsync(filename)
        if (!exists) {
          ctx.status = 404
          return
        }
        let { content } = data.attributes
        yield writeFileAsync(filename, content)
        let { size } = yield statAsync(filename)
        ctx.body = {
          data: {
            type: 'files',
            attributes: { size }
          }
        }
      }),
      /** Destroy the file */
      'DELETE': co.wrap(function * middleware (ctx) {
        debug('handle')
        let { filename } = ctx.state
        let exists = yield existsAsync(filename)
        let count = 0
        if (exists) {
          yield unlinkAsync(filename)
          count += 1
        }
        ctx.body = { meta: { count } }
      })
    }
  ]
}

Object.assign(create, {
  traversalError () {
    return {
      title: 'DIRECTORY_TRAVERSAL_DETECTED',
      detail: 'Invalid filename',
      source: {
        pointer: 'params/filename'
      }
    }
  },
  conflictError () {
    return {
      title: 'RESOURCE_CONFLICT',
      detail: 'Conflict on file.',
      source: {
        pointer: 'params/filename'
      }
    }
  }
})

module.exports = create
