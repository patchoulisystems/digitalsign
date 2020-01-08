const url = "127.0.0.1:3000";
const endpoint = "/upload";

const handleSubmit = event => {
  // Stops the form from submitting; we're doing that with AJAX
  event.preventDefault();
  // Call our function to get the form data here
  const data = formToJSON(form.elements);
  console.log(form.elements);
  console.log(data);
};

async function postSubmit(data) {
  const response = await fetch(`${url}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  });
}

const formToJSON = formElements =>
  [].reduce.call(
    formElements,
    (data, element) => {
      if (isValidElement(element)) {
        data[element.name] = element.value;
      }
      return data;
    },
    {}
  );

const isValidElement = element => {
  return element.name && element.value;
};

const form = document.getElementsByClassName("main-form")[0];
form.addEventListener("submit", handleSubmit);
