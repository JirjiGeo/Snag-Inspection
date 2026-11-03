const $ = (selector) => document.querySelector(selector);
const storageKey = 'snagline-inspection-schedule';
const apartmentStore = JSON.parse(localStorage.getItem('snagline-apartment-record') || '{}');
const apartments = apartmentStore.apartments || [{ id: 'default-unit', name: 'Unit 1204' }];
const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
const inspectionState = JSON.parse(localStorage.getItem('snagline-inspection-state') || '{}');
let slots = saved.slots || [];
let currentMonth = saved.currentMonth ? new Date(saved.currentMonth) : new Date();
let selectedSlotId = null;

function persist(message = 'Saved to local workspace') {
  localStorage.setItem(storageKey, JSON.stringify({ slots, currentMonth: currentMonth.toISOString() }));
  window.snagCloudSave?.();
  showToast(message);
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function unitName(id) {
  return apartments.find((unit) => unit.id === id)?.name || 'Unknown unit';
}

function unitPaymentStatus(id) {
  return apartments.find((unit) => unit.id === id)?.record?.paymentStatus === 'Paid' ? 'Paid' : 'Payment Pending';
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function unitInspectionStatus(id) {
  return apartments.find((unit) => unit.id === id)?.record?.inspectionStatus || 'To be scheduled';
}

function unitInspectors(id) {
  const apartment = apartments.find((unit) => unit.id === id);
  const primary = inspectionState.inspectionMeta?.[id]?.inspectedBy;
  const normalize = (assigned) => [...new Set((Array.isArray(assigned) ? assigned : String(assigned || '').split(','))
    .map((name) => String(name).trim())
    .filter(Boolean))];
  const inspectors = normalize(primary);
  return inspectors.length ? inspectors : normalize(apartment?.record?.inspectedBy);
}

function isActiveSlot(slot) {
  const apartment = apartments.find((unit) => unit.id === slot.unitId);
  if (!apartment) return false;
  const unitStatus = String(apartment.record?.unitStatus || '').toLowerCase();
  const inspectionStatus = String(apartment.record?.inspectionStatus || '').toLowerCase();
  return !['cancelled', 'completed'].includes(unitStatus)
    && !['cancelled', 'completed'].includes(inspectionStatus);
}

function formatScheduleDate(date) {
  const [year, month, day] = String(date || '').split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return Number.isFinite(parsed.getTime()) && formatDate(parsed) === date
    ? parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Date not set';
}

function paymentLabel(id) {
  const status = unitPaymentStatus(id);
  return `<span class="payment-label ${status === 'Paid' ? 'is-paid' : 'is-pending'}">${status}</span>`;
}

function inspectionLabel(id) {
  return `<span class="inspection-label">${escapeHtml(unitInspectionStatus(id))}</span>`;
}

function renderPaymentStatusField() {
  const status = unitPaymentStatus($('#slotUnit').value);
  const field = $('#slotPaymentStatus');
  field.value = status;
  field.classList.toggle('is-paid', status === 'Paid');
  field.classList.toggle('is-pending', status !== 'Paid');
}

function renderInspectionStatusField() {
  $('#slotInspectionStatus').value = unitInspectionStatus($('#slotUnit').value);
}

function renderUnits() {
  $('#slotUnit').innerHTML = apartments.map((unit) => `<option value="${unit.id}">${unit.name}</option>`).join('');
}

function renderStatusSummary() {
  const stages = ['Quote For Approval', 'For Inspection', 'Completed', 'Cancelled'];
  const legacyStages = { 'To be quoted': 'Quote For Approval', Quoted: 'Quote For Approval', Paid: 'For Inspection', 'To be inspected': 'For Inspection', Inspected: 'Completed', 'Report issued': 'Completed', Closed: 'Completed' };
  $('#statusSummary').innerHTML = stages.map((stage, index) => {
    const count = apartments.filter((unit) => {
      const status = unit.record?.unitStatus || 'Quote For Approval';
      return (legacyStages[status] || status) === stage;
    }).length;
    return `<div class="status-card ${stage === 'For Inspection' ? 'accent' : ''}"><span>${stage}</span><strong>${String(count).padStart(2, '0')}</strong></div>`;
  }).join('');
}

function renderBanner() {
  const today = formatDate(new Date());
  const todaySlots = slots.filter((slot) => isActiveSlot(slot) && slot.date === today).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  $('#todayBanner').innerHTML = todaySlots.length
    ? `<strong>${todaySlots.length} inspection${todaySlots.length === 1 ? '' : 's'} scheduled today</strong><p>${todaySlots.map((slot) => `${escapeHtml(unitName(slot.unitId))} at ${escapeHtml(slot.time || 'Time not set')} · Inspector: ${escapeHtml(unitInspectors(slot.unitId).join(', ') || 'Unassigned')}`).join(' · ')}</p>`
    : '<strong>Today’s inspections</strong><p>No units scheduled for inspection today.</p>';
}

function bindSlotActions() {
  document.querySelectorAll('.slot-summary').forEach((item) => item.addEventListener('click', () => editSlot(item.dataset.slotId)));
  document.querySelectorAll('[data-open-inspection]').forEach((button) => button.addEventListener('click', () => openInspection(button.dataset.openInspection)));
}

function renderScheduleInsights() {
  const today = formatDate(new Date());
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);
  const weekEnd = formatDate(endDate);
  const activeSlots = slots.filter(isActiveSlot);
  const overdue = activeSlots.filter((slot) => slot.date && slot.date < today)
    .sort((a, b) => `${a.date}T${a.time || ''}`.localeCompare(`${b.date}T${b.time || ''}`));
  $('#overdueCount').textContent = `${overdue.length} slot${overdue.length === 1 ? '' : 's'}`;
  $('#overdueList').innerHTML = overdue.length
    ? overdue.map((slot) => {
      const daysLate = Math.floor((new Date(`${today}T00:00:00`) - new Date(`${slot.date}T00:00:00`)) / 86400000);
      const inspectors = unitInspectors(slot.unitId).join(', ') || 'Unassigned';
      return `<article class="schedule-insight-item is-overdue"><div><strong>${escapeHtml(unitName(slot.unitId))}</strong><span>${formatScheduleDate(slot.date)} · ${escapeHtml(slot.time || 'Time not set')} · ${daysLate} day${daysLate === 1 ? '' : 's'} overdue<br>Inspector: ${escapeHtml(inspectors)}</span></div><div class="upcoming-actions"><button class="inspect" data-open-inspection="${escapeHtml(slot.unitId)}">Open inspection</button></div></article>`;
    }).join('')
    : '<p class="upcoming-empty">No overdue inspections.</p>';

  const workload = new Map();
  let unassigned = 0;
  activeSlots.filter((slot) => slot.date >= today && slot.date <= weekEnd).forEach((slot) => {
    const inspectors = unitInspectors(slot.unitId);
    if (!inspectors.length) {
      unassigned += 1;
      return;
    }
    inspectors.forEach((inspector) => {
      if (!workload.has(inspector)) workload.set(inspector, []);
      workload.get(inspector).push(slot);
    });
  });
  const workloadItems = [...workload.entries()].sort((first, second) =>
    second[1].length - first[1].length || first[0].localeCompare(second[0]));
  $('#inspectorWorkload').innerHTML = workloadItems.length || unassigned
    ? `${workloadItems.map(([inspector, assignedSlots]) => {
      const units = assignedSlots.map((slot) => escapeHtml(unitName(slot.unitId))).join(', ');
      return `<div class="schedule-insight-item"><div><strong>${escapeHtml(inspector)}</strong><span>${units}</span></div><strong class="workload-count">${assignedSlots.length}</strong></div>`;
    }).join('')}${unassigned ? `<div class="schedule-insight-item"><div><strong>Unassigned</strong><span>Appointments without an inspector</span></div><strong class="workload-count">${unassigned}</strong></div>` : ''}`
    : '<p class="upcoming-empty">No appointments in the next 7 days.</p>';
  bindSlotActions();
}

function renderUpcoming() {
  const today = formatDate(new Date());
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);
  const weekEnd = formatDate(endDate);
  const upcoming = slots
    .filter((slot) => isActiveSlot(slot)
      && slot.date >= today && slot.date <= weekEnd)
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  $('#upcomingList').innerHTML = upcoming.length
    ? upcoming.map((slot) => `<div class="upcoming-item" data-payment-status="${unitPaymentStatus(slot.unitId)}"><button class="slot-summary" data-slot-id="${escapeHtml(slot.id)}"><strong>${escapeHtml(unitName(slot.unitId))}</strong><span class="slot-meta">${formatScheduleDate(slot.date)} · ${escapeHtml(slot.time || 'Time not set')}<br>Inspector: ${escapeHtml(unitInspectors(slot.unitId).join(', ') || 'Unassigned')} · ${paymentLabel(slot.unitId)} · ${inspectionLabel(slot.unitId)}${slot.notes ? ` · ${escapeHtml(slot.notes)}` : ''}</span></button><div class="upcoming-actions"><button class="inspect" data-open-inspection="${escapeHtml(slot.unitId)}">Open inspection</button></div></div>`).join('')
    : '<p class="upcoming-empty">No upcoming inspections booked.</p>';
  bindSlotActions();
}

