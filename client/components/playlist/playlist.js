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
  console.log(playlist);
  // This is the base container for the playlist element
  var createdList = document.createElement("div");
  createdList.className += "created-list " + playlist.listName;

  // Stylistic: if the list doesn't want to append we change color based on it
  if (playlist.concat) createdList.className += " concat";

  // This is the upper banner
  var outsideContainer = document.createElement("div");
  outsideContainer.className += "outside-container";

  // This is the text inside the upper banner
  var listname = document.createElement("p");
  listname.className += "listname";
  listname.innerText = playlist.listName;

  // This is the button on the playlist
  var btn = document.createElement("button");
  btn.className += "button input";
  // This is the button's text
  var btnText = document.createElement("span");
  btnText.innerText = "Set playlist";
  btn.appendChild(btnText);
  btn.onclick = btnOnClick;

  // We're closing the top banner here
  outsideContainer.appendChild(listname);
  outsideContainer.appendChild(btn);

  // This is the picture slider
  var pictureSlider = document.createElement("div");
  pictureSlider.className += "pictures-slider";

  // This is the picture slider's wrapper
  var picturesWrapper = document.createElement("div");
  picturesWrapper.className += "pictures-slider-wrapper";

  // We iterate for each image in the playlist
  playlist.pictures.forEach((picture) => {
    var img = document.createElement("img");
    img.setAttribute("src", "/image?name=" + picture);
    picturesWrapper.appendChild(img);
  });

  // We place the wrapper inside the slider
  pictureSlider.appendChild(picturesWrapper);

  // We now add both outside and picture slider to the created list element
  createdList.appendChild(outsideContainer);
  createdList.appendChild(pictureSlider);
  return createdList;
};
