const $ = (selector) => document.querySelector(selector);
const apartmentStore = JSON.parse(localStorage.getItem('snagline-apartment-record') || '{}');
const inspectionStore = JSON.parse(localStorage.getItem('snagline-inspection-state') || '{}');
const apartments = apartmentStore.apartments || [];
const findings = inspectionStore.findings || {};
const inspectionMeta = inspectionStore.inspectionMeta || {};
let activeUnitId = apartments[0]?.id || null;

const reportSectionsKey = 'snagline-report-sections';
let reportSections = JSON.parse(localStorage.getItem(reportSectionsKey) || '{}');

function getReportSections(unitId) {
  return reportSections[unitId] || { projectOverview: '', propertyDetails: '', inspectionDateTeam: '', inspectionScope: '', inspectionHighlights: '' };
}

function saveReportSections(unitId, sections) {
  reportSections[unitId] = sections;
  localStorage.setItem(reportSectionsKey, JSON.stringify(reportSections));
  window.snagCloudSave?.();
}

const areaNames = ['Entrance & Corridor', 'Living & Dining Area', 'Kitchen', 'Master Bedroom', 'Second Bedroom', 'Third Bedroom', 'Maid Bedroom', 'Master Bathroom', 'Second Bathroom', 'Third Bathroom', 'Maid Bathroom', 'Guest Bathroom', 'Master Dressing Room', 'Second Dressing Room', 'Third Dressing Room', 'Washing Room', 'Storage Room', 'Lounge', 'Garden', 'Balcony', 'Staircase', 'MEP System'];

