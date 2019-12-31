var slideIndex = 0;
var images = [];

console.log("Hello Moto");
loadImages();
injectSlides();
showSlides();


function loadImages(){
    //Here an Ajax request would take place
    //In this step we're going to request a brand new object that contains the
        //pictures to display
    images.push("bread-food-brunch-lunch-3326103.jpg");
    images.push("lighthouse-3361704.jpg");
    images.push("shallow-focus-photography-of-woman-beside-fence-1684915.jpg");
    images.push("woman-holding-umbrella-2438805.jpg");
}

function injectSlides(){
    var mainContainer = document.getElementById('slideshow-container');
    console.log(mainContainer);
    images.forEach((image) => {
        var imageContainer = document.createElement("div");
        imageContainer.setAttribute('class', 'slide fade');
        var imageItself = document.createElement("img");
        imageItself.setAttribute("src", `./images/${image}`);
        imageContainer.appendChild(imageItself);
        mainContainer.appendChild(imageContainer);
        console.log(imageContainer);
    });
}

function showSlides(){
    var index;
    var slides = document.getElementsByClassName("slide");
    for (index = 0; index < slides.length; index++){
        slides[index].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) slideIndex = 1;
    slides[slideIndex - 1].style.display = "block";
    setTimeout(showSlides, 2000);
}