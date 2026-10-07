const $ = (selector) => document.querySelector(selector);
const storageKey = 'snagline-apartment-record';
const inspectionLinkKey = 'snagline-linked-apartment';
const scheduleKey = 'snagline-inspection-schedule';
const documentTypes = ['Title deed', 'Oqood', 'Unit layout', 'Quotation', 'Invoice', 'Receipt', 'Client payment proof', 'Inspection report'];
const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
let apartments = saved.apartments || [createApartment()];
let activeApartmentId = saved.activeApartmentId || apartments[0].id;
let documentTarget = null;
let profileEditing = false;
let detailsOpen = false;
let selectedScheduleId = null;
let scheduleDirty = false;

const legacyStages = { 'To be quoted': 'Quote For Approval', Quoted: 'Quote For Approval', Paid: 'For Inspection', 'To be inspected': 'For Inspection', Inspected: 'Completed', 'Report issued': 'Completed', Closed: 'Completed' };
apartments.forEach((apartment) => {
  apartment.record.unitStatus = legacyStages[apartment.record.unitStatus] || apartment.record.unitStatus || 'Quote For Approval';
  apartment.record.inspectionStatus = apartment.record.inspectionStatus || 'To be scheduled';
  if (apartment.record.unitBedrooms === 'Two bedrooms') {
    apartment.record.unitBedrooms = apartment.record.maidRoom === 'With maid room'
      ? 'Two bedrooms with Maid'
      : 'Two bedrooms without Maid';
  }
});

