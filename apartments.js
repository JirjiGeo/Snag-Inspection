const $ = (selector) => document.querySelector(selector);
const storageKey = 'snagline-apartment-record';
const inspectionLinkKey = 'snagline-linked-apartment';
const documentTypes = ['Title deed', 'Oqood', 'Unit layout', 'Quotation', 'Invoice', 'Receipt', 'Inspection report'];
const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
let apartments = saved.apartments || [createApartment()];
let activeApartmentId = saved.activeApartmentId || apartments[0].id;
let documentTarget = null;
let profileEditing = false;

function createApartment(name = 'New apartment') {
  return {
    id: `APT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    record: { ownerName: '', ownerPhone: '', ownerEmail: '', buildingName: '', unitSpace: '', unitBedrooms: 'Studio', unitLayout: 'Simplex', maidRoom: 'Without maid room', outdoorArea: 'Balcony', unitNotes: '', unitStatus: 'To be quoted' },
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

function renderApartmentList() {
  const query = ($('#unitSearch')?.value || '').trim().toLowerCase();
  const visible = apartments.filter((apartment) => apartment.name.toLowerCase().includes(query));
  $('#apartmentList').innerHTML = visible.length ? visible.map((apartment) => `<button class="apartment-card ${apartment.id === activeApartmentId ? 'active' : ''}" data-apartment-id="${apartment.id}"><strong>${apartment.name}</strong><span>${apartment.record.unitBedrooms || 'Bedrooms not set'} · ${apartment.record.unitStatus || 'To be quoted'}</span></button>`).join('') : '<p class="empty-findings">No units match this search.</p>';
  document.querySelectorAll('[data-apartment-id]').forEach((button) => button.addEventListener('click', () => {
    activeApartmentId = button.dataset.apartmentId;
    persist(false);
    renderAll(false);
  }));
}

function renderRecord() {
  const apartment = activeApartment();
  const fields = ['unitName', 'ownerName', 'ownerPhone', 'ownerEmail', 'buildingName', 'unitSpace', 'unitBedrooms', 'unitLayout', 'maidRoom', 'outdoorArea', 'unitNotes', 'unitStatus'];
  fields.forEach((id) => {
    const field = $(`#${id}`);
    if (!field) return;
    field.value = id === 'unitName' ? apartment.name : apartment.record[id] || '';
    field.defaultValue = field.value;
    field.disabled = !profileEditing;
  });
  document.querySelectorAll('.record-panel').forEach((panel) => panel.classList.toggle('is-view', !profileEditing));
  $('#createProfile').textContent = profileEditing ? 'Create profile' : 'Saved';
  $('#editApartment').textContent = profileEditing ? 'Cancel edit' : 'Edit';
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
  ['unitName', 'ownerName', 'ownerPhone', 'ownerEmail', 'buildingName', 'unitSpace', 'unitBedrooms', 'unitLayout', 'maidRoom', 'outdoorArea', 'unitNotes', 'unitStatus'].forEach((id) => {
    $(`#${id}`).addEventListener('input', () => {
      if (!profileEditing) return;
      saveRecord(false);
      renderApartmentList();
    });
  });
}

function saveRecord(show = true) {
  const apartment = activeApartment();
  apartment.name = $('#unitName').value || 'New apartment';
  apartment.record.ownerName = $('#ownerName').value;
  apartment.record.ownerPhone = $('#ownerPhone').value;
  apartment.record.ownerEmail = $('#ownerEmail').value;
  apartment.record.buildingName = $('#buildingName').value;
  apartment.record.unitSpace = $('#unitSpace').value;
  apartment.record.unitBedrooms = $('#unitBedrooms').value;
  apartment.record.unitLayout = $('#unitLayout').value;
  apartment.record.maidRoom = $('#maidRoom').value;
  apartment.record.outdoorArea = $('#outdoorArea').value;
  apartment.record.unitNotes = $('#unitNotes').value;
  apartment.record.unitStatus = $('#unitStatus').value;
  persist(show);
}

function fileToDocument(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result });
    reader.readAsDataURL(file);
  });
}

async function storeFiles(files) {
  if (!documentTarget) return;
  const apartment = activeApartment();
  apartment.documents[documentTarget.type] = apartment.documents[documentTarget.type] || [];
  const converted = await Promise.all([...files].map(fileToDocument));
  if (typeof documentTarget.index === 'number') apartment.documents[documentTarget.type][documentTarget.index] = converted[0];
  else apartment.documents[documentTarget.type].push(...converted);
  persist();
  renderDocuments();
}

function openDocument(target) {
  const [type, index] = target.split(':');
  const file = activeApartment().documents[type]?.[Number(index)];
  if (!file) return;
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
  profileEditing = true;
  documentTarget = null;
  persist(false);
  renderAll(false);
  $('#unitName').focus();
  $('#unitName').select();
}

function createProfile() {
  if (!profileEditing) return;
  saveRecord(false);
  profileEditing = false;
  persist(false);
  renderAll(false);
  showToast('Apartment profile saved');
}

function toggleEdit() {
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
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    unitSpace: '',
    unitBedrooms: '',
    unitNotes: '',
    unitStatus: 'To be quoted'
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
  renderApartmentList();
  renderRecord();
  renderDocuments();
  if (show) persist();
}

$('#documentInput').addEventListener('change', async (event) => {
  await storeFiles(event.target.files);
  event.target.value = '';
});
$('#addUnit').addEventListener('click', addUnit);
$('#createProfile').addEventListener('click', createProfile);
$('#editApartment').addEventListener('click', toggleEdit);
$('#deleteApartment').addEventListener('click', deleteApartment);
$('#openInspection').addEventListener('click', openInspection);
$('#unitSearch').addEventListener('input', renderApartmentList);
profileEditing = false;
bindRecord();
renderAll(false);
