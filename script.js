(function () {
  const currentEl = document.getElementById('current');
  const historyEl = document.getElementById('history');

  let current = '0';
  let prev = null;
  let op = null;
  let justEvaluated = false;

  const MAX_LEN = 18;

  function updateDisplay() {
    currentEl.textContent = current;
    const opMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    const hist = [prev !== null ? trimNum(prev) : '', op ? opMap[op] : ''].join(' ').trim();
    historyEl.textContent = hist;
  }

  function trimNum(n) {
    if (typeof n === 'number' && (!isFinite(n) || isNaN(n))) return 'Error';
    const s = (typeof n === 'number') ? n.toString() : n;
    if (s.length > 14 && !s.includes('e')) return Number(s).toExponential(8);
    return s;
  }

  function inputDigit(d) {
    if (justEvaluated) { current = '0'; justEvaluated = false; }
    current = current === '0' ? d : current + d;
    if (current.replace('-', '').length > MAX_LEN) current = current.slice(0, -1);
    updateDisplay();
  }

  function inputDot() {
    if (justEvaluated) { current = '0'; justEvaluated = false; }
    if (!current.includes('.')) current += current === '' ? '0.' : '.';
    updateDisplay();
  }

  function toggleSign() {
    if (current !== '0') current = current.startsWith('-') ? current.slice(1) : '-' + current;
    updateDisplay();
  }

  function percent() {
    const num = Number(current);
    if (!isNaN(num)) { current = trimNum(num / 100); updateDisplay(); }
  }

  function clearAll() { current = '0'; prev = null; op = null; justEvaluated = false; updateDisplay(); }

  function del() {
    if (justEvaluated) return clearAll();
    current = current.length <= 1 || (current.length === 2 && current.startsWith('-')) ? '0' : current.slice(0, -1);
    updateDisplay();
  }

  function operate(a, operator, b) {
    a = Number(a); b = Number(b);
    if (!isFinite(a) || !isFinite(b)) return NaN;
    switch (operator) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? NaN : a / b;
      default: return b;
    }
  }

  function setOperator(nextOp) {
    if (op && !justEvaluated) {
      const res = operate(prev ?? 0, op, current);
      if (!isFinite(res)) return showError();
      prev = res; current = '0';
    } else {
      prev = Number(current); current = '0';
    }
    op = nextOp; justEvaluated = false; updateDisplay();
  }

  function equals() {
    if (op === null || prev === null) return;
    const res = operate(prev, op, current);
    if (!isFinite(res)) return showError();
    current = trimNum(res);
    historyEl.textContent = `${trimNum(prev)} ${op} ${current}`;
    prev = null; op = null; justEvaluated = true; updateDisplay();
  }

  function showError() { current = 'Error'; prev = null; op = null; justEvaluated = true; updateDisplay(); }

  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const num = btn.getAttribute('data-num');
      const action = btn.getAttribute('data-action');
      const operator = btn.getAttribute('data-op');
      if (num !== null) return inputDigit(btn.textContent.trim());
      if (action) {
        if (action === 'clear') return clearAll();
        if (action === 'delete') return del();
        if (action === 'percent') return percent();
        if (action === 'toggle') return toggleSign();
        if (action === 'dot') return inputDot();
        if (action === 'equals') return equals();
      }
      if (operator) setOperator(operator);
    });
  });

  window.addEventListener('keydown', (e) => {
    const k = e.key;
    if (/[0-9]/.test(k)) return inputDigit(k);
    if (k === '.') return inputDot();
    if (['+', '-', '*', '/'].includes(k)) return setOperator(k);
    if (k === 'Enter' || k === '=') { e.preventDefault(); return equals(); }
    if (k === 'Backspace') return del();
    if (k === 'Escape') return clearAll();
    if (k === '%') return percent();
  });

  updateDisplay();
})();
