const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'My API',
        description: 'Description',
        version: '1.0'
    },
    host: 'localhost:5000'
};

const outputFile = './swagger-output.json';
const routes = ['./app.js'];

// NOTE: If you are using the express Router, you must pass in the 'routes' only the root file where the routes starts, such as index.js, app.js, routes.js, etc ...

swaggerAutogen(outputFile, routes, doc);