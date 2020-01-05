const handleSubmit = event => {
  // Stops the form from submitting; we're doing that with AJAX
  event.preventDefault();
  // Call our function to get the form data here
  const data = formToJSON(form.elements);
  console.log(form.elements);
  console.log(data);
};

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
