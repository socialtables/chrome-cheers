var cheers = require("tinypulse").Cheers;
var xhr = require("xhr");
var Typeahead = require("typeahead");

var token = null;
var tokenText = "";
var apiBase = "http://www.cheers.rocks";
var recipients = [];
var recipientElement;
var messageElement;
var anonymousElement;
var submitElement;

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

function submitCheers(event) {
	renderStatus("Sending ... ");
    var recipientValue = document.getElementById("recipient").value.toLowerCase().trim();
    // add recipient value to list if it might be a name
    var emails = recipientValue && recipientValue.length > 0 ? recipients.concat(recipientValue) : recipients;
	var message = messageElement.value;
	var isAnonymous = anonymousElement.checked;
	cheers.sendCheers({
		token: token,
		email: emails,
		message: message,
		isAnonymous: isAnonymous ? 1 : 0
	}, function(err){
        recipientElement.value = "";
        messageElement.value = "";
        anonymousElement.checked = false;
        recipients = [];
        buildTokens();
        
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
		recipientElement,
        messageElement,
        anonymousElement,
        submitElement
	];
	fields.forEach(function(field) {
		field.disabled = isDisabled
	})
};

var buildTokens = function() {
    var tokenDiv = document.getElementById("tokens");

    var tokens = recipients.map(function(recipient) {
        var index = recipient.indexOf("@") === -1 ? recipient.length : recipient.indexOf("@");
        return "<div data-recipient='" + recipient + "' class='mui-btn mui-btn-primary token'>"+recipient.slice(0, index)+"</div>";
    });
    tokenDiv.innerHTML = tokens.join("");
};

var removeToken = function(event) {
    var recipientToRemove = event.target.dataset.recipient;
    recipients.splice(recipients.indexOf(recipientToRemove), 1);
    buildTokens();
};

var clearElement = function() {
    var isNotWhitespace = this.value.trim().length > 0;
    if(isNotWhitespace && recipients.indexOf(this.value) === -1) {
        recipients.push(this.value);
        this.value = "";
        buildTokens();
    }
};



document.addEventListener('DOMContentLoaded', function() {
    recipientElement = document.getElementById("recipient");
    messageElement = document.getElementById("message");
    anonymousElement = document.getElementById("anonymous");
    submitElement = document.getElementById("submit-cheers");

    var tokenElement = document.getElementById("tokens");
    // catch change events emitted by typeahead
    recipientElement.addEventListener("change", clearElement, true);
    tokenElement.addEventListener("click", removeToken);

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

    		
    		var ta = Typeahead(recipientElement, {
    		    source: body.possibleRecipients
    		});

    		var button = submitElement;
    		button.addEventListener("click", submitCheers);
    	});
    }
    
  });
});