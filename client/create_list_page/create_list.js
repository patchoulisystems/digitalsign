$(() => {
  startTopBanner();
  initializeDatepicker();
  initializeModal(() => {
    startGlitter();
    $(".sendData").click((event) => {
      onSubmit();
    });
  }, true);
  openFrame();
});

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
