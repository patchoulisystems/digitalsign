$(() => {
  initializeModal(startGlitter);
});

$(document).on("submit", "form", (event) => {
  event.preventDefault();
  let form = document.forms.namedItem("main-form");
  let formData = new FormData(form);
  let errors = false;

  if (!formData.get("animationName")) {
    displayModal("Error getting the animation name");
    errors = true;
  } else if (!formData.get("animationSpeed")) {
    displayModal("Animation Speed is required");
    errors = true;
  } else if (formData.get("animationSpeed") < 0.1) {
    displayModal("Animation Speed must be at least 0.1");
    errors = true;
  } else if (!formData.get("timeBetweenPictures")) {
    displayModal("Time Between Pictures is required");
    errors = true;
  } else if (formData.get("timeBetweenPictures") < 0) {
    displayModal("Time Between Pictures cannot be less than 0!");
    errors = true;
  }

  // For an easier UX on the settings side, we make the conversion to miliseconds here
  // We add the animation speed to the time between pictures because the moment the picture is
  // being rendered (as soon as the animation starts) the countdown for the next picture starts
  // TODO: Move this to server side
  formData.set(
    "timeBetweenPictures",
    (parseFloat(formData.get("timeBetweenPictures")) +
      parseFloat(formData.get("animationSpeed"))) *
      1000
  );

  if (!errors) {
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
          displayModal("Your settings have been submitted successfully!");
          form.reset();
        }
      });
  }
});
