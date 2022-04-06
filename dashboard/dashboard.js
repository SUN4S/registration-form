const table = document.querySelector("tbody");
const countrySelect = document.querySelector("#countrySelect");
const searchBar = document.querySelector("#searchBar");
const main = document.querySelector("main");

const visitorCount = document.querySelector("#visitorCount");
const signupCount = document.querySelector("#signupCount");
const signupCountries = document.querySelector("#signupCountries");
const lowercaseNames = document.querySelector("#uncapitalizedCount");

const peopleURL = "http://18.193.250.181:1337/api/people";
const countriesURL = "http://18.193.250.181:1337/api/countries";
const populateQuery = "?populate=*";
const unlimitedSize = "&pagination[pageSize]=1000";

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

// ============= Renders an error message
const generateErrorField = (error) => {
  const h3 = document.createElement("h3");
  h3.textContent = error;

  main.appendChild(h3);
}

const generateHeader = async () => {
  const peopleData = await getData(peopleURL + populateQuery);

  // If strapi could take Regex (maybe it does and i messed up) this should probably have worked 
  //const filteredData = await getData(peopleURL + `?filters[first_name][$startsWith]=[a-z]`);

  const randomVisitorCount = Math.floor(Math.random() * 10000);
  visitorCount.innerHTML = randomVisitorCount;
  signupCount.innerHTML = peopleData.meta.pagination.total;
  lowercaseNames.innerHTML = "No Idea";
}

const generateCountryOptions = async () => {
  const countries = await getData(countriesURL);

  countries.data.map(item => {
    const option = document.createElement("option");
    option.textContent = item.attributes.country;
    option.value = item.attributes.country;

    countrySelect.appendChild(option);
  })
}

const generateuserList = async (searchQuery) => {
  const countryFilter = countrySelect.value;
  const filteredPeople = await getData(peopleURL + `?populate=*&filters[country][country][$eq]=${countryFilter || "Lithuania"}&filters[$or][0][first_name][$contains]=${searchQuery || ""}`);

  console.log(countryFilter);

  table.innerHTML = "";
  filteredPeople.data.map(item => {
    const tr = table.insertRow();

    const td1 = tr.insertCell();
    td1.textContent = item.attributes["first_name"] + " " + item.attributes["last_name"];

    const td2 = tr.insertCell();
    td2.textContent = item.attributes.country.data.attributes.country;
  })
}

countrySelect.addEventListener('click', () => {
  generateuserList(searchBar.value);
})

searchBar.addEventListener("input", e => {
  generateuserList(e.target.value);
})

window.onload = () => {
  generateHeader();
  generateCountryOptions();
  generateuserList();
}