var cheers = require("tinypulse").Cheers;
var xhr = require("xhr");
var Typeahead = require("typeahead");

var token = null;
var tokenText = "";
var apiBase = "http://www.cheers.rocks";

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

function submitCheers(event) {
	renderStatus("Sending ... ");
	var email = document.getElementById("recipient").value.toLowerCase().trim();
	var message = document.getElementById("message").value;
	var isAnonymous = document.getElementById("anonymous").checked;
	cheers.sendCheers({
		token: token,
		email: email,
		message: message,
		isAnonymous: isAnonymous ? 1 : 0
	}, function(err){
		if(err) {
			renderStatus("Cheers could not be sent.");
		}
		else {
			renderStatus("Cheers sent!");
			window.setTimeout(renderStatus, 1000, tokenText);
		}
	});
	
}

var setDisabledAllFields = function(isDisabled) {
	var fields = [
		document.getElementById("recipient"),
		document.getElementById("message"),
		document.getElementById("anonymous"),
		document.getElementById("submit-cheers")
	];
	fields.forEach(function(field) {
		field.disabled = isDisabled
	})
}

document.addEventListener('DOMContentLoaded', function() {
  renderStatus("Fetching token and loading users...");

  chrome.storage.sync.get('response_token', function(response) {
    token = response.response_token;
    if(!token) {
    	renderStatus("No token found. Please visit TinyPulse from your email. We'll grab it when we can.");
    	setDisabledAllFields(true);
    }
    else {
    	// verify token
    	xhr({
    		uri: apiBase + "/token/new",
    		method: "POST",
    		json: {token: token}
    	}, function(err, resp, body) {
    		if(err || !body.verified) {
    			renderStatus("Token is not valid. Please visit TinyPulse from your email. We'll grab a new one when we can.");
    			setDisabledAllFields(true);
    			throw new Error("Token is not valid.", err);
    		}
    		tokenText = "Sending as: " + body.email + " (" + token + ")"
    		renderStatus(tokenText);

    		var recipient = document.getElementById("recipient");
    		var ta = Typeahead(recipient, {
    		    source: body.possibleRecipients
    		});

    		var button = document.getElementById("submit-cheers");
    		button.addEventListener("click", submitCheers);
    	});
    }
    
  });
});