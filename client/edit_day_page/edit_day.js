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
          clearSelectedPictures();
        }
      })
      .done((response, status, xhr) => {
        if (xhr.status == 200) {
          displayModal("Your image has been successfully submitted!");
          clearDatepicker();
          clearSelectedPictures();
        }
      });
  }
};
