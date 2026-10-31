window.SNAG_INSPECTORS = Object.freeze([
  'Georges Mansour',
  'Azlan Ahmed',
  'Justin Karshath',
  'Mathew Samuel'
]);

document.querySelectorAll('[data-inspector-picker]').forEach((picker) => {
  window.SNAG_INSPECTORS.forEach((inspector) => {
    const option = document.createElement('option');
    option.value = inspector;
    option.textContent = inspector;
    picker.append(option);
  });
});