function createApartment(name = 'New apartment') {
  return {
    id: `APT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    record: { soNumber: '', ownerName: '', ownerPhone: '', ownerEmail: '', buildingName: '', unitSpace: '', unitBedrooms: 'Studio', unitLayout: 'Simplex', outdoorArea: 'Balcony', unitStatus: 'Quote For Approval', inspectedBy: '', inspectionStatus: 'To be scheduled', quotedAmount: '', invoicedAmount: '', calculatedArea: '', qbelChargesWithoutVat: '', qbelChargesWithVat: '', firstBridgeWithoutVat: '', firstBridgeWithVat: '', paymentStatus: 'Payment Pending', paymentMethod: '' },
    documents: {}
  };
}

function activeApartment() {
  return apartments.find((apartment) => apartment.id === activeApartmentId) || apartments[0];
}

function persist(show = true) {
  localStorage.setItem(storageKey, JSON.stringify({ apartments, activeApartmentId }));
  localStorage.setItem(inspectionLinkKey, JSON.stringify({ id: activeApartment().id, name: activeApartment().name }));
  window.snagCloudSave?.();
  if (show) showToast();
}

function showToast(message = 'Saved to local workspace') {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function updateInvoice() {
  const quoted = $('#quotedAmount');
  const amount = quoted.valueAsNumber;
  $('#invoicedAmount').value = quoted.value !== '' && quoted.validity.valid && Number.isFinite(amount)
    ? (Math.round((amount * 1.05 + Number.EPSILON) * 100) / 100).toFixed(2)
    : '';
  const areaField = $('#calculatedArea');
  const area = areaField.valueAsNumber;
  const hasArea = areaField.value !== '' && areaField.validity.valid && Number.isFinite(area);
  const formatAmount = (value) => (Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2);
  const rate = area < 800 ? 1 : area <= 1500 ? 0.75 : area <= 3000 ? 0.65 : area <= 5000 ? 0.6 : 0.5;
  const qbelWithoutVat = hasArea ? formatAmount(area * rate) : '';
  const qbelWithVat = hasArea ? formatAmount(Number(qbelWithoutVat) * 1.05) : '';
  const hasQuote = $('#invoicedAmount').value !== '';
  $('#qbelChargesWithoutVat').value = qbelWithoutVat;
  $('#qbelChargesWithVat').value = qbelWithVat;
  $('#firstBridgeWithoutVat').value = hasArea && hasQuote ? formatAmount(amount - Number(qbelWithoutVat)) : '';
  $('#firstBridgeWithVat').value = hasArea && hasQuote ? formatAmount(Number($('#invoicedAmount').value) - Number(qbelWithVat)) : '';
}

function updatePaymentStatus() {
  const paid = $('#paymentStatus').value === 'Paid';
  $('#paymentMethodField').hidden = !paid;
  $('#paymentMethod').disabled = !profileEditing || !paid;
  if (!paid) $('#paymentMethod').value = '';
}

function inspectionSchedule(unitId, slots) {
  const bookings = slots.filter((slot) => slot.unitId === unitId && slot.date)
    .sort((first, second) => `${first.date}T${first.time}`.localeCompare(`${second.date}T${second.time}`));
  const now = new Date();
  return bookings.find((slot) => new Date(`${slot.date}T${slot.time || '23:59'}`) >= now) || bookings[bookings.length - 1];
}

function renderApartmentList() {
  const query = ($('#unitSearch')?.value || '').trim().toLowerCase();
  const slots = JSON.parse(localStorage.getItem(scheduleKey) || '{}').slots || [];
  const reminderDate = new Date();
  reminderDate.setDate(reminderDate.getDate() + 2);
  const reminderKey = `${reminderDate.getFullYear()}-${String(reminderDate.getMonth() + 1).padStart(2, '0')}-${String(reminderDate.getDate()).padStart(2, '0')}`;
  const visible = apartments.filter((apartment) => apartment.name.toLowerCase().includes(query))
    .map((apartment) => ({ apartment, schedule: inspectionSchedule(apartment.id, slots) }))
    .sort((first, second) => {
      const firstCompleted = first.apartment.record.unitStatus === 'Completed' || first.apartment.record.inspectionStatus === 'Completed';
      const secondCompleted = second.apartment.record.unitStatus === 'Completed' || second.apartment.record.inspectionStatus === 'Completed';
      return Number(firstCompleted) - Number(secondCompleted)
        || Number(!first.schedule) - Number(!second.schedule)
        || `${first.schedule?.date || ''}T${first.schedule?.time || ''}`.localeCompare(`${second.schedule?.date || ''}T${second.schedule?.time || ''}`);
    });
  $('#apartmentList').innerHTML = visible.length ? visible.map(({ apartment, schedule }) => {
    const date = schedule ? new Date(`${schedule.date}T${schedule.time || '00:00'}`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not scheduled';
    const status = apartment.record.unitStatus || 'Quote For Approval';
    const paymentStatus = apartment.record.paymentStatus || 'Payment Pending';
    const upcoming = schedule?.date === reminderKey;
    return `<button class="apartment-card ${status === 'Completed' ? 'is-completed' : ''} ${upcoming ? 'is-upcoming' : ''}" data-apartment-id="${escapeHtml(apartment.id)}"><dl><div><dt>Unit number</dt><dd><strong>${escapeHtml(apartment.name)}</strong></dd></div><div><dt>Bedrooms</dt><dd>${escapeHtml(apartment.record.unitBedrooms || 'Not set')}</dd></div><div><dt>Status</dt><dd>${escapeHtml(status)}</dd></div><div><dt>Payment status</dt><dd class="payment-status ${paymentStatus === 'Paid' ? 'is-paid' : 'is-pending'}">${escapeHtml(paymentStatus)}</dd></div><div><dt>Inspection date</dt><dd class="inspection-date">${escapeHtml(date)}</dd></div><div><dt>Inspection time</dt><dd>${escapeHtml(schedule?.time || 'Not set')}</dd></div><div><dt>Inspected by</dt><dd>${escapeHtml(apartment.record.inspectedBy || 'Not set')}</dd></div></dl></button>`;
  }).join('') : '<p class="empty-findings">No units match this search.</p>';
  document.querySelectorAll('[data-apartment-id]').forEach((button) => button.addEventListener('click', () => {
    activeApartmentId = button.dataset.apartmentId;
    selectedScheduleId = null;
    scheduleDirty = false;
    detailsOpen = true;
    profileEditing = true;
    documentTarget = null;
    persist(false);
    renderAll(false);
    $('#unitName').focus();
  }));
}

function updateScheduleRequirements() {
  $('#inspectionDate').required = Boolean($('#inspectionTime').value);
  $('#inspectionTime').required = Boolean($('#inspectionDate').value);
}

function renderInspectionSchedule() {
  if (scheduleDirty) return;
  const slots = JSON.parse(localStorage.getItem(scheduleKey) || '{}').slots || [];
  const slot = slots.find((item) => item.id === selectedScheduleId && item.unitId === activeApartment().id)
    || inspectionSchedule(activeApartment().id, slots);
  selectedScheduleId = slot?.id || null;
  ['inspectionDate', 'inspectionTime'].forEach((id) => {
    const field = $(`#${id}`);
    field.value = slot?.[id === 'inspectionDate' ? 'date' : 'time'] || '';
    field.defaultValue = field.value;
    field.disabled = !profileEditing;
  });
  updateScheduleRequirements();
}

