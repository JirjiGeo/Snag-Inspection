window.SNAG_INSPECTORS = Object.freeze([
  'Georges Mansour',
  'Azlan Ahmed',
  'Justin Karshath',
  'Mathew Samuel'
]);

const inspectorAliases = new Map([
  ['georges', 'Georges Mansour'],
  ['georges mansour', 'Georges Mansour'],
  ['azlan', 'Azlan Ahmed'],
  ['azlan ahmed', 'Azlan Ahmed'],
  ['azlan ahemd', 'Azlan Ahmed']
]);

window.snagCanonicalInspectorName = (value) => {
  const name = String(value).trim();
  return inspectorAliases.get(name.toLowerCase().replace(/\s+/g, ' ')) || name;
};

window.snagInspectorNames = (value) => [...new Set(
  (Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [])
    .map(window.snagCanonicalInspectorName)
    .filter(Boolean)
)];

window.snagPreferredInspectorNames = (primary, fallback) => {
  const selected = window.snagInspectorNames(primary);
  return selected.length ? selected : window.snagInspectorNames(fallback);
};

window.snagSetInspectorSelection = (picker, value) => {
  const selected = window.snagInspectorNames(value);
  selected.forEach((name) => {
    if ([...picker.options].some((option) => option.value === name)) return;
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    picker.append(option);
  });
  [...picker.options].forEach((option) => { option.selected = selected.includes(option.value); });
};

window.snagGetInspectorSelection = (picker) => [...picker.selectedOptions].map((option) => option.value);

let inspectorDataChanged = false;
const apartmentStorageKey = 'snagline-apartment-record';
const apartmentState = JSON.parse(localStorage.getItem(apartmentStorageKey) || '{}');
(apartmentState.apartments || []).forEach((apartment) => {
  if (!apartment.record?.inspectedBy) return;
  const names = window.snagInspectorNames(apartment.record.inspectedBy);
  const normalized = Array.isArray(apartment.record.inspectedBy) ? names : names.join(', ');
  if (JSON.stringify(apartment.record.inspectedBy) === JSON.stringify(normalized)) return;
  apartment.record.inspectedBy = normalized;
  inspectorDataChanged = true;
});
if (inspectorDataChanged) localStorage.setItem(apartmentStorageKey, JSON.stringify(apartmentState));

const inspectionStorageKey = 'snagline-inspection-state';
const inspectionState = JSON.parse(localStorage.getItem(inspectionStorageKey) || '{}');
Object.values(inspectionState.inspectionMeta || {}).forEach((meta) => {
  if (!meta.inspectedBy) return;
  const names = window.snagInspectorNames(meta.inspectedBy);
  const normalized = Array.isArray(meta.inspectedBy) ? names : names.join(', ');
  if (JSON.stringify(meta.inspectedBy) === JSON.stringify(normalized)) return;
  meta.inspectedBy = normalized;
  inspectorDataChanged = true;
});
if (inspectorDataChanged) {
  localStorage.setItem(inspectionStorageKey, JSON.stringify(inspectionState));
  window.snagCloudSave?.();
}

document.querySelectorAll('[data-inspector-picker]').forEach((picker) => {
  picker.querySelector('option[value=""]')?.remove();
  window.SNAG_INSPECTORS.forEach((inspector) => {
    const option = document.createElement('option');
    option.value = inspector;
    option.textContent = inspector;
    picker.append(option);
  });
  picker.multiple = true;
  picker.size = window.SNAG_INSPECTORS.length;
});
