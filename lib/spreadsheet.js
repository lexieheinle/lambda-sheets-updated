const Promise = require("bluebird");
const GoogleSpreadsheet = require("google-spreadsheet");
const credentials = process.env;
//const credentials = require('../google-credentials.json');
const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1'
});
const s3 = new AWS.S3();

function getSpreadsheet(id) {

    const doc = Promise.promisifyAll(new GoogleSpreadsheet(id));
    console.log(doc);
    return doc.useServiceAccountAuthAsync(credentials)
        .bind(this)
        .then(() => {
            console.log('got authenticated')
            return doc.getInfoAsync()
                .then((info) => {
                    let title = info.title.toLowerCase().replace(/ /g, "_");
                    console.log(title);
                    return {
                        'sheet': info.worksheets[0],
                        'title': title
                    };
                })
                .catch(err => {
                  console.log('cant authenticate');
                  console.log(err);
                  return err;
                });
        })
        .then((sheetInfo) => {
          console.log('have sheet info');
            const json_name = sheetInfo.title + '.json';
            //See if it's been updated in the last file minutes;
            const newDateObj = new Date(new Date() - 5 * 60000);
            const getPromise = s3.getObject({
                Bucket: 'sheets-updated',
                Key: json_name,
                IfUnmodifiedSince: newDateObj
            }).promise();

            return getPromise.then((data) => {
                return sheetInfo
            }).catch((err) => {
                if (err.statusCode == '404') {
                  return sheetInfo
                } else if (err.statusCode == '412') {
                  return false
                } else {
                  console.log(err);
                }
            })
        })
        .then((sheetInfo) => {
            if (sheetInfo) {
                const sheet = Promise.promisifyAll(sheetInfo.sheet);
                const json_spreadsheet = {
                    "updated": new Date(),
                    "id": id,
                    "data": []
                }
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
                        const json_name = sheetInfo.title + '.json';
                        const json_string = JSON.stringify(json_spreadsheet);
                        const uploadPromise = s3.upload({
                            Bucket: 'sheets-updated',
                            Key: json_name,
                            Body: json_string
                        }).promise();

                        return uploadPromise.then((data) => {
                            return data.Location;
                        }).catch((err) => {
                            return err;
                        })
                    })
            } else {
                return Promise.resolve("No updates needed")
            }
        })
};

module.exports = {
  getSpreadsheet: getSpreadsheet,
}
//getSpreadsheet('1wFXJtXjQ-_JTWUM06RNa0chCdqsm5cF3krhOWMKeQ-Q')