function saveInspectionSchedule() {
  if (!scheduleDirty || !$('#inspectionDate').validity.valid || !$('#inspectionTime').validity.valid) return;
  const schedule = JSON.parse(localStorage.getItem(scheduleKey) || '{}');
  schedule.slots = schedule.slots || [];
  const date = $('#inspectionDate').value;
  const time = $('#inspectionTime').value;
  const slot = schedule.slots.find((item) => item.id === selectedScheduleId && item.unitId === activeApartment().id);
  if (!date && !time) {
    if (slot) schedule.slots = schedule.slots.filter((item) => item.id !== slot.id);
    selectedScheduleId = null;
  } else if (slot) {
    slot.date = date;
    slot.time = time;
  } else {
    selectedScheduleId = `SLOT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    schedule.slots.push({ id: selectedScheduleId, unitId: activeApartment().id, date, time, priority: 'Normal', notes: '' });
  }
  localStorage.setItem(scheduleKey, JSON.stringify(schedule));
  scheduleDirty = false;
}

function renderRecord() {
  const apartment = activeApartment();
  const fields = ['unitName', 'soNumber', 'ownerName', 'ownerPhone', 'ownerEmail', 'buildingName', 'unitSpace', 'unitBedrooms', 'unitLayout', 'outdoorArea', 'unitStatus', 'inspectedBy', 'inspectionStatus', 'quotedAmount', 'invoicedAmount', 'calculatedArea', 'qbelChargesWithoutVat', 'qbelChargesWithVat', 'firstBridgeWithoutVat', 'firstBridgeWithVat', 'paymentStatus', 'paymentMethod'];
  fields.forEach((id) => {
    const field = $(`#${id}`);
    if (!field) return;
    field.value = id === 'unitName' ? apartment.name : apartment.record[id] || (id === 'paymentStatus' ? 'Payment Pending' : '');
    field.defaultValue = field.value;
    field.disabled = !profileEditing;
  });
  document.querySelectorAll('.record-panel').forEach((panel) => panel.classList.toggle('is-view', !profileEditing));
  updateInvoice();
  updatePaymentStatus();
  renderInspectionSchedule();
  $('#detailTitle').textContent = apartment.name;
  $('#createProfile').textContent = profileEditing ? 'Save profile' : 'Saved';
  $('#createProfile').disabled = !profileEditing;
  $('#editApartment').textContent = profileEditing ? 'Finish editing' : 'Edit';
}

function renderDocuments() {
  const apartment = activeApartment();
  $('#documentGrid').innerHTML = documentTypes.map((type) => {
    const files = apartment.documents[type] || [];
    return `<div class="document-card"><strong>${type}</strong><div class="document-actions"><button data-doc-type="${type}">Add</button><span>${files.length} file${files.length === 1 ? '' : 's'}</span></div><div class="document-list">${files.length ? files.map((file, index) => `<div class="document-row"><button class="document-link" data-open-doc="${type}:${index}" title="${file.name}">${file.name}</button><div class="document-row-actions"><button data-replace-doc="${type}:${index}" title="Replace">↻</button><button data-remove-doc="${type}:${index}" title="Delete">×</button></div></div>`).join('') : '<span>No document attached</span>'}</div></div>`;
  }).join('');

  document.querySelectorAll('[data-doc-type]').forEach((button) => button.addEventListener('click', () => {
    documentTarget = { type: button.dataset.docType };
    $('#documentInput').click();
  }));
  document.querySelectorAll('[data-open-doc]').forEach((button) => button.addEventListener('click', () => openDocument(button.dataset.openDoc)));
  document.querySelectorAll('[data-remove-doc]').forEach((button) => button.addEventListener('click', () => removeDocument(button.dataset.removeDoc)));
  document.querySelectorAll('[data-replace-doc]').forEach((button) => button.addEventListener('click', () => {
    const [type, index] = button.dataset.replaceDoc.split(':');
    documentTarget = { type, index: Number(index) };
    $('#documentInput').click();
  }));
}

