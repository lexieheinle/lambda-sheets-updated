# sheets-updated
Lambda function to keep specific Google Sheets automatically baked out to JSON. You can also create a [backup of public Google Sheets](https://s3.amazonaws.com/sheets-updated/data_stories_dataset-main_data.json).

## Getting started
1. Run `npm install` for dependencies.
2. Make sure your AWS environmental credentials have the [correct security permissions](https://claudiajs.com/tutorials/installing.html).
3. Run `npm create`, and Claudia will create the Lambda function for AWS.
### Configuring AWS
The default IAM role sheets-updated-executor doesn't have access to S3, which will hold all the generated JSON, so using the [IAM section of the AWS console website](https://console.aws.amazon.com/iam), find the Roles and then choose the newly created sheets-updated-executor. After selecting that role, attach the AmazonS3FullAccess policy since you need both Read/Write access.
### Configuring Google
Using [these instructions](https://github.com/theoephraim/node-google-spreadsheet#service-account-recommended-method) for the Service Account configuration, make sure your credentials.json file is in the directory, with the name of google-credentials.json. *If you want to change the name, make sure to do so in the package.json update command as well as in the .gitignore.*
### Adding to a Google Sheet
1. If it's a private Google Sheet, you'll need to share the sheet with the client_email given in google-credentials.json.
2. Under the Tools menu, click Script editor.
3. Copy and paste the onEdit.gs script into the window. *Change the lambda_url to reflect the url generated when you created the lambda function.*
4. Edit -> Current project's triggers - > Click here to add one now. 
5. Change the Time-driven event to be "From spreadsheet" and then "On edit." *For debugging purposes, I would recommend adding notifications as well.* 
6. Click save, and you'll be asked to Review Permissions. Choose your Google account and then you'll receive a rather intense unverified app page. Click "Advanced" and then "Go to Untitled project (unsafe)." Finally, click Allow so the script is added to the Sheet.
7. Back on the Google Sheet, make edits to the sheet, and you'll see a comment with the link to the json has been added to the changed cells.

## JSON format
`{
  "updated":"2017-09-23T15:45:49.529Z",
  "id":"1n-94-1wecWTy6nKjz4AEIu6o1lxAN1iGuUM2YBVWyjs",
  "data":[{
    "id":"99","date":"Fri, 02 Jun 2017 16:24:43 +0000","title":"99 | Data Visualization at Capital One with Kim Rees and Steph Hay","type":"Chat","guests":"2","gender":"F","duration":"0:49:35","url-blog":"http://datastori.es/99-data-visualization-at-capital-one-with-kim-rees-and-steph-hay/","url-audio":"http://datastori.es/podlove/file/4032/s/feed/c/podcast/99-data-visualization-at-capital-one-with-kim-rees-and-steph-hay.m4a",
    }]
}
`
## Other considerations
### Exporting a specific sheet
By default, the first created sheet is used when a sheet number isn't provided. The json naming scheme is {{ google_sheet_title_lowercase_and_underdashes}}-{{ specific_worksheet_title_same_formating_as_previous}}.json
### Changing update duration
Right now, each time the lambda function is called, it checks to see if the spreadsheet-created JSON has been generated in the last 5 minutes. If so, it ignores the call. To change the duration, add the duration parameter to the URL.
### Formatting changes
Due to fun Google Sheets API, all headers will be lowercase in the output.json. Sheets API also removes spaces, but I use hyphens instead to separate. Also, special characters (currently just the hash sign) will be removed like they are in the API.
### Triggering manually
In addition to using the onEdit trigger, you can skip that aspect and just call the API itself. Any public Google Sheet can be saved. 
### Lacking IFTTT 
If you use IFTTT to build the Google Sheet, the onEdit function won't run during those changes, but you could use a Time-driven trigger although the onEdit.gs would need to be changed. 

