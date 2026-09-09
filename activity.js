const $ = (selector) => document.querySelector(selector);
const storageKey = 'snagline-inspection-schedule';
const apartmentStore = JSON.parse(localStorage.getItem('snagline-apartment-record') || '{}');
const apartments = apartmentStore.apartments || [{ id: 'default-unit', name: 'Unit 1204' }];
const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
let slots = saved.slots || [];
let currentMonth = saved.currentMonth ? new Date(saved.currentMonth) : new Date(2026, 8, 1);
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

function renderUnits() {
  $('#slotUnit').innerHTML = apartments.map((unit) => `<option value="${unit.id}">${unit.name}</option>`).join('');
}

function renderStatusSummary() {
  const stages = ['To be quoted', 'Quoted', 'Paid', 'To be inspected', 'Inspected', 'Report issued', 'Closed'];
  $('#statusSummary').innerHTML = stages.map((stage, index) => {
    const count = apartments.filter((unit) => (unit.record?.unitStatus || 'To be quoted') === stage).length;
    return `<div class="status-card ${index === 3 ? 'accent' : ''}"><span>${stage}</span><strong>${String(count).padStart(2, '0')}</strong></div>`;
  }).join('');
}

function renderBanner() {
  const today = formatDate(new Date());
  const todaySlots = slots.filter((slot) => slot.date === today).sort((a, b) => a.time.localeCompare(b.time));
  $('#todayBanner').innerHTML = todaySlots.length
    ? `<strong>${todaySlots.length} inspection${todaySlots.length === 1 ? '' : 's'} to be inspected today</strong><p>${todaySlots.map((slot) => `${unitName(slot.unitId)} at ${slot.time} (${slot.priority})`).join(' · ')}</p>`
    : '<strong>Today’s inspections</strong><p>No units scheduled for inspection today.</p>';
}

function renderUpcoming() {
  const now = new Date();
  const upcoming = slots
    .filter((slot) => new Date(`${slot.date}T${slot.time}`) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  $('#upcomingList').innerHTML = upcoming.length
    ? upcoming.map((slot) => `<div class="upcoming-item" data-priority="${slot.priority}"><button class="slot-summary" data-slot-id="${slot.id}"><strong>${unitName(slot.unitId)}</strong><span class="slot-meta">${slot.date} · ${slot.time} · ${slot.priority}${slot.notes ? ` · ${slot.notes}` : ''}</span></button><div class="upcoming-actions"><button class="inspect" data-open-inspection="${slot.unitId}">Open inspection</button></div></div>`).join('')
    : '<p class="upcoming-empty">No upcoming inspections booked.</p>';
  document.querySelectorAll('.slot-summary').forEach((item) => item.addEventListener('click', () => editSlot(item.dataset.slotId)));
  document.querySelectorAll('[data-open-inspection]').forEach((button) => button.addEventListener('click', () => openInspection(button.dataset.openInspection)));
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
    cells.push(`<div class="day-cell ${outside ? 'outside' : ''} ${isToday ? 'today' : ''}"><div class="day-number">${date.getDate()}</div>${daySlots.map((slot) => `<button class="slot ${slot.priority.toLowerCase()}" data-slot-id="${slot.id}">${unitName(slot.unitId)}<span class="time">${slot.time} · ${slot.priority}</span></button>`).join('')}</div>`);
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
}

function editSlot(id) {
  const slot = slots.find((item) => item.id === id);
  if (!slot) return;
  selectedSlotId = id;
  $('#slotUnit').value = slot.unitId;
  $('#slotDate').value = slot.date;
  $('#slotTime').value = slot.time;
  $('#slotPriority').value = slot.priority;
  $('#slotNotes').value = slot.notes || '';
  $('#saveSlot').textContent = 'Save changes';
  showToast('Slot opened for editing');
}

function saveSlot() {
  const slot = {
    id: selectedSlotId || `SLOT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    unitId: $('#slotUnit').value,
    date: $('#slotDate').value,
    time: $('#slotTime').value,
    priority: $('#slotPriority').value,
    notes: $('#slotNotes').value
  };
  if (selectedSlotId) slots = slots.map((item) => item.id === selectedSlotId ? slot : item);
  else slots.push(slot);
  persist(selectedSlotId ? 'Inspection slot updated' : 'Inspection slot booked');
  clearForm();
  renderBanner();
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
  renderUpcoming();
  renderCalendar();
}

$('#slotForm').addEventListener('submit', (event) => {
  event.preventDefault();
  saveSlot();
});
$('#clearSlot').addEventListener('click', clearForm);
$('#deleteSlot').addEventListener('click', deleteSlot);
$('#prevMonth').addEventListener('click', () => { currentMonth.setMonth(currentMonth.getMonth() - 1); renderCalendar(); });
$('#nextMonth').addEventListener('click', () => { currentMonth.setMonth(currentMonth.getMonth() + 1); renderCalendar(); });
$('#todayButton').addEventListener('click', () => { currentMonth = new Date(); renderCalendar(); });

renderUnits();
clearForm();
renderStatusSummary();
renderBanner();
renderUpcoming();
renderCalendar();
