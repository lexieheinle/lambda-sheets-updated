const ApiBuilder = require('claudia-api-builder');
const api = new ApiBuilder();
const spreadsheet = require('./lib/spreadsheet.js');
module.exports = api;

api.get('/update', function (request) {
  return spreadsheet.getSpreadsheet(request.queryString.id)
  .then(response => {
    return response;
  })
});
