document.addEventListener("DOMContentLoaded", function() {
  var jsonLinks = document.querySelectorAll(".json-link"),
    title = document.getElementById("title");

  jsonLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();

      jsonLinks.forEach(el => {
        el.parentElement.classList.remove("active");
      });
      link.parentElement.classList.add("active");

      var href = link.getAttribute("href");
      fetchJSONfile("json/" + href, function(data) {
        title.textContent = link.textContent;
        buildForm(data);
        var submitButton = document.getElementById("submit");
        submitButton.addEventListener("click", function(e) {
          e.preventDefault();
          checkAnswers(data);
        });

        toggleScrollers();
      });
    });
  });

  var scrollTop = document.getElementById("scroll-top"),
    scrollBot = document.getElementById("scroll-bot");

  scrollTop.addEventListener("click", e => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
  scrollBot.addEventListener("click", e => {
    e.preventDefault();
    window.scrollTo({
      top: document.body.clientHeight,
      behavior: "smooth"
    });
  });
  window.addEventListener("scroll", () => {
    clearTimeout(timeout);
    var timeout = setTimeout(() => {
      toggleScrollers();
    }, 200);
  });

  function toggleScrollers() {
    if (window.pageYOffset <= 100) {
      scrollTop.style.transform = "scale(0)";
    } else {
      scrollTop.style.transform = "scale(1)";
    }

    if (window.pageYOffset <= document.body.clientHeight - window.innerHeight) {
      scrollBot.style.transform = "scale(1)";
    } else {
      scrollBot.style.transform = "scale(0)";
    }
  }
});

function buildForm(data) {
  var docFrag = document.createDocumentFragment(),
    row = document.createElement("div"),
    submit = document.createElement("button"),
    shuffledData = shuffle(data);

  for (let i = 0; i < shuffledData.length; i++) {
    const element = shuffledData[i];
    docFrag.appendChild(buildQuestion(element, i + 1));
  }

  row.id = "submit";
  row.classList.add("row");
  submit.textContent = "Submit";
  submit.id = "submit";
  submit.classList.add("btn");
  submit.classList.add("waves-effect");
  row.appendChild(submit);
  docFrag.appendChild(row);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
  var sheet = document.getElementById("sheet");
  sheet.innerHTML = "";
  sheet.appendChild(docFrag);
}

function buildQuestion(question, index) {
  var div = document.createElement("div"),
    h5 = document.createElement("h6"),
    p = document.createElement("p"),
    label = document.createElement("label"),
    input = document.createElement("input"),
    span = document.createElement("span"),
    submit = document.createElement("button");

  div.id = "question" + index;
  div.classList.add("row");
  h5.innerHTML = index + ". " + question.question.replace(/\n/g, "<br>");
  input.name = "question" + index;

  if (Array.isArray(question.answer)) {
    input.type = "checkbox";
  } else {
    input.type = "radio";
  }

  div.appendChild(h5);
  label.appendChild(input);
  label.appendChild(span);
  p.appendChild(label);

  var choices = shuffle(question.choices);
  choices.forEach(choice => {
    input.value = choice;
    span.textContent = choice;
    div.appendChild(p.cloneNode(true));
  });

  return div;
}

function checkAnswers(data) {
  var sheet = document.getElementById("sheet"),
    correct = 0;

  for (let i = 0; i < data.length; i++) {
    const element = data[i],
      qId = "question" + (i + 1),
      answer = element.answer,
      checked = getCheckedValue(qId);

    if (Array.isArray(answer)) {
      answer.sort();
      checked.sort();
      if (isEqual(checked, answer)) {
        highlightCorrectAnswers(qId);
        correct++;
      } else {
        displayCorrectAnswers(answer, qId);
      }
    } else {
      if (checked[0] == answer) {
        highlightCorrectAnswers(qId);
        correct++;
      } else {
        displayCorrectAnswers(answer, qId);
      }
    }
    disableAllChoices(qId);
  }

  buildScore(correct, data.length);
}

function buildScore(correct, total) {
  var submitRow = document.getElementById("submit"),
    scoreEl = document.createElement("h5");

  scoreEl.textContent = correct + " / " + total;
  submitRow.appendChild(scoreEl);
}

function highlightCorrectAnswers(groupName) {
  var radios = document.getElementsByName(groupName);
  for (i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      radios[i].parentElement.parentElement.classList.add("green");
      radios[i].parentElement.parentElement.classList.add("lighten-2");
    }
  }
}

function displayCorrectAnswers(answer, qId) {
  var row = document.getElementById(qId),
    answerBox = document.createElement("blockquote"),
    p = document.createElement("p");

  if (Array.isArray(answer)) {
    answer.forEach(a => {
      p.textContent = a;
      answerBox.appendChild(p.cloneNode(true));
    });
  } else {
    answerBox.textContent = answer;
  }

  row.appendChild(answerBox);
}

function getCheckedValue(groupName) {
  var checkedValues = [];
  var radios = document.getElementsByName(groupName);
  for (i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      checkedValues.push(radios[i].value);
    }
  }
  return checkedValues;
}

function disableAllChoices(groupName) {
  var radios = document.getElementsByName(groupName);
  for (i = 0; i < radios.length; i++) {
    radios[i].disabled = true;
  }
}

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function fetchJSONfile(path, callback) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == "200") {
      var data = JSON.parse(this.responseText);
      if (callback) {
        callback(data);
      }
    }
  };
  xhttp.open("GET", path, true);
  xhttp.send();
}

var isEqual = function(value, other) {
  // Get the value type
  var type = Object.prototype.toString.call(value);

  // If the two objects are not the same type, return false
  if (type !== Object.prototype.toString.call(other)) return false;

  // If items are not an object or array, return false
  if (["[object Array]", "[object Object]"].indexOf(type) < 0) return false;

  // Compare the length of the length of the two items
  var valueLen =
    type === "[object Array]" ? value.length : Object.keys(value).length;
  var otherLen =
    type === "[object Array]" ? other.length : Object.keys(other).length;
  if (valueLen !== otherLen) return false;

  // Compare two items
  var compare = function(item1, item2) {
    // Get the object type
    var itemType = Object.prototype.toString.call(item1);

    // If an object or array, compare recursively
    if (["[object Array]", "[object Object]"].indexOf(itemType) >= 0) {
      if (!isEqual(item1, item2)) return false;
    }

    // Otherwise, do a simple comparison
    else {
      // If the two items are not the same type, return false
      if (itemType !== Object.prototype.toString.call(item2)) return false;

      // Else if it's a function, convert to a string and compare
      // Otherwise, just compare
      if (itemType === "[object Function]") {
        if (item1.toString() !== item2.toString()) return false;
      } else {
        if (item1 !== item2) return false;
      }
    }
  };

  // Compare properties
  if (type === "[object Array]") {
    for (var i = 0; i < valueLen; i++) {
      if (compare(value[i], other[i]) === false) return false;
    }
  } else {
    for (var key in value) {
      if (value.hasOwnProperty(key)) {
        if (compare(value[key], other[key]) === false) return false;
      }
    }
  }

  // If nothing failed, return true
  return true;
};
