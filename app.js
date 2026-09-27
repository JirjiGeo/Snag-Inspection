const layoutAreas = {
  default: ['Entrance & Corridor', 'Living & Dining Area', 'Kitchen', 'Master Bedroom', 'Second Bedroom', 'Third Bedroom', 'Maid Bedroom', 'Master Bathroom', 'Second Bathroom', 'Third Bathroom', 'Maid Bathroom', 'Guest Bathroom', 'Master Dressing Room', 'Second Dressing Room', 'Third Dressing Room', 'Washing Room', 'Storage Room', 'Lounge', 'Garden', 'Balcony', 'Staircase', 'MEP System'],
  studio: ['Entrance & Corridor', 'Living & Dining Area', 'Kitchen', 'Master Bedroom', 'Second Bedroom', 'Third Bedroom', 'Maid Bedroom', 'Master Bathroom', 'Second Bathroom', 'Third Bathroom', 'Maid Bathroom', 'Guest Bathroom', 'Master Dressing Room', 'Second Dressing Room', 'Third Dressing Room', 'Washing Room', 'Storage Room', 'Lounge', 'Garden', 'Balcony', 'Staircase', 'MEP System'],
  'one bedroom': ['Entrance & Corridor', 'Living & Dining Area', 'Kitchen', 'Master Bedroom', 'Second Bedroom', 'Third Bedroom', 'Maid Bedroom', 'Master Bathroom', 'Second Bathroom', 'Third Bathroom', 'Maid Bathroom', 'Guest Bathroom', 'Master Dressing Room', 'Second Dressing Room', 'Third Dressing Room', 'Washing Room', 'Storage Room', 'Lounge', 'Garden', 'Balcony', 'Staircase', 'MEP System'],
  'two bedrooms': ['Entrance & Corridor', 'Living & Dining Area', 'Kitchen', 'Master Bedroom', 'Second Bedroom', 'Third Bedroom', 'Maid Bedroom', 'Master Bathroom', 'Second Bathroom', 'Third Bathroom', 'Maid Bathroom', 'Guest Bathroom', 'Master Dressing Room', 'Second Dressing Room', 'Third Dressing Room', 'Washing Room', 'Storage Room', 'Lounge', 'Garden', 'Balcony', 'Staircase', 'MEP System'],
  'three bedrooms': ['Entrance & Corridor', 'Living & Dining Area', 'Kitchen', 'Master Bedroom', 'Second Bedroom', 'Third Bedroom', 'Maid Bedroom', 'Master Bathroom', 'Second Bathroom', 'Third Bathroom', 'Maid Bathroom', 'Guest Bathroom', 'Master Dressing Room', 'Second Dressing Room', 'Third Dressing Room', 'Washing Room', 'Storage Room', 'Lounge', 'Garden', 'Balcony', 'Staircase', 'MEP System'],
  townhouse: ['Entrance & Corridor', 'Living & Dining Area', 'Kitchen', 'Master Bedroom', 'Second Bedroom', 'Third Bedroom', 'Maid Bedroom', 'Master Bathroom', 'Second Bathroom', 'Third Bathroom', 'Maid Bathroom', 'Guest Bathroom', 'Master Dressing Room', 'Second Dressing Room', 'Third Dressing Room', 'Washing Room', 'Storage Room', 'Lounge', 'Garden', 'Balcony', 'Staircase', 'MEP System'],
  penthouse: ['Entrance & Corridor', 'Living & Dining Area', 'Kitchen', 'Master Bedroom', 'Second Bedroom', 'Third Bedroom', 'Maid Bedroom', 'Master Bathroom', 'Second Bathroom', 'Third Bathroom', 'Maid Bathroom', 'Guest Bathroom', 'Master Dressing Room', 'Second Dressing Room', 'Third Dressing Room', 'Washing Room', 'Storage Room', 'Lounge', 'Garden', 'Balcony', 'Staircase', 'MEP System']
};

