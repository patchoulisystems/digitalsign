$(() => {
  startTopBanner();
  initializeDatepicker();
  initializeModal(() => {
    $(".sendData").click((event) => {
      onSubmit();
    });
    startGlitter();
  }, true);
  openFrame();
});

const openFrame = () => {
  let columns = $(".picture-column");
  columns.innerHTML = "";
  let builtImages = [];

  $.get("/datedImages").then((response) => {
    response.data.forEach((image) => {
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

      builtImages.push(singlePicture);
    });

    let counter = 0;
    while (builtImages.length > 0) {
      columns[counter % 4].appendChild(builtImages.pop());
      counter++;
    }
  });
  $("#frame").css({
    transition: "height 0ms 0ms, opacity 600ms 0ms",
    opacity: 1,
    height: "auto",
  });
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

const onSubmit = (event) => {
  let selectedPicturesNames = [];
  let selectedPicturesElements = Array.from(
    document.getElementsByClassName("picture-selected")
  );
  let dateToSend = parseDatepicker();
  let dateType = $("input[name='radio']:checked").val();
  let errors = false;

  if (selectedPicturesElements.length == 0) {
    displayModal("Please select at least one picture!");
    errors = true;
  }

  if (dateToSend.length == 0 && errors == false) {
    displayModal("Please finish the date selection!");
    errors = true;
  }

  if (!errors) {
    selectedPicturesElements.forEach((element) => {
      selectedPicturesNames.push(element.id);
    });

    let payload = {
      method: "POST",
      type: "POST",
      url: "/pictureList",
      data: JSON.stringify({
        dateType: dateType,
        dates: dateToSend,
        pictures: selectedPicturesNames,
      }),
      contentType: "application/json",
    };

    $.ajax(payload)
      .fail((xhr, error) => {
        if (xhr.status == 400) {
          displayModal(
            "The request was unable to be completed. Please refresh the page or try again later."
          );
          clearDatepicker();
        }
      })
      .done((response, status, xhr) => {
        if (xhr.status == 200) {
          displayModal("Your image has been successfully submitted!");
          clearDatepicker();
        }
      });
  }
};
