const postBtn = document.getElementById("post-submit-btn");
const apiKeyInput = document.getElementById("api-key-input");
const apiKeyModal = document.getElementById("api-key-modal");
const saveApiKeyBtn = document.getElementById("save-api-key-btn");
const createPostBtn = document.getElementById("create-post-btn");
const postsListBtn = document.getElementById("posts-list-btn");
const settingBtn = document.getElementById("setting-btn");
let userInformationFromNotification = "";
let isPostLoaded = false;
function getCurrentUrl() {
	return new Promise((resolve, reject) => {
		chrome.tabs.query(
			{ active: true, currentWindow: true },
			function (tabs) {
				if (tabs.length === 0) {
					reject("No active tabs found.");
				} else {
					resolve(tabs[0].url);
				}
			}
		);
	});
}
// Save API key to local storage
function saveApiKey(apiKey) {
	chrome.storage.local.set({ "showwand-api-key": apiKey }, function () {
		saveApiKeyBtn.innerText = "Saved";
		setTimeout(() => {
			saveApiKeyBtn.innerText = "Save";
		}, 3000);
	});
}
// Display API key from local storage
const savedApiKey = chrome.storage.local.get(
	"showwand-api-key",
	function (data) {
		if (data["showwand-api-key"]) {
			apiKeyInput.value = data["showwand-api-key"];
		}
	}
);
// Dynamically render
function renderBlock(blockOrder) {
	const blocks = document.getElementsByClassName("block");
	for (let i = 0; i < blocks.length; i++) {
		if (i == blockOrder) {
			blocks[i].style.display = "block";
		} else {
			blocks[i].style.display = "none";
		}
	}
}
// Add .active class to the selected btn
function addActiveClass(btnOrder) {
	const btns = document.getElementsByClassName("all-nav-btn");
	for (let i = 0; i < btns.length; i++) {
		if (i == btnOrder) {
			btns[i].classList.add("active");
		} else {
			btns[i].classList.remove("active");
		}
	}
}
// Fetch function
function postFetchFunc(title, description, url, apiKey, callback) {
	const body = {
		title: title ? title : "",
		message: description,
		linkPreviewUrl: url ? url : "",
	};
	fetch("https://cache.showwcase.com/threads", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": apiKey,
		},
		body: JSON.stringify(body),
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			window.close(); // close the window after successful post
			return response.json();
		})
		.then((data) => {
			console.log(data);
			if (callback) {
				callback();
			}
		})
		.catch((error) => {
			console.error(
				"There was a problem with the fetch operation:",
				error
			);
		});
}

// Post btn event listener
postBtn.addEventListener("click", () => {
	const postTitle = document.getElementById("post-title").value;
	const postDescription = document.getElementById("post-description").value;
	const apiKey = apiKeyInput.value;
	const urlCheckbox = document.getElementById("url-checkbox");
	if (!apiKey) {
		alert("Please provide an API key");
		return;
	}
	if (urlCheckbox && urlCheckbox.checked) {
		getCurrentUrl()
			.then((url) => {
				postFetchFunc(postTitle, postDescription, url, apiKey);
			})
			.catch((error) => {
				console.error(error);
			});
	} else {
		postFetchFunc(postTitle, postDescription, "", apiKey);
	}
});

// Fetch user info function from Notification
function fetchUserInfo(apiKey) {
	fetch("https://cache.showwcase.com/notifications/?limit=1", {
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
			const user = data[0].data.thread.user;
			const userJson = JSON.stringify(user);
			chrome.storage.local.set({ userInfo: userJson });
		})
		.catch((error) => {
			console.error(
				"There was a problem with the fetch operation:",
				error
			);
		});
}
// Save user info to local storage
chrome.storage.local.get(["userInfo"], function (result) {
	const userJson = result.userInfo;
	const user = JSON.parse(userJson);
	userInformationFromNotification = user;
	console.log(userInformationFromNotification);
});
// Save API key btn event listener
saveApiKeyBtn.addEventListener("click", () => {
	const apiKey = apiKeyInput.value;
	if (apiKey) {
		saveApiKey(apiKey);
		fetchUserInfo(apiKey);
		console.log("API key saved.");
	} else {
		alert("Please provide an API key.");
	}
});
// Fetch posts list and display them in the id="posts-list" div
function fetchPostsList() {
	const postsList = document.getElementById("posts-list");
	fetch(
		`https://cache.showwcase.com/threads/?username=${userInformationFromNotification.username}&limit=5`
	)
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then((data) => {
			const posts = data;
			if (isPostLoaded == false) {
				posts.forEach((post) => {
					console.log(post);
					// Insert every post message into the postsList div
					// Using Template Literals
					const postMessage = `
          <div class="single-post">
            <div class="profile-img"><img src="${
				post.user.profilePictureKey
			}"></div>
            <div class="post-content">
            <a href="https://www.showwcase.com/thread/${
				post.id
			}" target="_blank">
              <h2 class="post-title">${post.title ? post.title : ""}</h2>
              <p class="post-message">${post.message}</p>
            </a>
            </div>
			<div class="delete-post-btn"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Interface / Trash_Full"> <path id="Vector" d="M14 10V17M10 10V17M6 6V17.8C6 18.9201 6 19.4798 6.21799 19.9076C6.40973 20.2839 6.71547 20.5905 7.0918 20.7822C7.5192 21 8.07899 21 9.19691 21H14.8031C15.921 21 16.48 21 16.9074 20.7822C17.2837 20.5905 17.5905 20.2839 17.7822 19.9076C18 19.4802 18 18.921 18 17.8031V6M6 6H8M6 6H4M8 6H16M8 6C8 5.06812 8 4.60241 8.15224 4.23486C8.35523 3.74481 8.74432 3.35523 9.23438 3.15224C9.60192 3 10.0681 3 11 3H13C13.9319 3 14.3978 3 14.7654 3.15224C15.2554 3.35523 15.6447 3.74481 15.8477 4.23486C15.9999 4.6024 16 5.06812 16 6M16 6H18M18 6H20" stroke="#ff0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg></div>
          
          </div>`;
					postsList.insertAdjacentHTML("beforeend", postMessage);
				});
				isPostLoaded = true;
			}
		})
		.catch((error) => {
			console.error(
				"There was a problem with the fetch operation:",
				error
			);
		});
}
createPostBtn.addEventListener("click", () => {
	renderBlock(0);
	addActiveClass(0);
});

postsListBtn.addEventListener("click", () => {
	renderBlock(1);
	addActiveClass(1);
	fetchPostsList();
});

settingBtn.addEventListener("click", () => {
	renderBlock(2);
	addActiveClass(2);
});