const apartmentStore = JSON.parse(localStorage.getItem('snagline-apartment-record') || '{}');
const savedApartments = apartmentStore.apartments || [];
const inspections = savedApartments.length ? savedApartments.map((apartment, index) => ({ id: apartment.id, unit: apartment.name, building: apartment.record.ownerName || 'Apartment record', layout: apartment.record.unitBedrooms || '2 bedrooms', level: apartment.record.unitSpace || `Unit ${index + 1}`, progress: 0, checked: 0, snags: 0, status: 'In progress', updated: 'Updated now' })) : [
  { id: '1204', unit: 'Unit 1204', building: 'Marina Heights', layout: '2 bedrooms', level: 'Level 12', progress: 42, checked: 3, snags: 4, status: 'In progress', updated: 'Updated 18 min ago' },
  { id: '0702', unit: 'Unit 0702', building: 'Cedar House', layout: '1 bedroom', level: 'Level 7', progress: 76, checked: 6, snags: 2, status: 'In progress', updated: 'Updated yesterday' }
];
const linkedApartment = JSON.parse(localStorage.getItem('snagline-linked-apartment') || '{}');
let activeInspection = inspections.find((inspection) => inspection.id === linkedApartment.id) || inspections[0];
let activeAreaIndex = 0;
let areaState = {};
let severity = {};
let findings = {};
let inspectionMeta = {};
let editingFindingIndex = null;
let findingViewMode = 'view';
let attachmentTarget = null;

const $ = (selector) => document.querySelector(selector);
const storageKey = 'snagline-inspection-state';
const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
areaState = saved.areaState || {};
severity = saved.severity || {};
findings = saved.findings || {};
inspectionMeta = saved.inspectionMeta || {};

