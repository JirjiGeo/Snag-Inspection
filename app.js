const legacyAreaNames = ['Entrance & Corridor', 'Living & Dining Area', 'Kitchen', 'Master Bedroom', 'Second Bedroom', 'Third Bedroom', 'Maid Bedroom', 'Master Bathroom', 'Second Bathroom', 'Third Bathroom', 'Maid Bathroom', 'Guest Bathroom', 'Master Dressing Room', 'Second Dressing Room', 'Third Dressing Room', 'Washing Room', 'Storage Room', 'Lounge', 'Garden', 'Balcony', 'Staircase', 'MEP System'];
const twoBedroomAreas = ['Entrance & Corridor', 'Guest Bathroom', 'Kitchen', 'Living & Dining Area', 'Balcony', 'Master Bedroom', 'Master Bathroom', 'Second Bedroom', 'Second Bathroom'];
const threeBedroomAreas = [...twoBedroomAreas, 'Third Bedroom', 'Third Bathroom'];
const layoutAreas = {
  studio: ['Entrance & Corridor', 'Kitchen', 'Bathroom', 'Living Area', 'Balcony'],
  'one bedroom': ['Entrance & Corridor', 'Guest Bathroom', 'Kitchen', 'Living & Dining Area', 'Balcony', 'Master Bedroom', 'Master Bathroom'],
  'two bedrooms without maid': twoBedroomAreas,
  'two bedrooms with maid': [...twoBedroomAreas, 'Maid Bedroom', 'Maid Bathroom'],
  'three bedrooms': threeBedroomAreas,
  townhouse: [...threeBedroomAreas, 'Maid Bedroom', 'Maid Bathroom', 'Master Dressing Room', 'Second Dressing Room', 'Third Dressing Room', 'Washing Room', 'Storage Room', 'Lounge', 'Garden', 'Balcony', 'Staircase', 'MEP System'],
  penthouse: [...threeBedroomAreas, 'Maid Bedroom', 'Maid Bathroom', 'Master Dressing Room', 'Second Dressing Room', 'Third Dressing Room', 'Washing Room', 'Storage Room', 'Lounge', 'Garden', 'Balcony', 'Staircase', 'MEP System']
};

const apartmentStore = JSON.parse(localStorage.getItem('snagline-apartment-record') || '{}');
let savedApartments = apartmentStore.apartments || [];
function makeInspections(apartments) { return apartments.length ? apartments.map((apartment, index) => ({ id: apartment.id, unit: apartment.name, building: apartment.record.buildingName || apartment.record.ownerName || 'Apartment record', layout: apartment.record.unitBedrooms || 'Studio', level: apartment.record.unitSpace || `Unit ${index + 1}`, progress: 0, checked: 0, snags: 0, status: 'In progress', updated: 'Updated now' })) : [
  { id: '1204', unit: 'Unit 1204', building: 'Marina Heights', layout: '2 bedrooms', level: 'Level 12', progress: 42, checked: 3, snags: 4, status: 'In progress', updated: 'Updated 18 min ago' },
  { id: '0702', unit: 'Unit 0702', building: 'Cedar House', layout: '1 bedroom', level: 'Level 7', progress: 76, checked: 6, snags: 2, status: 'In progress', updated: 'Updated yesterday' }
]; }
let inspections = makeInspections(savedApartments);
const linkedApartment = JSON.parse(localStorage.getItem('snagline-linked-apartment') || '{}');
let activeInspection = inspections.find((inspection) => inspection.id === linkedApartment.id) || inspections[0];
let activeAreaIndex = 0;
let areaState = {};
let findings = {};
let inspectionMeta = {};
let editingFindingIndex = null;
let findingViewMode = 'view';
let attachmentTarget = null;
let pendingFindingFiles = [];

const $ = (selector) => document.querySelector(selector);
const storageKey = 'snagline-inspection-state';
const maxPhotoDataLength = 100_000;
let lastPersistError = null;
const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
areaState = saved.areaState || {};
findings = saved.findings || {};
inspectionMeta = saved.inspectionMeta || {};

