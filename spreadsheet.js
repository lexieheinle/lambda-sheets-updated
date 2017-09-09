const Promise = require("bluebird");
const GoogleSpreadsheet = require("google-spreadsheet");
const credentials = require('./google-credentials.json');

function getSpreadsheet(id) {

    const doc = Promise.promisifyAll(new GoogleSpreadsheet(id));

    doc.useServiceAccountAuthAsync(credentials)
        .bind(this)
        .then(function() {
            return doc.getInfoAsync()
                .then(function(info) {
                    return info.worksheets[0];
                });
        })
        .then(function(sheet) {
            sheet = Promise.promisifyAll(sheet);
            console.log(sheet);

            return sheet.clearAsync()
                .then(function() {
                    return sheet.getRows()
                });
        });
}

getSpreadsheet('1wFXJtXjQ-_JTWUM06RNa0chCdqsm5cF3krhOWMKeQ-Q');
