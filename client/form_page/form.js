$(() => {
  startTopBanner();
  initializeDatepicker();
  initializeModal(startGlitter);
});

$(window).on("load resize", function () {
  let vpWidth = $(window).width();
  if (vpWidth <= 765) {
    $(".main-form").removeClass("row").addClass("col");
  } else {
    $(".main-form").removeClass("col").addClass("row");
  }
});

$(document).on("submit", "form", (event) => {
  event.preventDefault();
  let form = document.forms.namedItem("main-form");
  let formData = new FormData(form);
  let errors = false;

  if (!formData.get("firstname")) {
    displayModal("First Name is required");
    errors = true;
  } else if (!formData.get("lastname")) {
    displayModal("Last Name is required");
    errors = true;
  } else if (!formData.get("studentid")) {
    displayModal("Student ID is required");
    errors = true;
  } else if (!formData.get("picture").name) {
    displayModal("A picture to upload is required!");
    errors = true;
  } else if (!parseDatepicker()) {
    displayModal("Please finish choosing your dates!");
    errors = true;
  }

  if (!errors) {
    formData.append("dates", parseDatepicker());
    $.ajax({
      url: form.action,
      type: "POST",
      method: form.method,
      data: formData,
      contentType: false,
      processData: false,
    })
      .fail((xhr, error) => {
        if (xhr.status == 400) {
          displayModal(
            "The request was unable to be completed. Please refresh the page or try again later."
          );
        }
      })
      .done((response, status, xhr) => {
        if (xhr.status == 200) {
          displayModal("Your image has been successfully submitted!");
          form.reset();
          clearDatepicker();
        }
      });
  }
});
