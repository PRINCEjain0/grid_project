document.addEventListener('DOMContentLoaded', () => {
  const gridContainer = document.getElementById('grid-container');
  const mergeButton = document.getElementById('merge-btn');
  const unmergeButton = document.getElementById('unmerge-btn');
  const insertSubgridButton = document.getElementById('insert-subgrid-btn');
  const subgridForm = document.getElementById('subgrid-form');
  const addRowButton = document.getElementById('add-row-btn');
  const deleteRowButton = document.getElementById('delete-row-btn');
  const addColButton = document.getElementById('add-col-btn');
  const deleteColButton = document.getElementById('delete-col-btn');
  const numRowsInput = document.getElementById('num-rows');
  const numColsInput = document.getElementById('num-cols');
  let numRows = parseInt(numRowsInput.value);
  let numCols = parseInt(numColsInput.value);
  const selectedCells = new Set();
  const selectedSubgridCells = new Set();
  let subgridContainer = null;
  let cols = null;
  let cellToUnmerge = null;
  let subgridCellToUnmerge = null;

  // Function to create grid cells
  function createGridCells(rows, cols) {
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    const existingCells = gridContainer.children;
    const totalCells = rows * cols;

    for (let i = 0; i < totalCells; i++) {
      if (i >= existingCells.length) {
        const cell = document.createElement('div');
        cell.dataset.index = i;
        cell.dataset.merged = 'false';
        cell.addEventListener('click', handleCellClick);
        gridContainer.appendChild(cell);
      }
    }

    // Remove extra cells if rows or cols are reduced
    while (gridContainer.children.length > totalCells) {
      gridContainer.removeChild(gridContainer.lastChild);
    }
  }

  // Handle cell click event
  function handleCellClick() {
    const cell = this;
    const index = parseInt(cell.dataset.index);
    if (cell.dataset.merged === 'true') {
      if (cellToUnmerge) {
        cellToUnmerge.classList.remove('selected-to-unmerge');
      }
      cellToUnmerge = cell;
      cellToUnmerge.classList.add('selected-to-unmerge');
    } else {
      cell.classList.toggle('selected');
      if (selectedCells.has(index)) {
        selectedCells.delete(index);
      } else {
        selectedCells.add(index);
      }
    }
  }

  // Initial creation of grid
  createGridCells(numRows, numCols);

  // Merge cells
  mergeButton.addEventListener('click', () => {
    if (selectedCells.size >= 2) {
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
    } else if (selectedSubgridCells.size >= 2) {
      const selectedArray = Array.from(selectedSubgridCells);
      const firstIndex = Math.min(...selectedArray);
      const firstCell = subgridContainer.children[firstIndex];

      let minRow = Math.floor(firstIndex / cols);
      let maxRow = minRow;
      let minCol = firstIndex % cols;
      let maxCol = minCol;

      selectedArray.forEach(index => {
        const row = Math.floor(index / cols);
        const col = index % cols;
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
          const index = i * cols + j;
          if (index !== firstIndex) {
            subgridContainer.children[index].style.display = 'none';
          }
        }
      }

      selectedSubgridCells.clear();
      firstCell.classList.remove('selected');
    } else {
      alert("Please select more than one cell to merge.");
    }
  });

  // Unmerge cell
  unmergeButton.addEventListener('click', () => {
    if (subgridCellToUnmerge) {
      unmergeSubgridCell(subgridCellToUnmerge, subgridContainer, cols);
      subgridCellToUnmerge.classList.remove('selected-to-unmerge');
      subgridCellToUnmerge = null;
    } else if (cellToUnmerge) {
      unmergeMainGridCell(cellToUnmerge, gridContainer);
      cellToUnmerge.classList.remove('selected-to-unmerge');
      cellToUnmerge = null;
    }
  });

  function unmergeMainGridCell(cell, container) {
    const rowStart = parseInt(cell.style.gridRowStart) - 1;
    const rowEnd = parseInt(cell.style.gridRowEnd) - 1;
    const colStart = parseInt(cell.style.gridColumnStart) - 1;
    const colEnd = parseInt(cell.style.gridColumnEnd) - 1;

    while (cell.firstChild) {
      cell.removeChild(cell.firstChild);
    }

    for (let i = rowStart; i < rowEnd; i++) {
      for (let j = colStart; j < colEnd; j++) {
        const index = i * numCols + j;
        const unmergedCell = container.children[index];
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

  function unmergeSubgridCell(cell, container, cols) {
    const rowStart = parseInt(cell.style.gridRowStart) - 1;
    const rowEnd = parseInt(cell.style.gridRowEnd) - 1;
    const colStart = parseInt(cell.style.gridColumnStart) - 1;
    const colEnd = parseInt(cell.style.gridColumnEnd) - 1;

    while (cell.firstChild) {
      cell.removeChild(cell.firstChild);
    }

    for (let i = rowStart; i < rowEnd; i++) {
      for (let j = colStart; j < colEnd; j++) {
        const index = i * cols + j;
        const unmergedCell = container.children[index];
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
      cellToUnmerge.style.backgroundColor = 'red';
      subgridForm.style.display = 'block';
      subgridForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const rows = parseInt(document.getElementById('subgrid-rows').value);
        cols = parseInt(document.getElementById('subgrid-cols').value);

        if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
          alert("Invalid input for rows or columns.");
          return;
        }

        subgridContainer = document.createElement('div');
        subgridContainer.style.display = 'grid';
        subgridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        subgridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        subgridContainer.style.gap = '1px';
        subgridContainer.style.width = '100%';
        subgridContainer.style.height = '100%';

        for (let i = 0; i < rows * cols; i++) {
          const subgridCell = document.createElement('div');
          subgridCell.style.border = '3px solid purple';
          subgridCell.dataset.index = i;
          subgridCell.dataset.merged = 'false';
          subgridCell.addEventListener('click', () => {
            if (subgridCell.dataset.merged === 'true') {
              if (subgridCellToUnmerge) {
                subgridCellToUnmerge.classList.remove('selected-to-unmerge');
              }
              subgridCellToUnmerge = subgridCell;
              subgridCellToUnmerge.classList.add('selected-to-unmerge');
            } else {
              subgridCell.classList.toggle('selected');
              if (selectedSubgridCells.has(i)) {
                selectedSubgridCells.delete(i);
              } else {
                selectedSubgridCells.add(i);
              }
            }
          });
          subgridContainer.appendChild(subgridCell);
        }

        cellToUnmerge.innerHTML = '';
        cellToUnmerge.appendChild(subgridContainer);
        cellToUnmerge.style.backgroundColor = '';
        cellToUnmerge.classList.remove('selected-to-unmerge');
        cellToUnmerge = null;

        subgridForm.style.display = 'none';
      }, { once: true });
    } else {
      alert("Please select a merged cell to insert a subgrid.");
    }
  });

  // Add Row button
  addRowButton.addEventListener('click', () => {
    numRows++;
    updateGridSize();
  });

  // Delete Row button
  deleteRowButton.addEventListener('click', () => {
    if (numRows > 1) {
      if (canDeleteRow()) {
        numRows--;
        updateGridSize();
      } else {
        alert("Cannot delete row because it affects a merged cell.");
      }
    } else {
      alert("Cannot delete more rows.");
    }
  });

  // Add Column button
  addColButton.addEventListener('click', () => {
    numCols++;
    updateGridSize();
  });

  // Delete Column button
  deleteColButton.addEventListener('click', () => {
    if (numCols > 1) {
      if (canDeleteCol()) {
        numCols--;
        updateGridSize();
      } else {
        alert("Cannot delete column because it affects a merged cell.");
      }
    } else {
      alert("Cannot delete more columns.");
    }
  });

  // Check if a row can be deleted
  function canDeleteRow() {
    const cells = gridContainer.children;
    for (let cell of cells) {
      if (cell.dataset.merged === 'true') {
        const rowEnd = parseInt(cell.style.gridRowEnd) - 1;
        if (rowEnd >= numRows) {
          return false;
        }
      }
    }
    return true;
  }

  // Check if a column can be deleted
  function canDeleteCol() {
    const cells = gridContainer.children;
    for (let cell of cells) {
      if (cell.dataset.merged === 'true') {
        const colEnd = parseInt(cell.style.gridColumnEnd) - 1;
        if (colEnd >= numCols) {
          return false;
        }
      }
    }
    return true;
  }

  function updateGridSize() {
    numRowsInput.value = numRows;
    numColsInput.value = numCols;
    createGridCells(numRows, numCols);
  }
});