function areasFor(inspection) {
  const bedroomSelection = inspection.layout?.trim().toLowerCase();
  const aliases = { '1 bedroom': 'one bedroom', '2 bedrooms': 'two bedrooms without maid', 'two bedrooms': 'two bedrooms without maid' };
  return layoutAreas[aliases[bedroomSelection] || bedroomSelection] || layoutAreas.studio;
}
function stateKey() { return `${activeInspection.id}-${areasFor(activeInspection)[activeAreaIndex]}`; }
function isStorageQuotaError(error) { return error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || error.code === 22 || error.code === 1014; }
function persist() {
  lastPersistError = null;
  try {
    localStorage.setItem(storageKey, JSON.stringify({ areaState, findings, inspectionMeta }));
  } catch (error) {
    lastPersistError = error;
    const message = isStorageQuotaError(error)
      ? 'This app has reached its browser storage limit, which is separate from your phone storage. Remove or reduce saved photos, then try again.'
      : `Could not save this inspection: ${error.message}`;
    showToast(message);
    return false;
  }
  window.snagCloudSave?.();
  showToast('Saved on this device');
  return true;
}
function showToast(message = 'Saved on this device') { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 2800); }

function migrateLegacyAreaKeys() {
  [findings, areaState].forEach((records) => {
    Object.entries(records).forEach(([key, value]) => {
      const match = key.match(/^(.*)-(\d+)$/);
      if (!match) return;
      const area = legacyAreaNames[Number(match[2])];
      if (!area) return;
      const migratedKey = `${match[1]}-${area}`;
      if (records[migratedKey] === undefined) records[migratedKey] = value;
      delete records[key];
      if (records === findings) (records[migratedKey] || []).forEach((finding) => { finding.area = finding.area || area; });
    });
  });
}
migrateLegacyAreaKeys();

function renderQueue() {
  $('#inspectionList').innerHTML = inspections.map((inspection) => `<article class="inspection-item ${inspection.id === activeInspection.id ? 'selected' : ''}" data-id="${inspection.id}" data-status="${inspection.status}">
    <div class="item-top"><h3>${inspection.unit}</h3><span class="small-status ${inspection.status === 'Ready to sign off' ? 'ready' : 'progress'}">${inspection.status === 'Ready to sign off' ? 'Ready' : 'Active'}</span></div>
    <span class="item-meta">${inspection.building} · ${inspection.layout}</span><div class="mini-progress"><span style="width:${inspection.progress}%"></span></div>
    <div class="item-bottom"><span>${inspection.progress}% complete</span><span>${inspection.updated.replace('Updated ', '')}</span></div></article>`).join('');
  document.querySelectorAll('.inspection-item').forEach((item) => item.addEventListener('click', () => selectInspection(item.dataset.id)));
}

function setupFilters() {
  const filters = document.querySelectorAll('.filter');
  filters.forEach((filter) => filter.addEventListener('click', () => {
    filters.forEach((item) => item.classList.remove('active'));
    filter.classList.add('active');
    const mode = filter.textContent.toLowerCase();
    document.querySelectorAll('.inspection-item').forEach((item) => {
      const isReady = item.dataset.status === 'Ready to sign off';
      item.hidden = mode.includes('ready') ? !isReady : mode.includes('progress') ? isReady : false;
    });
  }));
}

