const storage = {
  apartments: 'snagline-apartment-record',
  schedule: 'snagline-inspection-schedule',
  inspection: 'snagline-inspection-state'
};

function readStore(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const apartmentStore = readStore(storage.apartments);
const apartments = Array.isArray(apartmentStore.apartments) ? apartmentStore.apartments : [];
const scheduleStore = readStore(storage.schedule);
const slots = Array.isArray(scheduleStore.slots) ? scheduleStore.slots : [];
const inspectionStore = readStore(storage.inspection);
const findings = inspectionStore.findings && typeof inspectionStore.findings === 'object' ? inspectionStore.findings : {};
const today = dateKey(new Date());
const endOfWeek = new Date();
endOfWeek.setDate(endOfWeek.getDate() + 7);
const weekEnd = dateKey(endOfWeek);

function unitName(unitId) {
  return apartments.find((unit) => unit.id === unitId)?.name || 'Unknown unit';
}

function isOpen(finding) {
  return !['resolved', 'completed', 'closed', 'cancelled'].includes(String(finding.status || 'Open').toLowerCase());
}

function allFindings() {
  return apartments.flatMap((unit) => Object.entries(findings)
    .filter(([key]) => key.startsWith(`${unit.id}-`))
    .flatMap(([key, unitFindings]) => (Array.isArray(unitFindings) ? unitFindings : []).map((finding) => ({
      ...finding,
      unit,
      areaIndex: Number(key.slice(unit.id.length + 1))
    }))));
}

const openFindings = allFindings().filter(isOpen);
function isActiveUnit(unit) {
  const unitStatus = String(unit.record?.unitStatus || '').toLowerCase();
  const inspectionStatus = String(unit.record?.inspectionStatus || '').toLowerCase();
  return !['cancelled', 'completed'].includes(unitStatus) && inspectionStatus !== 'completed';
}

function confirmedBooking(unit) {
  if (String(unit.record?.inspectionStatus || '').toLowerCase() !== 'confirmed') return null;
  return slots.filter((slot) => slot.unitId === unit.id && slot.date >= today)
    .sort((first, second) => `${first.date}T${first.time || ''}`.localeCompare(`${second.date}T${second.time || ''}`))[0] || null;
}

const unscheduledUnits = apartments.filter((unit) => isActiveUnit(unit) && !confirmedBooking(unit));
const activeSlots = slots.filter((slot) => {
  const status = String(apartments.find((unit) => unit.id === slot.unitId)?.record?.inspectionStatus || '').toLowerCase();
  return status !== 'completed' && status !== 'cancelled';
});
const todaySlots = activeSlots.filter((slot) => slot.date === today);
const weekSlots = activeSlots.filter((slot) => slot.date >= today && slot.date <= weekEnd)
  .sort((first, second) => `${first.date}T${first.time || ''}`.localeCompare(`${second.date}T${second.time || ''}`));
const pendingPayments = apartments.filter((unit) => unit.record?.unitStatus !== 'Cancelled' && unit.record?.paymentStatus !== 'Paid');
const completedInspections = apartments.filter((unit) => String(unit.record?.inspectionStatus || '').toLowerCase() === 'completed').length;

function renderMetrics() {
  const metrics = [
    { label: 'Total units', value: apartments.length, detail: 'All registered units', href: 'apartments.html' },
    { label: 'Inspections completed', value: completedInspections, detail: `Of ${apartments.length} units`, href: 'reports.html' },
    { label: 'Inspections today', value: todaySlots.length, detail: 'Scheduled for today', href: 'activity.html' },
    { label: 'Next 7 days', value: weekSlots.length, detail: 'Upcoming appointments', href: 'activity.html' },
    { label: 'Unscheduled units', value: unscheduledUnits.length, detail: 'No confirmed booking', view: 'unscheduled' },
    { label: 'Payments pending', value: pendingPayments.length, detail: 'Units awaiting payment', view: 'payments' }
  ];
  document.querySelector('#dashboardMetrics').innerHTML = metrics.map((metric) => metric.view
    ? `<button class="dashboard-metric" type="button" data-dashboard-view="${metric.view}" aria-controls="dashboardDetails" aria-expanded="false"><span>${metric.label}</span><strong>${metric.value}</strong><small>${metric.detail}</small></button>`
    : `<a class="dashboard-metric" href="${metric.href}"><span>${metric.label}</span><strong>${metric.value}</strong><small>${metric.detail}</small></a>`).join('');
}

function displayValue(value) {
  return value ? escapeHtml(value) : 'Not provided';
}

function renderUnitDetails(view) {
  const heading = document.querySelector('#dashboardDetailsHeading');
  const count = document.querySelector('#dashboardDetailsCount');
  const list = document.querySelector('#dashboardDetailsList');
  const details = view === 'payments' ? pendingPayments : unscheduledUnits;
  heading.textContent = view === 'payments' ? 'Units with pending payments' : 'Units without a confirmed booking';
  count.textContent = `${details.length} unit${details.length === 1 ? '' : 's'}`;
  document.querySelector('#dashboardDetails').dataset.view = view;
  list.innerHTML = details.length ? details.map((unit) => {
    const record = unit.record || {};
    if (view === 'payments') {
      const invoice = record.invoicedAmount ? `Invoiced ${displayValue(record.invoicedAmount)}` : '';
      const quote = record.quotedAmount ? `Quoted ${displayValue(record.quotedAmount)}` : '';
      const amount = invoice || quote || 'Amount not set';
      const contact = [record.ownerPhone, record.ownerEmail].filter(Boolean).map(escapeHtml).join(' · ') || 'No contact details';
      return `<article class="dashboard-detail-row"><div><strong>${escapeHtml(unit.name)}</strong><span>${displayValue(record.buildingName)}</span></div><div><strong>Owner</strong><span>${displayValue(record.ownerName)}</span></div><div><strong>Contact</strong><span>${contact}</span></div><div><strong>${invoice ? 'Invoice' : 'Quote'}</strong><span>${amount.replace(/^(Invoiced|Quoted) /, '')}</span></div><a href="apartments.html" data-apartment-unit="${escapeHtml(unit.id)}">View unit</a></article>`;
    }
    const status = record.inspectionStatus || 'To be scheduled';
    const stage = record.unitStatus || 'Quote For Approval';
    return `<article class="dashboard-detail-row"><div><strong>${escapeHtml(unit.name)}</strong><span>${displayValue(record.buildingName)}</span></div><div><strong>Inspection status</strong><span>${escapeHtml(status)}</span></div><div><strong>Workflow stage</strong><span>${escapeHtml(stage)}</span></div><div><strong>Booking</strong><span>No future confirmed slot</span></div><a href="activity.html">Open schedule</a></article>`;
  }).join('') : '<p class="dashboard-empty">No units in this list.</p>';
  document.querySelector('#dashboardDetails').hidden = false;
  document.querySelectorAll('[data-dashboard-view]').forEach((button) => {
    const expanded = button.dataset.dashboardView === view;
    button.setAttribute('aria-expanded', String(expanded));
  });
}

function closeUnitDetails() {
  document.querySelector('#dashboardDetails').hidden = true;
  document.querySelectorAll('[data-dashboard-view]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
}

function escapeSpreadsheetXml(value) {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function exportDashboardUnits(view) {
  const rows = view === 'payments'
    ? [
      ['Unit', 'Building', 'Owner', 'Phone', 'Email', 'Quoted Amount', 'Invoiced Amount', 'Payment Status', 'Payment Method'],
      ...pendingPayments.map((unit) => {
        const record = unit.record || {};
        return [unit.name, record.buildingName, record.ownerName, record.ownerPhone, record.ownerEmail, record.quotedAmount, record.invoicedAmount, record.paymentStatus || 'Payment Pending', record.paymentMethod];
      })
    ]
    : [
      ['Unit', 'Building', 'Owner', 'Phone', 'Email', 'Unit Status', 'Inspection Status', 'Existing Slot Date', 'Existing Slot Time'],
      ...unscheduledUnits.map((unit) => {
        const record = unit.record || {};
        const unitSlots = slots.filter((slot) => slot.unitId === unit.id && slot.date)
          .sort((first, second) => `${first.date}T${first.time || ''}`.localeCompare(`${second.date}T${second.time || ''}`));
        const slot = unitSlots.find((item) => item.date >= today) || unitSlots[unitSlots.length - 1];
        return [unit.name, record.buildingName, record.ownerName, record.ownerPhone, record.ownerEmail, record.unitStatus, record.inspectionStatus || 'To be scheduled', slot?.date, slot?.time];
      })
    ];
  const sheetRows = rows.map((row) => `<Row>${row.map((value, index) => {
    const amountColumn = view === 'payments' && (index === 5 || index === 6);
    const numeric = amountColumn && value !== '' && value !== null && Number.isFinite(Number(value));
    return numeric
      ? `<Cell><Data ss:Type="Number">${Number(value)}</Data></Cell>`
      : `<Cell><Data ss:Type="String">${escapeSpreadsheetXml(value)}</Data></Cell>`;
  }).join('')}</Row>`).join('');
  const sheetName = view === 'payments' ? 'Pending Payments' : 'Unscheduled Units';
  const workbook = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="${sheetName}"><Table>${sheetRows}</Table></Worksheet></Workbook>`;
  const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = view === 'payments' ? 'snagline-pending-payments.xls' : 'snagline-unscheduled-units.xls';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function inspectionLink(unit) {
  return `<a class="dashboard-row" href="inspection.html" data-inspection-unit="${escapeHtml(unit.id)}"><span>`;
}

function scheduleLink() {
  return '<a class="dashboard-row" href="activity.html"><span>';
}

function renderAttention() {
  const items = [];
  const overdueUnitIds = new Set();
  activeSlots.filter((slot) => slot.date && slot.date < today).forEach((slot) => {
    overdueUnitIds.add(slot.unitId);
    items.push({
      rank: 0,
      html: `${scheduleLink()}<span class="dashboard-tag urgent">Overdue</span><span class="dashboard-row-title">${escapeHtml(unitName(slot.unitId))} inspection</span><span class="dashboard-row-meta">Was scheduled ${escapeHtml(slot.date)}${slot.time ? ` at ${escapeHtml(slot.time)}` : ''}</span></span><span class="dashboard-row-action">Review schedule</span></a>`
    });
  });
  openFindings.filter((finding) => ['high', 'critical'].includes(String(finding.severity).toLowerCase())).forEach((finding) => {
    const severity = String(finding.severity || 'High');
    items.push({
      rank: severity.toLowerCase() === 'critical' ? 1 : 2,
      html: `${inspectionLink(finding.unit)}<span class="dashboard-tag ${severity.toLowerCase() === 'critical' ? 'urgent' : 'warning'}">${escapeHtml(severity)}</span><span class="dashboard-row-title">${escapeHtml(finding.text || 'Untitled finding')}</span><span class="dashboard-row-meta">${escapeHtml(finding.unit.name)} · ${escapeHtml(finding.status || 'Open')}</span></span><span class="dashboard-row-action">Open inspection</span></a>`
    });
  });
  const scheduledUnitIds = new Set(weekSlots.map((slot) => slot.unitId));
  apartments.filter((unit) => unit.record?.unitStatus === 'For Inspection'
    && !['completed', 'cancelled'].includes(String(unit.record?.inspectionStatus || '').toLowerCase())
    && !overdueUnitIds.has(unit.id)
    && !scheduledUnitIds.has(unit.id)).forEach((unit) => {
    items.push({
      rank: 3,
      html: `<a class="dashboard-row" href="activity.html"><span><span class="dashboard-tag warning">Schedule</span><span class="dashboard-row-title">${escapeHtml(unit.name)}</span><span class="dashboard-row-meta">Ready for inspection, no appointment in the next 7 days</span></span><span class="dashboard-row-action">Book slot</span></a>`
    });
  });
  items.sort((first, second) => first.rank - second.rank);
  const visible = items.slice(0, 8);
  document.querySelector('#attentionCount').textContent = items.length ? `${items.length} item${items.length === 1 ? '' : 's'}` : '';
  document.querySelector('#attentionList').innerHTML = visible.length
    ? visible.map((item) => item.html).join('')
    : '<p class="dashboard-empty">Nothing needs attention right now.</p>';
}

function renderUpcoming() {
  const upcoming = weekSlots.slice(0, 7);
  document.querySelector('#upcomingList').innerHTML = upcoming.length
    ? upcoming.map((slot) => `<a class="dashboard-row" href="activity.html"><span><span class="dashboard-row-title">${escapeHtml(unitName(slot.unitId))}</span><span class="dashboard-row-meta">${escapeHtml(slot.date)}${slot.time ? ` · ${escapeHtml(slot.time)}` : ''}${slot.priority && slot.priority !== 'Normal' ? ` · ${escapeHtml(slot.priority)} priority` : ''}</span></span><span class="dashboard-row-action">View schedule</span></a>`).join('')
    : '<p class="dashboard-empty">No inspections scheduled in the next 7 days.</p>';
}

document.querySelector('#dashboardDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
document.querySelector('#dashboardMetrics').addEventListener('click', (event) => {
  const button = event.target.closest('[data-dashboard-view]');
  if (!button) return;
  if (button.getAttribute('aria-expanded') === 'true') closeUnitDetails();
  else renderUnitDetails(button.dataset.dashboardView);
});
document.querySelector('#closeDashboardDetails').addEventListener('click', closeUnitDetails);
document.querySelector('#exportDashboardDetails').addEventListener('click', () => {
  exportDashboardUnits(document.querySelector('#dashboardDetails').dataset.view);
});
document.querySelector('#dashboardDetailsList').addEventListener('click', (event) => {
  const link = event.target.closest('[data-apartment-unit]');
  if (!link) return;
  apartmentStore.activeApartmentId = link.dataset.apartmentUnit;
  localStorage.setItem(storage.apartments, JSON.stringify(apartmentStore));
});
document.querySelector('#attentionList').addEventListener('click', (event) => {
  const link = event.target.closest('[data-inspection-unit]');
  if (!link) return;
  const unit = apartments.find((item) => item.id === link.dataset.inspectionUnit);
  if (unit) localStorage.setItem('snagline-linked-apartment', JSON.stringify({ id: unit.id, name: unit.name }));
});
renderMetrics();
renderAttention();
renderUpcoming();