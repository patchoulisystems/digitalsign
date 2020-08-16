$(() => {
  startTopBanner();
  initializeDatepicker();
  initializeModal(() => {
    bindOnClickEvents();
    startGlitter();
  }, true);
});

const bindOnClickEvents = () => {
  $(".getData").click((event) => {
    closeFrame();
    onRequest();
  });
  $(".sendData").click((event) => {
    onSubmit();
    closeFrame();
  });
  $("#reset-button").click((event) => {
    onResetPress();
    closeFrame();
  });
};

const onSubmit = () => {
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
      url: "/exclude_list",
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

const onRequest = () => {
  let dateToSend = parseDatepicker();
  let dateType = $("input[name='radio']:checked").val();
  let errors = false;

  if (!dateToSend) {
    displayModal(
      "Please choose at least one day to request pictures from that date"
    );
    errors = true;
  }

  if (!errors) {
    let payload = {
      method: "POST",
      type: "POST",
      url: "/datedImages",
      data: JSON.stringify({
        dateType: dateType,
        dates: dateToSend,
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
        openFrame(response.data);
      });
  }
};