function areasFor(inspection) { return layoutAreas[inspection.layout] || layoutAreas[inspection.layout?.toLowerCase()] || layoutAreas.default; }
function stateKey() { return `${activeInspection.id}-${activeAreaIndex}`; }
function persist() { localStorage.setItem(storageKey, JSON.stringify({ areaState, severity, findings, inspectionMeta })); window.snagCloudSave?.(); showToast(); }
function showToast() { const toast = $('#toast'); toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800); }

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
function areaStatus(inspectionId, index) { return (findings[`${inspectionId}-${index}`] || []).length ? 'issue' : 'pending'; }
function renderAreas() {
  const areas = areasFor(activeInspection);
  $('#areaCount').textContent = `${areas.length} areas`;
  $('#areaList').innerHTML = areas.map((area, index) => { const state = areaStatus(activeInspection.id, index); return `<button class="area-button ${index === activeAreaIndex ? 'active' : ''} ${state}" data-index="${index}"><span>${area}</span><span class="area-state">${state === 'done' ? '✓' : state === 'issue' ? '!' : '○'}</span></button>`; }).join('');
  document.querySelectorAll('.area-button').forEach((button) => button.addEventListener('click', () => { activeAreaIndex = Number(button.dataset.index); renderAreas(); renderAreaDetail(); }));
}
function renderAreaDetail() {
  const area = areasFor(activeInspection)[activeAreaIndex];
  const key = stateKey();
  const currentFindings = findings[key] || [];
  $('#areaDetail').innerHTML = `<h3>${area}</h3><p>Add as many findings as needed for this area. Each finding can be tracked separately.</p>
  <div class="manual-findings"><div class="finding-entry new-finding-card"><div class="entry-label">New finding</div><label>Description<input id="findingInput" type="text" placeholder="Describe a finding, defect, or action required"></label><div class="finding-selects"><label>Level<select id="findingLevel" aria-label="New finding level"><option>Main Level</option><option>First Level</option><option>Second Level</option></select></label><label>Severity<select id="findingSeverity" aria-label="New finding severity"><option>Low</option><option selected>Medium</option><option>High</option><option>Critical</option></select></label></div><label>Note<textarea id="findingNote" placeholder="Add a note for this finding"></textarea></label><label class="attachment-field">Attachments<input id="findingAttachments" type="file" accept="image/*" multiple></label><div class="attachment-preview" id="attachmentPreview"></div><button id="addFinding" class="button button-dark">Add finding</button></div>${editingFindingIndex !== null && currentFindings[editingFindingIndex] ? findingEditor(currentFindings[editingFindingIndex]) : ''}<div class="findings-heading"><strong>Findings summary</strong><span>${currentFindings.length} added</span></div><div class="finding-list">${currentFindings.length ? currentFindings.map((finding, index) => `<div class="finding-card severity-${finding.severity.toLowerCase()} ${editingFindingIndex === index ? 'editing' : ''}" data-edit-finding="${index}"><div><strong>${finding.text}</strong>${finding.note ? `<p class="finding-note">${finding.note}</p>` : ''}<span class="finding-meta"><b class="severity-${finding.severity.toLowerCase()}">${finding.severity}</b><span>${finding.level || 'Main Level'}</span><span>${finding.status}</span><span>${(finding.attachments || []).length} attachments</span></span></div><div class="finding-actions"><button data-view-finding="${index}">View</button><button data-edit-action="${index}">Edit</button><button class="remove-finding" data-remove-finding="${index}" aria-label="Remove finding">×</button></div></div>`).join('') : '<p class="empty-findings">No raised findings for this area.</p>'}</div></div>
`;
  $('#findingAttachments').addEventListener('change', renderAttachmentPreview);
  $('#addFinding').addEventListener('click', addFinding);
  document.querySelectorAll('[data-edit-finding]').forEach((card) => card.addEventListener('click', (event) => { if (!event.target.closest('button')) { editingFindingIndex = Number(card.dataset.editFinding); renderAreaDetail(); } }));
  document.querySelectorAll('[data-view-finding]').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); editingFindingIndex = Number(button.dataset.viewFinding); findingViewMode = 'view'; renderAreaDetail(); }));
  document.querySelectorAll('[data-edit-action]').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); editingFindingIndex = Number(button.dataset.editAction); findingViewMode = 'edit'; renderAreaDetail(); }));
  document.querySelectorAll('[data-remove-finding]').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); findings[key].splice(Number(button.dataset.removeFinding), 1); editingFindingIndex = null; persist(); renderAreas(); renderAreaDetail(); }));
  if (editingFindingIndex !== null && currentFindings[editingFindingIndex]) bindFindingEditor(currentFindings[editingFindingIndex]);
}
function findingEditor(finding) { if (findingViewMode === 'view') return `<div class="finding-editor"><div class="editor-heading"><strong>View finding</strong><button id="closeFindingEditor" aria-label="Close finding editor">×</button></div><div class="finding-view"><h4>${finding.text}</h4><p>${finding.note || 'No note added.'}</p><div class="finding-meta"><b class="severity-${finding.severity.toLowerCase()}">${finding.severity}</b><span>${finding.level || 'Main Level'}</span><span>${finding.status}</span><span>${(finding.attachments || []).length} attachments</span></div><div class="photo-grid">${(finding.attachments || []).map((file) => `<img class="photo-thumb" src="${file.data}" alt="${file.name}">`).join('')}</div></div></div>`; return `<div class="finding-editor"><div class="editor-heading"><strong>Edit finding</strong><button id="closeFindingEditor" aria-label="Close finding editor">×</button></div><input id="editFindingText" value="${finding.text.replace(/"/g, '&quot;')}" aria-label="Finding description"><label class="notes-field editor-note">Note<textarea id="editFindingNote">${finding.note || ''}</textarea></label><div class="editor-row"><select id="editFindingLevel" aria-label="Finding level"><option ${(!finding.level || finding.level === 'Main Level') ? 'selected' : ''}>Main Level</option><option ${finding.level === 'First Level' ? 'selected' : ''}>First Level</option><option ${finding.level === 'Second Level' ? 'selected' : ''}>Second Level</option></select><select id="editFindingSeverity" aria-label="Finding severity"><option ${finding.severity === 'Low' ? 'selected' : ''}>Low</option><option ${finding.severity === 'Medium' ? 'selected' : ''}>Medium</option><option ${finding.severity === 'High' ? 'selected' : ''}>High</option><option ${finding.severity === 'Critical' ? 'selected' : ''}>Critical</option></select><select id="editFindingStatus" aria-label="Finding status"><option ${finding.status === 'Open' ? 'selected' : ''}>Open</option><option ${finding.status === 'In progress' ? 'selected' : ''}>In progress</option><option ${finding.status === 'Resolved' ? 'selected' : ''}>Resolved</option></select><button id="saveFinding" class="button button-dark">Save changes</button></div><div class="finding-attachments"><div class="photo-heading"><strong>Finding photos</strong><span>${(finding.attachments || []).length} attached</span></div><button id="addAttachment" class="button button-outline">Add photo</button><div class="attachment-grid">${(finding.attachments || []).map((file, index) => `<div class="attachment-card"><img src="${file.data}" alt="${file.name}"><div class="attachment-actions"><button data-replace-attachment="${index}">Replace</button><button data-remove-attachment="${index}">Remove</button></div></div>`).join('') || '<p class="empty-findings">No photos attached.</p>'}</div></div></div>`; }
function bindFindingEditor(finding) { $('#closeFindingEditor').addEventListener('click', () => { editingFindingIndex = null; renderAreaDetail(); }); if (findingViewMode !== 'edit') return; $('#saveFinding').addEventListener('click', () => { finding.text = $('#editFindingText').value.trim() || finding.text; finding.note = $('#editFindingNote').value; finding.level = $('#editFindingLevel').value; finding.severity = $('#editFindingSeverity').value; finding.status = $('#editFindingStatus').value; persist(); editingFindingIndex = null; renderAreaDetail(); }); $('#addAttachment').addEventListener('click', () => { attachmentTarget = { finding, index: null }; $('#editAttachmentInput').click(); }); document.querySelectorAll('[data-replace-attachment]').forEach((button) => button.addEventListener('click', () => { attachmentTarget = { finding, index: Number(button.dataset.replaceAttachment) }; $('#editAttachmentInput').click(); })); document.querySelectorAll('[data-remove-attachment]').forEach((button) => button.addEventListener('click', () => { finding.attachments.splice(Number(button.dataset.removeAttachment), 1); persist(); renderAreaDetail(); })); }
function renderAttachmentPreview() { $('#attachmentPreview').innerHTML = [...$('#findingAttachments').files].map((file) => `<span class="attachment-pill">${file.name}</span>`).join(''); }
function addFinding() { const input = $('#findingInput'); const text = input.value.trim(); if (!text) { input.focus(); return; } const key = stateKey(); const files = [...$('#findingAttachments').files]; const attachments = []; let loaded = 0; const finish = () => { findings[key] = findings[key] || []; findings[key].push({ text, level: $('#findingLevel').value, severity: $('#findingSeverity').value, note: $('#findingNote').value, attachments, status: 'Open' }); editingFindingIndex = null; areaState[key] = 'issue'; persist(); renderAreas(); renderAreaDetail(); resetFindingEntry(); }; if (!files.length) { finish(); return; } files.forEach((file) => { const reader = new FileReader(); reader.onload = () => { attachments.push({ name: file.name, type: file.type, data: reader.result }); loaded += 1; if (loaded === files.length) finish(); }; reader.readAsDataURL(file); }); }
function resetFindingEntry() { const input = $('#findingInput'); if (!input) return; input.value = ''; $('#findingLevel').value = 'Main Level'; $('#findingSeverity').value = 'Medium'; $('#findingNote').value = ''; $('#findingAttachments').value = ''; }
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
  $('#inspectedBy').value = meta.inspectedBy || '';
}

