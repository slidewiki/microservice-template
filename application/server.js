/*
This is a demo application implementing some interfaces as described in https://docs.google.com/document/d/1337m6i7Y0GPULKLsKpyHR4NRzRwhoxJnAZNnDFCigkc/edit#
This application demonstrates a service which returns previously inserted data from a MongoDB database.
 */

'use strict';

//This is our webserver framework (instead of express)
const hapi = require('hapi'),
  co = require('./common');

//Initiate the webserver with standard or given port
//const server = new hapi.Server({ connections: {routes: {validate: { options: {convert : false}}}}});
let port = (!co.isEmpty(process.env.APPLICATION_PORT)) ? process.env.APPLICATION_PORT : 3000;
const server = new hapi.Server({
  port: port
});

let host = (!co.isEmpty(process.env.VIRTUAL_HOST)) ? process.env.VIRTUAL_HOST : server.info.host;

//Export the webserver to be able to use server.log()
module.exports = server;

//Plugin for sweet server console output
let plugins = [
  require('inert'),
  require('vision'), {
    plugin: require('good'),
    options: {
      ops: {
        interval: 1000
      },
      reporters: {
        console: [{
          module: 'good-squeeze',
          name: 'Squeeze',
          args: [{
            log: '*',
            response: '*',
            request: '*'
          }]
        }, {
          module: 'good-console'
        }, 'stdout']
      }
    }
  }, { //Plugin for swagger API documentation
    plugin: require('hapi-swagger'),
    options: {
      host: host,
      info: {
        title: 'Example API',
        description: 'Powered by node, hapi, joi, hapi-swaggered, hapi-swaggered-ui and swagger-ui',
        version: '0.1.0'
      }
    }
  }
];

const createIndexes = require('./database/createIndexes');

async function init() {
  await server.register(plugins);
  try {
    await createIndexes();
  } catch (err) {
    console.warn('error creating the indexes on the database collection:');
    console.warn(err.message);
  }
  require('./routes.js')(server);

  await server.start();
  server.log('info', 'Server started at ' + server.info.uri);
}

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
