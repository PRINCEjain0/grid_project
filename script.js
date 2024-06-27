document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const mergeButton = document.getElementById('merge-btn');
    const unmergeButton = document.getElementById('unmerge-btn');
    const numRows = 4;
    const numCols = 4;
    const selectedCells = new Set();
  
    // Create grid cells
    for (let i = 0; i < numRows * numCols; i++) {
      const cell = document.createElement('div');
      cell.dataset.index = i;
      cell.addEventListener('click', () => {
        cell.classList.toggle('selected');
        if (selectedCells.has(i)) {
          selectedCells.delete(i);
        } else {
          selectedCells.add(i);
        }
      });
      gridContainer.appendChild(cell);
    }
  
    // Merge cells
    mergeButton.addEventListener('click', () => {
      if (selectedCells.size < 2) return;
  
      const selectedArray = Array.from(selectedCells);
      const firstIndex = selectedArray[0];
      const firstCell = gridContainer.children[firstIndex];
  
      let minRow = Math.floor(firstIndex / numCols);
      let maxRow = minRow;
      let minCol = firstIndex % numCols;
      let maxCol = minCol;
  
      selectedArray.forEach(index => {
        const row = Math.floor(index / numCols);
        const col = index % numCols;
        if (row < minRow) minRow = row;
        if (row > maxRow) maxRow = row;
        if (col < minCol) minCol = col;
        if (col > maxCol) maxCol = col;
      });
  
      const rowspan = maxRow - minRow + 1;
      const colspan = maxCol - minCol + 1;
  
      firstCell.style.gridRowStart = minRow + 1;
      firstCell.style.gridRowEnd = minRow + 1 + rowspan;
      firstCell.style.gridColumnStart = minCol + 1;
      firstCell.style.gridColumnEnd = minCol + 1 + colspan;
  
      selectedArray.slice(1).forEach(index => {
        gridContainer.children[index].style.display = 'none';
      });
  
      selectedCells.clear();
      firstCell.classList.remove('selected');
    });
  
    // Unmerge cells
    unmergeButton.addEventListener('click', () => {
      Array.from(gridContainer.children).forEach(cell => {
        cell.style.display = '';
        cell.style.gridRowStart = '';
        cell.style.gridRowEnd = '';
        cell.style.gridColumnStart = '';
        cell.style.gridColumnEnd = '';
        cell.classList.remove('selected');
      });
      selectedCells.clear();
    });
  });
  