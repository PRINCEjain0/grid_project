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
  const subgridStateMap = new Map();
  let cellToUnmerge = null;

  // Function to create grid cells
  function createGridCells(rows, cols) {
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    const existingCells = gridContainer.children;
    const totalCells = rows * cols;

    for (let i = 0; i < totalCells; i++) {
      if (i >= existingCells.length) {
        const row = Math.floor(i / cols) + 1;
        const col = (i % cols) + 1
        const cell = document.createElement('div');
        cell.dataset.index = `${row}_${col}`;
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
    const index = cell.dataset.index;
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
          if (cell === firstCell) {
            firstCell = null; // Reset firstCell if the previously selected first cell is deselected
          }
        } else {
          selectedCells.add(index);
          if (firstCell === null || index < firstCell.dataset.index) { // Compare data indexes
            firstCell = cell;
          }
        }
    }
  }

  // Initial creation of grid
  createGridCells(numRows, numCols);

  // Merge cells
  mergeButton.addEventListener('click', () => {
    if (selectedCells.size >= 2) {
      const selectedArray = Array.from(selectedCells);
      const firstIndex = selectedArray[0].split('_').map(Number);
        const firstCell = gridContainer.querySelector(`[data-index="${firstIndex[0]}_${firstIndex[1]}"]`);


        let minRow = firstIndex[0] - 1;
        let maxRow = minRow;
        let minCol = firstIndex[1] - 1;
        let maxCol = minCol;

        selectedArray.forEach(index => {
          const [row, col] = index.split('_').map(Number);
          if (row < minRow + 1) minRow = row - 1;
          if (row > maxRow + 1) maxRow = row - 1;
          if (col < minCol + 1) minCol = col - 1;
          if (col > maxCol + 1) maxCol = col - 1;
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
          const index = `${i + 1}_${j + 1}`;
            const cell = gridContainer.querySelector(`[data-index="${index}"]`);
           
            if (`${i + 1}_${j + 1}` !== firstIndex.join('_')) { // Efficient comparison
              cell.style.display = 'none';
            }
        }
      }

      selectedCells.clear();
      firstCell.classList.remove('selected');
    } else {
      subgridStateMap.forEach((subgridState, subgridContainer) => {
        if (subgridState.selectedSubgridCells.size >= 2) {
          const selectedArray = Array.from(subgridState.selectedSubgridCells);
          if (typeof selectedArray[0] === 'string') {
            const firstIndex = selectedArray[0].split('_').map(Number);
            const firstCell = subgridContainer.querySelector(`[data-index="${firstIndex[0]}_${firstIndex[1]}"]`);

            let minRow = firstIndex[0] - 1;
            let maxRow = minRow;
            let minCol = firstIndex[1] - 1;
            let maxCol = minCol;

            selectedArray.forEach(index => {
              const [row, col] = index.split('_').map(Number);
              if (row < minRow + 1) minRow = row - 1;
              if (row > maxRow + 1) maxRow = row - 1;
              if (col < minCol + 1) minCol = col - 1;
              if (col > maxCol + 1) maxCol = col - 1;
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
              const index = `${i + 1}_${j + 1}`;
              const cell = subgridContainer.querySelector(`[data-index="${index}"]`);
              if (cell !== firstCell) {
                cell.style.display = 'none';
              }
            }
          }

          subgridState.selectedSubgridCells.clear();
          firstCell.classList.remove('selected');
        }
        }
      });
    }
  });

  // Unmerge cell
  unmergeButton.addEventListener('click', () => {
    if (cellToUnmerge) {
      if (subgridStateMap.has(cellToUnmerge.firstChild)) {
        const subgridState = subgridStateMap.get(cellToUnmerge.firstChild);
        if (subgridState.cellToUnmerge) {
          unmergeSubgridCell(subgridState.cellToUnmerge, cellToUnmerge.firstChild, subgridState.cols);
          subgridState.cellToUnmerge.classList.remove('selected-to-unmerge');
          subgridState.cellToUnmerge = null;
        } else {
          // Check if any cells are still merged
          let allUnmerged = true;
          for (let i = 0; i < cellToUnmerge.firstChild.children.length; i++) {
            if (cellToUnmerge.firstChild.children[i].dataset.merged === 'true') {
              allUnmerged = false;
              break;
            }
          }
          if (allUnmerged) {
            // If no merged cells are left, unmerge the whole subgrid
            unmergeAllSubgridCells(cellToUnmerge.firstChild, subgridState.cols);
          }
        }
      } else {
        unmergeMainGridCell(cellToUnmerge, gridContainer);
        cellToUnmerge.classList.remove('selected-to-unmerge');
        cellToUnmerge = null;
      }
    }
  });

  function unmergeMainGridCell(cell, container) {
    const rowStart = parseInt(cell.style.gridRowStart) - 1;
    const rowEnd = parseInt(cell.style.gridRowEnd) - 1;
    const colStart = parseInt(cell.style.gridColumnStart) - 1;
    const colEnd = parseInt(cell.style.gridColumnEnd) - 1;

    for (let i = rowStart; i < rowEnd; i++) {
      for (let j = colStart; j < colEnd; j++) {
        const index = `${i + 1}_${j + 1}`;
        const unmergedCell = container.querySelector(`[data-index="${index}"]`);
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

    for (let i = rowStart; i < rowEnd; i++) {
      for (let j = colStart; j < colEnd; j++) {
        const index = `${i + 1}_${j + 1}`;
        const unmergedCell = subgridContainer.querySelector(`[data-index="${index}"]`);
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

  function unmergeAllSubgridCells(container, cols) {
    const mainGrid = container.parentElement;
  
    if (!mainGrid || !container.parentElement) {
      console.error('Main grid or container parent element does not exist.');
      return;
    }
  
    const cells = container.children;
    const startIndex = parseInt(mainGrid.dataset.index);
  
    for (let i = 0; i < cells.length; i++) {
      const subgridCell = cells[i];
      const [row, col] = subgridCell.dataset.index.split('_').map(Number); // Parse row and col from "row_col"
  
      if (isNaN(row) || isNaN(col)) {
        console.error(`Invalid dataset index format for subgrid cell: ${subgridCell.dataset.index}`);
        continue;
      }
  
      const index = (row - 1) * cols + (col - 1);
      const mainGridCell = mainGrid.children[startIndex + index];
  
      if (!mainGridCell) {
        console.error(`Main grid cell at index ${startIndex + index} not found.`);
        continue;
      }
  
      // Perform operations on mainGridCell and subgridCell
      // ...
  
      // Remove subgridCell from DOM
      if (subgridCell.parentElement === container) {
        container.removeChild(subgridCell);
      } else {
        console.warn('subgridCell parent mismatch or already removed.');
      }
    }
  
    // Remove container from mainGrid
    if (container.parentElement === mainGrid) {
      mainGrid.removeChild(container);
    } else {
      console.warn('container parent mismatch or already removed.');
    }
  
    // Optionally, clear references or perform additional cleanup
    subgridStateMap.delete(container);
  }
  
  
  
  // Insert subgrid
  insertSubgridButton.addEventListener('click', () => {
    if (cellToUnmerge && cellToUnmerge.dataset.merged === 'true') {
      cellToUnmerge.style.backgroundColor = 'red';
      subgridForm.style.display = 'block';
      
      subgridForm.addEventListener('submit', (event) => {
        event.preventDefault();
  
        const rows = parseInt(document.getElementById('subgrid-rows').value);
        const cols = parseInt(document.getElementById('subgrid-cols').value);
  
        if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
          alert("Invalid input for rows or columns.");
          return;
        }
  
        const subgridContainer = document.createElement('div');
        subgridContainer.style.display = 'grid';
        subgridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        subgridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        subgridContainer.style.gap = '1px';
        subgridContainer.style.width = '100%';
        subgridContainer.style.height = '100%';
  
        const subgridState = {
          selectedSubgridCells: new Set(),
          cellToUnmerge: null,
          cols: cols
        };
  
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            const subgridCell = document.createElement('div');
            subgridCell.style.border = '3px solid purple';
            subgridCell.dataset.index = `${i + 1}_${j + 1}`; // Use "row_col" format
            subgridCell.dataset.merged = 'false';
            subgridCell.addEventListener('click', () => {
              if (subgridCell.dataset.merged === 'true') {
                if (subgridState.cellToUnmerge) {
                  subgridState.cellToUnmerge.classList.remove('selected-to-unmerge');
                }
                subgridState.cellToUnmerge = subgridCell;
                subgridState.cellToUnmerge.classList.add('selected-to-unmerge');
              } else {
                subgridCell.classList.toggle('selected');
                const index = `${i + 1}_${j + 1}`;
                if (subgridState.selectedSubgridCells.has(index)) {
                  subgridState.selectedSubgridCells.delete(index);
                } else {
                  subgridState.selectedSubgridCells.add(index);
                }
              }
            });
            subgridContainer.appendChild(subgridCell);
          }
        }
  
        subgridStateMap.set(subgridContainer, subgridState);
  
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
      const [row, col] = cell.dataset.index.split('_').map(Number); // Extract row and col from dataset
      if (rowEnd >= numRows && row > numRows) { // Check against row index
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
      const [row, col] = cell.dataset.index.split('_').map(Number); // Extract row and col from dataset
      if (colEnd >= numCols && col > numCols) { // Check against col index
        return false;
      }
    }
  }
  return true;
}

// Update grid size and recreate cells
function updateGridSize() {
  numRowsInput.value = numRows;
  numColsInput.value = numCols;
  gridContainer.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;
  createGridCells(numRows, numCols);
}
});