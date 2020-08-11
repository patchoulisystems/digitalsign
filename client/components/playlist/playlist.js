// Using vanilla JS because there's no replacement for
// createElement in jQuery
/**
 * Creates a DOM element based on the playlist and the onclick passed.
 * Returns the result DOM object originated with document functions, not jQuery.
 *
 * @param {Object} playlist The playlist to draw on screen
 * @param {Function} btnOnClick The onClick function of the playlist's button
 */
const createPlaylistElement = (playlist, btnOnClick) => {
  // This is the base container for the playlist element
  let createdList = document.createElement("div");
  createdList.className += "created-list container row ";

  // Stylistic: if the list doesn't want to append we change color based on it
  if (playlist.concat == "false") createdList.className += " no-modify";

  // This is the upper banner
  let outsideContainer = document.createElement("div");
  outsideContainer.className += "outside-container container";

  // This is the text inside the upper banner
  let listname = document.createElement("p");
  listname.className += "listname";
  listname.innerText = playlist.listName;

  // This is the button on the playlist
  let btn = document.createElement("button");
  btn.className += "button input";
  // This is the button's text
  let btnText = document.createElement("span");
  btnText.innerText = "Set playlist";
  btn.appendChild(btnText);
  btn.onclick = btnOnClick;

  // We're closing the top banner here
  let listNameWrapper = document.createElement("div");
  listNameWrapper.className += "list-name-wrapper col";
  let buttonWrapper = document.createElement("div");
  buttonWrapper.className += "set-playlist-wrapper col";

  listNameWrapper.appendChild(listname);
  buttonWrapper.appendChild(btn);

  let topBanner = document.createElement("div");
  topBanner.className += "top-banner container row";
  topBanner.appendChild(listNameWrapper);
  topBanner.appendChild(buttonWrapper);

  outsideContainer.appendChild(topBanner);

  // This is the picture slider
  let pictureSlider = document.createElement("div");
  pictureSlider.className += "pictures-slider container row";

  // We iterate for each image in the playlist
  playlist.pictures.forEach((picture) => {
    let img = document.createElement("img");
    img.setAttribute("src", "/image?name=" + picture);
    pictureSlider.appendChild(img);
  });

  // We place the wrapper inside the slider

  // We now add both outside and picture slider to the created list element
  createdList.appendChild(topBanner);
  createdList.appendChild(pictureSlider);
  return createdList;
};
