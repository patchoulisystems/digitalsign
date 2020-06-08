var modal;
var modalContent;

fetch("/widget?widgetName=modal&resource=modal.html").then((data) => {
  data.text().then((html) => {
    $("#modal").html(html);
    startModal();
    // startGlitter();
  });
});

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

const displayModal = (text) => {
  modalContent.text(text);
  modal.css("display", "block");
};
