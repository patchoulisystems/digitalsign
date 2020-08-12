const createGlitterCssLink = () => {
  let link = document.createElement("link");
  link.href = "/widget?widgetName=buttonglitter&resource=buttonglitter.css";
  link.rel = "stylesheet";
  link.type = "text/css";
  document.body.appendChild(link);
};

createGlitterCssLink();

const startGlitter = () => {
  $(".button").mousemove((e) => {
    bindMouseEvent(e);
  });
};

const bindMouseEvent = (e) => {
  const x = e.pageX - e.target.offsetLeft;
  const y = e.pageY - e.target.offsetTop;

  e.target.style.setProperty("--x", `${x}px`);
  e.target.style.setProperty("--y", `${y}px`);
};
