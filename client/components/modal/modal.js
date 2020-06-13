var modal;
var modalContent;

const startModal = () => {
  modal = $("#modal");
  modalContent = $(modal).find('p[id="modal-text"]');
  $('button[id="modal-close"]').click(() => {
    modal.css("display", "none");
    modalContent.text("");
  });
  $(window).click(() => {
    modal.css("display", "none");
    modalContent.text("");
  });
};

const startModalForList = () => {
  modal = $("#modal");
  modalContent = $(modal).find('p[id="modal-text"]');
  $('button[id="modal-close"]').click(() => {
    modal.css("display", "none");
    modalContent.text("");
  });
};

const displayModal = (text) => {
  modalContent.text(text);
  modal.css("display", "block");
};
