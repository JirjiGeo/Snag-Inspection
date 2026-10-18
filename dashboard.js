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
const activeSlots = slots.filter((slot) => {
  const status = String(apartments.find((unit) => unit.id === slot.unitId)?.record?.inspectionStatus || '').toLowerCase();
  return status !== 'completed' && status !== 'cancelled';
});
const todaySlots = activeSlots.filter((slot) => slot.date === today);
const weekSlots = activeSlots.filter((slot) => slot.date >= today && slot.date <= weekEnd)
  .sort((first, second) => `${first.date}T${first.time || ''}`.localeCompare(`${second.date}T${second.time || ''}`));
const pendingPayments = apartments.filter((unit) => unit.record?.unitStatus !== 'Cancelled' && unit.record?.paymentStatus !== 'Paid');

function renderMetrics() {
  const metrics = [
    { label: 'Inspections today', value: todaySlots.length, detail: 'Scheduled for today', href: 'activity.html' },
    { label: 'Next 7 days', value: weekSlots.length, detail: 'Upcoming appointments', href: 'activity.html' },
    { label: 'Open findings', value: openFindings.length, detail: 'Across all units', href: 'reports.html' },
    { label: 'Payments pending', value: pendingPayments.length, detail: 'Units awaiting payment', href: 'financials.html' }
  ];
  document.querySelector('#dashboardMetrics').innerHTML = metrics.map((metric) => `<a class="dashboard-metric" href="${metric.href}"><span>${metric.label}</span><strong>${metric.value}</strong><small>${metric.detail}</small></a>`).join('');
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
document.querySelector('#attentionList').addEventListener('click', (event) => {
  const link = event.target.closest('[data-inspection-unit]');
  if (!link) return;
  const unit = apartments.find((item) => item.id === link.dataset.inspectionUnit);
  if (unit) localStorage.setItem('snagline-linked-apartment', JSON.stringify({ id: unit.id, name: unit.name }));
});
renderMetrics();
renderAttention();
renderUpcoming();