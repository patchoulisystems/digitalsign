const onChangeMonthYear = () => {
  setTimeout(() => {
    $("a.day").each(function (itm) {
      let parsedEpoch = $(this).attr("class").split(" ")[0].split("dp")[1];
      fetch(`/hasPicture?time=${parsedEpoch}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.data == "none") {
            $(this).css("background-color", "#cf4036");
          }
        });
    });
  }, 0);
};

let options = {
  rangeSelect: true,
  minDate: 0,
  multiSelect: null,
  dateFormat: "yyyy-mm-dd",
  onChangeMonthYear: onChangeMonthYear,
};

const initializeDatepicker = (fn, thenFn) => {
  fetch("/widget?widgetName=datepicker&resource=datepicker.html").then(
    (data) => {
      data.text().then((html) => {
        let ogHTML = document.getElementById("datepicker-component").innerHTML;
        document.getElementById("datepicker-component").innerHTML =
          html + ogHTML;
        startDatepicker(fn);
        if (thenFn) thenFn();
      });
    }
  );
};

const startDatepicker = (fn) => {
  options = { ...options, ...fn };
  $("#datepicker").datepick(options);
  attachOnChange();
  onResetPress();
  onChangeMonthYear();
};

const attachOnChange = () => {
  $("input[name='radio']").on("change", () => {
    var selected = $("input[name='radio']:checked").val();
    switch (selected) {
      case "multiple":
        options.rangeSelect = null;
        options.multiSelect = 999;
        $("#datepicker").datepick("destroy").datepick(options);
        $("#dpfield").val("");
        break;
      case "interval":
        options.rangeSelect = true;
        options.multiSelect = null;
        $("#datepicker").datepick("destroy").datepick(options);
        $("#dpfield").val("");
        break;
      default:
        break;
    }
  });
};

const clearDatepicker = () => {
  if ($("input[name='radio']:checked")) {
    $("input[name='radio']:checked").prop("checked", false);
  }
  $("#datepicker").datepick("destroy");
};

const onResetPress = () => {
  $("#reset-button").click(() => {
    if ($("input[name='radio']:checked")) {
      $("input[name='radio']:checked").prop("checked", false);
    }
    $("#datepicker").datepick("destroy");
  });
};

const parseDatepicker = () => {
  let resultDateString = "";

  let radioValue = $("input[name='radio']:checked").val();

  if (radioValue == "interval") {
    let dates = $("#datepicker").datepick("getDate");
    let formatedLeft = $.datepick.formatDate("yyyy-mm-dd", dates[0]);
    let formatedRight = $.datepick.formatDate("yyyy-mm-dd", dates[1]);
    if (formatedLeft && formatedRight)
      resultDateString = `${formatedLeft} - ${formatedRight}`;
  } else if (radioValue == "multiple") {
    let dates = $("#datepicker").datepick("getDate");
    dates.forEach((date) => {
      let formated = $.datepick.formatDate("yyyy-mm-dd", date);
      resultDateString += formated;
      if (date != dates[dates.length - 1]) {
        resultDateString += ",";
      }
    });
  }
  return resultDateString;
};
