var urlParse = require("url");

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (tab.url) {
    updateToken(tab.url, tabId);
  }
});

chrome.tabs.onCreated.addListener(handleTab);

function handleTab(tab) { 
  if (tab.url) {
    updateToken(tab.url, tab.id); 
  }
}

function updateToken(url, tabId) {
  var urlObject = urlParse.parse(url);
  var isTinyPulse = urlObject.host.indexOf("tinypulse.com") !== -1;
  var hasParams = urlObject.query;
  var hasResponseToken = hasParams && urlObject.query.indexOf("response_token") !== -1;
  if(isTinyPulse &&  hasResponseToken) {
    var splitQueries = urlObject.query.split("&");
    var params = splitQueries.reduce(function(params, query) {
      var splitQuery = query.split("=");
      params[splitQuery[0]] = splitQuery[1];
      return params;
    }, {});
    chrome.storage.sync.set({"response_token": params.response_token}, function() {
    });
  }
}