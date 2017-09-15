const Promise = require("bluebird");
const GoogleSpreadsheet = require("google-spreadsheet");
const credentials = require('./google-credentials.json');
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const s3 = new AWS.S3();

function getSpreadsheet(id) {

    const doc = Promise.promisifyAll(new GoogleSpreadsheet(id));

    doc.useServiceAccountAuthAsync(credentials)
        .bind(this)
        .then(() => {
            return doc.getInfoAsync()
                .then((info) => {
                  console.log('info stuff')
                    console.log(info);
                    let title = info.title.toLowerCase().replace(/ /g,"_");
                    return [info.worksheets[0], title];
                });
        })
        .then((sheetInfo) => {
            sheet = Promise.promisifyAll(sheetInfo[0]);
            const json_spreadsheet = {"updated":new Date(), "id": id, "data": []}
            const headers = [];
            return sheet.getCellsAsync({
                    'min-row': 1,
                    'max-row': 1
                })
                .then((cells) => {
                    cells.forEach((cell) => {
                        headers.push(cell.value)
                    })
                    return headers;
                })
                .then(() => {
                    return sheet.getRowsAsync()
                        .then((rows) => {
                            rows.forEach((row) => {
                              let rowInfo = {}
                              headers.forEach((header) => {
                                rowInfo[header] = row[header]
                              })
                              json_spreadsheet['data'].push(rowInfo)
                            })
                            //console.log(rows);
                            return json_spreadsheet
                        });
                })
                .then(() => {
                  const json_name = sheetInfo[1] + '.json';
                  const json_string = JSON.stringify(json_spreadsheet);
                  const uploadPromise = s3.upload({
                    Bucket: 'sheets-updated', Key: json_name, Body: json_string
                  }).promise();

                  return uploadPromise.then((data) => {
                    console.log('Success');
                    console.log(data)
                  }).catch((err) => {
                    console.log('fail');
                    console.log(err);
                  })
                })
        });
};

getSpreadsheet('1wFXJtXjQ-_JTWUM06RNa0chCdqsm5cF3krhOWMKeQ-Q');
