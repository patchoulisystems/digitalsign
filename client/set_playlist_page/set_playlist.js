$(() => {
  initializeDatepicker();
  initializeModal(null, true);
  getPlaylists();
});

const getPlaylists = () => {
  fetch("/getPlaylists")
    .then((resp) => resp.json())
    .then((data) => {
      let playlists = data.playlists;
      for (var playlist in playlists) {
        let current = playlists[playlist];
        let built = createPlaylistElement(current, () => {
          listOnClick(current);
        });
        $("#playlists-container").append(built);
      }
      startGlitter();
    });
};

const listOnClick = (playlist) => {
  if (playlist.concat == "true") {
    displayModal(
      "This list currently accepts other images to be added/removed to it. Would you like to keep it this way? (Click No to make it so we don't modify the list at all)",
      () => {
        submitList(playlist);
      },
      "Yes",
      "No",
      () => {
        submitList({ ...playlist, concat: "false" });
      }
    );
  } else {
    displayModal(
      "This list currently cannot be added to/removed from. Would you like to keep it this way? (Click No to make it so we are modifying the list)",
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
