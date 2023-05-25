const getTwitterUsername = () => {
    const path = window.location.pathname;
    const pathArray = path.split("/");
    const username = pathArray[1];
    return username;
  };
  
  const getTwitterName = () => {
    const nameSelector = "div[data-testid='primaryColumn'] h2";
    const name = document.querySelector(nameSelector)?.textContent;
    return name;
  };
  
  const addShowcaseProfileButton = () => {
    const username = getTwitterUsername();
    const name = getTwitterName();
    console.log(name);
    if (username) {
      console.log(username);
      const showCaseRes = fetch(`https://cache.showwcase.com/search?term=${name}`).then((res) => res.json());
      showCaseRes.then((res) => {
        const user = res[0];
        if (user && user.displayName.includes(name)) {
          removeShowcaseProfileButton(); // Remove previously inserted button
          const button = document.createElement("a");
          button.innerHTML = `Hello`;
          button.setAttribute("href", `https://showwcase.com/${user.username}`);
          button.setAttribute("target", "_blank");
          button.setAttribute("id", "showwcase-profile-button"); // Add an ID to the button for easy removal
          const profileContainer = document.querySelector(".r-1h0z5md");
          profileContainer.prepend(button);
        }
      });
    } else {
      console.log("No username found");
    }
  };
  
  const removeShowcaseProfileButton = () => {
    const existingButton = document.getElementById("showwcase-profile-button");
    if (existingButton) {
      existingButton.remove();
    }
  };
  
  const observeURLChanges = () => {
    const currentURL = window.location.href;
  
    setInterval(() => {
      const newURL = window.location.href;
      if (newURL !== currentURL) {
        currentURL = newURL;
        removeShowcaseProfileButton();
        addShowcaseProfileButton();
      }
    }, 1000); // Check for URL changes every second
  };
  
  // Execute the code when the Twitter page is initially loaded
  window.onload = () => {
    setTimeout(() => {
      addShowcaseProfileButton();
      observeURLChanges();
    }, 2000); // Delay of 2 seconds (2000 milliseconds)
  };
  