const createTopBannerCssLink = () => {
  let link = document.createElement("link");
  link.href = "/widget?widgetName=topbanner&resource=topbanner.css";
  link.rel = "stylesheet";
  link.type = "text/css";
  document.head.prepend(link);
};

createTopBannerCssLink();

const startTopBanner = () => {
  let topbar = document.getElementById("top-bar");
  let title = topbar.getAttribute("title");
  let description = topbar.getAttribute("description");

  let topBannerTitle = document.createElement("h1");
  topBannerTitle.setAttribute("id", "top-bar-title");
  topBannerTitle.innerHTML = title;
  let topBarText = document.createElement("div");
  topBarText.setAttribute("class", "top-bar-text");
  topBarText.appendChild(topBannerTitle);

  let topBannerDescription = document.createElement("p");
  topBannerDescription.setAttribute("id", "top-bar-description");
  topBannerDescription.innerHTML = description;
  let topBarText2 = document.createElement("div");
  topBarText2.setAttribute("class", "top-bar-text");
  topBarText2.appendChild(topBannerDescription);

  document.getElementById("top-bar").appendChild(topBarText);
  document.getElementById("top-bar").appendChild(topBarText2);
};

/** Gonna leave this here as a schema for the top bar. Maybe it helps someone else to understand how it works
<div id="top-bar">
  <div id="top-bar-text">
    <h1 id="top-bar-title">
      Create a Playlist
    </h1>
  </div>
  <div id="top-bar-text">
    <p id="top-bar-description">
      You can use this page to select, from the uploaded pictures, which ones
      you want to add to a playlist, and then choose whether this list should
      include other lists scheduled for its dates or not. You can choose
      manually what list to display today on the main menu.
    </p>
  </div>
</div>
 * 
 */