function bindRecord() {
  ['inspectionDate', 'inspectionTime'].forEach((id) => {
    $(`#${id}`).addEventListener('input', () => {
      if (!profileEditing) return;
      scheduleDirty = true;
      updateScheduleRequirements();
      if (!$('#quotedAmount').validity.valid || !$('#calculatedArea').validity.valid) return;
      saveRecord(false);
      renderApartmentList();
    });
  });
  ['unitName', 'soNumber', 'ownerName', 'ownerPhone', 'ownerEmail', 'buildingName', 'unitSpace', 'unitBedrooms', 'unitLayout', 'outdoorArea', 'unitStatus', 'inspectedBy', 'inspectionStatus', 'quotedAmount', 'calculatedArea', 'paymentStatus', 'paymentMethod'].forEach((id) => {
    $(`#${id}`).addEventListener('input', () => {
      if (!profileEditing) return;
      updateInvoice();
      updatePaymentStatus();
      if (!$('#quotedAmount').validity.valid || !$('#calculatedArea').validity.valid) return;
      saveRecord(false);
      $('#detailTitle').textContent = activeApartment().name;
      renderApartmentList();
    });
  });
}

function saveRecord(show = true) {
  const apartment = activeApartment();
  apartment.name = $('#unitName').value || 'New apartment';
  apartment.record.soNumber = $('#soNumber').value;
  apartment.record.ownerName = $('#ownerName').value;
  apartment.record.ownerPhone = $('#ownerPhone').value;
  apartment.record.ownerEmail = $('#ownerEmail').value;
  apartment.record.buildingName = $('#buildingName').value;
  apartment.record.unitSpace = $('#unitSpace').value;
  apartment.record.unitBedrooms = $('#unitBedrooms').value;
  apartment.record.unitLayout = $('#unitLayout').value;
  apartment.record.outdoorArea = $('#outdoorArea').value;
  apartment.record.unitStatus = $('#unitStatus').value;
  apartment.record.inspectedBy = $('#inspectedBy').value;
  apartment.record.inspectionStatus = $('#inspectionStatus').value;
  updateInvoice();
  apartment.record.quotedAmount = $('#quotedAmount').value;
  apartment.record.invoicedAmount = $('#invoicedAmount').value;
  apartment.record.calculatedArea = $('#calculatedArea').value;
  apartment.record.qbelChargesWithoutVat = $('#qbelChargesWithoutVat').value;
  apartment.record.qbelChargesWithVat = $('#qbelChargesWithVat').value;
  apartment.record.firstBridgeWithoutVat = $('#firstBridgeWithoutVat').value;
  apartment.record.firstBridgeWithVat = $('#firstBridgeWithVat').value;
  updatePaymentStatus();
  apartment.record.paymentStatus = $('#paymentStatus').value;
  apartment.record.paymentMethod = $('#paymentMethod').value;
  saveInspectionSchedule();
  persist(show);
}

async function fileToDocument(file, unitId) {
  const uploaded = await window.snagCloudUploadDocument?.(file, unitId);
  if (uploaded) return uploaded;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result });
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.onabort = () => reject(new Error('File reading was cancelled'));
    reader.readAsDataURL(file);
  });
}

async function storeFiles(files) {
  if (!documentTarget || !files.length) return;
  const apartment = activeApartment();
  const target = { ...documentTarget };
  const previous = apartment.documents[target.type] || [];
  showToast('Uploading documents...');
  const converted = await Promise.all([...files].map((file) => fileToDocument(file, apartment.id)));
  const next = [...previous];
  if (typeof target.index === 'number') next[target.index] = converted[0];
  else next.push(...converted);
  apartment.documents[target.type] = next;
  try {
    persist(false);
  } catch (error) {
    apartment.documents[target.type] = previous;
    throw error;
  }
  if (activeApartment().id === apartment.id) renderDocuments();
  showToast('Documents uploaded');
}

async function openDocument(target) {
  const [type, index] = target.split(':');
  const file = activeApartment().documents[type]?.[Number(index)];
  if (!file) return;
  if (file.cloudPath) {
    try {
      await window.snagCloudOpenDocument(file);
    } catch (error) {
      showToast(error.message);
    }
    return;
  }
  const link = document.createElement('a');
  link.href = file.data;
  link.download = file.name;
  link.target = '_blank';
  link.click();
}