function selectInspection(id) { activeInspection = inspections.find((item) => item.id === id) || inspections[0]; localStorage.setItem('snagline-linked-apartment', JSON.stringify({ id: activeInspection.id, name: activeInspection.unit })); activeAreaIndex = 0; renderAll(); }
function areaStatus(inspectionId, area) { return (findings[`${inspectionId}-${area}`] || []).length ? 'issue' : 'pending'; }
function renderAreas() {
  const areas = areasFor(activeInspection);
  $('#areaCount').textContent = `${areas.length} areas`;
  $('#areaList').innerHTML = areas.map((area, index) => { const state = areaStatus(activeInspection.id, area); return `<button class="area-button ${index === activeAreaIndex ? 'active' : ''} ${state}" data-index="${index}"><span>${area}</span><span class="area-state">${state === 'done' ? '✓' : state === 'issue' ? '!' : '○'}</span></button>`; }).join('');
  document.querySelectorAll('.area-button').forEach((button) => button.addEventListener('click', () => { activeAreaIndex = Number(button.dataset.index); renderAreas(); renderAreaDetail(); }));
}
function renderAreaDetail() {
  const area = areasFor(activeInspection)[activeAreaIndex];
  const key = stateKey();
  const currentFindings = findings[key] || [];
  $('#areaDetail').innerHTML = `<h3>${area}</h3><p>Add as many findings as needed for this area. Each finding can be tracked separately.</p>
  <div class="manual-findings"><div class="finding-entry new-finding-card"><div class="entry-label">New finding</div><label>Description<input id="findingInput" type="text" placeholder="Describe a finding, defect, or action required"></label><label>Note<textarea id="findingNote" placeholder="Add a note for this finding"></textarea></label><div class="attachment-field"><span>Attachments</span><div class="attachment-controls"><label for="findingAttachments" class="button button-outline file-picker-button">Choose photos</label><label id="takeFindingPhoto" for="findingCameraInput" class="button button-outline file-picker-button">Take photo</label></div><input id="findingAttachments" type="file" accept="image/*" multiple hidden></div><div class="attachment-preview" id="attachmentPreview"></div><button id="addFinding" class="button button-dark">Add finding</button></div>${editingFindingIndex !== null && currentFindings[editingFindingIndex] ? findingEditor(currentFindings[editingFindingIndex]) : ''}<div class="findings-heading"><strong>Findings summary</strong><span>${currentFindings.length} added</span></div><div class="finding-list">${currentFindings.length ? currentFindings.map((finding, index) => `<div class="finding-card ${editingFindingIndex === index ? 'editing' : ''}" data-edit-finding="${index}"><div><strong>${finding.text}</strong>${finding.note ? `<p class="finding-note">${finding.note}</p>` : ''}<span class="finding-meta"><span>${finding.status || 'Open'}</span><span>${(finding.attachments || []).length} attachments</span></span></div><div class="finding-actions"><button data-view-finding="${index}">View</button><button data-edit-action="${index}">Edit</button><button class="remove-finding" data-remove-finding="${index}" aria-label="Remove finding">×</button></div></div>`).join('') : '<p class="empty-findings">No raised findings for this area.</p>'}</div></div>
`;
  $('#findingAttachments').addEventListener('change', (event) => stageFindingFiles(event));
  $('#findingCameraInput').onchange = (event) => stageFindingFiles(event);
  $('#takeFindingPhoto').addEventListener('click', requireSecureCamera);
  $('#addFinding').addEventListener('click', addFinding);
  document.querySelectorAll('[data-edit-finding]').forEach((card) => card.addEventListener('click', (event) => { if (!event.target.closest('button')) { editingFindingIndex = Number(card.dataset.editFinding); renderAreaDetail(); } }));
  document.querySelectorAll('[data-view-finding]').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); editingFindingIndex = Number(button.dataset.viewFinding); findingViewMode = 'view'; renderAreaDetail(); }));
  document.querySelectorAll('[data-edit-action]').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); editingFindingIndex = Number(button.dataset.editAction); findingViewMode = 'edit'; renderAreaDetail(); }));
  document.querySelectorAll('[data-remove-finding]').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); findings[key].splice(Number(button.dataset.removeFinding), 1); editingFindingIndex = null; persist(); renderAreas(); renderAreaDetail(); }));
  if (editingFindingIndex !== null && currentFindings[editingFindingIndex]) bindFindingEditor(currentFindings[editingFindingIndex]);
}
function findingEditor(finding) {
  const attachments = finding.attachments || [];
  if (findingViewMode === 'view') return `<div class="finding-editor"><div class="editor-heading"><strong>View finding</strong><button id="closeFindingEditor" aria-label="Close finding editor">×</button></div><div class="finding-view"><h4>${finding.text}</h4><p>${finding.note || 'No note added.'}</p><div class="finding-meta"><span>${finding.status || 'Open'}</span><span>${attachments.length} attachments</span></div><div class="photo-grid">${attachments.map((file) => `<img class="photo-thumb" src="${file.data}" alt="${file.name}">`).join('')}</div></div></div>`;
  return `<div class="finding-editor"><div class="editor-heading"><strong>Edit finding</strong><button id="closeFindingEditor" aria-label="Close finding editor">×</button></div><input id="editFindingText" value="${finding.text.replace(/"/g, '&quot;')}" aria-label="Finding description"><label class="notes-field editor-note">Note<textarea id="editFindingNote">${finding.note || ''}</textarea></label><div class="editor-row"><select id="editFindingStatus" aria-label="Finding status"><option ${finding.status === 'Open' ? 'selected' : ''}>Open</option><option ${finding.status === 'In progress' ? 'selected' : ''}>In progress</option><option ${finding.status === 'Resolved' ? 'selected' : ''}>Resolved</option></select><button id="saveFinding" class="button button-dark">Save changes</button></div><div class="finding-attachments"><div class="photo-heading"><strong>Finding photos</strong><span>${attachments.length} attached</span></div><div class="attachment-controls"><label for="editAttachmentInput" id="addAttachment" class="button button-outline file-picker-button">Choose photos</label><label for="editCameraInput" id="takeEditPhoto" class="button button-outline file-picker-button">Take photo</label></div><div class="attachment-grid">${attachments.map((file, index) => `<div class="attachment-card"><img src="${file.data}" alt="${file.name}"><div class="attachment-actions"><button data-replace-attachment="${index}">Replace</button><button data-remove-attachment="${index}">Remove</button></div></div>`).join('') || '<p class="empty-findings">No photos attached.</p>'}</div></div></div>`;
}
function requireSecureCamera(event) {
  if (window.isSecureContext) return;
  event.preventDefault();
  showToast('Camera access needs the secure HTTPS app address.');
}
function bindFindingEditor(finding) { $('#closeFindingEditor').addEventListener('click', () => { editingFindingIndex = null; renderAreaDetail(); }); if (findingViewMode !== 'edit') return; $('#saveFinding').addEventListener('click', () => { finding.text = $('#editFindingText').value.trim() || finding.text; finding.note = $('#editFindingNote').value; finding.status = $('#editFindingStatus').value; persist(); editingFindingIndex = null; renderAreaDetail(); }); $('#addAttachment').addEventListener('click', () => { attachmentTarget = { finding, index: null }; }); $('#takeEditPhoto').addEventListener('click', requireSecureCamera); document.querySelectorAll('[data-replace-attachment]').forEach((button) => button.addEventListener('click', () => { attachmentTarget = { finding, index: Number(button.dataset.replaceAttachment) }; $('#editAttachmentInput').click(); })); document.querySelectorAll('[data-remove-attachment]').forEach((button) => button.addEventListener('click', () => { finding.attachments.splice(Number(button.dataset.removeAttachment), 1); persist(); renderAreaDetail(); })); }
function stageFindingFiles(event) { const files = [...event.target.files].filter((file) => file.type.startsWith('image/')); if (files.length) pendingFindingFiles.push(...files); event.target.value = ''; renderAttachmentPreview(); }
function renderAttachmentPreview() { $('#attachmentPreview').innerHTML = pendingFindingFiles.map((file) => `<span class="attachment-pill">${file.name}</span>`).join(''); }
function loadImage(file) {
  const loadWithImage = () => new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => resolve({ source: image, width: image.naturalWidth, height: image.naturalHeight, close: () => URL.revokeObjectURL(url) });
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Cannot open ${file.name}. On iPhone, set Camera > Formats to Most Compatible, then try again.`)); };
    image.src = url;
  });
  if (!('createImageBitmap' in window)) return loadWithImage();
  return createImageBitmap(file)
    .then((bitmap) => ({ source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() }))
    .catch(loadWithImage);
}
async function readAttachment(file, maxDataLength = maxPhotoDataLength, maxDimension = 1024) {
  if (!file.type.startsWith('image/')) throw new Error(`"${file.name}" is not an image.`);
  const image = await loadImage(file);
  try {
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Photo processing is unavailable in this browser.');
    context.drawImage(image.source, 0, 0, canvas.width, canvas.height);
    let quality = 0.62;
    let data = canvas.toDataURL('image/jpeg', quality);
    while (data.length > maxDataLength && quality > 0.38) {
      quality = Math.max(0.38, quality - 0.08);
      data = canvas.toDataURL('image/jpeg', quality);
    }
    while (data.length > maxDataLength && canvas.width > 320) {
      canvas.width = Math.round(canvas.width * 0.8);
      canvas.height = Math.round(canvas.height * 0.8);
      context.drawImage(image.source, 0, 0, canvas.width, canvas.height);
      data = canvas.toDataURL('image/jpeg', 0.48);
    }
    if (data.length > maxDataLength) throw new Error(`"${file.name}" could not be reduced enough to fit this browser's storage limit. Choose a smaller image.`);
    return { name: file.name.replace(/\.[^.]+$/, '.jpg'), type: 'image/jpeg', data };
  } finally {
    image.close();
  }
}
async function readAttachments(files) { const attachments = []; for (const file of files) attachments.push(await readAttachment(file)); return attachments; }
async function compactFindingsForStorage() {
  const compactedFindings = JSON.parse(JSON.stringify(findings));
  let changed = false;
  for (const areaFindings of Object.values(compactedFindings)) {
    for (const finding of areaFindings) {
      for (let index = 0; index < (finding.attachments || []).length; index += 1) {
        const attachment = finding.attachments[index];
        if (!attachment.data?.startsWith('data:image/')) continue;
        const response = await fetch(attachment.data);
        const blob = await response.blob();
        const file = new File([blob], attachment.name || 'inspection-photo', { type: attachment.type || blob.type });
        const compressed = await readAttachment(file, 25_000, 640);
        if (compressed.data.length < attachment.data.length) {
          finding.attachments[index] = { ...attachment, ...compressed, name: attachment.name || compressed.name };
          changed = true;
        }
      }
    }
  }
  if (!changed) return false;
  try {
    localStorage.setItem(storageKey, JSON.stringify({ areaState, findings: compactedFindings, inspectionMeta }));
  } catch (error) {
    const message = isStorageQuotaError(error)
      ? 'This app has reached the browser storage limit. Remove some saved photos, then try again.'
      : `Could not save this inspection: ${error.message}`;
    showToast(message);
    return false;
  }
  findings = compactedFindings;
  window.snagCloudSave?.();
  showToast('Photos reduced and finding saved on this device');
  return true;
}
async function compactStoredPhotos() {
  const compactedFindings = JSON.parse(JSON.stringify(findings));
  let changed = false;
  for (const areaFindings of Object.values(compactedFindings)) {
    for (const finding of areaFindings) {
      for (let index = 0; index < (finding.attachments || []).length; index += 1) {
        const attachment = finding.attachments[index];
        if (!attachment.data?.startsWith('data:image/') || attachment.data.length <= maxPhotoDataLength) continue;
        const response = await fetch(attachment.data);
        const blob = await response.blob();
        const file = new File([blob], attachment.name || 'inspection-photo', { type: attachment.type || blob.type });
        const compressed = await readAttachment(file);
        finding.attachments[index] = { ...attachment, ...compressed, name: attachment.name || compressed.name };
        changed = true;
      }
    }
  }
  if (!changed) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify({ areaState, findings: compactedFindings, inspectionMeta }));
  } catch (error) {
    const message = isStorageQuotaError(error)
      ? 'This app has reached its browser storage limit, which is separate from your phone storage. Remove saved photos to make room.'
      : `Could not optimize saved inspection photos: ${error.message}`;
    showToast(message);
    return;
  }
  findings = compactedFindings;
  window.snagCloudSave?.();
  renderAll();
}
async function addFinding() {
  const input = $('#findingInput');
  const text = input.value.trim();
  if (!text) { input.focus(); return; }
  const button = $('#addFinding');
  button.disabled = true;
  try {
    const attachments = await readAttachments(pendingFindingFiles);
    const key = stateKey();
    const wasAreaState = areaState[key];
    findings[key] = findings[key] || [];
    findings[key].push({ area: areasFor(activeInspection)[activeAreaIndex], text, note: $('#findingNote').value, attachments, status: 'Open' });
    areaState[key] = 'issue';
    if (!persist() && !(isStorageQuotaError(lastPersistError) && await compactFindingsForStorage())) {
      findings[key].pop();
      if (!findings[key].length) delete findings[key];
      if (wasAreaState === undefined) delete areaState[key];
      else areaState[key] = wasAreaState;
      return;
    }
    editingFindingIndex = null;
    pendingFindingFiles = [];
    renderAreas();
    renderAreaDetail();
    resetFindingEntry();
  } catch (error) {
    showToast(error.message);
  } finally {
    if ($('#addFinding')) $('#addFinding').disabled = false;
  }
}
function resetFindingEntry() { const input = $('#findingInput'); if (!input) return; input.value = ''; $('#findingNote').value = ''; $('#findingAttachments').value = ''; pendingFindingFiles = []; }
function renderUnitSelector() {
  const selector = $('#inspectionUnitSelect');
  if (!selector) return;
  selector.innerHTML = inspections.map((inspection) => `<option value="${inspection.id}" ${inspection.id === activeInspection.id ? 'selected' : ''}>${inspection.unit}</option>`).join('');
  selector.onchange = () => selectInspection(selector.value);
}

