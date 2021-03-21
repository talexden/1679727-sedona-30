const searchButton = document.querySelector('.search-button');
const searchForm = document.querySelector('.search-form');
const searchFields = searchForm.querySelectorAll('[name]');

let isStorageSupport = true;

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
  searchForm.classList.toggle('search-form-hide');

  if (!searchForm.classList.contains('search-form-hide')) {
    searchForm.classList.add('search-form-appear');
    setTimeout(() => searchForm.classList.remove('search-form-appear'), 600);
  }
});

searchForm.addEventListener('submit', function (evt) {
  evt.preventDefault();
  searchForm.classList.remove('search-form-error');

  if (!searchForm.checkValidity()) {
    setTimeout(() => searchForm.classList.add('search-form-error'), 0);

    for (const field of searchFields) {
      console.log(field.validity.valid);
      if (!field.validity.valid) {
        field.focus();
        break; // выходим из цикла
      }
    }

    return; // выходим из функции
  }

  for (const field of searchFields) {
    localStorage.setItem(field.name, field.value);
  }

  searchForm.submit();
});

window.addEventListener('keydown', function (evt) {
  if (evt.keyCode === 27) {
    searchForm.classList.remove('search-form-show');
  }
});

