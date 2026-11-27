(() => {
  const calculator = document.querySelector('[data-serving-calculator]');
  if (!calculator) return;
  const form = calculator.querySelector('form');
  const { basis, calories, quantity, portion } = form.elements;
  const result = calculator.querySelector('[data-total]');
  const explanation = calculator.querySelector('[data-calculation]');
  const unitField = calculator.querySelector('[data-unit-field]');
  const basisLabel = calculator.querySelector('[data-basis-label]');
  const quantityLabel = calculator.querySelector('[data-quantity-label]');
  const portionLabel = calculator.querySelector('[data-portion-label]');
  const number = new Intl.NumberFormat('en', { maximumFractionDigits: 6 });
  const kcalFormat = new Intl.NumberFormat('en', { maximumFractionDigits: 2 });
  const modes = {
    servings: { label: 'Calories per serving (kcal)', portion: 'Number of servings', initial: '2.5' },
    container: { label: 'Calories per whole container (kcal)', portion: 'Number of containers (0.5 for half)', initial: '0.5' },
    grams: { label: 'Calories for the label weight (kcal)', unit: 'g', initial: '70' },
    volume: { label: 'Calories for the label volume (kcal)', unit: 'ml', initial: '300' }
  };

  function update() {
    const kcal = calories.valueAsNumber;
    const amount = portion.valueAsNumber;
    const unit = modes[basis.value].unit;
    const base = unit ? quantity.valueAsNumber : 1;
    if (!form.checkValidity() || base <= 0 || !Number.isFinite(amount * kcal / base)) {
      result.textContent = '—';
      explanation.textContent = 'Enter a number in each field. The quantity printed on the label must be greater than zero.';
      return;
    }
    const total = amount * kcal / base;
    result.textContent = (total > 0 && total < 0.01 ? '< 0.01' : kcalFormat.format(total)) + ' kcal';
    const countUnit = basis.value === 'container' ? 'container' : 'serving';
    explanation.textContent = unit
      ? number.format(kcal) + ' kcal × (' + number.format(amount) + ' ' + unit + ' ÷ ' + number.format(base) + ' ' + unit + ')'
      : number.format(kcal) + ' kcal × ' + number.format(amount) + ' ' + countUnit + (amount === 1 ? '' : 's');
  }
  function selectBasis() {
    const mode = modes[basis.value];
    basisLabel.textContent = mode.label;
    unitField.hidden = !mode.unit;
    quantity.disabled = !mode.unit;
    if (mode.unit) {
      const isWeight = mode.unit === 'g';
      quantityLabel.textContent = 'Quantity on the label (' + mode.unit + ')';
      portionLabel.textContent = 'Your portion (' + mode.unit + ')';
      quantity.value = isWeight ? '40' : '250';
    } else {
      portionLabel.textContent = mode.portion;
    }
    portion.value = mode.initial;
    update();
  }
  basis.addEventListener('change', selectBasis);
  for (const input of [calories, quantity, portion]) input.addEventListener('input', update);
  form.addEventListener('submit', event => { event.preventDefault(); update(); });
  form.hidden = false;
  selectBasis();
})();
