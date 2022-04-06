const stepCount = document.querySelector("#count");
const loadingBar = document.querySelector("#loadingBar");
const formSelect = document.querySelector("#formSelect");

const peopleURL = "http://18.193.250.181:1337/api/people";
const countriesURL = "http://18.193.250.181:1337/api/countries";
const activitiesURL = "http://18.193.250.181:1337/api/activities";


// ============= Gets data from given URL
const getData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    if(data.data != null) return data;  

    generateErrorField("Failed getting meaningful data");
  } catch (error) {
    generateErrorField(error || "unknown error");
  }
}

// ============= Post info about single user (new user object)
const postPerson = async (person) => {
  try {
    const response = await fetch(peopleURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          ...person
        }
      })
    })
    const data = await response.json();
    return data.data.id;
  } catch (error) {
    generateErrorField(error);
  }
}

// ============= Delete info about single user (by ID)
const deletePerson = async (person) => {
  const deleteURL = peopleURL + "/" + person;
  try {
    const response = await fetch(deleteURL, {
      method: "DELETE",
      headers: {
        'Content-type': 'application/json'
      }
    });
    const data = response.json();
    console.log(data);
  } catch (error) {
    generateErrorField(error);
  }
}

// ============= Renders an error message
const generateErrorField = (error) => {
  const h3 = document.createElement("h3");
  h3.textContent = error;

  formSelect.appendChild(h3);
}

// ============= Creates the first form with selectable activities
const generateActionForm = async () => {
  const data = await getData(activitiesURL);
  if(data == null) return;

  // General data change - step count, loadingbar increase
  formSelect.innerHTML = "";
  stepCount.innerHTML = 1;
  loadingBar.style.width = "25%";

  const actionForm = document.createElement("form");
  actionForm.id = "actionForm";

  const h2 = document.createElement("h2");
  h2.textContent = "What do you usually do after work?";

  actionForm.appendChild(h2);

  const checkboxContainer = document.createElement("div");
  checkboxContainer.id = "checkboxContainer";

  data.data.map(item => {
    const label = document.createElement("label");
    label.classList = "container";
    label.innerText = item.attributes.title;

    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = item.id;

    const span = document.createElement("span");
    span.classList = "checkmark";

    label.appendChild(input);
    label.appendChild(span);

    checkboxContainer.appendChild(label);
  })

  actionForm.appendChild(checkboxContainer);

  const submitButton = document.createElement("input");
  submitButton.type = "submit";
  submitButton.value = "Next";
  submitButton.id = "submit";

  actionForm.append(submitButton);

  actionForm.addEventListener("submit", e => {
    e.preventDefault();
    let actionIDs = [];

    Array.from(document.querySelectorAll('input[type=checkbox]:checked'))
      .map(item => actionIDs.push(item.value));

    localStorage.setItem("activityIDs", actionIDs);
    generatePersonForm();
  })

  formSelect.append(actionForm);
}

// ============= Creates the second form with details about user
const generatePersonForm = async () => {
  const countryList = await getData(countriesURL);
  if(countryList == null) return;

    // General data change - step count, loadingbar increase
  formSelect.innerHTML = "";
  stepCount.innerHTML = 2;
  loadingBar.style.width = "50%";

  const personForm = document.createElement("form");
  personForm.id = "personForm";

  const h2 = document.createElement("h2");
  h2.textContent = "Please fill in your details";

  personForm.appendChild(h2);

  const inputContainer = document.createElement("div");
  inputContainer.id = "inputContainer";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "First Name";
  nameInput.required = true;

  const lNameInput = document.createElement("input");
  lNameInput.type = "text";
  lNameInput.placeholder = "Last Name";
  lNameInput.required = true

  const emailInput = document.createElement("input");
  emailInput.type = "text";
  emailInput.placeholder = "Your Email";
  emailInput.required = true;

  const countryInput = document.createElement("select");
  countryInput.name = "countries";
  countryInput.id = "countryList";

  countryList.data.map(item => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.attributes.country;

    countryInput.appendChild(option);
  })

  const label = document.createElement("label");
  label.innerHTML = "Please accept our <a href='/'>Terms and conditions</a>";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "tosCheckbox";
  

  label.appendChild(checkbox);
  
  const submitButton = document.createElement("input");
  submitButton.type = "submit";
  submitButton.value = "Next";
  submitButton.id = "submit";

  inputContainer.appendChild(nameInput);
  inputContainer.appendChild(lNameInput);
  inputContainer.appendChild(emailInput);
  inputContainer.appendChild(countryInput);
  inputContainer.appendChild(label);

  personForm.appendChild(inputContainer);
  personForm.appendChild(submitButton);

  personForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if(!e.target[4].checked) {
      alert("Please accept TOS");
      return;
    }
    const newUser = {
      first_name: e.target[0].value,
      last_name: e.target[1].value,
      email: e.target[2].value,
      country: e.target[3].value,
      activities: localStorage.getItem("activityIDs").split(',')
    }
    localStorage.setItem("countryID", e.target[3].value);
    console.log(newUser);
    const userID = await postPerson(newUser);
    generateUserCheck(userID);
  })

  formSelect.append(personForm);
}

