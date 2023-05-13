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
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length === 0) {
        reject("No active tabs found.");
      } else {
        resolve(tabs[0].url);
      }
    });
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
      console.error("There was a problem with the fetch operation:", error);
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
		chrome.storage.local.set({ "userInfo": userJson });

	})
	.catch((error) => {
	  console.error("There was a problem with the fetch operation:", error);
	});
  }
// Save user info to local storage
chrome.storage.local.get(["userInfo"], function(result) {
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
	  fetch(`https://cache.showwcase.com/threads/?username=${userInformationFromNotification.username}&limit=5`)
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then((data) => {
			const posts = data;
      if(isPostLoaded == false){
        posts.forEach((post) => {
          console.log(post);
          // Insert every post message into the postsList div
          const postMessage = document.createElement("div");
          postMessage.classList.add("post-message");
          postMessage.innerHTML = post.message;
          postsList.appendChild(postMessage);
        });
        isPostLoaded = true;
      }
		})
		.catch((error) => {
			console.error("There was a problem with the fetch operation:", error);
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
