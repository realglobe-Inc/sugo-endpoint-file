'use strict'

const sugoAgentFile = require('sugo-agent-file')
const co = require('co')

co(function * () {
  let agent = sugoAgentFile('http://my-sever.com/files')

  // Check if server available
  {
    let ok = yield agent.knock() // Send HTTP HEAD request.
    /* ... */
  }

  // Access dynamic files
  {
    // Write
    yield agent.write('my-text-01.txt', 'This is the text.')
    // Read
    let content = yield agent.read('my-text-01.txt')
    console.log(content)
    /* ... */
    // Check
    let exists = yield agent.exists('my-text-01.text')
    if (exists) {
      // Delete
      yield agent.delete('my-text-01.txt')
    }
  }
}).catch((err) => console.error(err))