// ============= Gets info about user (by ID) and renders it
const generateUserCheck = async(personID) => {
  const personData = await getData(`http://18.193.250.181:1337/api/people/${personID}`);
  const countries = await getData(countriesURL);

  if(personData == null || countries == null) return;

  // General data change - step count, loadingbar increase
  formSelect.innerHTML = "";
  stepCount.innerHTML = 3;
  loadingBar.style.width = "75%";

  console.log(personData);

  const detailsContainer = document.createElement("div");
  detailsContainer.id ="detailsContainer";

  const h2 = document.createElement("h2");
  h2.textContent = "Are these details correct?";

  detailsContainer.appendChild(h2);

  const div = document.createElement("div");
  div.textContent = "Please make sure these details are correct:";
  div.classList = "detailsText";

  detailsContainer.appendChild(div);

  const detailsList = document.createElement("div");
  detailsList.classList = "detailsList";

  const userContainer = document.createElement("div");
  userContainer.classList = "userContainer";

  const nameTitle = document.createElement("div");
  nameTitle.textContent = "Name";
  nameTitle.classList = "userTitle";

  const nameValue = document.createElement("div");
  nameValue.textContent = personData.data.attributes["first_name"];
  nameValue.classList = "userValue";

  const surnameTitle = document.createElement("div");
  surnameTitle.textContent = "Surname";
  surnameTitle.classList = "userTitle";

  const surnameValue = document.createElement("div");
  surnameValue.textContent = personData.data.attributes["last_name"];
  surnameValue.classList = "userValue";

  const emailTitle = document.createElement("div");
  emailTitle.textContent = "Email";
  emailTitle.classList = "userTitle";

  const emailValue = document.createElement("div");
  emailValue.textContent = personData.data.attributes["email"];
  emailValue.classList = "userValue";

  const countryTitle = document.createElement("div");
  countryTitle.textContent = "Country";
  countryTitle.classList = "userTitle";

  const countryValue = document.createElement("div");
  countryValue.textContent = countries.data[localStorage.getItem("countryID")-1].attributes.country;
  countryValue.classList = "userValue";
  detailsList.appendChild(nameTitle);
  detailsList.appendChild(nameValue);
  detailsList.appendChild(surnameTitle);
  detailsList.appendChild(surnameValue);
  detailsList.appendChild(emailTitle);
  detailsList.appendChild(emailValue);
  detailsList.appendChild(countryTitle);
  detailsList.appendChild(countryValue);

  detailsContainer.appendChild(detailsList);

  const deleteBtn = document.createElement("button");
  deleteBtn.classList = "deleteBtn";
  deleteBtn.textContent = "Oops, no";

  deleteBtn.addEventListener('click', e => {
    deletePerson(personID);
    alert("user deleted");
    generateActionForm();
  })

  detailsContainer.appendChild(deleteBtn);

  const acceptBtn = document.createElement("button");
  acceptBtn.classList = "acceptBtn";
  acceptBtn.textContent = "I confirm details are accurate";

  acceptBtn.addEventListener('click', e => {
    console.log("accepted");
    generateFinish();
  })

  detailsContainer.appendChild(acceptBtn);

  formSelect.append(detailsContainer);
}

// ============= Renders a "good job" message
const generateFinish = () => {
  // General data change - step count, loadingbar increase
  formSelect.innerHTML = "";
  stepCount.innerHTML = 4;
  loadingBar.style.width = "100%";

  const finishContainer = document.createElement("div");
  finishContainer.id = "finishContainer";

  const h2 = document.createElement("h2");
  h2.textContent = "Pleace check you email";

  const div = document.createElement("div");
  div.textContent = "We sent you an email with all fot he required information to complete the registartion";

  finishContainer.appendChild(h2);
  finishContainer.appendChild(div);

  formSelect.appendChild(finishContainer);
}

window.onload = async () => {
  generateActionForm();
}