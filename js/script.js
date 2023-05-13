const postBtn = document.getElementById("post-submit-btn");
const apiKeyInput = document.getElementById("api-key-input");
const apiKeyModal = document.getElementById("api-key-modal");
const saveApiKeyBtn = document.getElementById("save-api-key-btn");
const createPostBtn = document.getElementById("create-post-btn");
const postsListBtn = document.getElementById("posts-list-btn");
const settingBtn = document.getElementById("setting-btn");
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

// Save API key btn event listener
saveApiKeyBtn.addEventListener("click", () => {
  const apiKey = apiKeyInput.value;
  if (apiKey) {
    saveApiKey(apiKey);
    console.log("API key saved.");
  } else {
    alert("Please provide an API key.");
  }
});

createPostBtn.addEventListener("click", () => {
  renderBlock(0);
});

postsListBtn.addEventListener("click", () => {
  renderBlock(1);
});

settingBtn.addEventListener("click", () => {
  renderBlock(2);
});
