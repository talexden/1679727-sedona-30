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
  searchForm.classList.toggle('search-form-show');
  searchForm.classList.toggle('search-form-hide');
});

