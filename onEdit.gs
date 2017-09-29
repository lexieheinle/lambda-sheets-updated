function onEdit(e){
  // Set a comment on the edited cell to indicate when it was changed.
  var range = e.range;
  var spreadsheetId = e.source.getId();
  var spreadsheetName = e.source.getName().replace(/ /g,"_").toLowerCase();
  var lambda_url = ADD_YOUR_LAMBDA_URL_HERE +'update?' + 'id='+spreadsheetId + '&name=' + spreadsheetName;;
  var params={
  'method':'get'
};
  //Grab the link to the JSON
  var response = UrlFetchApp.fetch(lambda_url, params);
  //Set a comment on the changed cells
  range.setNote('lambda_url: ' + response.getContentText());
}
