const storageKey = 'snagline-apartment-record';
const amountFormat = new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function amountInCents(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round((amount + Number.EPSILON) * 100) : null;
}

function unitSizeTotal(apartments) {
  const sizes = apartments
    .map((apartment) => String(apartment.record?.unitSpace || '').trim())
    .filter(Boolean);
  if (!sizes.length) return '-';

  const parsed = sizes.map((size) => {
    const match = size.match(/^\s*([\d,]+(?:\.\d+)?)\s*(.*?)\s*$/);
    return match ? { value: Number(match[1].replace(/,/g, '')), unit: match[2].toLowerCase() } : null;
  });
  if (parsed.some((size) => !size || !Number.isFinite(size.value))) return '-';
  const units = new Set(parsed.map((size) => size.unit));
  if (units.size !== 1) return '-';

  const total = parsed.reduce((sum, size) => sum + size.value, 0);
  return `${new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(total)}${parsed[0].unit ? ` ${parsed[0].unit}` : ''}`;
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
  const paidApartments = allApartments.filter((apartment) => apartment.record?.paymentStatus === 'Paid');
  const financialRows = [
    ['Unit Number', 'Payment Status', 'Unit Size', 'Invoiced Amount', 'Qbel Charges W VAT', 'First Bridge W VAT']
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
      { value: record.unitSpace || '-' },
      ...amounts
    ]);
  });
  financialRows.push([
    { value: 'Totals' },
    { value: `${paidApartments.length} paid` },
    { value: unitSizeTotal(paidApartments) },
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
    const details = { ...record, inspectionDate: schedule?.date || '', inspectionTime: schedule?.time || '' };
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

  const workbook = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${spreadsheetWorksheet('Financials', financialRows)}${spreadsheetWorksheet('Unit Details', detailRows)}</Workbook>`;
  const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'snagline-finances-and-unit-details.xls';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  const toast = document.querySelector('#toast');
  toast.textContent = 'Finances and unit details exported';
  toast.classList.add('show');
  clearTimeout(exportFinancials.toastTimer);
  exportFinancials.toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function renderFinancials() {
  const apartments = (JSON.parse(localStorage.getItem(storageKey) || '{}').apartments || [])
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
    cell.colSpan = 6;
    cell.className = 'empty-financials';
    cell.textContent = 'No paid units yet.';
    row.append(cell);
    rows.push(row);
  }
  document.querySelector('#financialRows').replaceChildren(...rows);
  document.querySelector('#unitCountTotal').textContent = `${apartments.length} paid`;
  document.querySelector('#unitSizeTotal').textContent = unitSizeTotal(apartments);
  ['invoicedTotal', 'qbelTotal', 'firstBridgeTotal'].forEach((id, index) => {
    document.querySelector(`#${id}`).textContent = amountFormat.format(totals[index] / 100);
  });
}

document.querySelector('#exportFinancialsButton').addEventListener('click', exportFinancials);
window.addEventListener('storage', (event) => {
  if (event.key === storageKey || event.key === null) renderFinancials();
});
window.addEventListener('focus', renderFinancials);
renderFinancials();