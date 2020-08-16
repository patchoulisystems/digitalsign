$(() => {
  startGlitter();
  $(".button").click(function () {
    let sendTo = $(this).attr("sendTo");
    window.open(sendTo);
  });
});
