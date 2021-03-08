const pageMatch = window.location.pathname.match(/^\/(.*)\.html$/);
const page = pageMatch ? pageMatch[1] : `index`;
const ppOffsets = JSON.parse(localStorage.getItem(`ppOffsets`)) || {};
if (!ppOffsets[page]) {
  ppOffsets[page] = 0;
  localStorage.setItem(`ppOffsets`, JSON.stringify(ppOffsets));
}

const ppEl = document.createElement(`div`);
ppEl.style.setProperty(`--pp-offset`, `${ppOffsets[page]}px`);
ppEl.style.setProperty(`--pp-img`, `url("../img/pixelperfect/${page}.jpg")`);
document.body.insertAdjacentElement(`beforeend`, ppEl);

const managePP = (pp) => {
	if (pp) {
		ppEl.classList.add(`pixelperfect`);
	} else {
		ppEl.classList.remove(`pixelperfect`);
	}
};
const movePP = (offset) => {
  ppOffsets[page] += offset;
  localStorage.setItem(`ppOffsets`, JSON.stringify(ppOffsets));
  ppEl.style.setProperty(`--pp-offset`, `${ppOffsets[page]}px`);
};

managePP(Number(localStorage.getItem(`pp`)));

document.addEventListener(`keydown`, (evt) => {
	if (document.activeElement !== document.body) {
		return;
	}
  evt.preventDefault();

	const isPP = Boolean(Number(localStorage.getItem(`pp`)));

	if (evt.code === `KeyP`) {
		const pp = Number(!isPP);
		localStorage.setItem(`pp`, pp);
		managePP(pp);
	} else if (isPP && evt.code === `ArrowUp`) {
		movePP(-1);
	} else if (isPP && evt.code === `ArrowDown`) {
		movePP(1);
	}
});
