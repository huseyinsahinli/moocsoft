(() => {
  const counter = document.getElementById('rectangle-counter');
  if (!counter) return;
  const rowsInput = counter.querySelector('#rectangle-rows');
  const columnsInput = counter.querySelector('#rectangle-columns');
  const output = counter.querySelector('[data-grid-output]');
  const error = counter.querySelector('#rectangle-error');
  const integer = new Intl.NumberFormat('en-US');
  const number = value => integer.format(value);
  const counted = (value, singular, plural = singular + 's') => number(value) + ' ' + (value === 1 ? singular : plural);

  function drawGrid(rows, columns) {
    const svg = counter.querySelector('svg');
    const shape = svg.querySelector('[data-example-shape]');
    const width = Math.min(2, columns);
    const height = columns === 1 ? Math.min(2, rows) : 1;
    svg.setAttribute('viewBox', `-0.1 -0.1 ${columns + 0.2} ${rows + 0.2}`);
    const lines = [];
    for (let x = 0; x <= columns; x++) lines.push(`M${x} 0V${rows}`);
    for (let y = 0; y <= rows; y++) lines.push(`M0 ${y}H${columns}`);
    svg.querySelector('[data-grid-lines]').setAttribute('d', lines.join(' '));
    shape.setAttribute('width', width);
    shape.setAttribute('height', height);
    const positions = (columns - width + 1) * (rows - height + 1);
    counter.querySelector('[data-example-caption]').textContent =
      `The highlighted rectangle spans ${counted(height, 'row')} and ${counted(width, 'column')}. It fits in ${counted(positions, 'position')} in this grid.`;
  }

  function update() {
    const valid = rowsInput.validity.valid && columnsInput.validity.valid;
    rowsInput.setAttribute('aria-invalid', String(!rowsInput.validity.valid));
    columnsInput.setAttribute('aria-invalid', String(!columnsInput.validity.valid));
    error.textContent = valid ? '' : 'Enter a whole number from 1 to 30 in each field.';
    output.hidden = !valid;
    if (!valid) return;

    const rows = rowsInput.valueAsNumber;
    const columns = columnsInput.valueAsNumber;
    const horizontal = rows * (rows + 1) / 2;
    const vertical = columns * (columns + 1) / 2;
    const total = horizontal * vertical;
    const countsBySide = [];
    for (let side = 1; side <= Math.min(rows, columns); side++) {
      countsBySide.push((rows - side + 1) * (columns - side + 1));
    }
    const squares = countsBySide.reduce((sum, count) => sum + count, 0);
    counter.querySelector('[data-count="total"]').textContent = number(total);
    counter.querySelector('[data-count="squares"]').textContent = number(squares);
    counter.querySelector('[data-count="other"]').textContent = number(total - squares);
    counter.querySelector('[data-step="rows"]').textContent =
      `Choose 2 of the ${rows + 1} horizontal lines for the top and bottom. That gives ${rows + 1} × ${rows} ÷ 2 = ${counted(horizontal, 'pair')}.`;
    counter.querySelector('[data-step="columns"]').textContent =
      `Choose 2 of the ${columns + 1} vertical lines for the left and right sides. That gives ${columns + 1} × ${columns} ÷ 2 = ${counted(vertical, 'pair')}.`;
    counter.querySelector('[data-step="total"]').textContent =
      `Multiply the two counts. ${number(horizontal)} × ${number(vertical)} = ${counted(total, 'rectangle')}, including squares.`;
    counter.querySelector('[data-square-detail]').textContent =
      `For a square of side k, multiply (rows − k + 1) by (columns − k + 1). Add the counts for each side length from 1 through ${countsBySide.length}: ${countsBySide.map(number).join(' + ')} = ${counted(squares, 'square')}. Subtract these from ${number(total)} to leave ${counted(total - squares, 'non-square rectangle')}.`;
    drawGrid(rows, columns);
  }

  counter.querySelector('[data-grid-inputs]').hidden = false;
  rowsInput.addEventListener('input', update);
  columnsInput.addEventListener('input', update);
  update();
})();
