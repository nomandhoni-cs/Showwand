const postBtn = document.getElementById("post-submit-btn");
const apiKeyInput = document.getElementById("api-key-input");
const usernameInput = document.getElementById("api-username-input");
const apiKeyModal = document.getElementById("api-key-modal");
const createPostBtn = document.getElementById("create-post-btn");
const postsListBtn = document.getElementById("posts-list-btn");
const settingBtn = document.getElementById("setting-btn");
const form = document.getElementById("api-username-form");
const formSubmitBtn = document.getElementById("save-api-key-btn");
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
// Function to get saved user info to chrome storage
function getSavedUserInfoFromChromeStorage() {
	chrome.storage.local.get(["userInfo"], function (result) {
		if(result.userInfo) {
		const userJson = result.userInfo;
		const user = JSON.parse(userJson);
		userInformationFromNotification = user;
		console.log(userInformationFromNotification);
		}
	});
}
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
form.addEventListener("submit", (event) => {
	event.preventDefault(); // Prevent form submission
  
	const apiKeyInput = document.getElementById("api-key-input");
	const usernameInput = document.getElementById("api-username-input");
  
	const apiKey = apiKeyInput.value;
	const username = usernameInput.value;
  
	console.log("API Key:", apiKey);
	console.log("Username:", username);
  
	// Save API key to Chrome storage
	chrome.storage.local.set({ "showwcase-api-key": apiKey }, function () {
		// Change the text to submitted but not change the svg icon in the btn
		formSubmitBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
		<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
	  </svg> Submitted!`;
		// Change the text back to submit after 3 seconds
		setTimeout(() => {
			formSubmitBtn.innerHTML = `<svg class="paper-plane" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
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
	  apiKeyInput.value = data["showwcase-api-key"];
	}
  });
  
  // Retrieve username from Chrome storage
  chrome.storage.local.get("showwcase-username", function (data) {
	if (data["showwcase-username"]) {
	  usernameInput.value = data["showwcase-username"];
	}
  });

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
// Add boost event listener to every boost post btn
function addBoostEventListener(postId, isBoostedByUser, boostedByArrayLength) {
			const apiKey = apiKeyInput.value;
			let afterBoostedbyUser = isBoostedByUser;
			if (!apiKey) {
				alert("Please provide an API key");
				return;
			}
		let url = `https://cache.showwcase.com/threads/${postId}/` + (afterBoostedbyUser ? "unboost" : "boost");
			fetch(
				`${url}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-api-key": apiKey,
					},
				}
			)
				.then((response) => {
					if (!response.ok) {
						throw new Error(
							"Network response was not ok"
						);
					}
					return response.json();
				})
				.then((data) => {
					console.log(data, postId, afterBoostedbyUser, url);
					afterBoostedbyUser = !afterBoostedbyUser;
					const boostCount = document.getElementById("boost-count-"+ postId)
					if (data.success === true) {
						boostedByArrayLength++;
						const boostButton = document.getElementById("svg-" + postId);
						boostButton.setAttribute("fill", "#27ae60");
						boostButton.setAttribute("disabled", "true");
						boostButton.style.cursor = "not-allowed";
						boostCount.innerText = boostedByArrayLength;
					} else {
						boostedByArrayLength--;
						const boostButton = document.getElementById("svg-" + postId);
						boostButton.setAttribute("fill", "#ffffff");
						boostButton.setAttribute("disabled", "true");
						boostButton.style.cursor = "not-allowed";
						boostCount.innerText = boostedByArrayLength;
					  }					  
				})
				.catch((error) => {
					console.error(
						"There was a problem with the fetch operation:",
						error
					);
				});
}
// Fetch posts list and display them in the id="posts-list" div
function fetchPostsList() {
	const postsList = document.getElementById("posts-list");
	getSavedUserInfoFromChromeStorage();
	// Get username from Chrome storage
	chrome.storage.local.get("showwcase-username", function (result) {
		const storedUsername = result["showwcase-username"];
		if (!storedUsername) {
			console.error("Username not found in Chrome storage");
			return;
		}

		const username = storedUsername;

		fetch(`https://cache.showwcase.com/threads/?username=${userInformationFromNotification.username || username}&limit=15`)
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				return response.json();
			})
			.then((data) => {
				const posts = data;
				if (!isPostLoaded) {
					posts.forEach((post) => {
						console.log(post);
						const boostedByArray = post.boostedBy;
						const boostedByArrayLength = boostedByArray.length;
						let isBoostedByUser = false;
						for (let i = 0; i < boostedByArray.length; i++) {
							const user = boostedByArray[i];
							if (user.username === userInformationFromNotification.username || user.username === username) {
								isBoostedByUser = true;
								break;
							}
						}
						// Insert every post message into the postsList div
						const postMessage = `
						<div class="single-post">
							<div class="profile-img"><img src="${post.user.profilePictureKey}"></div>
							<div class="post-content">
								<a href="https://www.showwcase.com/thread/${post.id}" target="_blank">
									<h2 class="post-title">${post.title ? post.title : ""}</h2>
									<p class="post-message">${post.message}</p>
								</a>
							</div>
							<div class="boost-post-btn">
								<svg class="boost-post-svg" post-id="${post.id}" id="svg-${post.id}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="${isBoostedByUser ? "#27ae60" : "currentColor"}" aria-hidden="true">
									<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd"></path>
								</svg>
								<span id="boost-count-${post.id}" class="boost-count">${boostedByArrayLength}</span>
							</div>
						</div>`;

						postsList.insertAdjacentHTML("beforeend", postMessage);
						document.getElementById("svg-" + post.id).addEventListener("click", () => {
							addBoostEventListener(post.id, isBoostedByUser, boostedByArrayLength);
						});
					});
					isPostLoaded = true;
				}
			})
			.catch((error) => {
				console.error("There was a problem with the fetch operation:", error);
			});
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