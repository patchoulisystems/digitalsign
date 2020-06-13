const endpoint = "/today_images";
const settingsEndpoint = "/settings";

var slideIndex = 0;
var images = [];
var settings = {};

document.onreadystatechange = () => {
  if (document.readyState === "complete") {
    loadImages().then(() => {
      loadSettings().then(() => {
        injectSlides();
        showSlides();
      });
    });
  }
};

async function loadImages() {
  return fetch(`${endpoint}`)
    .then((response) => response.json())
    .then((data) => {
      data.data.forEach(function (element) {
        images.push(element);
      });
    });
}

async function loadSettings() {
  return fetch(settingsEndpoint)
    .then((response) => response.json())
    .then((data) => {
      settings = data.data;
    });
}

function injectSlides() {
  var mainContainer = document.getElementById("slideshow-container");

  images.forEach((image) => {
    let imageContainer = document.createElement("div");
    imageContainer.setAttribute("class", "slide animatable");
    imageContainer.style.setProperty("--animation", settings.animationName);
    imageContainer.style.setProperty(
      "--anim-duration",
      `${settings.animationSpeed}s`
    );
    let imageItself = document.createElement("img");
    imageItself.setAttribute("src", `/image?name=${image}`);

    imageContainer.appendChild(imageItself);
    mainContainer.appendChild(imageContainer);
  });
}

const showSlides = () => {
  var index;
  var slides = document.getElementsByClassName("slide");

  for (index = 0; index < slides.length; index++) {
    slides[index].style.display = "none";
  }

  slideIndex++;
  slides[slideIndex % slides.length].style.display = "block";
  setTimeout(showSlides, settings.timeBetweenPictures);
};

var justHidden = false;
var j;

function hide() {
  $("html").css({
    cursor: "none",
  });
  justHidden = true;
  setTimeout(function () {
    justHidden = false;
  }, 500);
}
$(document).mousemove(function () {
  if (!justHidden) {
    justHidden = false;
    console.log("move");
    clearTimeout(j);
    $("html").css({
      cursor: "default",
    });
    j = setTimeout(hide, 1000);
  }
});