function removeDocument(target) {
  const [type, index] = target.split(':');
  activeApartment().documents[type].splice(Number(index), 1);
  persist();
  renderDocuments();
}

function addUnit() {
  const apartment = createApartment(`Unit ${apartments.length + 1}`);
  apartments = [...apartments, apartment];
  activeApartmentId = apartment.id;
  detailsOpen = true;
  profileEditing = true;
  documentTarget = null;
  persist(false);
  renderAll(false);
  $('#unitName').focus();
  $('#unitName').select();
}

function createProfile() {
  if (!profileEditing) return;
  if (!$('#quotedAmount').reportValidity() || !$('#calculatedArea').reportValidity()) return;
  if (scheduleDirty && (!$('#inspectionDate').reportValidity() || !$('#inspectionTime').reportValidity())) return;
  saveRecord(false);
  profileEditing = false;
  persist(false);
  renderAll(false);
  showToast('Apartment profile saved');
}

function toggleEdit() {
  if (profileEditing) {
    createProfile();
    return;
  }
  profileEditing = !profileEditing;
  renderAll(false);
  if (profileEditing) {
    showToast('Editing apartment profile');
    $('#unitName').focus();
  }
}

function clearApartmentForm(cleanName) {
  const values = {
    unitName: cleanName,
    soNumber: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    unitSpace: '',
    unitBedrooms: '',
    unitStatus: 'Quote For Approval',
    inspectedBy: '',
    inspectionStatus: 'To be scheduled'
  };
  Object.entries(values).forEach(([id, value]) => {
    const field = $(`#${id}`);
    if (!field) return;
    field.value = value;
    field.defaultValue = value;
    field.dispatchEvent(new Event('input', { bubbles: false }));
  });
}

function deleteApartment() {
  if (apartments.length <= 1) {
    showToast('At least one apartment must remain');
    return;
  }
  apartments = apartments.filter((apartment) => apartment.id !== activeApartmentId);
  activeApartmentId = apartments[0].id;
  detailsOpen = false;
  profileEditing = false;
  documentTarget = null;
  persist(false);
  renderAll(false);
  showToast('Apartment deleted');
}

function openInspection() {
  persist(false);
  window.location.href = 'inspection.html';
}

function renderAll(show = true) {
  $('#apartmentOverview').hidden = detailsOpen;
  $('#apartmentDetails').hidden = !detailsOpen;
  $('#addUnit').hidden = detailsOpen;
  renderApartmentList();
  renderRecord();
  renderDocuments();
  if (show) persist();
}

$('#documentInput').addEventListener('change', async (event) => {
  try {
    await storeFiles(event.target.files);
  } catch (error) {
    showToast(error.name === 'QuotaExceededError' ? 'Browser storage is full. Sign in to cloud and retry.' : error.message);
  } finally {
    event.target.value = '';
  }
});
$('#addUnit').addEventListener('click', addUnit);
$('#backToApartments').addEventListener('click', () => {
  if (profileEditing) {
    if (!$('#quotedAmount').reportValidity() || !$('#calculatedArea').reportValidity()) return;
    if (scheduleDirty && (!$('#inspectionDate').reportValidity() || !$('#inspectionTime').reportValidity())) return;
    saveRecord(false);
  }
  detailsOpen = false;
  profileEditing = false;
  documentTarget = null;
  renderAll(false);
  $('#unitSearch').focus();
});
$('#createProfile').addEventListener('click', createProfile);
$('#editApartment').addEventListener('click', toggleEdit);
$('#deleteApartment').addEventListener('click', deleteApartment);
$('#openInspection').addEventListener('click', openInspection);
$('#unitSearch').addEventListener('input', renderApartmentList);
window.addEventListener('focus', renderApartmentList);
window.addEventListener('snag-cloud-documents-updated', () => {
  const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
  for (const saved of stored.apartments || []) {
    const apartment = apartments.find((unit) => unit.id === saved.id);
    if (apartment) apartment.documents = saved.documents || {};
  }
  renderDocuments();
});
window.addEventListener('storage', (event) => {
  if (event.key === scheduleKey) {
    renderApartmentList();
    renderInspectionSchedule();
  }
});
profileEditing = false;
bindRecord();
renderAll(false);
