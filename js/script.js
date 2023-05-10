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
        const postBtn = document.getElementById('post-submit-btn')

        function postFetchFunc(postTitle, postDescription, callback) {
            fetch('https://cache.showwcase.com/threads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': '' // Put your api key here
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
        

        postBtn.addEventListener('click', () => {
            const postDescription = document.getElementById('post-description')
            let fullPostDescription = postDescription.value
            const postTitle = document.getElementById('post-title')
            const title = postTitle.value
            fullPostDescription = fullPostDescription+'\n   '+url
            postFetchFunc(title, fullPostDescription, ()=>{
                window.close()
            });
        })
    })
    .catch(error => {
        console.error(error)
    });