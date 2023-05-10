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

getCurrentUrl()
    .then(url => {
        const postBtn = document.getElementById('post-submit-btn');
        const settingBtn = document.getElementById('setting-btn');
        const apiKeyInput = document.getElementById('api-key-input');
        const apiKeySavedMsg = document.getElementById('api-key-saved');
        const apiKeyModal = document.getElementById('api-key-modal');
        const saveApiKeyBtn = document.getElementById('save-api-key-btn');

        function postFetchFunc(postTitle, postDescription, apiKey, callback) {
            fetch('https://cache.showwcase.com/threads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify({
                    title: postTitle,
                    message: postDescription
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                callback();
            })
            .catch(error => console.error(error));
        }

        function saveApiKey(apiKey) {
            localStorage.setItem('showwand-api-key', apiKey);
            apiKeySavedMsg.style.display = 'block';
            setTimeout(() => {
                apiKeySavedMsg.style.display = 'none';
            }, 3000);
        }

        const savedApiKey = localStorage.getItem('showwand-api-key');
        if (savedApiKey) {
            apiKeyInput.value = savedApiKey;
        }

        postBtn.addEventListener('click', () => {
            const postDescription = document.getElementById('post-description');
            let fullPostDescription = postDescription.value;
            const postTitle = document.getElementById('post-title');
            const title = postTitle.value;
            fullPostDescription = fullPostDescription + '\n   ' + url;
            const apiKey = apiKeyInput.value;
            postFetchFunc(title, fullPostDescription, apiKey, () => {
                window.close();
            });
        });

        settingBtn.addEventListener('click', () => {
            apiKeyModal.style.display = 'block';
        });

        saveApiKeyBtn.addEventListener('click', () => {
            const apiKey = apiKeyInput.value;
            if (apiKey) {
                saveApiKey(apiKey);
                apiKeyModal.style.display = 'none';
            } else {
                alert('Please provide an API key.');
            }
        });

        apiKeyModal.addEventListener('click', (event) => {
            if (event.target == apiKeyModal) {
                apiKeyModal.style.display = 'none';
            }
        });
    })
    .catch(error => {
        console.error(error);
    });

    const createPostBtn = document.getElementById('create-post-btn');
    const postsListBtn = document.getElementById('posts-list-btn');
    const settingBtn = document.getElementById('setting-btn');
    // Dynamically render
    function renderBlock(blockOrder){
        const blocks = document.getElementsByClassName('block');
        for (let i = 0; i < blocks.length; i++) {
            if (i == blockOrder) {
                blocks[i].style.display = 'block';
            } else {
                blocks[i].style.display = 'none';
            }
        }

    }
    
    createPostBtn.addEventListener('click', () => {
      renderBlock(0);
    });
    
    postsListBtn.addEventListener('click', () => {
      renderBlock(1);
    });
    
    settingBtn.addEventListener('click', () => {
      renderBlock(2);
    });