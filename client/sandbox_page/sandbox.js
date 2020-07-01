fetch("/widget?widgetName=modal&resource=modal.html").then((data) => {
  data.text().then((html) => {
    $("#modal").html(html);
    startModal();
    displayModal(
      "Hello World",
      () => console.log("PATATA"),
      "Triggers Custom FN",
      "Closes"
    );
  });
});
