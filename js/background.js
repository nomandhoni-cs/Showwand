chrome.runtime.onInstalled.addListener(function() {
    try {
      chrome.contextMenus.create({
        "title": "Post to Showwand",
        "contexts": ["selection"],
        "id": "showwandSelection"
      }, function() {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          console.log("Context menu created successfully");
        }
      });
    } catch (error) {
      console.error(error);
    }
  });
  
  chrome.contextMenus.onClicked.addListener(function(info, tab) {
    try {
      if (info.menuItemId === "showwandSelection") {
        chrome.storage.local.get("showwcase-api-key", function(data) {
          var apiKey = data["showwcase-api-key"];
          console.log(apiKey);
          if (!apiKey) {
            chrome.runtime.openOptionsPage();
            return;
          }
          let selectedText = info.selectionText;
          console.log("The selected text is: " + selectedText);
          postFetchFunc(selectedText, apiKey, function() {
            console.log("Successfully posted to Showwand");
          });
        });
      }
    } catch (error) {
      console.error(error);
    }
  });

  function postFetchFunc(postDescription, apiKey, callback) {
    try {
      fetch('https://cache.showwcase.com/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          message: postDescription
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        callback();
      })
      .catch(error => console.error(error));
    } catch (error) {
      console.error(error);
    }
  }
  