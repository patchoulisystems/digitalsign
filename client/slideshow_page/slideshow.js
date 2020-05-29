const endpoint = "/today_images";

var slideIndex = 0;
var images = [];

document.onreadystatechange = () => {
  if (document.readyState === "complete") {
    loadImages().then(() => {
      injectSlides();
      showSlides();
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

function injectSlides() {
  var mainContainer = document.getElementById("slideshow-container");

  images.forEach((image) => {
    let imageContainer = document.createElement("div");
    imageContainer.setAttribute("class", "slide fade");

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
  setTimeout(showSlides, 5000);
};
