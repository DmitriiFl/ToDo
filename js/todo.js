// Initial data
const getDataFromLocaleStorage = (data) =>
  localStorage.getItem(data) ? JSON.parse(localStorage.getItem(data)) : [];

const setDataToLocaleStorage = (name, data) =>
  localStorage.setItem(name, JSON.stringify(data));

let titles = getDataFromLocaleStorage("titles");
let data = getDataFromLocaleStorage("data");

// Data drawing

function checkListBeforeShow() {
  if (titles.length > 0) {
    return showList(titles[0].name);
  }
  document.querySelector(".list-content").innerHTML = "";
}

function showCategories() {
  const listNav = document.querySelector(".list-nav ul"); // Categories list in table
  const customOptions = document.querySelector(".custom-options"); // Categories list in dropdown

  listNav.innerHTML = "";
  customOptions.innerHTML = customOptions.firstChild.outerHTML;

  if (titles.length) {
    titles.forEach((item) => {
      listNav.innerHTML += `<li data-value="${item.name}" id="${item.name}">${item.value}</li>`;
      customOptions.innerHTML += `<span class='custom-option' data-value='${item.name}'>${item.value}</span>`;
    });
  } else {
    listNav.textContent = "Ещё нет категорий";
  }

  listNavListener(); // ??
  dropdownEventListener(); // ??
}

function showList(category) {
  let listContent = document.querySelector(".list-content");
  listContent.innerHTML = "";

  try {
    document.querySelector(".list-nav li.active").classList.remove("active");
  } catch (e) {
    console.log(e);
  }
  try {
    document.querySelector(`#${category}`).classList.add("active");
  } catch (e) {
    console.log(e);
  }

  data.forEach((item, index) => {
    if (category === item["list"]) {
      let doneClass = item["isDone"] ? "done" : "";
      let doneIcon = doneClass
        ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>'
        : '<i class="fa fa-square-o" aria-hidden="true"></i>';
      listContent.innerHTML += `<div class="list-item ${doneClass}" data-index="${index}">
                        <div class="desc">${item["title"]}</div>
                        <div class="buttons">
                            <ul>
                                <li data-value="${item["title"]}" id="edit"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></li>
                                <li data-value="${item["title"]}" id="delete">
                                    <i class="fa fa-minus-square-o" aria-hidden="true"></i>
                                </li>
                                <li data-value="${item["title"]}" id="done">${doneIcon}</li>
                            </ul>
                        </div>
                    </div>
                `;
    }
  });
  deleteElementListener();
  doneElementListener();
  editElementListener();
}

// Listeners

function dropdownEventListener() {
  const input = document.querySelector("#new_category");

  for (const option of document.querySelectorAll(".custom-option")) {
    option.addEventListener("click", function () {
      if (!this.classList.contains("selected")) {
        try {
          this.parentNode
            .querySelector(".selected")
            .classList.remove("selected");
        } catch (e) {
          console.log(e);
        }
        this.classList.add("selected");
        this.closest(".custom-select").querySelector(
          ".custom-select__trigger span"
        ).dataset.value = this.dataset.value;
        this.closest(".custom-select").querySelector(
          ".custom-select__trigger span"
        ).innerHTML = this.innerHTML;
        showList(this.dataset.value);

        if (this.contains(input)) {
          this.closest(".custom-select").querySelector(
            ".custom-select__trigger"
          ).style.padding = "0";
          this.closest(".custom-select")
            .querySelector("#new_category")
            // .select()
            .focus();
        } else {
          this.closest(".custom-select").querySelector(
            ".custom-select__trigger"
          ).style.padding = "10px 20px";
        }
      }
    });
  }
}

function listNavListener() {
  let listNavItems = document.querySelectorAll(".list-nav ul li");

  [...listNavItems].map((listItem) =>
    listItem.addEventListener("click", function () {
      showList(this.dataset.value);
    })
  );
}

