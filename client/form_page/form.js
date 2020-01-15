const url = "127.0.0.1:3000";
const endpoint = "/upload";

//Another approach to handling the form would be...
const submitForm = () => {
  var form = document.getElementById('main-form');
  form.setAttribute('action', `${url}${endpoint}`);
};


const handleSubmit = event => {
  // Stops the form from submitting; we're doing that with AJAX
  event.preventDefault();
  // Call our function to get the form data here
  console.log(event);
  const data = formToJSON(form.elements);
  console.log(form.elements);
  console.log(data);
  postSubmit(data);
};

async function postSubmit(data) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
    "Access-Control-Max-Age": 2592000 // 30 days
    /** add other headers as per requirement */
  };
  const response = await fetch(`http://${url}/${endpoint}`, {
    method: "POST",
    body: data,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
      "Access-Control-Max-Age": 2592000 // 30 days,
    },
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