function bindInspectionMeta() {
  ['inspectionDate', 'inspectionTime', 'inspectedBy'].forEach((id) => {
    $(`#${id}`).addEventListener('input', () => {
      inspectionMeta[activeInspection.id] = {
        date: $('#inspectionDate').value,
        time: $('#inspectionTime').value,
        inspectedBy: $('#inspectedBy').value
      };
      persist();
    });
  });
}

function totalSnags() { return Object.entries(findings).filter(([key]) => key.startsWith(`${activeInspection.id}-`)).reduce((total, [, areaFindings]) => total + areaFindings.length, 0); }

function renderAll() { renderUnitSelector(); $('#detailTitle').innerHTML = `${activeInspection.unit} <span class="status-pill progress">${totalSnags()} snags</span>`; $('#detailMeta').textContent = `${activeInspection.building} · ${activeInspection.layout} · ${activeInspection.level}`; renderInspectionMeta(); renderAreas(); renderAreaDetail(); }


$('#editAttachmentInput').addEventListener('change', (event) => { if (!attachmentTarget) return; const files = [...event.target.files]; if (!files.length) return; let loaded = 0; files.forEach((file) => { const reader = new FileReader(); reader.onload = () => { const uploaded = { name: file.name, type: file.type, data: reader.result }; attachmentTarget.finding.attachments = attachmentTarget.finding.attachments || []; if (attachmentTarget.index === null) attachmentTarget.finding.attachments.push(uploaded); else attachmentTarget.finding.attachments[attachmentTarget.index] = uploaded; loaded += 1; if (loaded === files.length) { persist(); renderAreaDetail(); } }; reader.readAsDataURL(file); }); event.target.value = ''; });
function exportInspection() {
  const meta = inspectionMeta[activeInspection.id] || {};
  const apartment = savedApartments.find((unit) => unit.id === activeInspection.id);
  const rows = [['Unit', 'Building', 'Owner', 'Bedrooms', 'Layout', 'Outdoor area', 'Inspection date', 'Inspection time', 'Inspected by', 'Area', 'Finding', 'Level', 'Severity', 'Status', 'Note', 'Attachment']];
  areasFor(activeInspection).forEach((area, areaIndex) => {
    const areaFindings = findings[`${activeInspection.id}-${areaIndex}`] || [];
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
        finding.level || '',
        finding.severity || '',
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
