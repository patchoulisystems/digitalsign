const endpoint = "/today_images";
const axios = window.axios;

var slideIndex = 0;
var images = [];

document.onreadystatechange = () => {
  if (document.readyState === 'complete')
  // The page is fully loaded
  {
  
    loadImages().then(function () {
      injectSlides();
      showSlides();
    });
  } 
}

async function loadImages() {
  //Here an Ajax request would take place
  let response = await axios.get(`${endpoint}`);
  response.data["data"].forEach(function (element) {
    images.push(element);
  });
}

function injectSlides() {
  var mainContainer = document.getElementById("slideshow-container");
  images.forEach(image => {
    var imageContainer = document.createElement("div");
    imageContainer.setAttribute("class", "slide fade");
    var imageItself = document.createElement("img");
    imageItself.setAttribute("src", `/image?name=${image}`);
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
