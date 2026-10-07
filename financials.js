const storageKey = 'snagline-apartment-record';
const amountFormat = new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function amountInCents(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round((amount + Number.EPSILON) * 100) : null;
}

function renderFinancials() {
  const apartments = JSON.parse(localStorage.getItem(storageKey) || '{}').apartments || [];
  const fields = ['invoicedAmount', 'qbelChargesWithVat', 'firstBridgeWithVat'];
  const totals = [0, 0, 0];
  const rows = apartments.map((apartment) => {
    const row = document.createElement('tr');
    const unit = document.createElement('td');
    unit.textContent = apartment.name || 'Not set';
    row.append(unit);
    const space = document.createElement('td');
    space.textContent = apartment.record?.unitSpace || '-';
    row.append(space);
    fields.forEach((field, index) => {
      const cents = amountInCents(apartment.record?.[field]);
      const cell = document.createElement('td');
      cell.textContent = cents === null ? '-' : amountFormat.format(cents / 100);
      totals[index] += cents ?? 0;
      row.append(cell);
    });
    return row;
  });
  if (!rows.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.className = 'empty-financials';
    cell.textContent = 'No units yet.';
    row.append(cell);
    rows.push(row);
  }
  document.querySelector('#financialRows').replaceChildren(...rows);
  ['invoicedTotal', 'qbelTotal', 'firstBridgeTotal'].forEach((id, index) => {
    document.querySelector(`#${id}`).textContent = amountFormat.format(totals[index] / 100);
  });
}

window.addEventListener('storage', (event) => {
  if (event.key === storageKey || event.key === null) renderFinancials();
});
window.addEventListener('focus', renderFinancials);
renderFinancials();