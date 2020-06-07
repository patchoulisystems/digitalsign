$(() => {
  fetch("/widget?widgetName=datepicker&resource=datepicker.html").then(
    (data) => {
      data.text().then((html) => {
        document.getElementById("datepicker-component").innerHTML = html;
        startDatepicker();
      });
    }
  );
  fetch("/widget?widgetName=modal&resource=modal.html").then((data) => {
    data.text().then((html) => {
      $("#modal").html(html);
      startModal();
    });
  });
});

$(document).on("submit", "form", (event) => {
  event.preventDefault();
  let form = document.forms.namedItem("main-form");
  let formData = new FormData(form);
  let errors = false;

  if (!formData.get("firstname")) {
    alert("First Name is required");
    errors = true;
  } else if (!formData.get("lastname")) {
    alert("Last Name is required");
    errors = true;
  } else if (!formData.get("studentid")) {
    alert("Student ID is required");
    errors = true;
  } else if (!formData.get("picture").name) {
    alert("A picture to upload is required!");
    errors = true;
  } else if (!parseDatepicker()) {
    alert("Please finish choosing your dates!");
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
