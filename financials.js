const storageKey = 'snagline-apartment-record';
const amountFormat = new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function amountInCents(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round((amount + Number.EPSILON) * 100) : null;
}

function inspectionState() {
  return JSON.parse(localStorage.getItem('snagline-inspection-state') || '{}');
}

function inspectorFor(apartment, state = inspectionState()) {
  return window.snagPreferredInspectorNames(state.inspectionMeta?.[apartment.id]?.inspectedBy, apartment.record?.inspectedBy);
}

function summarizeInspectors(apartments, state = inspectionState()) {
  const summaries = new Map((window.SNAG_INSPECTORS || []).map((inspector) => [inspector, []]));
  apartments.forEach((apartment) => {
    inspectorFor(apartment, state).forEach((inspector) => {
      if (!summaries.has(inspector)) summaries.set(inspector, []);
      summaries.get(inspector).push(apartment.name || 'Not set');
    });
  });
  return [...summaries].map(([inspector, units]) => ({ inspector, units }));
}

function xmlEscape(value) {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function spreadsheetCell(value, numeric = false) {
  if (numeric && value !== null && value !== undefined && value !== '') {
    const number = Number(value);
    if (Number.isFinite(number)) return `<Cell><Data ss:Type="Number">${number}</Data></Cell>`;
  }
  return `<Cell><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`;
}

function spreadsheetWorksheet(name, rows) {
  const worksheetRows = rows.map((row) => `<Row>${row.map((cell) => spreadsheetCell(cell.value, cell.numeric)).join('')}</Row>`).join('');
  return `<Worksheet ss:Name="${xmlEscape(name)}"><Table>${worksheetRows}</Table></Worksheet>`;
}

function exportFinancials() {
  const allApartments = JSON.parse(localStorage.getItem(storageKey) || '{}').apartments || [];
  const state = inspectionState();
  const paidApartments = allApartments.filter((apartment) => apartment.record?.paymentStatus === 'Paid');
  const financialRows = [
    ['Unit Number', 'Payment Status', 'Inspector', 'Unit Size', 'Invoiced Amount', 'Qbel Charges W VAT', 'First Bridge W VAT']
      .map((value) => ({ value }))
  ];
  const totals = [0, 0, 0];
  paidApartments.forEach((apartment) => {
    const record = apartment.record || {};
    const amounts = ['invoicedAmount', 'qbelChargesWithVat', 'firstBridgeWithVat'].map((field, index) => {
      const cents = amountInCents(record[field]);
      totals[index] += cents ?? 0;
      return { value: cents === null ? '' : cents / 100, numeric: cents !== null };
    });
    financialRows.push([
      { value: apartment.name || 'Not set' },
      { value: 'Paid' },
      { value: inspectorFor(apartment, state).join(', ') },
      { value: record.unitSpace || '-' },
      ...amounts
    ]);
  });
  financialRows.push([
    { value: 'Totals' },
    { value: `${paidApartments.length} paid` },
    { value: '' },
    { value: '' },
    ...totals.map((cents) => ({ value: cents / 100, numeric: true }))
  ]);

  const scheduleSlots = JSON.parse(localStorage.getItem('snagline-inspection-schedule') || '{}').slots || [];
  const detailFields = [
    ['soNumber', 'SO Number'], ['ownerName', 'Owner Name'], ['ownerPhone', 'Phone Number'],
    ['ownerEmail', 'Email'], ['buildingName', 'Building Name'], ['unitSpace', 'Unit Size'],
    ['unitBedrooms', 'Bedrooms'], ['unitLayout', 'Layout'], ['outdoorArea', 'Outdoor Area'],
    ['inspectionDate', 'Inspection Date'], ['inspectionTime', 'Inspection Time'],
    ['unitStatus', 'Unit Status'], ['inspectedBy', 'Inspected By'], ['inspectionStatus', 'Inspection Status'],
    ['paymentStatus', 'Payment Status'], ['paymentMethod', 'Payment Method'],
    ['quotedAmount', 'Quoted Amount'], ['invoicedAmount', 'Invoiced Amount'],
    ['calculatedArea', 'Calculated Area'], ['qbelChargesWithoutVat', 'Qbel Charges Without VAT'],
    ['qbelChargesWithVat', 'Qbel Charges With VAT'], ['firstBridgeWithoutVat', 'First Bridge Without VAT'],
    ['firstBridgeWithVat', 'First Bridge With VAT']
  ];
  const detailRows = [[{ value: 'Unit Number' }, ...detailFields.map(([, title]) => ({ value: title }))]];
  allApartments.forEach((apartment) => {
    const record = apartment.record || {};
    const bookings = scheduleSlots.filter((slot) => slot.unitId === apartment.id && slot.date)
      .sort((first, second) => `${first.date}T${first.time || ''}`.localeCompare(`${second.date}T${second.time || ''}`));
    const now = new Date();
    const schedule = bookings.find((slot) => new Date(`${slot.date}T${slot.time || '23:59'}`) >= now) || bookings[bookings.length - 1];
    const details = { ...record, inspectedBy: inspectorFor(apartment, state).join(', '), inspectionDate: schedule?.date || '', inspectionTime: schedule?.time || '' };
    detailRows.push([
      { value: apartment.name || 'Not set' },
      ...detailFields.map(([field]) => {
        const value = details[field] ?? '';
        const isAmount = ['quotedAmount', 'invoicedAmount', 'calculatedArea', 'qbelChargesWithoutVat', 'qbelChargesWithVat', 'firstBridgeWithoutVat', 'firstBridgeWithVat'].includes(field);
        return isAmount && value !== '' && Number.isFinite(Number(value))
          ? { value: Number(value), numeric: true }
          : { value };
      })
    ]);
  });
  if (!allApartments.length) detailRows.push([{ value: 'No units recorded' }]);

  const inspectorRows = [[{ value: 'Inspector' }, { value: 'Units inspected' }, { value: 'Unit numbers' }]];
  summarizeInspectors(allApartments, state).forEach(({ inspector, units }) => {
    inspectorRows.push([{ value: inspector }, { value: units.length, numeric: true }, { value: units.join(', ') }]);
  });
  const workbook = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${spreadsheetWorksheet('Financials', financialRows)}${spreadsheetWorksheet('Inspector Summary', inspectorRows)}${spreadsheetWorksheet('Unit Details', detailRows)}</Workbook>`;
  const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'snagline-finances-and-unit-details.xls';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  const toast = document.querySelector('#toast');
  toast.textContent = 'Exported to Excel';
  toast.classList.add('show');
  clearTimeout(exportFinancials.toastTimer);
  exportFinancials.toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function renderFinancials() {
  const allApartments = JSON.parse(localStorage.getItem(storageKey) || '{}').apartments || [];
  const state = inspectionState();
  const apartments = allApartments
    .filter((apartment) => apartment.record?.paymentStatus === 'Paid');
  const fields = ['invoicedAmount', 'qbelChargesWithVat', 'firstBridgeWithVat'];
  const totals = [0, 0, 0];
  const rows = apartments.map((apartment) => {
    const row = document.createElement('tr');
    const unit = document.createElement('td');
    unit.textContent = apartment.name || 'Not set';
    row.append(unit);
    const paid = apartment.record?.paymentStatus === 'Paid';
    const payment = document.createElement('td');
    payment.textContent = paid ? 'Paid' : 'Payment Pending';
    payment.className = `payment-status ${paid ? 'is-paid' : 'is-pending'}`;
    row.append(payment);
    const inspector = document.createElement('td');
    inspector.textContent = inspectorFor(apartment, state).join(', ') || '-';
    row.append(inspector);
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
    cell.colSpan = 7;
    cell.className = 'empty-financials';
    cell.textContent = 'No paid units yet.';
    row.append(cell);
    rows.push(row);
  }
  document.querySelector('#financialRows').replaceChildren(...rows);
  document.querySelector('#unitCountTotal').textContent = `${apartments.length} paid`;
  ['invoicedTotal', 'qbelTotal', 'firstBridgeTotal'].forEach((id, index) => {
    document.querySelector(`#${id}`).textContent = amountFormat.format(totals[index] / 100);
  });
  const summaries = summarizeInspectors(allApartments, state);
  const summaryRows = summaries.map(({ inspector, units }) => {
    const row = document.createElement('tr');
    [inspector, String(units.length), units.join(', ') || '-'].forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    });
    return row;
  });
  if (!summaryRows.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 3;
    cell.className = 'empty-financials';
    cell.textContent = 'No inspectors configured.';
    row.append(cell);
    summaryRows.push(row);
  }
  document.querySelector('#inspectorSummaryRows').replaceChildren(...summaryRows);
}