function scheduleConflicts(slot) {
  const assigned = new Set(unitInspectors(slot.unitId));
  if (!assigned.size) return [];
  const conflicts = new Map();
  slots.forEach((otherSlot) => {
    if (otherSlot.id === slot.id || otherSlot.unitId === slot.unitId
      || otherSlot.date !== slot.date || otherSlot.time !== slot.time
      || !isActiveSlot(otherSlot)) return;
    unitInspectors(otherSlot.unitId).forEach((inspector) => {
      if (assigned.has(inspector)) conflicts.set(`${inspector}:${otherSlot.unitId}`, {
        inspector,
        unit: unitName(otherSlot.unitId)
      });
    });
  });
  return [...conflicts.values()];
}

function openInspection(unitId) {
  const apartment = apartments.find((unit) => unit.id === unitId);
  if (!apartment) return;
  localStorage.setItem('snagline-linked-apartment', JSON.stringify({ id: apartment.id, name: apartment.name }));
  window.location.href = 'inspection.html';
}

function renderCalendar() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  $('#calendarTitle').textContent = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const cells = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => `<div class="day-name">${day}</div>`);
  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = formatDate(date);
    const daySlots = slots.filter((slot) => slot.date === key);
    const isToday = key === formatDate(new Date());
    const outside = date.getMonth() !== month;
    cells.push(`<div class="day-cell ${outside ? 'outside' : ''} ${isToday ? 'today' : ''}"><div class="day-number">${date.getDate()}</div>${daySlots.map((slot) => `<button class="slot ${unitPaymentStatus(slot.unitId) === 'Paid' ? 'paid' : 'pending'}" data-slot-id="${escapeHtml(slot.id)}">${escapeHtml(unitName(slot.unitId))}<span class="time">${escapeHtml(slot.time || 'Time not set')}</span><span class="time">Inspector: ${escapeHtml(unitInspectors(slot.unitId).join(', ') || 'Unassigned')}</span>${paymentLabel(slot.unitId)}${inspectionLabel(slot.unitId)}</button>`).join('')}</div>`);
  }
  $('#calendarGrid').innerHTML = cells.join('');
  document.querySelectorAll('[data-slot-id]').forEach((button) => button.addEventListener('click', () => editSlot(button.dataset.slotId)));
}

