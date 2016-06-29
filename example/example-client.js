/** This is example of client */

'use strict'

const sugoAgentFile = require('sg-agent-file')
const co = require('co')

co(function * () {
  let agent = sugoAgentFile('/api/my-docs')
  yield agent.write('my-data-01.json', JSON.stringify({ foo: 'bar' }, null, 2))
  let content = yield agent.read('my-data-01.json')
  /* .. */
}).catch((err) => console.error(err))