function renderInspectionMeta() {
  const apartment = savedApartments.find((unit) => unit.id === activeInspection.id);
  $('#detailBedrooms').textContent = apartment?.record?.unitBedrooms || activeInspection.layout || '—';
  $('#detailLayout').textContent = apartment?.record?.unitLayout || '—';
  $('#detailOutdoor').textContent = apartment?.record?.outdoorArea || '—';
  const meta = inspectionMeta[activeInspection.id] || {};
  $('#inspectionDate').value = meta.date || '';
  $('#inspectionTime').value = meta.time || '';
  window.snagSetInspectorSelection($('#inspectedBy'), window.snagPreferredInspectorNames(meta.inspectedBy, apartment?.record?.inspectedBy));
}

function bindInspectionMeta() {
  ['inspectionDate', 'inspectionTime'].forEach((id) => {
    $(`#${id}`).addEventListener('input', () => {
      inspectionMeta[activeInspection.id] = {
        date: $('#inspectionDate').value,
        time: $('#inspectionTime').value,
        inspectedBy: window.snagGetInspectorSelection($('#inspectedBy'))
      };
      persist();
    });
  });
  $('#inspectedBy').addEventListener('change', () => {
    const inspectedBy = window.snagGetInspectorSelection($('#inspectedBy'));
    inspectionMeta[activeInspection.id] = {
      date: $('#inspectionDate').value,
      time: $('#inspectionTime').value,
      inspectedBy
    };
    const apartmentState = JSON.parse(localStorage.getItem('snagline-apartment-record') || '{}');
    const apartment = (apartmentState.apartments || []).find((unit) => unit.id === activeInspection.id);
    if (apartment) {
      apartment.record.inspectedBy = inspectedBy;
      localStorage.setItem('snagline-apartment-record', JSON.stringify(apartmentState));
    }
    persist();
  });
}

