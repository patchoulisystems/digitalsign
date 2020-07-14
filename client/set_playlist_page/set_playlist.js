$(() => {
  fetch("/widget?widgetName=datepicker&resource=datepicker.html").then(
    (data) => {
      data.text().then((html) => {
        let ogHTML = document.getElementById("datepicker-component").innerHTML;
        document.getElementById("datepicker-component").innerHTML =
          html + ogHTML;
        startDatepicker();
        fetch("/widget?widgetName=modal&resource=modal.html").then((data) => {
          data.text().then((html) => {
            $("#modal").html(html);
            startModalForList();
            $(".sendData").click((event) => {
              onSubmit();
            });
            getPlaylists();
          });
        });
      });
    }
  );
});

const getPlaylists = () => {
  fetch("/get_playlists")
    .then((resp) => resp.json())
    .then((data) => {
      let playlists = data.playlists;
      for (var playlist in playlists) {
        let current = playlists[playlist];
        let built = createPlaylistElement(current, () => {
          listOnClick(current);
        });
        $("#playlists-container").append(built);
        startGlitter();
      }
    });
};

const listOnClick = (playlist) => {
  if (playlist.concat == "false") {
    displayModal(
      "This list currently accepts other images to be concatenated to it. Would you like to keep it this way? (Click No to make it so we don't concatenate anymore)",
      () => {
        console.log("Clicked yes bruh");
        submitList(playlist);
        console.log("After yes bruh");
      },
      "Yes",
      "No",
      () => {
        submitList({ ...playlist, concat: "false" });
      }
    );
  } else {
    displayModal(
      "This list currently takes no other images concatenated to it. Would you like to keep it this way? (Click No to make it so we are concatenating other scheduled images)",
      () => {
        submitList(playlist);
      },
      "Yes",
      "No",
      () => {
        submitList({ ...playlist, concat: "true" });
      }
    );
  }
};

const submitList = (playlist) => {
  let dates = parseDatepicker();
  let payload = {
    method: "POST",
    type: "POST",
    url: "/set_playlist",
    data: JSON.stringify({
      ...playlist,
      dateType: dates.length != 0 ? $("input[name='radio']:checked").val() : "",
      dates: dates.length != 0 ? dates : "",
    }),
    contentType: "application/json",
  };
  console.log(payload);
  $.ajax(payload)
    .fail((xhr, error) => {
      if (xhr.status == 400) {
        displayModal(
          "The request was unable to be completed. Please refresh the page or try again later."
        );
        clearDatepicker();
      }
    })
    .done((response, status, xhr) => {
      if (xhr.status == 200) {
        displayModal("Your list has been set successfully!");
        clearDatepicker();
      }
    });
};