function selectFinancialTab(tab) {
  const showSummary = tab === 'inspectorSummaryTab';
  document.querySelector('#financialsPanel').hidden = showSummary;
  document.querySelector('#inspectorSummaryPanel').hidden = !showSummary;
  document.querySelector('#financialsTab').setAttribute('aria-selected', String(!showSummary));
  document.querySelector('#inspectorSummaryTab').setAttribute('aria-selected', String(showSummary));
  document.querySelector('#financialsTab').tabIndex = showSummary ? -1 : 0;
  document.querySelector('#inspectorSummaryTab').tabIndex = showSummary ? 0 : -1;
}

document.querySelector('#exportFinancialsButton').addEventListener('click', exportFinancials);
document.querySelector('#financialsTab').addEventListener('click', () => selectFinancialTab('financialsTab'));
document.querySelector('#inspectorSummaryTab').addEventListener('click', () => selectFinancialTab('inspectorSummaryTab'));
document.querySelector('.financials-tabs').addEventListener('keydown', (event) => {
  const tabs = [...document.querySelectorAll('.financials-tab')];
  const currentIndex = tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
  const nextIndex = event.key === 'ArrowRight' ? (currentIndex + 1) % tabs.length
    : event.key === 'ArrowLeft' ? (currentIndex + tabs.length - 1) % tabs.length
      : event.key === 'Home' ? 0
        : event.key === 'End' ? tabs.length - 1
          : -1;
  if (nextIndex < 0) return;
  event.preventDefault();
  tabs[nextIndex].focus();
  selectFinancialTab(tabs[nextIndex].id);
});
window.addEventListener('storage', (event) => {
  if ([storageKey, 'snagline-inspection-state', null].includes(event.key)) renderFinancials();
});
window.addEventListener('focus', renderFinancials);
window.addEventListener('snag-cloud-snapshot-applied', renderFinancials);
renderFinancials();