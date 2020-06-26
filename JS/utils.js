
// Returns the class name for a specific cell
function getClassName(location) {
	const cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}


// A function that return a random integer
function getRandomInteger(min, max) {
    const randnNum = Math.random() * (max - min) + min;
    return Math.floor(randnNum);
}


// Shuffle an array of nums
function shuffle(arrayOfNums) {
    for (let i = 0; i < arrayOfNums.length; i++) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayOfNums[i], arrayOfNums[j]] = [arrayOfNums[j], arrayOfNums[i]];
    }
    return arrayOfNums;
}


// A function that render a cell and set the value
function renderCell(location, value) {    
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    elCell.innerHTML = value;
}

function revealCell(location) {
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    elCell.classList.add('revealed');
}


