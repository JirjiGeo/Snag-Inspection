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

function nextBooking(unit) {
  return slots.filter((slot) => slot.unitId === unit.id && slot.date >= today)
    .sort((first, second) => `${first.date}T${first.time || ''}`.localeCompare(`${second.date}T${second.time || ''}`))[0] || null;
}

function confirmedBooking(unit) {
  return String(unit.record?.inspectionStatus || '').toLowerCase() === 'confirmed' ? nextBooking(unit) : null;
}

const remainingInspectionUnits = apartments.filter(isActiveUnit);
const scheduledUnits = remainingInspectionUnits.filter(confirmedBooking);
const unscheduledUnits = remainingInspectionUnits.filter((unit) => !confirmedBooking(unit));
const paidUnits = remainingInspectionUnits.filter((unit) => unit.record?.paymentStatus === 'Paid');
const pendingPayments = remainingInspectionUnits.filter((unit) => unit.record?.paymentStatus !== 'Paid');
const activeSlots = slots.filter((slot) => {
  const status = String(apartments.find((unit) => unit.id === slot.unitId)?.record?.inspectionStatus || '').toLowerCase();
  return status !== 'completed' && status !== 'cancelled';
});
const todaySlots = activeSlots.filter((slot) => slot.date === today);
const weekSlots = activeSlots.filter((slot) => slot.date >= today && slot.date <= weekEnd)
  .sort((first, second) => `${first.date}T${first.time || ''}`.localeCompare(`${second.date}T${second.time || ''}`));
const completedUnits = apartments.filter((unit) => String(unit.record?.inspectionStatus || '').toLowerCase() === 'completed');

function dashboardEntries(view) {
  const units = (list) => list.map((unit) => ({ unit, slot: nextBooking(unit) }));
  const appointments = (list) => list.map((slot) => ({ unit: apartments.find((unit) => unit.id === slot.unitId), slot })).filter((item) => item.unit);
  if (view === 'all') return units(apartments);
  if (view === 'completed') return units(completedUnits);
  if (view === 'remaining') return units(remainingInspectionUnits);
  if (view === 'scheduled') return scheduledUnits.map((unit) => ({ unit, slot: confirmedBooking(unit) }));
  if (view === 'unscheduled') return units(unscheduledUnits);
  if (view === 'paid') return units(paidUnits);
  if (view === 'payments') return units(pendingPayments);
  if (view === 'today') return appointments(todaySlots);
  if (view === 'week') return appointments(weekSlots);
  return [];
}

function renderMetrics() {
  const totals = [
    { label: 'Total units', value: apartments.length, detail: 'All registered units', view: 'all', tone: 'total' },
    { label: 'Inspections completed', value: completedUnits.length, detail: `Of ${apartments.length} units`, view: 'completed', tone: 'completed' },
    { label: 'Inspections remaining', value: remainingInspectionUnits.length, detail: 'Active units not completed', view: 'remaining', tone: 'remaining' }
  ];
  const schedule = [
    { label: 'Inspections today', value: todaySlots.length, detail: 'Scheduled for today', view: 'today', tone: 'schedule' },
    { label: 'Next 7 days', value: weekSlots.length, detail: 'Upcoming appointments', view: 'week', tone: 'schedule' }
  ];
  const breakdown = [
    { label: 'Scheduled', value: scheduledUnits.length, detail: 'Confirmed future booking', view: 'scheduled', tone: 'scheduled' },
    { label: 'Unscheduled', value: unscheduledUnits.length, detail: 'No confirmed future booking', view: 'unscheduled', tone: 'unscheduled' },
    { label: 'Paid', value: paidUnits.length, detail: 'Of active units', view: 'paid', tone: 'paid' },
    { label: 'Payments pending', value: pendingPayments.length, detail: 'Of active units', view: 'payments', tone: 'pending' }
  ];
  const metricMarkup = (metric, className) => {
    const classes = `${className}${metric.tone ? ` is-${metric.tone}` : ''}`;
    return `<button class="${classes}" type="button" data-dashboard-view="${metric.view}" aria-controls="dashboardDetails" aria-expanded="false"><span>${metric.label}</span><strong>${metric.value}</strong><small>${metric.detail}</small></button>`;
  };
  document.querySelector('#dashboardMetrics').innerHTML = totals.map((metric) => metricMarkup(metric, 'dashboard-metric')).join('');
  document.querySelector('#remainingUnitCount').textContent = `${remainingInspectionUnits.length} active unit${remainingInspectionUnits.length === 1 ? '' : 's'}`;
  document.querySelector('#remainingMetrics').innerHTML = breakdown.map((metric) => metricMarkup(metric, 'remaining-metric')).join('');
  document.querySelector('#scheduleMetrics').innerHTML = schedule.map((metric) => metricMarkup(metric, 'dashboard-metric')).join('');
}

