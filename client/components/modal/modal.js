var modal;
var modalContent;

const startModal = () => {
  modal = $("#modal");
  modalContent = $(modal).find('p[id="modal-text"]');
  $('button[id="modal-action"]').on("click", () => {
    closeModal();
  });
  $(window).click(() => {
    closeModal();
  });
};

const closeModal = () => {
  modal.css("visibility", "hidden");
  modalContent.text("");
};

const startModalForList = () => {
  modal = $("#modal");
  modalContent = $(modal).find('p[id="modal-text"]');
  $('button[id="modal-action"]').on("click", () => {
    closeModal();
  });
};

const displayModal = (text, fn, buttonAText, buttonBText) => {
  $("button#modal-cancel").remove();
  $('button[id="modal-action"] > span').html(buttonAText || "Ok");
  if (fn) {
    $("#modal > div > div.button-group")
      .prepend(
        "<button id='modal-cancel' class='button close input'>" +
          (buttonBText || "Cancel") +
          "</button>"
      )
      .click(() => closeModal());
    $("button#modal-action")
      .off("click")
      .on("click", () => {
        fn();
        closeModal();
      });
  } else {
    $("button#modal-action")
      .off("click")
      .on("click", () => closeModal);
  }
  modalContent.text(text);
  modal.css("visibility", "visible");
};