function unitFindings(unitId) {
  return Object.entries(findings)
    .filter(([key]) => key.startsWith(`${unitId}-`))
    .flatMap(([key, list]) => (list || []).map((finding) => ({ ...finding, area: areaNames[Number(key.split('-').pop())] || 'General area' })));
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function renderUnits() {
  const list = $('#reportUnitList');
  if (!apartments.length) {
    list.innerHTML = '<p class="empty-report">No apartments available. Create a unit in the Apartments tab.</p>';
    return;
  }
  list.innerHTML = apartments.map((unit) => {
    const count = unitFindings(unit.id).length;
    return `<button class="report-unit ${unit.id === activeUnitId ? 'active' : ''}" data-unit="${unit.id}"><strong>${unit.name}</strong><span>${count} snag${count === 1 ? '' : 's'}</span></button>`;
  }).join('');
  document.querySelectorAll('[data-unit]').forEach((button) => button.addEventListener('click', () => {
    activeUnitId = button.dataset.unit;
    renderAll();
  }));
}

function renderReport() {
  const detail = $('#reportDetail');
  const unit = apartments.find((item) => item.id === activeUnitId);
  if (!unit) {
    detail.innerHTML = '<p class="empty-report">Select a unit to view its inspection report.</p>';
    return;
  }
  const unitFindingsList = unitFindings(unit.id);
  const meta = inspectionMeta[unit.id] || {};
  const sections = getReportSections(unit.id);
  const severityCounts = ['Low', 'Medium', 'High', 'Critical'].map((sev) => `${sev}: ${unitFindingsList.filter((f) => f.severity === sev).length}`).join(' · ');
  detail.innerHTML = `
    <h3>${unit.name}</h3>
    <p class="report-meta">${unit.record?.buildingName || '—'} · ${unit.record?.unitBedrooms || '—'} · ${unit.record?.unitLayout || '—'} · ${unit.record?.outdoorArea || '—'} · Inspected by: ${meta.inspectedBy || '—'} ${meta.date ? `· ${meta.date}` : ''}${meta.time ? ` ${meta.time}` : ''}</p>
    <div class="report-actions"><button class="button button-dark" id="exportUnitReport">Export report (.xls)</button><button class="button button-dark" id="exportUnitWord">Export report (.docx)</button></div>
    
    <div style="margin-top: 20px; padding: 16px; background: #f0f1f2; border-radius: 8px;">
      <h4 style="margin-top: 0;">Report Sections</h4>
      <label style="display: grid; gap: 8px; margin-bottom: 16px;">
        <span style="font: 700 10px 'DM Sans'; text-transform: uppercase; letter-spacing: .6px; color: #5f6d77;">Project Overview</span>
        <textarea id="projectOverviewField" placeholder="Enter project overview..." style="width: 100%; box-sizing: border-box; border: 1px solid #aeb6bd; border-radius: 5px; background: #eceeef; color: #26333a; padding: 9px; font: 500 12px 'DM Sans'; min-height: 80px; resize: vertical;">${sections.projectOverview || ''}</textarea>
      </label>
      <label style="display: grid; gap: 8px; margin-bottom: 16px;">
        <span style="font: 700 10px 'DM Sans'; text-transform: uppercase; letter-spacing: .6px; color: #5f6d77;">Property Details</span>
        <textarea id="propertyDetailsField" placeholder="Enter property details..." style="width: 100%; box-sizing: border-box; border: 1px solid #aeb6bd; border-radius: 5px; background: #eceeef; color: #26333a; padding: 9px; font: 500 12px 'DM Sans'; min-height: 80px; resize: vertical;">${sections.propertyDetails || ''}</textarea>
      </label>
      <label style="display: grid; gap: 8px; margin-bottom: 16px;">
        <span style="font: 700 10px 'DM Sans'; text-transform: uppercase; letter-spacing: .6px; color: #5f6d77;">Inspection Date & Team</span>
        <textarea id="inspectionDateTeamField" placeholder="Enter inspection date & team information..." style="width: 100%; box-sizing: border-box; border: 1px solid #aeb6bd; border-radius: 5px; background: #eceeef; color: #26333a; padding: 9px; font: 500 12px 'DM Sans'; min-height: 80px; resize: vertical;">${sections.inspectionDateTeam || ''}</textarea>
      </label>
      <label style="display: grid; gap: 8px; margin-bottom: 16px;">
        <span style="font: 700 10px 'DM Sans'; text-transform: uppercase; letter-spacing: .6px; color: #5f6d77;">Inspection Scope</span>
        <textarea id="inspectionScopeField" placeholder="Enter inspection scope..." style="width: 100%; box-sizing: border-box; border: 1px solid #aeb6bd; border-radius: 5px; background: #eceeef; color: #26333a; padding: 9px; font: 500 12px 'DM Sans'; min-height: 80px; resize: vertical;">${sections.inspectionScope || ''}</textarea>
      </label>
      <label style="display: grid; gap: 8px;">
        <span style="font: 700 10px 'DM Sans'; text-transform: uppercase; letter-spacing: .6px; color: #5f6d77;">Inspection Highlights</span>
        <textarea id="inspectionHighlightsField" placeholder="Enter inspection highlights..." style="width: 100%; box-sizing: border-box; border: 1px solid #aeb6bd; border-radius: 5px; background: #eceeef; color: #26333a; padding: 9px; font: 500 12px 'DM Sans'; min-height: 80px; resize: vertical;">${sections.inspectionHighlights || ''}</textarea>
      </label>
    </div>
    
    <p class="report-meta" style="margin-top: 20px;">${unitFindingsList.length} total snags · ${severityCounts}</p>
    ${unitFindingsList.length ? `<table class="report-table"><thead><tr><th>Area</th><th>Finding</th><th>Level</th><th>Severity</th><th>Status</th><th>Photos</th></tr></thead><tbody>${unitFindingsList.map((finding) => `<tr><td>${finding.area}</td><td><strong>${finding.text}</strong>${finding.note ? `<br><span class="report-meta">${finding.note}</span>` : ''}</td><td>${finding.level || '—'}</td><td><span class="sev sev-${(finding.severity || 'Medium').toLowerCase()}">${finding.severity || 'Medium'}</span></td><td>${finding.status || 'Open'}</td><td>${(finding.attachments || []).length}</td></tr>`).join('')}</tbody></table>` : '<p class="empty-report">No findings recorded for this unit.</p>'}`;
  
  $('#exportUnitReport').addEventListener('click', () => exportReport(unit, unitFindingsList, meta));
  $('#exportUnitWord').addEventListener('click', () => {
    const updatedSections = {
      projectOverview: $('#projectOverviewField').value,
      propertyDetails: $('#propertyDetailsField').value,
      inspectionDateTeam: $('#inspectionDateTeamField').value,
      inspectionScope: $('#inspectionScopeField').value,
      inspectionHighlights: $('#inspectionHighlightsField').value
    };
    saveReportSections(unit.id, updatedSections);
    exportWordReport(unit, unitFindingsList, meta, updatedSections);
  });
  
  ['projectOverviewField', 'propertyDetailsField', 'inspectionDateTeamField', 'inspectionScopeField', 'inspectionHighlightsField'].forEach(fieldId => {
    const field = $(`#${fieldId}`);
    if (field) {
      field.addEventListener('change', () => {
        const updatedSections = {
          projectOverview: $('#projectOverviewField').value,
          propertyDetails: $('#propertyDetailsField').value,
          inspectionDateTeam: $('#inspectionDateTeamField').value,
          inspectionScope: $('#inspectionScopeField').value,
          inspectionHighlights: $('#inspectionHighlightsField').value
        };
        saveReportSections(unit.id, updatedSections);
      });
    }
  });
}

function escapeXml(value) { return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;'); }

function uint16(value) { return new Uint8Array([value & 255, (value >>> 8) & 255]); }
function uint32(value) { return new Uint8Array([value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255]); }
function concatBytes(...parts) {
  const result = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  parts.forEach((part) => { result.set(part, offset); offset += part.length; });
  return result;
}
function textBytes(text) { return new TextEncoder().encode(text); }
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function zipStore(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  entries.forEach(({ name, data }) => {
    const nameBytes = textBytes(name);
    const crc = crc32(data);
    const local = concatBytes(uint32(0x04034b50), uint16(20), uint16(0), uint16(0), uint16(0), uint16(0), uint32(crc), uint32(data.length), uint32(data.length), uint16(nameBytes.length), uint16(0), nameBytes, data);
    const central = concatBytes(uint32(0x02014b50), uint16(20), uint16(20), uint16(0), uint16(0), uint16(0), uint16(0), uint32(crc), uint32(data.length), uint32(data.length), uint16(nameBytes.length), uint16(0), uint16(0), uint16(0), uint16(0), uint32(0), uint32(offset), nameBytes);
    localParts.push(local);
    centralParts.push(central);
    offset += local.length;
  });
  const central = concatBytes(...centralParts);
  return concatBytes(...localParts, central, concatBytes(uint32(0x06054b50), uint16(0), uint16(0), uint16(entries.length), uint16(entries.length), uint32(central.length), uint32(offset), uint16(0)));
}
function base64Bytes(data) {
  const base64 = data.includes(',') ? data.split(',')[1] : data;
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function exportReport(unit, unitFindingsList, meta) {
  const headers = ['Unit', 'Building', 'Owner', 'Bedrooms', 'Layout', 'Outdoor area', 'Inspection date', 'Inspection time', 'Inspected by', 'Area', 'Finding', 'Level', 'Severity', 'Status', 'Note', 'Photo Count', 'Photos'];
  const media = [];
  const rows = [
    ['INSPECTION REPORT'],
    ['Finding details with uploaded photos embedded in this workbook.'],
    [],
    headers
  ];
  const drawingAnchors = [];
  const imageExtensions = { 'image/png': 'png', 'image/jpeg': 'jpeg', 'image/jpg': 'jpeg', 'image/gif': 'gif', 'image/webp': 'png' };

  unitFindingsList.forEach((finding, findingIndex) => {
    const attachments = finding.attachments || [];
    const photoNames = attachments.map((attachment, index) => `Photo ${index + 1}: ${attachment.name || 'image'}`).join(' | ') || 'No photos';
    rows.push([
      unit.name, unit.record?.buildingName || '', unit.record?.ownerName || '', unit.record?.unitBedrooms || '', unit.record?.unitLayout || '', unit.record?.outdoorArea || '',
      meta.date || '', meta.time || '', meta.inspectedBy || '', finding.area || '', finding.text || '', finding.level || '', finding.severity || '', finding.status || '', finding.note || '', attachments.length, photoNames
    ]);
    const rowNumber = findingIndex + 5;
    attachments.forEach((attachment, photoIndex) => {
      if (!attachment.data) return;
      const type = attachment.type || 'image/jpeg';
      const extension = imageExtensions[type] || 'jpeg';
      const mediaName = `xl/media/image${media.length + 1}.${extension}`;
      media.push({ name: mediaName, data: base64Bytes(attachment.data), type, rowNumber, photoIndex });
      drawingAnchors.push({ mediaIndex: media.length - 1, rowNumber, photoIndex, name: attachment.name || `Photo ${photoIndex + 1}` });
    });
  });
  if (!unitFindingsList.length) rows.push(['No findings recorded for this unit.']);

  const cell = (value) => `<c t="inlineStr"><is><t>${escapeXml(String(value ?? ''))}</t></is></c>`;
  const sheetRows = rows.map((row, index) => `<row r="${index + 1}"${index >= 4 ? ' ht="110" customHeight="1"' : ''}>${row.map(cell).join('')}</row>`).join('');
  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><cols><col min="1" max="17" width="18" customWidth="1"/></cols><sheetData>${sheetRows}</sheetData><drawing r:id="rId1"/></worksheet>`;
  const drawingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${drawingAnchors.map((anchor, index) => `<xdr:twoCellAnchor editAs="oneCell"><xdr:from><xdr:col>${16 + anchor.photoIndex * 2}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${anchor.rowNumber - 1}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:to><xdr:col>${18 + anchor.photoIndex * 2}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${anchor.rowNumber}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="${index + 1}" name="${escapeXml(anchor.name)}"/><xdr:cNvPicPr/></xdr:nvPicPr><xdr:blipFill><a:blip r:embed="rId${index + 1}"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:twoCellAnchor>`).join('')}</xdr:wsDr>`;
  const drawingRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${media.map((image, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${image.name.split('/').pop()}"/>`).join('')}</Relationships>`;
  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Inspection Data" sheetId="1" r:id="rId1"/></sheets></workbook>`;
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpeg" ContentType="image/jpeg"/><Default Extension="gif" ContentType="image/gif"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;
  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`;
  const sheetRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>`;
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Arial"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="1"><xf/></cellXfs></styleSheet>`;
  const entries = [
    { name: '[Content_Types].xml', data: textBytes(contentTypes) }, { name: '_rels/.rels', data: textBytes(rootRels) }, { name: 'xl/workbook.xml', data: textBytes(workbookXml) },
    { name: 'xl/_rels/workbook.xml.rels', data: textBytes(workbookRels) }, { name: 'xl/worksheets/sheet1.xml', data: textBytes(sheetXml) }, { name: 'xl/worksheets/_rels/sheet1.xml.rels', data: textBytes(sheetRels) },
    { name: 'xl/styles.xml', data: textBytes(stylesXml) }, { name: 'xl/drawings/drawing1.xml', data: textBytes(drawingXml) }, { name: 'xl/drawings/_rels/drawing1.xml.rels', data: textBytes(drawingRels) },
    ...media.map((image) => ({ name: image.name, data: image.data }))
  ];
  const blob = new Blob([zipStore(entries)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${unit.name.replace(/\s+/g, '-')}-report.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
  showToast('Excel report exported with embedded finding photos');
}

async function exportWordReport(unit, unitFindingsList, meta, reportSections) {
  try {
    const groupedByArea = {};
    unitFindingsList.forEach(finding => {
      if (!groupedByArea[finding.area]) groupedByArea[finding.area] = [];
      groupedByArea[finding.area].push(finding);
    });

    const severityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };

    // Build HTML content for Word document
    let htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Calibri', Arial, sans-serif; margin: 40px; color: #333; }
    h1 { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    h2 { font-size: 18px; font-weight: bold; margin-top: 30px; margin-bottom: 10px; border-bottom: 2px solid #013220; padding-bottom: 5px; }
    h3 { font-size: 14px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; }
    p { margin: 8px 0; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #999; padding: 10px; text-align: left; }
    th { background-color: #013220; color: white; font-weight: bold; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .meta { color: #666; font-size: 12px; }
    .section-title { color: #013220; font-weight: bold; margin-top: 20px; }
    .finding { margin-left: 20px; margin-bottom: 20px; padding: 10px; background-color: #f5f5f5; border-left: 4px solid #013220; }
    .severity-low { border-left-color: #67b58a; }
    .severity-medium { border-left-color: #e0b35c; }
    .severity-high { border-left-color: #e58c69; }
    .severity-critical { border-left-color: #c95757; }
    .photo-container { margin: 15px 0; }
    .photo-container img { max-width: 100%; height: auto; border: 1px solid #999; margin: 10px 0; }
    .photo-label { margin: 10px 0 5px 0; font-weight: bold; font-size: 12px; }
  </style>
</head>
<body>`;

    // Title
    htmlContent += `<h1>INSPECTION REPORT</h1>
<h2 style="border: none; padding: 0; margin-top: 0;">${unit.name}</h2>`;

    // Project Overview
    if (reportSections?.projectOverview?.trim()) {
      htmlContent += `<h2>Project Overview</h2>
<p>${reportSections.projectOverview.replace(/\n/g, '<br>')}</p>`;
    }

    // Property Details
    if (reportSections?.propertyDetails?.trim()) {
      htmlContent += `<h2>Property Details</h2>
<p>${reportSections.propertyDetails.replace(/\n/g, '<br>')}</p>`;
    }

    // Inspection Date & Team
    if (reportSections?.inspectionDateTeam?.trim()) {
      htmlContent += `<h2>Inspection Date & Team</h2>
<p>${reportSections.inspectionDateTeam.replace(/\n/g, '<br>')}</p>`;
    }

    // Inspection Scope
    if (reportSections?.inspectionScope?.trim()) {
      htmlContent += `<h2>Inspection Scope</h2>
<p>${reportSections.inspectionScope.replace(/\n/g, '<br>')}</p>`;
    }

    // Inspection Highlights
    if (reportSections?.inspectionHighlights?.trim()) {
      htmlContent += `<h2>Inspection Highlights</h2>
<p>${reportSections.inspectionHighlights.replace(/\n/g, '<br>')}</p>`;
    }

    // Unit Details
    htmlContent += `<h2>Unit Details</h2>
<table>
<tr><th>Building</th><td>${unit.record?.buildingName || 'N/A'}</td></tr>
<tr><th>Bedrooms</th><td>${unit.record?.unitBedrooms || 'N/A'}</td></tr>
<tr><th>Layout</th><td>${unit.record?.unitLayout || 'N/A'}</td></tr>
<tr><th>Outdoor Area</th><td>${unit.record?.outdoorArea || 'N/A'}</td></tr>
<tr><th>Inspection Date</th><td>${meta.date || 'N/A'}</td></tr>
<tr><th>Inspection Time</th><td>${meta.time || 'N/A'}</td></tr>
<tr><th>Inspected By</th><td>${meta.inspectedBy || 'N/A'}</td></tr>
</table>`;

    // Summary
    const severitySummary = ['Critical', 'High', 'Medium', 'Low']
      .map(sev => `${sev}: ${unitFindingsList.filter((f) => f.severity === sev).length}`)
      .join(' | ');
    
    htmlContent += `<h2>Summary</h2>
<p><strong>Total Findings:</strong> ${unitFindingsList.length}</p>
<p>${severitySummary}</p>`;

    // Detailed Findings
    if (unitFindingsList.length > 0) {
      htmlContent += `<h2>Detailed Findings</h2>`;

      Object.keys(groupedByArea).sort().forEach((area) => {
        htmlContent += `<h3>${area}</h3>`;

        const areaFindings = groupedByArea[area].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
        
        areaFindings.forEach((finding, findingIndex) => {
          htmlContent += `<div class="finding severity-${(finding.severity || 'Medium').toLowerCase()}">
<p><strong>${findingIndex + 1}. ${finding.text}</strong></p>
<table style="width: 100%; margin: 10px 0;">
<tr><th style="width: 20%;">Severity</th><td>${finding.severity || 'Medium'}</td></tr>
<tr><th>Level</th><td>${finding.level || 'Main Level'}</td></tr>
<tr><th>Status</th><td>${finding.status || 'Open'}</td></tr>
${finding.note ? `<tr><th>Note</th><td>${finding.note}</td></tr>` : ''}
</table>`;

          // Add images with proper handling
          if (finding.attachments && finding.attachments.length > 0) {
            htmlContent += `<p style="margin-top: 15px; font-weight: bold;">Attached Photos:</p>`;
            finding.attachments.forEach((attachment, imgIndex) => {
              // Ensure data is in the correct format
              const imgData = attachment.data && attachment.data.startsWith('data:') ? attachment.data : `data:${attachment.type || 'image/jpeg'};base64,${attachment.data}`;
              htmlContent += `<div class="photo-container">
<p class="photo-label">Photo ${imgIndex + 1}: ${attachment.name}</p>
<img src="${imgData}" style="max-width: 600px; height: auto; border: 1px solid #ccc;">
</div>`;
            });
          }

          htmlContent += `</div>`;
        });
      });
    }

    htmlContent += `</body></html>`;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${unit.name.replace(/\s+/g, '-')}-inspection-report.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    showToast('Report exported successfully with photos!');
    console.log('Report exported as .doc file with images');
  } catch (error) {
    console.error('Export error:', error);
    showToast(`Error: ${error.message}`);
  }
}

function renderAll() {
  renderUnits();
  renderReport();
}

renderAll();
