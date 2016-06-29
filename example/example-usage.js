/** This is an example to use sugo-endpoint-file */

'use strict'

const sgServer = require('sg-server')

const server = sgServer({
  middlewares: [
    /* ... */
  ],
  endpoints: {
    '/api/my-docs/:filename': require('sugo-endpoint-file')(
      'var/my-docs/', // Directory path to save files
      {
        // Options
      })
  }
})

server.listen(3000)

