const url = "127.0.0.1:3000";
const endpoint = "/today_images";

var slideIndex = 0;
var images = [];

loadImages().then(() => {
  injectSlides();
  showSlides();
});

async function loadImages() {
  //Here an Ajax request would take place
  let response = await fetch(new URL(`http://${url}${endpoint}`));
  let data = await response.json();
  data["data"].forEach(element => {
    images.push(element);
  });
}

function injectSlides() {
  var mainContainer = document.getElementById("slideshow-container");
  images.forEach(image => {
    var imageContainer = document.createElement("div");
    imageContainer.setAttribute("class", "slide fade");
    var imageItself = document.createElement("img");
    imageItself.setAttribute("src", `http://${url}/image?name=${image}`);
    imageContainer.appendChild(imageItself);
    mainContainer.appendChild(imageContainer);
  });
}

function showSlides() {
  var index;
  var slides = document.getElementsByClassName("slide");
  for (index = 0; index < slides.length; index++) {
    slides[index].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > slides.length) slideIndex = 1;
  slides[slideIndex - 1].style.display = "block";
  setTimeout(showSlides, 5000);
}