function totalSnags() { return Object.entries(findings).filter(([key]) => key.startsWith(`${activeInspection.id}-`)).reduce((total, [, areaFindings]) => total + areaFindings.length, 0); }

function renderAll() { renderUnitSelector(); $('#detailTitle').innerHTML = `${activeInspection.unit} <span class="status-pill progress">${totalSnags()} snags</span>`; $('#detailMeta').textContent = `${activeInspection.building} · ${activeInspection.layout} · ${activeInspection.level}`; renderInspectionMeta(); renderAreas(); renderAreaDetail(); }

function refreshApartmentProfiles() {
  const latest = JSON.parse(localStorage.getItem('snagline-apartment-record') || '{}');
  const previousLayout = activeInspection.layout;
  savedApartments = latest.apartments || [];
  inspections = makeInspections(savedApartments);
  activeInspection = inspections.find((inspection) => inspection.id === activeInspection.id) || inspections[0];
  if (activeInspection.layout !== previousLayout || activeAreaIndex >= areasFor(activeInspection).length) activeAreaIndex = 0;
  renderAll();
}
window.addEventListener('storage', (event) => {
  if (event.key === 'snagline-apartment-record') refreshApartmentProfiles();
});
window.addEventListener('snag-cloud-snapshot-applied', () => {
  const latest = JSON.parse(localStorage.getItem(storageKey) || '{}');
  areaState = latest.areaState || {};
  findings = latest.findings || {};
  inspectionMeta = latest.inspectionMeta || {};
  const linked = JSON.parse(localStorage.getItem('snagline-linked-apartment') || '{}');
  if (linked.id) activeInspection = inspections.find((inspection) => inspection.id === linked.id) || activeInspection;
  activeAreaIndex = 0;
  refreshApartmentProfiles();
});


