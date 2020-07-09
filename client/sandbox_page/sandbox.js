$(() => {
  for (let index = 0; index < 10; index++) {
    var playlist = createPlaylistElement(
      {
        name: "List " + (index + 1),
        concat: index % 2 == 0,
        pictures: [
          "image29.jpg",
          "image20.jpg",
          "image19.jpg",
          "image19.jpg",
          "image19.jpg",
          "image19.jpg",
          "image19.jpg",
          "image19.jpg",
          "image19.jpg",
          "image7.jpg",
          "image7.jpg",
          "image7.jpg",
          "image7.jpg",
          "image7.jpg",
          "image7.jpg",
          "image7.jpg",
          "image19.jpg",
          "image19.jpg",
          "image19.jpg",
          "asd.jpg",
        ],
      },
      () => {
        alert("HOLA BACANO");
      }
    );
    $("#playlists-container").append(playlist);
  }
});
