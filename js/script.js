const postBtn = document.getElementById("post-submit-btn");
const createPostBtn = document.getElementById("create-post-btn");
const postsListBtn = document.getElementById("posts-list-btn");
const profileBtn = document.getElementById("profile-btn");
const feedsBtn = document.getElementById("feeds-btn");
const form = document.getElementById("api-username-form");
const formSubmitBtn = document.getElementById("save-api-key-btn");
let isPostLoaded = false;
let isFeedLoaded = false;
let isProfileLoaded = false;

async function getAPIKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get("showwcase-api-key", function (data) {
      const apiKey = data["showwcase-api-key"] || "";
      resolve(apiKey);
    });
  });
}

async function getAuthorizedUserInfo() {
  return new Promise((resolve) => {
    chrome.storage.local.get("userInfo", function (data) {
      const userJson = data["userInfo"] || "";
      const user = JSON.parse(userJson);
      resolve(user);
    });
  });
}

async function getCurrentUrl() {
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

// Remove API key from Chrome storage
function removeAPIKey() {
  chrome.storage.local.remove("showwcase-api-key", function () {
    console.log("API key removed from Chrome storage");
  });
}
// Remove user info from Chrome storage
function removeUserInfo() {
  chrome.storage.local.remove("userInfo", function () {
    console.log("User info removed from Chrome storage");
  });
}

chrome.storage.local.get(
  ["showwcase-api-key", "userInfo"],
  async function (data) {
    if (data["showwcase-api-key"] && data["userInfo"]) {
      displayAuthenticatedBlock();
    } else {
      document.getElementById("user-loggedin").style.display = "none";
      document.getElementById("user-not-loggedin").style.display = "block";
      // Form submit event listener
      form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent form submission
        const apiKeyInput = document.getElementById("api-key-input");
        const apiKey = apiKeyInput.value;
        console.log("API Key:", apiKey);
        try {
          // Save API key to Chrome storage
          await new Promise((resolve) => {
            chrome.storage.local.set({ "showwcase-api-key": apiKey }, resolve);
          });

          // Change the text to submitted but not change the svg icon in the btn
          formSubmitBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
        </svg> Submitted!`;

          // Fetch user info and save to Chrome storage
          const userInfo = await fetchUserInfo(apiKey);
          await new Promise((resolve) => {
            const userInfoJson = JSON.stringify(userInfo);
            chrome.storage.local.set({ userInfo: userInfoJson }, resolve);
          });

          // Change the text back to submit after 3 seconds
          setTimeout(() => {
            formSubmitBtn.innerHTML = `<svg class="paper-plane" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
            aria-hidden="true">
            <path
              d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z">
            </path>
          </svg> Submit`;
          }, 2000);

          console.log("API key and user info saved to Chrome storage");

          displayAuthenticatedBlock();
        } catch (error) {
          console.log("Error:", error);
        }
      });
    }
  }
);

function displayAuthenticatedBlock() {
  document.getElementById("user-loggedin").style.display = "block";
  document.getElementById("user-not-loggedin").style.display = "none";
}

function fetchUserInfo(apiKey) {
  return fetch("https://cache.showwcase.com/auth", {
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
      if (data) {
        return data;
      }
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

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
postBtn.addEventListener("click", async () => {
  const postTitle = document.getElementById("post-title").value;
  const postDescription = document.getElementById("post-description").value;
  const apiKey = await getAPIKey();
  const urlCheckbox = document.getElementById("url-checkbox");
  if (!apiKey) {
    alert("Please provide an API key");
    return;
  }
  if (urlCheckbox && urlCheckbox.checked) {
    try {
      const url = await getCurrentUrl();
      postFetchFunc(postTitle, postDescription, url, apiKey);
    } catch (error) {
      console.error(error);
    }
  } else {
    postFetchFunc(postTitle, postDescription, "", apiKey);
  }
});
// Add boost event listener to every boost post btn
async function addBoostEventListener(
  postId,
  isBoostedByUser,
  boostedByArrayLength
) {
  const apiKey = await getAPIKey();
  console.log(apiKey);
  let afterBoostedbyUser = isBoostedByUser;
  if (!apiKey) {
    alert("Please provide an API key");
    console.log("returning");
    return;
  }
  let url =
    `https://cache.showwcase.com/threads/${postId}/` +
    (afterBoostedbyUser ? "unboost" : "boost");
  fetch(`${url}`, {
    method: "POST",
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
      console.log(data, postId, afterBoostedbyUser, url);
      afterBoostedbyUser = !afterBoostedbyUser;
      const boostCount = document.getElementById("boost-count-" + postId);
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
      console.error("There was a problem with the fetch operation:", error);
    });
}
// Fetch posts list and display them in the id="posts-list" div
async function fetchPostsList() {
  const postsList = document.getElementById("posts-list");
  const authorizedUserInfo = await getAuthorizedUserInfo();
  const username = authorizedUserInfo.username;
  fetch(`https://cache.showwcase.com/threads/?username=${username}&limit=15`)
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
            if (user.username === username) {
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
                <div class="post-img">
                  ${
                    post.images && post.images.length > 0
                      ? `<img src="${post.images[0]}" />`
                      : ""
                  }
							  </div>
                ${
                  post.linkPreviewMeta?.url && post.linkPreviewMeta?.title
                    ? `<div class="link-preview">
                  <a href="${
                    post.linkPreviewMeta && post.linkPreviewMeta.url
                      ? post.linkPreviewMeta.url
                      : ""
                  }" target="_blank">
                ${
                  post.linkPreviewMeta && post.linkPreviewMeta.title
                    ? `<div class="link-preview-title">${post.linkPreviewMeta.title}</div>`
                    : ""
                }
                ${
                  post.linkPreviewMeta && post.linkPreviewMeta.favicon
                    ? `<div class="link-preview-img"><img src="${post.linkPreviewMeta.favicon}" /></div>`
                    : ""
                }
                </a>
                  </div>
              `
                    : ""
                }
							</div>
							<div class="boost-post-btn">
								<svg class="boost-post-svg" post-id="${post.id}" id="svg-${
            post.id
          }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="${
            isBoostedByUser ? "#27ae60" : "currentColor"
          }" aria-hidden="true">
									<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd"></path>
								</svg>
								<span id="boost-count-${
                  post.id
                }" class="boost-count">${boostedByArrayLength}</span>
							</div>
						</div>`;

          postsList.insertAdjacentHTML("beforeend", postMessage);
          document
            .getElementById("svg-" + post.id)
            .addEventListener("click", () => {
              addBoostEventListener(
                post.id,
                isBoostedByUser,
                boostedByArrayLength
              );
            });
        });
        isPostLoaded = true;
      }
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

// Fetch feeds and display them in the id="feeds-list" div
async function fetchFeeds() {
  const feedsList = document.getElementById("feeds-list");
  const authorizedUserInfo = await getAuthorizedUserInfo();
  const token = authorizedUserInfo.token;
  const username = authorizedUserInfo.username;
  fetch(`https://cache.showwcase.com/feeds/discover?limit=15`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  })
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
            if (user.username === username) {
              isBoostedByUser = true;
              break;
            }
          }
          // Insert every post message into the feedsList div
          const postMessage = `
						<div class="single-post">
							<div class="profile-img"><img src="${post.user.profilePictureUrl}"></div>
							<div class="post-content">
								<a href="https://www.showwcase.com/thread/${post.id}" target="_blank">
									<h2 class="post-title">${post.title ? post.title : ""}</h2>
									<p class="post-message">${post.message}</p>
								</a>
              <div class="post-img">
                  ${
                    post.images && post.images.length > 0
                      ? `<img src="${post.images[0]}" />`
                      : ""
                  }
							</div>
              ${
                post.linkPreviewMeta?.url && post.linkPreviewMeta?.title
                  ? `<div class="link-preview">
                  <a href="${
                    post.linkPreviewMeta && post.linkPreviewMeta.url
                      ? post.linkPreviewMeta.url
                      : ""
                  }" target="_blank">
                ${
                  post.linkPreviewMeta && post.linkPreviewMeta.title
                    ? `<div class="link-preview-title">${post.linkPreviewMeta.title}</div>`
                    : ""
                }
                ${
                  post.linkPreviewMeta && post.linkPreviewMeta.favicon
                    ? `<div class="link-preview-img"><img src="${post.linkPreviewMeta.favicon}" /></div>`
                    : ""
                }
                </a>
                  </div>
              `
                  : ""
              }

              </div>
							<div class="boost-post-btn">
								<svg class="boost-post-svg" post-id="${post.id}" id="svg-${
            post.id
          }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="${
            isBoostedByUser ? "#27ae60" : "currentColor"
          }" aria-hidden="true">
									<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd"></path>
								</svg>
								<span id="boost-count-${
                  post.id
                }" class="boost-count">${boostedByArrayLength}</span>
							</div>
						</div>`;

          feedsList.insertAdjacentHTML("beforeend", postMessage);
          document
            .getElementById("svg-" + post.id)
            .addEventListener("click", () => {
              addBoostEventListener(
                post.id,
                isBoostedByUser,
                boostedByArrayLength
              );
            });
        });
        isFeedLoaded = true;
      }
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