async function addEditorAttachments(event) {
  const files = [...event.target.files].filter((file) => file.type.startsWith('image/'));
  event.target.value = '';
  if (!attachmentTarget || !files.length) return;
  const target = attachmentTarget;
  try {
    const uploaded = await readAttachments(files);
    target.finding.attachments = target.finding.attachments || [];
    if (target.index !== null) {
      target.finding.attachments[target.index] = uploaded.shift();
    }
    target.finding.attachments.push(...uploaded);
    attachmentTarget = null;
    persist();
    renderAreaDetail();
  } catch (error) {
    showToast(error.message);
  }
}
$('#editAttachmentInput').addEventListener('change', addEditorAttachments);
$('#editCameraInput').addEventListener('change', addEditorAttachments);
function exportInspection() {
  const meta = inspectionMeta[activeInspection.id] || {};
  const apartment = savedApartments.find((unit) => unit.id === activeInspection.id);
  const rows = [['Unit', 'Building', 'Owner', 'Bedrooms', 'Layout', 'Outdoor area', 'Inspection date', 'Inspection time', 'Inspected by', 'Area', 'Finding', 'Status', 'Note', 'Attachment']];
  areasFor(activeInspection).forEach((area) => {
    const areaFindings = findings[`${activeInspection.id}-${area}`] || [];
    areaFindings.forEach((finding) => {
      const base = [
        activeInspection.unit,
        apartment?.record?.buildingName || activeInspection.building || '',
        apartment?.record?.ownerName || '',
        apartment?.record?.unitBedrooms || activeInspection.layout || '',
        apartment?.record?.unitLayout || '',
        apartment?.record?.outdoorArea || '',
        meta.date || '',
        meta.time || '',
        meta.inspectedBy || '',
        area,
        finding.text || '',
        finding.status || '',
        finding.note || ''
      ];
      const attachments = finding.attachments || [];
      if (!attachments.length) rows.push([...base, 'No attachments']);
      attachments.forEach((file) => rows.push([...base, file.data || file.name]));
    });
  });
  const sheetRows = rows.map((row) => `<Row>${row.map((cell) => `<Cell><Data ss:Type="String">${escapeXml(String(cell))}</Data></Cell>`).join('')}</Row>`).join('');
  const workbookXml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Inspection"><Table>${sheetRows}</Table></Worksheet></Workbook>`;
  const blob = new Blob([workbookXml], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${activeInspection.unit.replace(/\s+/g, '-')}-inspection.xls`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast();
  $('#toast').textContent = 'Inspection exported';
}

function escapeXml(value) { return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;'); }

$('#exportInspectionButton').addEventListener('click', exportInspection);
bindInspectionMeta();
renderAll();
compactStoredPhotos().catch((error) => showToast(`Could not optimize saved inspection photos: ${error.message}`));
