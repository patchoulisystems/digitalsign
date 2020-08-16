const COLUMNS = 4;

const openFrame = (endpoint = "/datedImages") => {
  framePromise(endpoint).then((data) => {
    prepareFrame();
    let columns = $(".picture-column");
    columns.innerHTML = "";
    let builtImages = buildSinglePictureTags(data);

    let counter = 0;
    while (builtImages.length > 0) {
      columns[counter % COLUMNS].appendChild(builtImages.pop());
      counter++;
    }
    $("#frame").css({
      opacity: 1,
      height: "auto",
    });
  });
};

const framePromise = (obj) =>
  new Promise((res, rej) => {
    switch (typeof obj) {
      case "string":
        $.get(obj).then((resp) => res(resp.data));
        break;
      case "object":
        res(obj);
        break;
      default:
        rej();
        break;
    }
  });

const buildSinglePictureTags = (data) => {
  return data.map((image) => {
    let singlePicture = document.createElement("div");
    singlePicture.setAttribute("class", "single-picture picture-unselected");
    singlePicture.setAttribute("id", image);

    singlePicture.onclick = function () {
      onSinglePictureClick(image);
    };

    let imageTag = document.createElement("img");
    imageTag.setAttribute("src", `/image?name=${image}`);

    let overlay = document.createElement("div");
    overlay.setAttribute("class", "overlay unselected");

    singlePicture.appendChild(imageTag);
    singlePicture.appendChild(overlay);

    return singlePicture;
  });
};

const prepareFrame = () => {
  let counter = 0;
  let frame = document.getElementById("frame");
  frame.className += "picture-row ";
  if (frame) {
    // Number of columns we want on the frame
    while (counter < COLUMNS) {
      let col = document.createElement("div");
      col.className += "picture-column ";
      frame.appendChild(col);
      counter++;
    }
  }
};

const onSinglePictureClick = (pictureName) => {
  let singlePicture = document.getElementById(pictureName);
  let singlePictureOverlay = singlePicture.getElementsByClassName("overlay")[0];
  togglePictureClass(singlePicture, singlePictureOverlay);
};

const togglePictureClass = (picture, overlay) => {
  if (picture.classList.contains("picture-unselected")) {
    picture.classList.remove("picture-unselected");
    picture.classList.add("picture-selected");
    overlay.classList.remove("unselected");
    overlay.classList.add("selected");
  } else {
    picture.classList.remove("picture-selected");
    picture.classList.add("picture-unselected");
    overlay.classList.remove("selected");
    overlay.classList.add("unselected");
  }
};

const clearSelectedPictures = () => {
  let selectedPicturesElements = Array.from(
    document.getElementsByClassName("picture-selected")
  );
  selectedPicturesElements.forEach((element) => {
    let picture = document.getElementById(element.id);
    let pictureOverlay = picture.getElementsByClassName("overlay")[0];
    togglePictureClass(picture, pictureOverlay);
  });
};

const closeFrame = () => {
  $(".picture-column").html("");
};
