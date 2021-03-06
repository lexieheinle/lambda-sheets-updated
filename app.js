const ApiBuilder = require('claudia-api-builder');
const api = new ApiBuilder();
const spreadsheet = require('./lib/spreadsheet.js');
module.exports = api;
api.get('/update', function (request) {
  return spreadsheet.getSpreadsheet(request.queryString.id, request.queryString.sheet_num, request.queryString.duration)
  .then(response => {
    return response
  })
});
api.get('/delete', function (request) {
  return spreadsheet.deleteJSON(request.queryString.file_name)
  .then(response => {
    if (response) {
      return 'JSON file successfully deleted'
    } else {
      return 'JSON file wasn\'t deleted'
    }
  })
});
