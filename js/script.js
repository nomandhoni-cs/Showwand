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
					return 0;
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
					const boostedByArray = post.boostedBy;
					let boostedByArrayLength = boostedByArray.length;
					let isBoostedByUser = false;
					for (let i = 0; i < boostedByArray.length; i++) {
					const user = boostedByArray[i];
					if (user.username === userInformationFromNotification.username) {
						isBoostedByUser = true;
						break;
					}
					}
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
						<div class="boost-post-btn">
						<svg class="boost-post-svg" post-id="${post.id}" id="svg-${post.id}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill=${isBoostedByUser? "#27ae60" : "currentColor"} aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd"></path></svg>
						<span id="boost-count-${post.id}" class="boost-count">${boostedByArrayLength}</span>
						</div>
					</div>`;
					postsList.insertAdjacentHTML("beforeend", postMessage);
					document.getElementById("svg-"+post.id).addEventListener("click", () => {
						addBoostEventListener(post.id, isBoostedByUser, boostedByArrayLength)
					});
				});
				// addBoostEventListener(isBoostedByUser);
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
