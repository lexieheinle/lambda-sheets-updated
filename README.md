# sheets-updated
Lambda function to keep chosen Google Sheets automatically baked out to JSON.

## Getting started
1. Run `npm install` for dependencies.
2. Make sure your AWS environmental credentials have the [correct security permissions](https://claudiajs.com/tutorials/installing.html).
3. Run `npm create` and Claudia will create the Lambda function for AWS.
### AWS configuration
The default IAM role sheets-updated-executor doesn't have access to S3, which will hold all the generated JSON, so using the [IAM section of the AWS console website](https://console.aws.amazon.com/iam), find the Roles and then choose the newly created sheets-updated-executor. After selecting that role, attach the AmazonS3FullAccess policy since you need both Read/Write access.
### Google configuration
Using [these instructions](https://github.com/theoephraim/node-google-spreadsheet#service-account-recommended-method) for the Service Account configuration, make sure your credentials.json file is in the directory, with the name of google-credentials.json. *If you want to change the name, make sure to do so in the package.json update command as well as in the .gitignore.*
### Adding to Google Sheet
1. Under the Tools menu, click Script editor.
2. Copy and paste the Code.gs script into the window. *Change the lambda_url to reflect the url generated when you created the lambda function.*
3. Edit -> Current project's triggers - > Click here to add one now. 
4. Change the Time-driven event to be "From spreadsheet" and then "On edit." For debugging purposes, I would recommend adding notifications as well. 
5. Click save, and you'll be asked to Review Permissions. Choose your Google account and then you'll receive a rather intense unverified app page. Click "Advanced" and then "Go to Untitled project (unsafe)." Finally, click Allow so the script is added to the Sheet.
6. Back on the Google Sheet, make edits to the sheet, and you'll see a comment with the Lambda url has been added to the changed cells.
## Other considerations
### Choose a specific sheet
By default, the first created sheet is used when a sheet number isn't provided. The json naming scheme is {{ google_sheet_title_lowercase_and_underdashes}}-{{ specific_worksheet_title_same_formating_as_previous}}.json
### Five minute JSON update lag
Right now, each time the lambda function is called, it checks to see if the spreadsheet-created JSON has been generated in the last 5 minutes. If so, it ignores the call. To change the duration, add the 'duration=' parameter to the URL.
### Lowercase header names & remove special characters & expect spaces become hyphens
Due to fun Google Sheets API, all headers will be lowercase in the output.json. Sheets API also removes spaces, but I use hyphens instead to separate. Also, special characters (currently just the hash sign) will be removed like they are in the API.
### Skip the onEdit trigger
In addition to using the onEdit trigger, you can skip that aspect and just call the API itself. Any public Google Sheet can be saved. 
### Trigger lacking on IFTTT 
If you use IFTTT to build the Google Sheet, the onEdit function won't run during those changes. 

