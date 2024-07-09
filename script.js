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
        cell.id = `${row}_${col}`;
        cell.dataset.index = `${row}_${col}`;
        cell.dataset.merged = 'false';
        cell.dataset.hiddenByMerge = 'false'; // New attribute to track hidden cells
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
    console.log('Selected cells:', selectedArray);
    
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

    console.log('Min row:', minRow, 'Max row:', maxRow, 'Min col:', minCol, 'Max col:', maxCol);

    const rowspan = maxRow - minRow + 1;
    const colspan = maxCol - minCol + 1;

    // Check if any cell within the selected range is already part of a merged cell
    for (let i = minRow; i <= maxRow; i++) {
      for (let j = minCol; j <= maxCol; j++) {
        const index = `${i + 1}_${j + 1}`;
        const cell = gridContainer.querySelector(`[data-index="${index}"]`);
        if (cell) {
          console.log('Checking cell:', index, 'Merged:', cell.dataset.merged, 'HiddenByMerge:', cell.dataset.hiddenByMerge);
          if (cell.dataset.merged === 'true' || cell.dataset.hiddenByMerge === 'true') {
            alert("Cannot merge cells because one or more cells are already part of an existing merged cell.");
            return;
          }
        }
      }
    }

    firstCell.style.gridRowStart = minRow + 1;
    firstCell.style.gridRowEnd = minRow + 1 + rowspan;
    firstCell.style.gridColumnStart = minCol + 1;
    firstCell.style.gridColumnEnd = minCol + 1 + colspan;
    firstCell.dataset.merged = 'true';

    for (let i = minRow; i <= maxRow; i++) {
      for (let j = minCol; j <= maxCol; j++) {
        const index = `${i + 1}_${j + 1}`;
        const cell = gridContainer.querySelector(`[data-index="${index}"]`);
        if (`${i + 1}_${j + 1}` !== firstIndex.join('_')) {
          cell.style.display = 'none';
          cell.dataset.hiddenByMerge = 'true';
        }
      }
    }

    selectedCells.clear();
    firstCell.classList.remove('selected');
  
  }else {
      subgridStateMap.forEach((subgridState, subgridContainer) => {
        if (subgridState.selectedSubgridCells.size >= 2) {
          const selectedArray = Array.from(subgridState.selectedSubgridCells);
          const firstIndex = Math.min(...selectedArray);
          const firstCell = subgridContainer.children[firstIndex];

          let minRow = Math.floor(firstIndex / subgridState.cols);
          let maxRow = minRow;
          let minCol = firstIndex % subgridState.cols;
          let maxCol = minCol;

          selectedArray.forEach(index => {
            const row = Math.floor(index / subgridState.cols);
            const col = index % subgridState.cols;
            if (row < minRow) minRow = row;
            if (row > maxRow) maxRow = row;
            if (col < minCol) minCol = col;
            if (col > maxCol) maxCol = col;
          });

          const rowspan = maxRow - minRow + 1;
          const colspan = maxCol - minCol + 1;

             // Check if any cell within the selected range is already part of a merged cell
          for (let i = minRow; i <= maxRow; i++) {
            for (let j = minCol; j <= maxCol; j++) {
              const index = i * subgridState.cols + j;
              const cell = subgridContainer.children[index];
              if (cell && (cell.dataset.merged === 'true' || cell.dataset.hiddenByMerge === 'true')) {
                alert("Cannot merge cells because one or more cells are already part of an existing merged cell.");
                return;
              }
            }
          }

          firstCell.style.gridRowStart = minRow + 1;
          firstCell.style.gridRowEnd = minRow + 1 + rowspan;
          firstCell.style.gridColumnStart = minCol + 1;
          firstCell.style.gridColumnEnd = minCol + 1 + colspan;
          firstCell.dataset.merged = 'true';

          for (let i = minRow; i <= maxRow; i++) {
            for (let j = minCol; j <= maxCol; j++) {
              const index = i * subgridState.cols + j;
              if (index !== firstIndex) {
                subgridContainer.children[index].style.display = 'none';
                subgridContainer.children[index].dataset.hiddenByMerge = 'true';
              }
            }
          }

          subgridState.selectedSubgridCells.clear();
          firstCell.classList.remove('selected');
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
        unmergedCell.dataset.hiddenByMerge = 'false'; // Mark as unhidden
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
        const index = i * cols + j;
        const unmergedCell = container.children[index];
        unmergedCell.style.display = '';
        unmergedCell.classList.remove('selected');
        unmergedCell.dataset.merged = 'false';
        container.children[index].dataset.hiddenByMerge = 'false'; // Mark as unhidden
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
      const index = startIndex + i;
      
  
      const mainGridCell = mainGrid.children[index];
     
  
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

        for (let i = 0; i < rows * cols; i++) {
          const subgridCell = document.createElement('div');
          subgridCell.style.border = '3px solid purple';
          subgridCell.dataset.index = i;
          subgridCell.dataset.merged = 'false';
          subgridCell.dataset.hiddenByMerge = 'false';
          subgridCell.addEventListener('click', () => {
            if (subgridCell.dataset.merged === 'true') {
              if (subgridState.cellToUnmerge) {
                subgridState.cellToUnmerge.classList.remove('selected-to-unmerge');
              }
              subgridState.cellToUnmerge = subgridCell;
              subgridState.cellToUnmerge.classList.add('selected-to-unmerge');
            } else {
              subgridCell.classList.toggle('selected');
              if (subgridState.selectedSubgridCells.has(i)) {
                subgridState.selectedSubgridCells.delete(i);
              } else {
                subgridState.selectedSubgridCells.add(i);
              }
            }
          });
          subgridContainer.appendChild(subgridCell);
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
      for (let col_i = 1; col_i <= numCols; col_i++) {
        const cell = document.getElementById(`${numRows}_${col_i}`);
        if (cell) {
          cell.remove();
        }
      }
      numRows--;
      updateGridSize();
    } else {
      alert("Cannot delete row because it affects a merged cell.");
    }
  } else {
    alert("Cannot delete more rows.");
  }
});

// Check if a row can be deleted
function canDeleteRow() {
  const cells = gridContainer.children;
  for (let cell of cells) {
    if (cell.dataset.merged === 'true') {
      const rowEnd = parseInt(cell.style.gridRowEnd) - 1;
      const [row, col] = cell.dataset.index.split('_').map(Number);
      if (rowEnd > numRows || row <= numRows && rowEnd >= numRows) {
        // The merged cell spans into the row to be deleted
        return false;
      }
    }
  }
  return true;
}


// Add Column button
addColButton.addEventListener('click', () => {
  numCols++;
  for(let row_i = 1; row_i <=numRows; row_i++ ) {
    LastRowCell = document.getElementById(row_i+"_"+(numCols-1)); 
    console.log(LastRowCell);

    const cell = document.createElement('div');
    cell.id = `${row_i}_${numCols}`;
    cell.dataset.index = `${row_i}_${numCols}`;
    cell.dataset.merged = 'false';
    cell.addEventListener('click', handleCellClick);

    LastRowCell.insertAdjacentElement("afterend", cell);
  }
  updateGridSize();
});

deleteColButton.addEventListener('click', () => {
  if (numCols > 1) {
    if (canDeleteCol()) {
      for (let row_i = 1; row_i <= numRows; row_i++) {
        const cell = document.getElementById(`${row_i}_${numCols}`);
        if (cell) {
          cell.remove();
        }
      }
      numCols--;
      updateGridSize();
    } else {
      alert("Cannot delete column because it affects a merged cell.");
    }
  } else {
    alert("Cannot delete more columns.");
  }
});

// Check if a column can be deleted
function canDeleteCol() {
  const cells = gridContainer.children;
  for (let cell of cells) {
    if (cell.dataset.merged === 'true') {
      const colEnd = parseInt(cell.style.gridColumnEnd) - 1;
      const [row, col] = cell.dataset.index.split('_').map(Number);
      if (colEnd > numCols || col <= numCols && colEnd >= numCols) { 
        // The merged cell spans into the column to be deleted
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