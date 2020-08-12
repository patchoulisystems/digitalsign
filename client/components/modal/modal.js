let modal;
let modalContent;

const createModalCssLink = () => {
  let link = document.createElement("link");
  link.href = "/widget?widgetName=modal&resource=modal.css";
  link.rel = "stylesheet";
  link.type = "text/css";
  document.body.appendChild(link);
};

createModalCssLink();

const initializeModal = (thenFn, forList) => {
  fetch("/widget?widgetName=modal&resource=modal.html").then((data) => {
    data.text().then((html) => {
      $("#modal").html(html);
      forList ? startModalForList() : startModal();
      if (thenFn) thenFn();
    });
  });
};

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
  modal.css("display", "none");
  modalContent.text("");
};

const startModalForList = () => {
  modal = $("#modal");
  modalContent = $(modal).find('p[id="modal-text"]');
  $('button[id="modal-action"]').on("click", () => {
    closeModal();
  });
};

const displayModal = (text, fn, buttonAText, buttonBText, fn2) => {
  $("button#modal-cancel").remove();
  $('button[id="modal-action"] > span').html(buttonAText || "Ok");
  if (fn) {
    $("#modal > div > div.button-group").prepend(
      "<button id='modal-cancel' class='button close input'>" +
        (buttonBText || "Cancel") +
        "</button>"
    );
    $("button#modal-action")
      .off("click")
      .on("click", () => {
        fn();
        closeModal();
      });
  } else {
    $("button#modal-action").off("click").on("click", closeModal);
  }

  if (fn2) {
    $("#modal-cancel")
      .off("click")
      .on("click", () => {
        fn2();
        closeModal();
      });
  } else {
    $("#modal-cancel").off("click").on("click", closeModal);
  }
  modalContent.text(text);
  modal.css("display", "block");
};
