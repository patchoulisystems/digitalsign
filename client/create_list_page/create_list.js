$(() => {
  fetch("/widget?widgetName=datepicker&resource=datepicker.html").then(
    (data) => {
      data.text().then((html) => {
        let ogHTML = document.getElementById("datepicker-component").innerHTML;
        document.getElementById("datepicker-component").innerHTML =
          html + ogHTML;
        startDatepicker();
        fetch("/widget?widgetName=modal&resource=modal.html").then((data) => {
          data.text().then((html) => {
            $("#modal").html(html);
            startModalForList();
            $(".sendData").click((event) => {
              onSubmit();
            });
            startGlitter();
          });
        });
      });
    }
  );
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

const handlePost = (
  dateType,
  listName,
  dateToSend,
  concatList,
  selectedPicturesElements
) => {
  let selectedPicturesNames = [];
  selectedPicturesElements.forEach((element) => {
    selectedPicturesNames.push(element.id);
  });
  let payload = {
    method: "POST",
    type: "POST",
    url: "/create_list",
    data: JSON.stringify({
      dateType,
      listName,
      dates: dateToSend,
      concat: concatList,
      pictures: selectedPicturesNames,
    }),
    contentType: "application/json",
  };
  displayModal("Loading...");
  $.ajax(payload)
    .fail((xhr, error) => {
      if (xhr.status == 400) {
        displayModal(
          "The request was unable to be completed. Please refresh the page or try again later."
        );
        clearDatepicker();
        clearSelectedPictures();
        clearName();
      }
    })
    .done((response, status, xhr) => {
      if (xhr.status == 200) {
        displayModal("Your list has been successfully submitted!");
        clearDatepicker();
        clearSelectedPictures();
        clearName();
      }
    });
};

const clearName = () => {
  $("#list-name").val("");
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

const onSubmit = (event) => {
  let selectedPicturesElements = Array.from(
    document.getElementsByClassName("picture-selected")
  );
  let dateToSend = parseDatepicker();
  let dateType = $("input[name='radio']:checked").val();
  let listName = $("#list-name").val();
  let concatList = $("input[name='concat']:checked").val();
  let errors = false;

  if (selectedPicturesElements.length == 0) {
    displayModal("Please select at least one picture!");
    errors = true;
  }

  if (dateToSend.length == 0 && errors == false) {
    displayModal("Please finish the date selection!");
    errors = true;
  }

  if (!listName && !errors) {
    displayModal("Please type a list name!");
    errors = true;
  }

  if (!concatList && !errors) {
    displayModal(
      "Please choose if you would like to add other scheduled picture lists to this one!"
    );
    errors = true;
  }

  if (!errors) {
    $.ajax({
      method: "GET",
      type: "GET",
      url: "/playlistExists?name=" + listName,
    }).done((response, status, xhr) => {
      // No need to look inside response.data unless we change that on router
      let parsedRes = JSON.parse(response);
      if (parsedRes.playlistExists == true) {
        displayModal(
          "There's already a list with this name. This will overwrite the previous list. Are you sure you want to continue?",
          () => {
            handlePost(
              dateType,
              listName,
              dateToSend,
              concatList,
              selectedPicturesElements
            );
          }
        );
      } else {
        handlePost(
          dateType,
          listName,
          dateToSend,
          concatList,
          selectedPicturesElements
        );
      }
    });
  }
};
