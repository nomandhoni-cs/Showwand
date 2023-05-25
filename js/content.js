//! Options Page JS Start
const formInOptionsPage = document.getElementById("api-username-form-options-page");
const formSubmitBtnOptionsPage = document.getElementById("save-api-key-btn-options-page");
const apiKeyInputOptionsPage = document.getElementById("api-key-input-options-page");
const usernameInputOptionsPage = document.getElementById("api-username-input-options-page");
// Fetch user info function from Notification
function fetchUserInfo(apiKey) {
	fetch("https://cache.showwcase.com/notifications", {
		headers: {
			"Content-Type": "application/json",
			"x-api-key": apiKey,
		},
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then((data) => {
			if(data[0].data.thread){
				const user = data[0].data.thread.user;
				const userJson = JSON.stringify(user);
				chrome.storage.local.set({ userInfo: userJson });
				getSavedUserInfoFromChromeStorage();
			}
		})
		.catch((error) => {
			console.error(
				"There was a problem with the fetch operation:",
				error
			);
		});
}
// Form submit event listener
formInOptionsPage.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent form submission
  
  
  const apiKey = apiKeyInputOptionsPage.value;
  const username = usernameInputOptionsPage.value;
  
  console.log("API Key:", apiKey);
  console.log("Username:", username);
  
  // Save API key to Chrome storage
  chrome.storage.local.set({ "showwcase-api-key": apiKey }, function () {
    // Change the text to submitted but not change the svg icon in the btn
    formSubmitBtnOptionsPage.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
    </svg> Submitted!`;
    // Change the text back to submit after 3 seconds
    setTimeout(() => {
      formSubmitBtnOptionsPage.innerHTML = `<svg class="paper-plane" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
      aria-hidden="true">
      <path
        d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z">
      </path>
    </svg> Submit`;
    }, 2000);
    console.log("API key saved to Chrome storage");
  });
  
  // Save username to Chrome storage
  chrome.storage.local.set({ "showwcase-username": username }, function () {
    console.log("Username saved to Chrome storage");
  });
  chrome.storage.local.get(["userInfo"], function (result) {
		if(!result.userInfo) {
      fetchUserInfo(apiKey);
    }
	});
  });
  
  // Retrieve API key from Chrome storage
  chrome.storage.local.get("showwcase-api-key", function (data) {
  if (data["showwcase-api-key"]) {
    apiKeyInputOptionsPage.value = data["showwcase-api-key"];
  }
  });
  
  // Retrieve username from Chrome storage
  chrome.storage.local.get("showwcase-username", function (data) {
  if (data["showwcase-username"]) {
    usernameInputOptionsPage.value = data["showwcase-username"];
  }
  });
//! Options Page JS END