function displayValue(value) {
  return value ? escapeHtml(value) : 'Not provided';
}

function renderUnitDetails(view) {
  const heading = document.querySelector('#dashboardDetailsHeading');
  const count = document.querySelector('#dashboardDetailsCount');
  const list = document.querySelector('#dashboardDetailsList');
  const titles = {
    all: 'All units',
    completed: 'Units with completed inspections',
    remaining: 'Units with inspections remaining',
    scheduled: 'Units with confirmed bookings',
    unscheduled: 'Units without confirmed bookings',
    paid: 'Paid units among active inspections',
    payments: 'Units with pending payments',
    today: "Today's inspections",
    week: 'Inspections in the next 7 days'
  };
  const entries = dashboardEntries(view);
  const paymentView = view === 'payments' || view === 'paid';
  const appointmentView = ['scheduled', 'today', 'week'].includes(view);
  heading.textContent = titles[view] || 'Units';
  count.textContent = `${entries.length} ${appointmentView ? 'inspection' : 'unit'}${entries.length === 1 ? '' : 's'}`;
  document.querySelector('#dashboardDetails').dataset.view = view;
  list.innerHTML = entries.length ? entries.map(({ unit, slot }) => {
    const record = unit.record || {};
    if (paymentView) {
      const invoice = record.invoicedAmount ? `Invoiced ${displayValue(record.invoicedAmount)}` : '';
      const quote = record.quotedAmount ? `Quoted ${displayValue(record.quotedAmount)}` : '';
      const amount = invoice || quote || 'Amount not set';
      const contact = [record.ownerPhone, record.ownerEmail].filter(Boolean).map(escapeHtml).join(' · ') || 'No contact details';
      return `<article class="dashboard-detail-row"><div><strong>${escapeHtml(unit.name)}</strong><span>${displayValue(record.buildingName)}</span></div><div><strong>Owner</strong><span>${displayValue(record.ownerName)}</span></div><div><strong>Contact</strong><span>${contact}</span></div><div><strong>${invoice ? 'Invoice' : 'Quote'}</strong><span>${amount.replace(/^(Invoiced|Quoted) /, '')} · ${escapeHtml(record.paymentStatus || 'Payment Pending')}</span></div><a href="apartments.html" data-apartment-unit="${escapeHtml(unit.id)}">View unit</a></article>`;
    }
    if (appointmentView) {
      const appointment = slot ? `${escapeHtml(slot.date)}${slot.time ? ` · ${escapeHtml(slot.time)}` : ''}` : 'No future booking';
      const priority = slot?.priority && slot.priority !== 'Normal' ? `${escapeHtml(slot.priority)} priority` : 'Normal priority';
      return `<article class="dashboard-detail-row"><div><strong>${escapeHtml(unit.name)}</strong><span>${displayValue(record.buildingName)}</span></div><div><strong>Inspection slot</strong><span>${appointment}</span></div><div><strong>Inspection status</strong><span>${escapeHtml(record.inspectionStatus || 'To be scheduled')}</span></div><div><strong>Priority</strong><span>${priority}</span></div><a href="activity.html">Open schedule</a></article>`;
    }
    const status = record.inspectionStatus || 'To be scheduled';
    const stage = record.unitStatus || 'Quote For Approval';
    const booking = slot ? `${confirmedBooking(unit) ? 'Confirmed' : 'Unconfirmed'} · ${escapeHtml(slot.date)}${slot.time ? ` · ${escapeHtml(slot.time)}` : ''}` : 'No future booking';
    const contextLabel = view === 'unscheduled' ? 'Booking' : 'Payment status';
    const contextValue = view === 'unscheduled' ? booking : escapeHtml(record.paymentStatus || 'Payment Pending');
    return `<article class="dashboard-detail-row"><div><strong>${escapeHtml(unit.name)}</strong><span>${displayValue(record.buildingName)}</span></div><div><strong>Inspection status</strong><span>${escapeHtml(status)}</span></div><div><strong>Workflow stage</strong><span>${escapeHtml(stage)}</span></div><div><strong>${contextLabel}</strong><span>${contextValue}</span></div><a href="apartments.html" data-apartment-unit="${escapeHtml(unit.id)}">View unit</a></article>`;
  }).join('') : '<p class="dashboard-empty">No records match this dashboard category.</p>';
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
  const entries = dashboardEntries(view);
  const rows = [
    ['Unit', 'Building', 'Owner', 'Phone', 'Email', 'Unit Status', 'Inspection Status', 'Payment Status', 'Payment Method', 'Quoted Amount', 'Invoiced Amount', 'Booking Date', 'Booking Time', 'Booking Priority'],
    ...entries.map(({ unit, slot }) => {
      const record = unit.record || {};
      return [unit.name, record.buildingName, record.ownerName, record.ownerPhone, record.ownerEmail, record.unitStatus, record.inspectionStatus || 'To be scheduled', record.paymentStatus || 'Payment Pending', record.paymentMethod, record.quotedAmount, record.invoicedAmount, slot?.date, slot?.time, slot?.priority];
    })
  ];
  const sheetRows = rows.map((row) => `<Row>${row.map((value, index) => {
    const amountColumn = index === 9 || index === 10;
    const numeric = amountColumn && value !== '' && value !== null && Number.isFinite(Number(value));
    return numeric
      ? `<Cell><Data ss:Type="Number">${Number(value)}</Data></Cell>`
      : `<Cell><Data ss:Type="String">${escapeSpreadsheetXml(value)}</Data></Cell>`;
  }).join('')}</Row>`).join('');
  const sheetNames = { all: 'All Units', completed: 'Completed Inspections', remaining: 'Remaining Inspections', scheduled: 'Scheduled Units', unscheduled: 'Unscheduled Units', paid: 'Paid Units', payments: 'Pending Payments', today: 'Inspections Today', week: 'Next 7 Days' };
  const filenames = { all: 'all-units', completed: 'completed-inspections', remaining: 'remaining-inspections', scheduled: 'scheduled-units', unscheduled: 'unscheduled-units', paid: 'paid-units', payments: 'pending-payments', today: 'inspections-today', week: 'inspections-next-7-days' };
  const sheetName = sheetNames[view] || 'Dashboard Units';
  const workbook = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="${sheetName}"><Table>${sheetRows}</Table></Worksheet></Workbook>`;
  const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `snagline-${filenames[view] || 'dashboard-units'}.xls`;
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
      tone: 'overdue',
      html: `<a class="attention-item is-overdue" href="activity.html"><span class="attention-marker" aria-hidden="true">!</span><span class="attention-copy"><span class="attention-label">Overdue inspection</span><strong>${escapeHtml(unitName(slot.unitId))}</strong><small>Was scheduled ${escapeHtml(slot.date)}${slot.time ? ` · ${escapeHtml(slot.time)}` : ''}</small></span><span class="attention-action">Review schedule <span aria-hidden="true">→</span></span></a>`
    });
  });
  openFindings.filter((finding) => ['high', 'critical'].includes(String(finding.severity).toLowerCase())).forEach((finding) => {
    const severity = String(finding.severity || 'High');
    items.push({
      rank: severity.toLowerCase() === 'critical' ? 1 : 2,
      tone: severity.toLowerCase() === 'critical' ? 'critical' : 'high',
      html: `<a class="attention-item is-${severity.toLowerCase() === 'critical' ? 'critical' : 'high'}" href="inspection.html" data-inspection-unit="${escapeHtml(finding.unit.id)}"><span class="attention-marker" aria-hidden="true">${severity.toLowerCase() === 'critical' ? '!!' : '!'}</span><span class="attention-copy"><span class="attention-label">${escapeHtml(severity)} finding</span><strong>${escapeHtml(finding.text || 'Untitled finding')}</strong><small>${escapeHtml(finding.unit.name)} · ${escapeHtml(finding.status || 'Open')}</small></span><span class="attention-action">Open inspection <span aria-hidden="true">→</span></span></a>`
    });
  });
  const scheduledUnitIds = new Set(weekSlots.map((slot) => slot.unitId));
  apartments.filter((unit) => unit.record?.unitStatus === 'For Inspection'
    && !['completed', 'cancelled'].includes(String(unit.record?.inspectionStatus || '').toLowerCase())
    && !overdueUnitIds.has(unit.id)
    && !scheduledUnitIds.has(unit.id)).forEach((unit) => {
    items.push({
      rank: 3,
      tone: 'schedule',
      html: `<a class="attention-item is-schedule" href="activity.html"><span class="attention-marker" aria-hidden="true">+</span><span class="attention-copy"><span class="attention-label">Booking needed</span><strong>${escapeHtml(unit.name)}</strong><small>Ready for inspection · no confirmed appointment</small></span><span class="attention-action">Book slot <span aria-hidden="true">→</span></span></a>`
    });
  });
  items.sort((first, second) => first.rank - second.rank);
  const visible = items.slice(0, 8);
  document.querySelector('#attentionCount').textContent = String(items.length).padStart(2, '0');
  document.querySelector('#attentionList').innerHTML = visible.length
    ? visible.map((item) => item.html).join('')
    : '<div class="attention-empty"><span aria-hidden="true">✓</span><div><strong>All clear</strong><small>No overdue inspections or urgent actions.</small></div></div>';
}

function renderUpcoming() {
  const upcoming = weekSlots.slice(0, 7);
  document.querySelector('#upcomingList').innerHTML = upcoming.length
    ? upcoming.map((slot) => {
      const date = new Date(`${slot.date}T00:00:00`);
      const day = date.toLocaleDateString('en-US', { day: '2-digit' });
      const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const unit = apartments.find((item) => item.id === slot.unitId);
      const building = unit?.record?.buildingName;
      const priority = slot.priority && slot.priority !== 'Normal' ? `${escapeHtml(slot.priority)} priority` : 'Inspection';
      return `<a class="agenda-item ${slot.priority && slot.priority !== 'Normal' ? 'is-priority' : ''}" href="activity.html"><span class="agenda-date"><strong>${day}</strong><small>${weekday}</small></span><span class="agenda-time">${escapeHtml(slot.time || '—')}</span><span class="agenda-copy"><strong>${escapeHtml(unitName(slot.unitId))}</strong><small>${escapeHtml(building || priority)}</small></span><span class="agenda-arrow" aria-hidden="true">↗</span></a>`;
    }).join('')
    : '<div class="agenda-empty"><span class="agenda-empty-mark" aria-hidden="true">—</span><div><strong>No bookings ahead</strong><small>Your next 7 days are clear.</small></div><a href="activity.html">Open schedule</a></div>';
}

document.querySelector('#dashboardDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
document.querySelector('#dashboardSummary').addEventListener('click', (event) => {
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