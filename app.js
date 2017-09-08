const ApiBuilder = require('claudia-api-builder'),
const api = new ApiBuilder();

module.exports = api;

api.get('/update', function (request) {
  return 'SpreadsheetID: ' + request.queryString.id + ' with name: ' + request.queryString.name;
});
