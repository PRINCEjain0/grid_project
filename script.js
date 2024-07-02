document.addEventListener('DOMContentLoaded', () => {
  const gridContainer = document.getElementById('grid-container');
  const mergeButton = document.getElementById('merge-btn');
  const unmergeButton = document.getElementById('unmerge-btn');
  const insertSubgridButton = document.getElementById('insert-subgrid-btn');
  const numRows = 4;
  const numCols = 4;
  const selectedCells = new Set();
  let cellToUnmerge = null;

  // Create grid cells
  for (let i = 0; i < numRows * numCols; i++) {
    const cell = document.createElement('div');
    cell.dataset.index = i;
    cell.dataset.merged = 'false';
    gridContainer.appendChild(cell);
    cell.addEventListener('click', () => {
      if (cell.dataset.merged === 'true') {
        if (cellToUnmerge) {
          cellToUnmerge.classList.remove('selected-to-unmerge');
        }
        cellToUnmerge = cell;
        cellToUnmerge.classList.add('selected-to-unmerge');
      } else {
        cell.classList.toggle('selected');
        if (selectedCells.has(i)) {
          selectedCells.delete(i);
        } else {
          selectedCells.add(i);
        }
      }
    });
  }

  // Merge cells
  mergeButton.addEventListener('click', () => {
    if (selectedCells.size < 2) return;

    const selectedArray = Array.from(selectedCells);
    const firstIndex = Math.min(...selectedArray);
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
    firstCell.dataset.merged = 'true';

    for (let i = minRow; i <= maxRow; i++) {
      for (let j = minCol; j <= maxCol; j++) {
        const index = i * numCols + j;
        if (index !== firstIndex) {
          gridContainer.children[index].style.display = 'none';
        }
      }
    }

    selectedCells.clear();
    firstCell.classList.remove('selected');
  });

  // Unmerge cell
  unmergeButton.addEventListener('click', () => {
    if (cellToUnmerge) {
      unmergeCell(cellToUnmerge);
      cellToUnmerge.classList.remove('selected-to-unmerge');
      cellToUnmerge = null;
    }
  });

  function unmergeCell(cell) {
    const rowStart = parseInt(cell.style.gridRowStart) - 1;
    const rowEnd = parseInt(cell.style.gridRowEnd) - 1;
    const colStart = parseInt(cell.style.gridColumnStart) - 1;
    const colEnd = parseInt(cell.style.gridColumnEnd) - 1;

    // Remove any subgrid present
    while (cell.firstChild) {
      cell.removeChild(cell.firstChild);
    }

    for (let i = rowStart; i < rowEnd; i++) {
      for (let j = colStart; j < colEnd; j++) {
        const index = i * numCols + j;
        const unmergedCell = gridContainer.children[index];
        unmergedCell.style.display = '';
        unmergedCell.classList.remove('selected');
        unmergedCell.dataset.merged = 'false';
      }
    }

    cell.style.gridRowStart = '';
    cell.style.gridRowEnd = '';
    cell.style.gridColumnStart = '';
    cell.style.gridColumnEnd = '';
    cell.dataset.merged = 'false';
  }

  // Insert subgrid
  insertSubgridButton.addEventListener('click', () => {
    if (cellToUnmerge && cellToUnmerge.dataset.merged === 'true') {
      const rows = parseInt(prompt("Enter number of rows for the subgrid:", "2"));
      const cols = parseInt(prompt("Enter number of columns for the subgrid:", "2"));
      if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
        alert("Invalid input for rows or columns.");
        return;
      }

      // Create subgrid container
      const subgridContainer = document.createElement('div');
      subgridContainer.style.display = 'grid';
      subgridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      subgridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
      subgridContainer.style.gap = '1px';
      subgridContainer.style.width = '100%';
      subgridContainer.style.height = '100%';

      // Create subgrid cells
      for (let i = 0; i < rows * cols; i++) {
        const subgridCell = document.createElement('div');
        subgridCell.style.border = '1px solid #000';
        subgridCell.addEventListener('click', () => {
          subgridCell.classList.toggle('selected');
        });
        subgridContainer.appendChild(subgridCell);
      }

      // Clear cell content and insert subgrid
      cellToUnmerge.innerHTML = '';
      cellToUnmerge.appendChild(subgridContainer);
      cellToUnmerge.classList.remove('selected-to-unmerge');
      cellToUnmerge = null;
    } else {
      alert("Please select a merged cell to insert a subgrid.");
    }
  });
});