function doneElementListener() {
  for (const item of document.querySelectorAll("#done")) {
    item.addEventListener("click", doneElement);
  }
}

function deleteElementListener() {
  for (const item of document.querySelectorAll("#delete")) {
    item.addEventListener("click", deleteElement);
  }
}

function editElementListener() {
  for (const item of document.querySelectorAll("#edit")) {
    item.addEventListener("click", showEditInput);
  }
}

window.addEventListener("click", function (e) {
  const select = document.querySelector(".custom-select");
  if (!select.contains(e.target)) {
    select.classList.remove("open");
  }
});

// Dropdown toggle
document
  .querySelector(".custom-select-wrapper")
  .addEventListener("click", function () {
    this.querySelector(".custom-select").classList.toggle("open");
  });

document.forms.create
  .querySelector("button")
  .addEventListener("click", function (e) {
    e.preventDefault();
    createElement();
  });

function rusToTranslit(str) {
  const ru = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "j",
    з: "z",
    и: "i",
    й: "j",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "c",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ы: "y",
    э: "e",
    ю: "u",
    я: "ya",
    _: "_",
    0: "0",
    1: "1",
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
    8: "8",
    9: "9",
  };
  let newStr = "";

  str = str
    .toLowerCase()
    .replace(/\s/g, "_")
    .replace(/[ъь]/g, "")
    .replace(/[^0-9a-zа-я_]/g, "");

  return [...str].reduce((accum, char) => (accum += ru[char]), "");
}

function createElement() {
  const createForm = document.forms.create;
  const name = createForm.title.value;
  let category = createForm.querySelector(".custom-select__trigger span")
    .dataset.value;

  if (!category) {
    alert("Выберите или создайте категорию");
    return false;
  }
  if (category === "add_category") {
    category = rusToTranslit(
      createForm.querySelector(".custom-select__trigger input").value
    );
    const newCategory = {
      name: category,
      value: createForm.querySelector(".custom-select__trigger input").value,
    };
    titles = [...titles, newCategory];
    setDataToLocaleStorage("titles", titles);
    createForm.querySelector(".custom-select__trigger #new_category").value =
      "Новая категория...";
  }

  data = [
    ...data,
    {
      title: name,
      list: category,
      isDone: false,
    },
  ];
  setDataToLocaleStorage("data", data);
  createForm.title.value = "Что нужно сделать";

  showCategories();
  showList(category);
}

function showEditInput() {
  this.closest(".list-item").querySelector(
    ".desc"
  ).innerHTML = `<form id="edit_item" method="POST" ><input type="text";
            value="${
              this.closest(".list-item").querySelector(".desc").innerHTML
            }"></form>`;
  let dataIndex = this.closest(".list-item").dataset.index;
  this.removeEventListener("click", showEditInput);
  document.querySelector("#edit_item").addEventListener("submit", function (e) {
    e.preventDefault();

    data[dataIndex]["title"] = this.querySelector("input").value;
    setDataToLocaleStorage("data", data);
    showList(data[dataIndex]["list"]);
  });
}

function deleteElement() {
  const dataIndex = this.closest(".list-item").dataset.index;
  const itemList = data[dataIndex]["list"];

  data = data.filter((item) => item !== data[dataIndex]);
  setDataToLocaleStorage("data", data);

  const isCategoryNotEmpty = data.find((item) => item.list === itemList);

  if (!isCategoryNotEmpty) {
    deleteCategory(itemList);
    showCategories();
    return checkListBeforeShow();
  }
  return showList(itemList);
}

function deleteCategory(catName) {
  titles = titles.filter((item) => item.name !== catName);
  setDataToLocaleStorage("titles", titles);
}

function doneElement() {
  let dataIndex = this.closest(".list-item").dataset.index;

  data[dataIndex]["isDone"] = !data[dataIndex]["isDone"];
  setDataToLocaleStorage("data", data);
  showList(data[dataIndex]["list"]);
}

showCategories();

checkListBeforeShow();