function clearForm() {
  selectedSlotId = null;
  $('#slotForm').reset();
  $('#slotDate').value = formatDate(new Date());
  $('#slotTime').value = '09:00';
  $('#saveSlot').textContent = 'Book slot';
  renderPaymentStatusField();
  renderInspectionStatusField();
}

function editSlot(id) {
  const slot = slots.find((item) => item.id === id);
  if (!slot) return;
  selectedSlotId = id;
  $('#slotUnit').value = slot.unitId;
  $('#slotDate').value = slot.date;
  $('#slotTime').value = slot.time;
  renderPaymentStatusField();
  renderInspectionStatusField();
  $('#slotNotes').value = slot.notes || '';
  $('#saveSlot').textContent = 'Save changes';
  showToast('Slot opened for editing');
}

function saveSlot() {
  const existing = slots.find((item) => item.id === selectedSlotId);
  const slot = {
    ...existing,
    id: selectedSlotId || `SLOT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    unitId: $('#slotUnit').value,
    date: $('#slotDate').value,
    time: $('#slotTime').value,
    priority: existing?.priority || 'Normal',
    notes: $('#slotNotes').value
  };
  const conflicts = scheduleConflicts(slot);
  if (conflicts.length) {
    const details = conflicts.map(({ inspector, unit }) => `- ${inspector}: ${unit}`).join('\n');
    window.alert(`Schedule conflict: an assigned inspector is booked for another unit at the same date and time.\n\n${details}\n\nThe booking will still be saved.`);
  }
  if (selectedSlotId) slots = slots.map((item) => item.id === selectedSlotId ? slot : item);
  else slots.push(slot);
  persist(selectedSlotId ? 'Inspection slot updated' : 'Inspection slot booked');
  clearForm();
  renderBanner();
  renderScheduleInsights();
  renderUpcoming();
  renderCalendar();
}

function deleteSlot() {
  if (!selectedSlotId) {
    showToast('Select a slot to delete');
    return;
  }
  slots = slots.filter((slot) => slot.id !== selectedSlotId);
  persist('Inspection slot deleted');
  clearForm();
  renderBanner();
  renderScheduleInsights();
  renderUpcoming();
  renderCalendar();
}

$('#slotForm').addEventListener('submit', (event) => {
  event.preventDefault();
  saveSlot();
});
$('#slotUnit').addEventListener('change', () => {
  renderPaymentStatusField();
  renderInspectionStatusField();
});
$('#clearSlot').addEventListener('click', clearForm);
$('#deleteSlot').addEventListener('click', deleteSlot);
$('#prevMonth').addEventListener('click', () => { currentMonth.setMonth(currentMonth.getMonth() - 1); renderCalendar(); });
$('#nextMonth').addEventListener('click', () => { currentMonth.setMonth(currentMonth.getMonth() + 1); renderCalendar(); });
$('#todayButton').addEventListener('click', () => { currentMonth = new Date(); renderCalendar(); });

renderUnits();
clearForm();
renderStatusSummary();
$('#scheduleDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
renderBanner();
renderScheduleInsights();
renderUpcoming();
renderCalendar();
