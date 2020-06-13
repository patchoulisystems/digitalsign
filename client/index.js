$(() => {
  startGlitter();
  $(".button").click((event) => {
    let sendTo = $(event.target).attr("sendTo");
    window.open(sendTo);
  });
});
