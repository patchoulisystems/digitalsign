const endpoint = "/todayImages";
const settingsEndpoint = "/settings";

var now = new Date();
const then = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate() + 1
).setHours(2);

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

// When the time of a date object is manipulated, the date object
// becomes an epoch time. That's why we're doing this comparison
// like that
const refresher = () => {
  if (now.getTime() >= then) {
    // Refresh
    location.reload();
  } else {
    // Reset now
    now = new Date();
  }
  // Every hour
  setTimeout(refresher, 360000);
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
    clearTimeout(j);
    $("html").css({
      cursor: "default",
    });
    j = setTimeout(hide, 1000);
  }
});

refresher();
