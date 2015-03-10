var cheers = require("./cheers");

var token = null;

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

function submitCheers(event) {
	console.log("Cheers!", arguments);
	var email = document.getElementById("recipient").value.toLowerCase().trim();
	var message = document.getElementById("message").value;
	var isAnonymous = document.getElementById("anonymous").checked;
	console.log(email, message, isAnonymous);
	cheers.sendCheers({
		token: token,
		email: email,
		message: message,
		isAnonymous: isAnonymous ? 1 : 0
	});
	renderStatus("Cheers sent!");
}

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get('response_token', function(response) {
    token = response.response_token;
    if(!token) {
    	renderStatus("No token found. Please visit TinyPulse from your email. We'll grab it when we can.");
    }
    renderStatus(token);

    var button = document.getElementById("submit-cheers");
    console.log(button);
    button.addEventListener("click", submitCheers);
  });
});