// Load Profile info
async function loadProfileInfo() {
  const profileContainer = document.getElementById("profile-container");
  const authorizedUserInfo = await getAuthorizedUserInfo();
  // const token = authorizedUserInfo.token;
  const username = authorizedUserInfo.username;
  const profilePictureUrl = authorizedUserInfo.profilePictureKey;
  const profileName = authorizedUserInfo.displayName;
  const profileBio = authorizedUserInfo.headline;
  const followers = authorizedUserInfo.totalFollowers;
  const following = authorizedUserInfo.totalFollowing;
  const threads = authorizedUserInfo.totalThreads;
  const shows = authorizedUserInfo.engagement.totalPublishedShows;
  const domain = authorizedUserInfo.domain;
  const resume = authorizedUserInfo.resumeUrl;
  const profileSceleton = `<div class="profile-header">
  <div class="profile-image">
    <img src="${profilePictureUrl}" alt="">
  </div>
  <div class="name-username">
    <h3 class="profile-name">${profileName}</h3>
    <span class="profile-username">@<span class="username-slice">${username}</span></span>
  </div>
  <button id="logout-btn">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path fill-rule="evenodd"
        d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z" />
      <path fill-rule="evenodd"
        d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" />
    </svg>
  </button>
</div>
<span class="profile-bio">
  ${profileBio}
</span>
<div class="profile-stats">
  <div class="profile-stats-item">Followers: <span class="profile-stats-item-value">${followers}</span></div>
  <div class="profile-stats-item">Following: <span class="profile-stats-item-value">${following}</span></div>
  <div class="profile-stats-item">Threads: <span class="profile-stats-item-value">${threads}</span></div>
  <div class="profile-stats-item">Shows: <span class="profile-stats-item-value">${shows}</span></div>
</div>
<div class="domain-link">
<svg width="30" height="25" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M35.64 7.241a67.234 67.234 0 0 1 7.064-.916c.536-.041.909-.13 1.14-.507.39-.634 1.084-.878 2.05-.95 2.6-.194 5.179-.208 7.785-.029 1.257.087 2.095.406 2.577 1.233.19.325.517.445 1.007.48 1.023.072 2.04.182 3.054.317 1.317.176 2.621.399 3.988.623-.236-.795-.603-1.468-1.016-2.129C61.711 2.84 59.18 1.121 55.415.424c-2.829-.523-5.692-.477-8.56-.311-1.795.104-3.508.46-5.107 1.076-3.332 1.28-4.971 3.466-6.109 6.052ZM1.981 9.547a12.25 12.25 0 0 1 3.153 1.76c2.095 1.603 3.537 3.515 4.873 5.472 1.485 2.174 2.654 4.445 3.756 6.746.219-.133.235-.292.282-.446.562-1.82 1.222-3.621 2.067-5.385 1.499-3.125 3.505-6.015 7.157-8.138.367-.213.337-.362.066-.613-1.157-1.072-2.406-2.08-3.863-2.94-1.152-.679-2.476-1.023-3.981-.998-3.304.054-6.31.833-9.16 1.977-1.642.659-3.17 1.43-4.35 2.565ZM45.45 7.29l-.342.05c-.051-.011-.104-.036-.153-.034-4.328.237-8.622.618-12.79 1.552-4.464 1-7.909 2.943-10.303 5.858-1.906 2.322-2.948 4.888-3.898 7.47-.993 2.698-1.683 5.448-2.296 8.204-.99 4.449-1.742 8.922-2.45 13.397a447.73 447.73 0 0 0-1.416 9.807c-.629 4.646-1.188 9.295-1.23 13.97-.039 4.101.087 8.19 1.83 12.149 1.143 2.596 3.11 4.73 6.42 6.152 3.43 1.474 7.184 2.27 11.028 2.869 5.693.887 11.478 1.179 17.284 1.246 6.24.072 12.475-.037 18.666-.692 4.539-.48 8.99-1.21 13.202-2.585 3.829-1.25 6.623-3.198 8.143-6.093 1.51-2.873 2.026-5.87 2.202-8.902.397-6.85-.515-13.656-1.473-20.456-.703-4.991-1.466-9.978-2.389-14.952-.565-3.042-1.164-6.078-1.951-9.093-.915-3.5-2-6.965-3.879-10.273-2.289-4.032-6.139-6.879-11.985-8.1-7.264-1.516-14.7-1.883-22.22-1.544Zm45.755 42.175c.003.397.02.794.16 1.181l.461 3.191c-.066.202-.033.392.1.65.108-.268.344-.42.27-.644l1.4-4.995c.097-.184.189-.368.138-.57.271-.456.333-.95.5-1.425 1.016-2.877 1.708-5.8 2.36-8.728.718-3.222 1.337-6.457 2.134-9.669.98-3.95 1.42-7.92 1.23-11.925-.071-1.482-.168-2.973-.716-4.513-.457.259-.857.453-1.206.688-1.61 1.087-2.752 2.428-3.775 3.816-2.914 3.953-4.805 8.195-6.571 12.47-.09.217-.038.424.013.639.914 3.878 1.578 7.78 2.206 11.686.437 2.716.864 5.432 1.296 8.148ZM.279 13.058c-.292.848-.277 1.715-.279 2.579-.01 3.925.578 7.814 1.284 11.7.613 3.377 1.465 6.721 2.295 10.069a465.6 465.6 0 0 0 2.498 9.73c.834 3.079 1.135 6.197 1.452 9.316.023.228-.03.473.188.7.042-.064.096-.11.102-.16a374.246 374.246 0 0 1 1.956-13.677c.718-4.433 1.403-8.868 2.415-13.272.133-.575.297-1.137-.002-1.74-.584-1.182-1.025-2.4-1.587-3.588-1.487-3.142-3.07-6.259-5.444-9.12-.961-1.16-1.956-2.314-3.495-3.14-.35-.218-.73-.605-1.147-.469-.347.114-.221.589-.288.906-.01.052.033.11.052.166Zm92.7-6.237a29.925 29.925 0 0 0-10.118-1.67 5.212 5.212 0 0 0-2.807.825c-1.426.913-2.417 2.057-3.266 3.277-.174.25.013.351.233.483a15.27 15.27 0 0 1 2.692 2.039c2.817 2.682 4.257 5.803 5.445 9.003.362.976.685 1.959 1.068 3.06 1.164-2.394 2.288-4.667 3.762-6.834 1.792-2.635 3.72-5.205 7.08-7.008l.436-.202.378-.152c.35-.092.138-.185 0-.278-.069-.2-.25-.34-.466-.463-.178-.247-.463-.413-.79-.548-.73-.497-1.58-.86-2.482-1.164-.373-.148-.714-.35-1.165-.368Z" fill="currentColor"></path></svg>
  <a href="https://${domain}" target="_blank">${domain}</a>
</div>
<div class="resume-link">
<svg width="30" height="25" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path></svg>
  <a href="${resume}" target="_blank">Resume</a>
</div>
  <div class="footer-logo-and-name">
  <a href="https://github.com/nomandhoni-cs/Showwand" target="_blank">
      <img src="assets/icon48.png" alt="Showwand Logo" class="logo">
      <span class="logo-name">Showwand</span>
  </a>
  </div>
`;
  if (!isProfileLoaded) {
    profileContainer.insertAdjacentHTML("beforeend", profileSceleton);
    isProfileLoaded = true;
  }
  const userLogout = document.getElementById("logout-btn");
  userLogout.addEventListener("click", () => {
    chrome.storage.local.remove(["showwcase-api-key", "userInfo"], function () {
      window.location.reload();
      // document.getElementById("user-loggedin").style.display = "none";
      // document.getElementById("user-not-loggedin").style.display = "block";
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

feedsBtn.addEventListener("click", () => {
  renderBlock(2);
  addActiveClass(2);
  fetchFeeds();
});

profileBtn.addEventListener("click", () => {
  renderBlock(3);
  addActiveClass(3);
  loadProfileInfo();
});
