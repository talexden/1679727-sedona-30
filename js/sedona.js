const searchButton = document.querySelector('.search-button');
const searchForm = document.querySelector('.search-form');
const dateOfCheckIn = searchForm.querySelector('[name=date-of-check-in]');
const dateOfCheckOut = searchForm.querySelector('[name=date-of-check-out]');
const adults = searchForm.querySelector('[name=adults]');
const children = searchForm.querySelector('[name=children]');

let memDateOfCheckIn;
let memDateOfCheckOut;
let memAdults;
let memChildren
let isStorageSupport = true;
let tryStorage;

try {
  tryStorage = localStorage.getItem('memDateOfCheckIn')
} catch (err) {
  isStorageSupport = false;
}

searchButton.addEventListener('click', function () {
  searchForm.classList.toggle('search-form-show');
  if (searchForm.classList.contains('search-form-error')) {
    searchForm.classList.remove('search-form-error');
  }
});

if (memDateOfCheckIn) {
  dateOfCheckIn.value = memDateOfCheckIn
}
if (memDateOfCheckOut) {
  dateOfCheckOut.value = memDateOfCheckOut
}
if (memAdults) {
  adults.value = memAdults
}
if (memChildren) {
  children.value = memChildren
}

searchForm.addEventListener('submit', function (evt) {
  if (searchForm.classList.contains('search-form-error')) {
    searchForm.classList.remove('search-form-error');
  }
  if (!dateOfCheckIn.value) {
    evt.preventDefault();
    dateOfCheckIn.focus();
    searchForm.classList.add('search-form-error');
  } else {
    if (isStorageSupport) {
      localStorage.setItem('memDateOfCheckIn', dateOfCheckIn.value);
    }
    if (!dateOfCheckOut.value) {
      evt.preventDefault();
      dateOfCheckOut.focus();
    } else {
      if (isStorageSupport) {
        localStorage.setItem('dateOfCheckOut', memDateOfCheckOut.value);
      }
      if (!adults.value) {
        evt.preventDefault();
        adults.focus();
      } else {
        if (isStorageSupport) {
          localStorage.setItem('memAdults', adults.value);
          localStorage.setItem('memChildren', children.value);
        }
      }
    }
  }
})

window.addEventListener('keydown', function (evt) {
  if (evt.keyCode === 27) {
    if (searchForm.classList.contains('search-form-show')) {
      searchForm.classList.remove('search-form-show');
    }
  }

  if (searchForm.classList.contains('search-form-error')) {
    searchForm.classList.remove('search-form-error');
  }
})
