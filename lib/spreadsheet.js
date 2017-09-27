const Promise = require("bluebird");
const GoogleSpreadsheet = require("google-spreadsheet");
const credentials = process.env;
//const credentials = require('../google-credentials.json');
const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1'
});
const s3 = new AWS.S3();
function getSpreadsheet(id, sheet_num = 0, duration=5) {
    const doc = Promise.promisifyAll(new GoogleSpreadsheet(id));
    return doc.useServiceAccountAuthAsync(credentials)
        .bind(this)
        .then(() => {
            console.log('got authenticated')
            return doc.getInfoAsync()
                .then((info) => {
                    let title = info.title.toLowerCase().replace(/ /g, "_") + '-' + info.worksheets[parseInt(sheet_num)].title.toLowerCase().replace(/ /g, "_");
                    return {
                        'sheet': info.worksheets[parseInt(sheet_num)],
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
            //See if it's been updated in the last five minutes;
            const newDateObj = new Date(new Date() - parseInt(duration) * 60000);
            const getPromise = s3.getObject({
                Bucket: 'sheets-updated',
                Key: json_name,
                IfUnmodifiedSince: newDateObj
            }).promise();

            return getPromise.then((data) => {
                return sheetInfo
            }).catch((err) => {
                if (err.statusCode == '404') {
                  console.log('Needs updating')
                  return sheetInfo
                } else if (err.statusCode == '412') {
                  console.log('No updates')
                  return false
                } else {
                  console.log(err);
                }
            })
        })
        .then((sheetInfo) => {
            if (sheetInfo) {
                console.log('Sheet needs updating')
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
                            let clean_header = cell.value.toLowerCase().trim().replace(/ /g,"-");
                            if (clean_header.indexOf('#') != -1) {
                              let cleaner_header = clean_header.replace(/#-/g, '');
                              if(headers.indexOf(cleaner_header) != -1) {
                                cleaner_header += '_2'
                              }
                              headers.push(cleaner_header)
                            } else {
                              headers.push(clean_header)
                            }


                        })
                        return headers;
                    })
                    .then(() => {
                        return sheet.getRowsAsync()
                            .then((rows) => {
                                rows.forEach((row) => {
                                    let rowInfo = {}
                                    headers.forEach((header) => {
                                        const weird_header = header.replace(/-/g,"");
                                        rowInfo[header] = row[weird_header]
                                    })
                                    json_spreadsheet['data'].push(rowInfo)
                                })
                                return json_spreadsheet
                            });
                    })
                    .then(() => {
                        console.log('Updating JSON')
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
                console.log('No updates needed')
                return Promise.resolve("No updates needed")
            }
        })
};

module.exports = {
  getSpreadsheet: getSpreadsheet,
}
