
const frontEndServer = require('./front-end-server');
const ClientTestServer = require('./client-test-server');
const backendServer = require('./back-end-server');


backendServer.start();
frontEndServer.start();
ClientTestServer.start();


