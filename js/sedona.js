const searchButton = document.querySelector('.search-button');
const searchForm = document.querySelector('.search-form');
const searchFields = searchForm.querySelectorAll('[name]');

let isStorageSupport = true;
let isShowSearch = true;

const toggleSearchVisibility = (isShowSearchNow) => {
  isShowSearch = isShowSearchNow;

  if (isShowSearch) {
    searchForm.classList.remove('search-form-hide');
    searchForm.classList.add('search-form-appear');
    setTimeout(() => searchForm.classList.remove('search-form-appear'), 600);
  } else {
    searchForm.classList.remove('search-form-error');
    searchForm.classList.add('search-form-disappear');
    setTimeout(() => {
      searchForm.classList.remove('search-form-disappear');
      searchForm.classList.add('search-form-hide');
    }, 600);
  }
}

try {
  localStorage.getItem('test');
} catch (err) {
  isStorageSupport = false;
}

if (isStorageSupport) {
  for (const field of searchFields) {
    const storedValue = localStorage.getItem(field.name);
    if (storedValue) {
      field.value = storedValue;
    }
  }
}

searchButton.addEventListener('click', function () {
  toggleSearchVisibility(!isShowSearch);
});

searchForm.addEventListener('submit', function (evt) {
  evt.preventDefault();
  searchForm.classList.remove('search-form-error');

  if (!searchForm.checkValidity()) {
    setTimeout(() => searchForm.classList.add('search-form-error'), 0);

    for (const field of searchFields) {
      if (!field.validity.valid) {
        field.focus();
        return; // выходим из цикла и функции
      }
    }
  }

  for (const field of searchFields) {
    localStorage.setItem(field.name, field.value);
  }

  searchForm.submit();
});

window.addEventListener('keydown', function (evt) {
  if (evt.keyCode === 27 && isShowSearch) {
    toggleSearchVisibility(false);
  }
});
