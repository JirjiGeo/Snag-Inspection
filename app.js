const commonCriteria = [
  { section: '1.1 Attendance & Punctuality', weight: 10, items: [{ name: 'Adherence to working hours', weight: 5 }, { name: 'Timeliness in reporting to duty', weight: 5 }] },
  { section: '1.2 Professional Conduct & Ethics', weight: 10, items: [{ name: 'Respectful behavior with colleagues', weight: 4 }, { name: 'Compliance with company policies', weight: 3 }, { name: 'Demonstrates integrity & accountability', weight: 3 }] },
  { section: '1.3 Teamwork & Collaboration', weight: 10, items: [{ name: 'Works effectively with team members', weight: 4 }, { name: 'Supports cross-department coordination', weight: 3 }, { name: 'Contributes to team goals', weight: 3 }] },
  { section: '1.4 Problem Solving & Initiative', weight: 10, items: [{ name: 'Identifies issues proactively', weight: 3 }, { name: 'Suggests practical solutions', weight: 4 }, { name: 'Takes initiative without waiting for instructions', weight: 3 }] }
];

const leadershipCriteria = [{ section: '3.1 Leadership & People Management', weight: 15, items: [{ name: 'Ability to guide and mentor team', weight: 5 }, { name: 'Delegation & workload distribution', weight: 5 }, { name: 'Conflict resolution & decision-making', weight: 5 }] }];
const communicationCriteria = [{ section: '4.1 Communication Quality', weight: 10, items: [{ name: 'Clarity and professionalism', weight: 4 }, { name: 'Responsiveness & follow-up', weight: 3 }, { name: 'Written & verbal communication accuracy', weight: 3 }] }];
const systemCriteria = [{ section: '5.1 System Usage & Technical Skills', weight: 5, items: [{ name: 'Proficiency in department systems (Odoo, HRMS, CAFM, ERP, etc.)', weight: 2 }, { name: 'Accuracy of digital entries & reports', weight: 2 }, { name: 'Ability to troubleshoot basic system issues', weight: 1 }] }];

const facilityEngineerForm = {
  common: [
    { section: '1.1 Attendance & Punctuality', weight: 10, items: [{ name: 'Adherence to working hours', weight: 5 }, { name: 'Timeliness in reporting to duty', weight: 5 }] },
    { section: '1.2 Professional Conduct & Ethics', weight: 10, items: [{ name: 'Respectful behaviours with colleagues & occupants', weight: 4 }, { name: 'Compliance with company policies & safety rules', weight: 3 }, { name: 'Demonstrates integrity & accountability', weight: 3 }] },
    { section: '1.3 Teamwork & Collaboration', weight: 10, items: [{ name: 'Coordination with service providers', weight: 4 }, { name: 'Collaboration with help desk, procurement, soft services', weight: 3 }, { name: 'Contribution to team goals', weight: 3 }] }
  ],
  process: [
    { section: '2.1 Contract & Service Provider Management', weight: 10, items: [{ name: 'Contract compliance monitoring', weight: 4 }, { name: 'Timely escalation of breaches', weight: 3 }, { name: 'Quality of service provider coordination', weight: 3 }] },
    { section: '2.2 Maintenance & Asset Management', weight: 15, items: [{ name: 'PPM scheduling & completion', weight: 5 }, { name: 'Reactive maintenance resolution time', weight: 5 }, { name: 'Asset condition evaluation & reporting', weight: 5 }] },
    { section: '2.3 Incident, Emergency & Compliance Management', weight: 15, items: [{ name: 'Incident response & documentation', weight: 5 }, { name: 'Emergency preparedness & fire drill execution', weight: 5 }, { name: 'Compliance with safety regulations', weight: 5 }] }
  ],
  leadership: [{ section: '3.1 Leadership & Team Supervision', weight: 15, items: [{ name: 'Daily briefings & task delegation', weight: 5 }, { name: 'Guidance to technical team', weight: 5 }, { name: 'Decision-making & conflict resolution', weight: 5 }] }],
  communication: [{ section: '4.1 Communication Quality', weight: 10, items: [{ name: 'Clarity & professionalism', weight: 4 }, { name: 'Responsiveness to occupants & stakeholders', weight: 3 }, { name: 'Accuracy of written reports (weekly, inspection, snag)', weight: 3 }] }],
  system: [{ section: '5.1 System Usage & Technical Skills', weight: 5, items: [{ name: 'Proficiency in Odoo / CAFM', weight: 2 }, { name: 'Accuracy of digital entries & maintenance logs', weight: 2 }, { name: 'Ability to troubleshoot basic system issues', weight: 1 }] }],
  weights: { common: 30, process: 40, leadership: 15, communication: 10, system: 5 }
};

const facilityTechnicianForm = {
  common: [
    { section: '1.1 Attendance & Punctuality', weight: 10, items: [{ name: 'Adherence to working hours', weight: 5 }, { name: 'Timeliness in reporting to duty', weight: 5 }] },
    { section: '1.2 Professional Conduct & Ethics', weight: 10, items: [{ name: 'Professional behavior with colleagues & occupants', weight: 4 }, { name: 'Compliance with safety rules & company policies', weight: 3 }, { name: 'Demonstrates integrity & accountability', weight: 3 }] },
    { section: '1.3 Teamwork & Collaboration', weight: 10, items: [{ name: 'Collaboration with technicians & supervisors', weight: 4 }, { name: 'Coordination with other departments (help desk, soft services)', weight: 3 }, { name: 'Contribution to team goals', weight: 3 }] }
  ],
  process: [
    { section: '2.1 Technical Maintenance & Repairs', weight: 15, items: [{ name: 'Quality of routine maintenance', weight: 5 }, { name: 'Accuracy in diagnosing faults', weight: 5 }, { name: 'Quality of repairs & corrective actions', weight: 5 }] },
    { section: '2.2 Inspections & Preventative Maintenance', weight: 15, items: [{ name: 'Daily site inspection completion', weight: 5 }, { name: 'Accuracy of inspection reports', weight: 5 }, { name: 'Implementation of preventative maintenance', weight: 5 }] },
    { section: '2.3 Tools, PPE & Safety Compliance', weight: 10, items: [{ name: 'Proper use & care of tools', weight: 4 }, { name: 'Adherence to PPE requirements', weight: 3 }, { name: 'Compliance with safety standards', weight: 3 }] }
  ],
  leadership: [{ section: '3.1 Work Discipline & Initiative', weight: 10, items: [{ name: 'Takes initiative in resolving issues', weight: 4 }, { name: 'Follows instructions from Supervisor/Engineer', weight: 3 }, { name: 'Supports team members when needed', weight: 3 }] }],
  communication: [{ section: '4.1 Communication Quality', weight: 10, items: [{ name: 'Clarity & professionalism with occupants', weight: 4 }, { name: 'Responsiveness to Supervisor/Engineer', weight: 3 }, { name: 'Accuracy of written reports (inspection, maintenance logs)', weight: 3 }] }],
  system: [{ section: '5.1 System Usage & Reporting', weight: 10, items: [{ name: 'Proficiency in Odoo / CAFM', weight: 4 }, { name: 'Accuracy of digital entries & ticket updates', weight: 3 }, { name: 'Timely submission of reports', weight: 3 }] }],
  weights: { common: 30, process: 40, leadership: 10, communication: 10, system: 10 },
  titles: { leadership: 'Section 3 · Leadership & Work Ethic' }
};

const facilitySupervisorTeamLeaderForm = {
  common: [
    { section: '1.1 Attendance & Punctuality', weight: 10, items: [{ name: 'Adherence to working hours', weight: 5 }, { name: 'Timeliness in reporting to duty', weight: 5 }] },
    { section: '1.2 Professional Conduct & Ethics', weight: 10, items: [{ name: 'Professional behavior with colleagues & occupants', weight: 4 }, { name: 'Compliance with safety rules & company policies', weight: 3 }, { name: 'Demonstrates integrity & accountability', weight: 3 }] },
    { section: '1.3 Teamwork & Collaboration', weight: 10, items: [{ name: 'Collaboration with technicians & service providers', weight: 4 }, { name: 'Coordination with help desk, procurement, soft services', weight: 3 }, { name: 'Contribution to team goals', weight: 3 }] }
  ],
  process: [
    { section: '2.1 Technical Supervision & Team Management', weight: 15, items: [{ name: 'Daily briefings & task delegation', weight: 5 }, { name: 'Monitoring service provider schedules', weight: 5 }, { name: 'Ensuring maintenance requests meet KPIs', weight: 5 }] },
    { section: '2.2 Maintenance & Operations Oversight', weight: 15, items: [{ name: 'PPM scheduling & completion', weight: 5 }, { name: 'Reactive maintenance management', weight: 5 }, { name: 'Quality of inspections & asset management', weight: 5 }] },
    { section: '2.3 Incident, Emergency & Compliance Management', weight: 10, items: [{ name: 'Incident response & documentation', weight: 4 }, { name: 'Emergency preparedness & fire drills', weight: 3 }, { name: 'Compliance with safety regulations', weight: 3 }] }
  ],
  leadership: [{ section: '3.1 Leadership & People Management', weight: 10, items: [{ name: 'Ability to guide and mentor technicians', weight: 4 }, { name: 'Delegation & workload distribution', weight: 3 }, { name: 'Decision-making & conflict resolution', weight: 3 }] }],
  communication: [{ section: '4.1 Communication Quality', weight: 10, items: [{ name: 'Clarity & professionalism with occupants', weight: 4 }, { name: 'Responsiveness to Facility Engineer / Manager', weight: 3 }, { name: 'Accuracy of written reports (weekly, inspection, snag)', weight: 3 }] }],
  system: [{ section: '5.1 System Usage & Reporting', weight: 10, items: [{ name: 'Proficiency in Odoo / CAFM', weight: 4 }, { name: 'Accuracy of digital entries & ticket updates', weight: 3 }, { name: 'Timely submission of reports', weight: 3 }] }],
  weights: { common: 30, process: 40, leadership: 10, communication: 10, system: 10 }
};

const headOfEngineeringForm = {
  common: [
    { section: '1.1 Attendance & Punctuality', weight: 10, items: [{ name: 'Adherence to working hours', weight: 5 }, { name: 'Timeliness in reporting to duty', weight: 5 }] },
    { section: '1.2 Professional Conduct & Ethics', weight: 10, items: [{ name: 'Respectful behaviours with colleagues & occupants', weight: 4 }, { name: 'Compliance with company policies & safety rules', weight: 3 }, { name: 'Demonstrates integrity & accountability', weight: 3 }] },
    { section: '1.3 Teamwork & Collaboration', weight: 10, items: [{ name: 'Coordination with service providers', weight: 4 }, { name: 'Collaboration with help desk, procurement, soft services', weight: 3 }, { name: 'Contribution to team goals', weight: 3 }] }
  ],
  process: [
    { section: '2.1 Department Leadership & Strategy', weight: 15, items: [{ name: 'Strategic planning & direction of engineering operations', weight: 5 }, { name: 'Implementation of improvement initiatives', weight: 5 }, { name: 'Operational alignment with organizational goals', weight: 5 }] },
    { section: '2.2 Contract & Service Provider Management', weight: 10, items: [{ name: 'Compliance & SLA monitoring', weight: 4 }, { name: 'Escalation & corrective action management', weight: 3 }, { name: 'Service provider performance oversight', weight: 3 }] },
    { section: '2.3 Maintenance, PPM & Asset Management', weight: 15, items: [{ name: 'PPM planning & completion across facilities', weight: 5 }, { name: 'Reactive maintenance response & resolution', weight: 5 }, { name: 'Asset condition evaluation & improvement planning', weight: 5 }] }
  ],
  leadership: [{ section: '3.1 Leadership & People Management', weight: 10, items: [{ name: 'Leadership & guidance to engineering teams', weight: 4 }, { name: 'Delegation & workload distribution', weight: 3 }, { name: 'Decision-making & conflict resolution', weight: 3 }] }],
  communication: [{ section: '4.1 Communication Quality', weight: 10, items: [{ name: 'Clarity & professionalism with stakeholders', weight: 4 }, { name: 'Accuracy of written reports (weekly, monthly, asset)', weight: 3 }, { name: 'Responsiveness to escalations & clients', weight: 3 }] }],
  system: [{ section: '5.1 System Usage & Reporting', weight: 10, items: [{ name: 'Proficiency in Odoo / CAFM / ERP systems', weight: 4 }, { name: 'Accuracy of digital entries & engineering reports', weight: 3 }, { name: 'Use of analytics for decision-making', weight: 3 }] }],
  weights: { common: 30, process: 40, leadership: 10, communication: 10, system: 10 }
};

const procurementManagerForm = {
  common: [
    { section: 'A1. Procurement Strategy & Planning', weight: 10, items: [{ name: 'Quality of procurement strategy', weight: 4 }, { name: 'Accuracy of forecasting & planning', weight: 3 }, { name: 'Implementation of cost-saving initiatives', weight: 3 }] },
    { section: 'A2. Vendor & Contract Management', weight: 10, items: [{ name: 'Supplier evaluation & selection', weight: 4 }, { name: 'Contract negotiation & compliance', weight: 3 }, { name: 'Supplier performance monitoring', weight: 3 }] },
    { section: 'A3. Purchasing Operations & Compliance', weight: 10, items: [{ name: 'Accuracy of purchasing cycle', weight: 4 }, { name: 'Compliance with procurement policies', weight: 3 }, { name: 'Quality of documentation & audit readiness', weight: 3 }] },
    { section: 'A4. Inventory & Supply Chain Coordination', weight: 10, items: [{ name: 'Inventory control & accuracy', weight: 3 }, { name: 'Coordination with stores/warehouse', weight: 4 }, { name: 'Material availability & replenishment', weight: 3 }] }
  ],
  process: [
    { section: 'B1. Financial Oversight & Cost Control', weight: 10, items: [{ name: 'Budget adherence', weight: 4 }, { name: 'Cost-saving & value engineering', weight: 3 }, { name: 'Accuracy of PO & invoice approvals', weight: 3 }] },
    { section: 'B2. Policy Compliance & Audit Readiness', weight: 10, items: [{ name: 'Compliance with procurement policies', weight: 4 }, { name: 'Accuracy of procurement records', weight: 3 }, { name: 'Audit readiness & documentation quality', weight: 3 }] },
    { section: 'B3. Reporting & Analytics', weight: 10, items: [{ name: 'Quality of procurement reports', weight: 4 }, { name: 'Spend analysis & insights', weight: 3 }, { name: 'Use of KPIs for decision-making', weight: 3 }] }
  ],
  leadership: [{ section: 'C1. Leadership & Team Management', weight: 10, items: [{ name: 'Leadership & guidance', weight: 4 }, { name: 'Delegation & workload management', weight: 3 }, { name: 'Conflict resolution & decision-making', weight: 3 }] }],
  communication: [{ section: 'C2. Communication & Stakeholder Coordination', weight: 10, items: [{ name: 'Communication clarity & professionalism', weight: 4 }, { name: 'Responsiveness to internal stakeholders', weight: 3 }, { name: 'Supplier communication & negotiation quality', weight: 3 }] }],
  system: [{ section: 'D1. ERP / Procurement System Usage', weight: 10, items: [{ name: 'Proficiency in ERP / procurement systems', weight: 4 }, { name: 'Accuracy of digital entries', weight: 3 }, { name: 'Use of analytics for procurement decisions', weight: 3 }] }],
  weights: { common: 40, process: 30, leadership: 10, communication: 10, system: 10 },
  titles: { common: 'Section A · Core Procurement Functions', process: 'Section B · Compliance, Financial Control & Reporting', leadership: 'Section C1 · Leadership & Team Management', communication: 'Section C2 · Communication & Stakeholder Coordination', system: 'Section D · Systems & Digital Competency' }
};

const purchaseAssistantForm = {
  common: [
    { section: 'A1. Attendance & Punctuality', weight: 10, items: [{ name: 'Adherence to working hours', weight: 5 }, { name: 'Timeliness in reporting to duty', weight: 5 }] },
    { section: 'A2. Professional Conduct & Ethics', weight: 10, items: [{ name: 'Professional behavior with colleagues', weight: 4 }, { name: 'Compliance with company policies', weight: 3 }, { name: 'Integrity & accountability', weight: 3 }] },
    { section: 'A3. Teamwork & Collaboration', weight: 10, items: [{ name: 'Coordination with departments', weight: 4 }, { name: 'Support to Procurement Manager', weight: 3 }, { name: 'Contribution to team goals', weight: 3 }] },
    { section: 'A4. Initiative & Problem Solving', weight: 10, items: [{ name: 'Identifies issues proactively', weight: 3 }, { name: 'Suggests practical solutions', weight: 4 }, { name: 'Takes initiative without waiting', weight: 3 }] }
  ],
  process: [
    { section: 'B1. Purchasing Operations', weight: 10, items: [{ name: 'Accuracy in processing PRs & RFQs', weight: 4 }, { name: 'Timeliness of PO preparation', weight: 3 }, { name: 'Follow-up on deliveries & orders', weight: 3 }] },
    { section: 'B2. Supplier Coordination', weight: 10, items: [{ name: 'Quality of supplier communication', weight: 4 }, { name: 'Timely follow-up on quotations', weight: 3 }, { name: 'Accuracy in supplier information', weight: 3 }] },
    { section: 'B3. Documentation & Compliance', weight: 10, items: [{ name: 'Accuracy of procurement documentation', weight: 4 }, { name: 'Compliance with procurement procedures', weight: 3 }, { name: 'Audit readiness & record quality', weight: 3 }] }
  ],
  leadership: [{ section: 'C1. Work Discipline & Support', weight: 10, items: [{ name: 'Follows instructions from supervisor', weight: 4 }, { name: 'Supports team members', weight: 3 }, { name: 'Shows responsibility & ownership', weight: 3 }] }],
  communication: [{ section: 'D1. Communication Quality', weight: 10, items: [{ name: 'Clarity & professionalism', weight: 4 }, { name: 'Responsiveness to departments', weight: 3 }, { name: 'Accuracy of written communication', weight: 3 }] }],
  system: [{ section: 'E1. ERP / Procurement System Usage', weight: 10, items: [{ name: 'Proficiency in ERP / procurement systems', weight: 4 }, { name: 'Accuracy of digital entries', weight: 3 }, { name: 'Use of analytics for procurement decisions', weight: 3 }] }],
  weights: { common: 40, process: 30, leadership: 10, communication: 10, system: 10 },
  titles: { common: 'Section A · Common Core Competencies', process: 'Section B · Process Evaluation', leadership: 'Section C · Leadership', communication: 'Section D · Communication', system: 'Section E · System Knowledge' }
};

const itManagerForm = {
  common: [
    { section: 'A1. Attendance & Punctuality', weight: 10, items: [{ name: 'Adherence to working hours', weight: 5 }, { name: 'Timeliness in reporting to duty', weight: 5 }] },
    { section: 'A2. Professional Conduct & Ethics', weight: 10, items: [{ name: 'Professional behavior with colleagues', weight: 4 }, { name: 'Compliance with company policies', weight: 3 }, { name: 'Integrity & accountability', weight: 3 }] },
    { section: 'A3. Teamwork & Collaboration', weight: 10, items: [{ name: 'Coordination with departments', weight: 4 }, { name: 'Support to team members', weight: 3 }, { name: 'Contribution to organizational goals', weight: 3 }] },
    { section: 'A4. Initiative & Problem Solving', weight: 10, items: [{ name: 'Identifies issues proactively', weight: 3 }, { name: 'Suggests practical solutions', weight: 4 }, { name: 'Takes initiative without waiting', weight: 3 }] }
  ],
  process: [
    { section: 'B1. IT Infrastructure Management', weight: 10, items: [{ name: 'System uptime & reliability', weight: 4 }, { name: 'Quality of maintenance & upgrades', weight: 3 }, { name: 'Network & server performance management', weight: 3 }] },
    { section: 'B2. Cybersecurity & Risk Management', weight: 10, items: [{ name: 'Implementation of security controls', weight: 4 }, { name: 'Vulnerability assessment & mitigation', weight: 3 }, { name: 'Compliance with security policies', weight: 3 }] },
    { section: 'B3. IT Operations & Support', weight: 10, items: [{ name: 'Helpdesk responsiveness & resolution', weight: 4 }, { name: 'Quality of IT documentation', weight: 3 }, { name: 'User satisfaction with IT services', weight: 3 }] }
  ],
  leadership: [{ section: 'C1. Leadership & Team Management', weight: 10, items: [{ name: 'Guidance & supervision of IT team', weight: 4 }, { name: 'Delegation & workload management', weight: 3 }, { name: 'Decision-making & conflict resolution', weight: 3 }] }],
  communication: [{ section: 'D1. Communication Quality', weight: 10, items: [{ name: 'Clarity & professionalism', weight: 4 }, { name: 'Responsiveness to departments', weight: 3 }, { name: 'Accuracy of written communication', weight: 3 }] }],
  system: [{ section: 'E1. System Usage & Technical Skills', weight: 10, items: [{ name: 'Proficiency in ERP / IT systems', weight: 4 }, { name: 'Accuracy of digital entries & logs', weight: 3 }, { name: 'Use of analytics for IT decisions', weight: 3 }] }],
  weights: { common: 40, process: 30, leadership: 10, communication: 10, system: 10 },
  titles: { common: 'Section A · Common Core Competencies', process: 'Section B · Process Evaluation', leadership: 'Section C · Leadership', communication: 'Section D · Communication', system: 'Section E · System Knowledge' }
};

const operationsManagerForm = {
  common: [
    { section: 'A1. Attendance & Punctuality', weight: 10, items: [{ name: 'Adherence to working hours', weight: 5 }, { name: 'Timeliness in reporting to duty', weight: 5 }] },
    { section: 'A2. Professional Conduct & Ethics', weight: 10, items: [{ name: 'Professional behavior with colleagues', weight: 4 }, { name: 'Compliance with company policies', weight: 3 }, { name: 'Integrity & accountability', weight: 3 }] },
    { section: 'A3. Teamwork & Collaboration', weight: 10, items: [{ name: 'Coordination with all departments', weight: 4 }, { name: 'Support to department heads', weight: 3 }, { name: 'Contribution to organizational goals', weight: 3 }] },
    { section: 'A4. Initiative & Problem Solving', weight: 10, items: [{ name: 'Identifies issues proactively', weight: 3 }, { name: 'Suggests practical solutions', weight: 4 }, { name: 'Takes initiative without waiting', weight: 3 }] }
  ],
  process: [
    { section: 'B1. Multi-Department Oversight', weight: 10, items: [{ name: 'Oversight of Engineering, Procurement, IT', weight: 4 }, { name: 'Coordination across all operational units', weight: 3 }, { name: 'Ensuring departmental alignment', weight: 3 }] },
    { section: 'B2. Service Delivery & Performance', weight: 10, items: [{ name: 'Achievement of KPIs & SLAs', weight: 4 }, { name: 'Quality of operational outputs', weight: 3 }, { name: 'Timeliness of service delivery', weight: 3 }] },
    { section: 'B3. Compliance, Risk & Safety', weight: 10, items: [{ name: 'Compliance with policies & regulations', weight: 4 }, { name: 'Risk management & mitigation', weight: 3 }, { name: 'Emergency preparedness & incident handling', weight: 3 }] }
  ],
  leadership: [{ section: 'C1. Leadership & People Management', weight: 10, items: [{ name: 'Guidance & supervision of department heads', weight: 4 }, { name: 'Delegation & workload management', weight: 3 }, { name: 'Decision-making & conflict resolution', weight: 3 }] }],
  communication: [{ section: 'D1. Communication Quality', weight: 10, items: [{ name: 'Clarity & professionalism', weight: 4 }, { name: 'Responsiveness to stakeholders', weight: 3 }, { name: 'Accuracy of written communication', weight: 3 }] }],
  system: [{ section: 'E1. System Usage & Digital Competency', weight: 10, items: [{ name: 'Proficiency in ERP / CAFM / HRMS systems', weight: 4 }, { name: 'Accuracy of digital entries & reports', weight: 3 }, { name: 'Use of analytics for operational decisions', weight: 3 }] }],
  weights: { common: 40, process: 30, leadership: 10, communication: 10, system: 10 },
  titles: { common: 'Section A · Common Core Competencies', process: 'Section B · Process Evaluation', leadership: 'Section C · Leadership', communication: 'Section D · Communication', system: 'Section E · System Knowledge' }
};

const customerSupportRepresentativeForm = {
  common: [
    { section: 'A1. Attendance & Punctuality', weight: 10, items: [{ name: 'Adherence to working hours', weight: 5 }, { name: 'Timeliness in reporting to duty', weight: 5 }] },
    { section: 'A2. Professional Conduct & Ethics', weight: 10, items: [{ name: 'Professional behavior with customers', weight: 4 }, { name: 'Compliance with company policies', weight: 3 }, { name: 'Integrity & accountability', weight: 3 }] },
    { section: 'A3. Teamwork & Collaboration', weight: 10, items: [{ name: 'Coordination with internal departments', weight: 4 }, { name: 'Support to colleagues', weight: 3 }, { name: 'Contribution to team goals', weight: 3 }] },
    { section: 'A4. Initiative & Problem Solving', weight: 10, items: [{ name: 'Identifies issues proactively', weight: 3 }, { name: 'Suggests practical solutions', weight: 4 }, { name: 'Takes initiative without waiting', weight: 3 }] }
  ],
  process: [
    { section: 'B1. Customer Interaction & Support', weight: 10, items: [{ name: 'Quality of customer communication', weight: 4 }, { name: 'Accuracy of information provided', weight: 3 }, { name: 'Professional handling of inquiries', weight: 3 }] },
    { section: 'B2. Issue Resolution & Follow-Up', weight: 10, items: [{ name: 'Timeliness of issue resolution', weight: 4 }, { name: 'Quality of follow-up', weight: 3 }, { name: 'Escalation accuracy & judgment', weight: 3 }] },
    { section: 'B3. Documentation & Reporting', weight: 10, items: [{ name: 'Accuracy of customer records', weight: 4 }, { name: 'Quality of daily/weekly reports', weight: 3 }, { name: 'Proper use of CRM/ERP systems', weight: 3 }] }
  ],
  leadership: [{ section: 'C1. Work Discipline & Responsibility', weight: 10, items: [{ name: 'Responsibility in handling tasks', weight: 4 }, { name: 'Support to team members', weight: 3 }, { name: 'Ability to work independently', weight: 3 }] }],
  communication: [{ section: 'D1. Communication Quality', weight: 10, items: [{ name: 'Clarity & professionalism', weight: 4 }, { name: 'Responsiveness to customers', weight: 3 }, { name: 'Accuracy of written communication', weight: 3 }] }],
  system: [{ section: 'E1. System Usage & Digital Competency', weight: 10, items: [{ name: 'Proficiency in CRM / ERP systems', weight: 4 }, { name: 'Accuracy of digital entries', weight: 3 }, { name: 'Use of analytics for customer insights', weight: 3 }] }],
  weights: { common: 40, process: 30, leadership: 10, communication: 10, system: 10 },
  titles: { common: 'Section A · Common Core Competencies', process: 'Section B · Process Evaluation', leadership: 'Section C · Leadership', communication: 'Section D · Communication', system: 'Section E · System Knowledge' }
};

const departmentCriteria = {
  Engineering: [
    { section: '2.1 Process Knowledge & Execution', weight: 15, items: [{ name: 'Understanding of Engineering processes', weight: 5 }, { name: 'Accuracy in executing Engineering tasks', weight: 5 }, { name: 'Compliance with SOPs & SLAs', weight: 5 }] },
    { section: '2.2 Quality & Timeliness of Deliverables', weight: 15, items: [{ name: 'Quality of completed Engineering tasks', weight: 5 }, { name: 'Timely submission of work', weight: 5 }, { name: 'Error rate / rework required', weight: 5 }] }
  ],
  HR: [
    { section: '2.1 Process Knowledge & Execution', weight: 15, items: [{ name: 'Understanding of HR processes', weight: 5 }, { name: 'Accuracy in executing HR tasks', weight: 5 }, { name: 'Compliance with SOPs & SLAs', weight: 5 }] },
    { section: '2.2 Quality & Timeliness of Deliverables', weight: 15, items: [{ name: 'Quality of completed HR tasks', weight: 5 }, { name: 'Timely submission of work', weight: 5 }, { name: 'Error rate / rework required', weight: 5 }] }
  ],
  Operations: [
    { section: '2.1 Process Knowledge & Execution', weight: 15, items: [{ name: 'Understanding of Operations processes', weight: 5 }, { name: 'Accuracy in executing Operations tasks', weight: 5 }, { name: 'Compliance with SOPs & SLAs', weight: 5 }] },
    { section: '2.2 Quality & Timeliness of Deliverables', weight: 15, items: [{ name: 'Quality of completed Operations tasks', weight: 5 }, { name: 'Timely submission of work', weight: 5 }, { name: 'Error rate / rework required', weight: 5 }] }
  ],
  Procurement: [
    { section: '2.1 Process Knowledge & Execution', weight: 15, items: [{ name: 'Understanding of Procurement processes', weight: 5 }, { name: 'Accuracy in executing Procurement tasks', weight: 5 }, { name: 'Compliance with SOPs & SLAs', weight: 5 }] },
    { section: '2.2 Quality & Timeliness of Deliverables', weight: 15, items: [{ name: 'Quality of completed Procurement tasks', weight: 5 }, { name: 'Timely submission of work', weight: 5 }, { name: 'Error rate / rework required', weight: 5 }] }
  ]
};

const departmentForms = {
  HR: { common: commonCriteria, process: departmentCriteria.HR, leadership: leadershipCriteria, communication: communicationCriteria, system: systemCriteria, weights: { common: 40, process: 30, leadership: 15, communication: 10, system: 5 } },
  Operations: { common: commonCriteria, process: departmentCriteria.Operations, leadership: leadershipCriteria, communication: communicationCriteria, system: systemCriteria, weights: { common: 40, process: 30, leadership: 15, communication: 10, system: 5 } },
  Procurement: { common: commonCriteria, process: departmentCriteria.Procurement, leadership: leadershipCriteria, communication: communicationCriteria, system: systemCriteria, weights: { common: 40, process: 30, leadership: 15, communication: 10, system: 5 } },
  Engineering: { common: commonCriteria, process: departmentCriteria.Engineering, leadership: leadershipCriteria, communication: communicationCriteria, system: systemCriteria, weights: { common: 40, process: 30, leadership: 15, communication: 10, system: 5 } }
};

const departmentRoles = {
  HR: ['HR Manager'],
  'Customer Service': ['Customer Support Representative'],
  IT: ['IT Manager'],
  Engineering: ['Head of Engineer', 'Facility Manager', 'Facility Engineer', 'Team Leader/ Supervisor', 'Facility Technician'],
  Operations: ['Operation Manager'],
  Procurement: ['Procurement Manager', 'Assistance Purchase']
};

const designationFormKeys = {
  'HR Manager': 'department',
  'Customer Support Representative': 'customerSupportRepresentative',
  'IT Manager': 'itManager',
  'Head of Engineer': 'headOfEngineering',
  'Facility Manager': 'facilityEngineer',
  'Facility Engineer': 'facilityEngineer',
  'Team Leader/ Supervisor': 'facilitySupervisorTeamLeader',
  'Facility Technician': 'facilityTechnician',
  'Operation Manager': 'operationsManager',
  'Procurement Manager': 'procurementManager',
  'Assistance Purchase': 'purchaseAssistant'
};

let employees = [];
let editingEmployeeId = null;
let evaluationModalMode = 'new';
let editingEvaluationIndex = null;

const deletedEvaluationIds = new Set(JSON.parse(localStorage.getItem('northstar-deleted-evaluations') || '[]'));
const cloudEmployeeIds = new Set();

const rows = document.querySelector('#evaluationRows');
const employeeRows = document.querySelector('#employeeRows');
const employeeSearchInput = document.querySelector('#employeeSearchInput');
const importEmployeesButton = document.querySelector('#importEmployeesButton');
const employeeCsvInput = document.querySelector('#employeeCsvInput');
const employeeModal = document.querySelector('#employeeModal');
const employeeForm = document.querySelector('#employeeForm');
const searchInput = document.querySelector('#searchInput');
const departmentFilter = document.querySelector('#departmentFilter');
const modal = document.querySelector('#evaluationModal');
const employeeSelect = document.querySelector('#employeeSelect');
const commonContainer = document.querySelector('#commonCriteria');
const departmentContainer = document.querySelector('#departmentCriteria');
const leadershipContainer = document.querySelector('#leadershipCriteria');
const communicationContainer = document.querySelector('#communicationCriteria');
const systemContainer = document.querySelector('#systemCriteria');
const totalScore = document.querySelector('#totalScore');
const departmentTitle = document.querySelector('#departmentCriteriaTitle');
const commonTitle = document.querySelector('#commonCriteriaTitle');
const commonWeight = document.querySelector('#commonWeight');
const departmentWeight = document.querySelector('#departmentWeight');
const leadershipWeight = document.querySelector('#leadershipWeight');
const communicationWeight = document.querySelector('#communicationWeight');
const systemWeight = document.querySelector('#systemWeight');
const toast = document.querySelector('#toast');
const progressCurrentQuarter = document.querySelector('#progressCurrentQuarter');
const progressPreviousQuarter = document.querySelector('#progressPreviousQuarter');
const quarterSummary = document.querySelector('#quarterSummary');
const quarterProgressRows = document.querySelector('#quarterProgressRows');
const departmentMovementChart = document.querySelector('#departmentMovementChart');
const previousMovementLabel = document.querySelector('#previousMovementLabel');
const currentMovementLabel = document.querySelector('#currentMovementLabel');
const previousQuarterControlLabel = document.querySelector('#previousQuarterControlLabel');
const currentQuarterControlLabel = document.querySelector('#currentQuarterControlLabel');

function avatarMarkup(employee) {
  return `<span class="avatar avatar-${employee.color}">${employee.initials}</span>`;
}

function employeeEvaluations(employee) {
  if (Array.isArray(employee.evaluations) && employee.evaluations.length) return employee.evaluations;
  return employee.evaluation ? [employee.evaluation] : [];
}

function renderRows() {
  const query = searchInput.value.toLowerCase().trim();
  const department = departmentFilter.value;
  const filtered = employees.filter((employee) => !employee.deleted).flatMap((employee) => employeeEvaluations(employee).map((evaluation, evaluationIndex) => ({ employee, evaluation, evaluationIndex }))).filter(({ employee, evaluation }) => {
    const matchesQuery = `${employee.name} ${employee.department} ${employee.role || ''} ${evaluation.date || ''}`.toLowerCase().includes(query);
    return matchesQuery && (department === 'all' || employee.department === department);
  }).sort((first, second) => new Date(second.evaluation.date || 0) - new Date(first.evaluation.date || 0));

  rows.innerHTML = filtered.map(({ employee, evaluation, evaluationIndex }) => `
    <tr>
      <td><div class="employee-cell">${avatarMarkup(employee)}<div>${employee.name}<small>${employee.role || employee.department} · ${escapeHtml(evaluation.date || 'Date not recorded')}</small></div></div></td>
      <td>${employee.department}</td>
      <td>${employee.evaluator}</td>
      <td><span class="score">${evaluation.score ?? employee.score ?? 0}<small>/100</small></span></td>
      <td><span class="status complete">Completed</span></td>
      <td><div class="row-actions"><button class="table-more" data-employee-id="${employee.id}" data-evaluation-index="${evaluationIndex}" aria-label="More options for ${employee.name}">•••</button><div class="action-menu" data-menu-for="${employee.id}-${evaluationIndex}"><button data-action="view" data-employee-id="${employee.id}" data-evaluation-index="${evaluationIndex}">View form</button><button data-action="edit" data-employee-id="${employee.id}" data-evaluation-index="${evaluationIndex}">Edit evaluation</button><button data-action="delete-evaluation" data-employee-id="${employee.id}" data-evaluation-index="${evaluationIndex}">Delete evaluation</button><button data-action="print" data-employee-id="${employee.id}" data-evaluation-index="${evaluationIndex}">Export as PDF</button></div></div></td>
    </tr>`).join('') || '<tr><td colspan="6" class="empty-state">No evaluations match this search.</td></tr>';
  updateDashboardMetrics();
}

function quarterFromDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return { key: `${date.getFullYear()}-Q${quarter}`, label: `Q${quarter} ${date.getFullYear()}`, year: date.getFullYear(), quarter };
}

function updateEvaluationPeriod() {
  const periodInput = document.querySelector('#evaluationPeriodInput');
  const periodHeading = document.querySelector('#evaluationPeriodHeading');
  const quarter = quarterFromDate(document.querySelector('#evaluationDateInput')?.value);
  const label = quarter?.label || 'Select an evaluation date';
  periodInput.textContent = label;
  periodHeading.textContent = quarter ? `New evaluation - ${label}` : 'New evaluation';
  updatePreviousEvaluationScore();
}

function previousQuarterFrom(quarter) {
  if (!quarter) return null;
  const previousQuarter = quarter.quarter === 1 ? 4 : quarter.quarter - 1;
  const previousYear = quarter.quarter === 1 ? quarter.year - 1 : quarter.year;
  return { key: `${previousYear}-Q${previousQuarter}`, label: `Q${previousQuarter} ${previousYear}` };
}

function updatePreviousEvaluationScore() {
  const previousScore = document.querySelector('#previousScore');
  if (!previousScore) return;
  const employee = employees.find((item) => item.id === employeeSelect.value);
  const previousQuarter = previousQuarterFrom(quarterFromDate(document.querySelector('#evaluationDateInput')?.value));
  if (!employee || !previousQuarter) {
    previousScore.textContent = 'Select an evaluation date';
    return;
  }
  const previousEvaluation = latestEvaluationInQuarter(employee, previousQuarter.key);
  previousScore.textContent = previousEvaluation
    ? `${previousEvaluation.score}/100 (${previousQuarter.label})`
    : `No ${previousQuarter.label} evaluation`;
}

function quarterSortValue(quarter) {
  return quarter.year * 10 + quarter.quarter;
}

function latestEvaluationInQuarter(employee, quarterKey) {
  return employeeEvaluations(employee).filter((evaluation) => quarterFromDate(evaluation.date)?.key === quarterKey).sort((first, second) => new Date(second.date || 0) - new Date(first.date || 0))[0] || null;
}

function renderQuarterlyProgress() {
  const activeEmployees = employees.filter((employee) => !employee.deleted);
  const quarters = [...new Map(activeEmployees.flatMap((employee) => employeeEvaluations(employee).map((evaluation) => quarterFromDate(evaluation.date))).filter(Boolean).map((quarter) => [quarter.key, quarter])).values()].sort((first, second) => quarterSortValue(second) - quarterSortValue(first));
  if (!progressCurrentQuarter || !progressPreviousQuarter || !quarterSummary || !quarterProgressRows) return;
  if (!quarters.length) {
    progressCurrentQuarter.innerHTML = '<option>No quarters yet</option>';
    progressPreviousQuarter.innerHTML = '<option>No quarters yet</option>';
    quarterSummary.innerHTML = '<div class="quarter-empty">Quarterly progress will appear after evaluations are recorded.</div>';
    quarterProgressRows.innerHTML = '<tr><td colspan="6" class="empty-state">No evaluation history yet.</td></tr>';
    if (departmentMovementChart) departmentMovementChart.innerHTML = '<div class="quarter-empty">Department movement will appear after two quarters are available.</div>';
    return;
  }
  const selectedCurrent = quarters.some((quarter) => quarter.key === progressCurrentQuarter.value) ? progressCurrentQuarter.value : quarters[0].key;
  const previousOptions = quarters.filter((quarter) => quarter.key !== selectedCurrent);
  const selectedPrevious = previousOptions.some((quarter) => quarter.key === progressPreviousQuarter.value) ? progressPreviousQuarter.value : previousOptions[0]?.key || '';
  progressCurrentQuarter.innerHTML = quarters.map((quarter) => `<option value="${quarter.key}">${quarter.label}</option>`).join('');
  progressPreviousQuarter.innerHTML = previousOptions.length ? previousOptions.map((quarter) => `<option value="${quarter.key}">${quarter.label}</option>`).join('') : '<option value="">No previous quarter</option>';
  progressCurrentQuarter.value = selectedCurrent;
  progressPreviousQuarter.value = selectedPrevious;
  const currentQuarter = quarters.find((quarter) => quarter.key === selectedCurrent);
  const previousQuarter = quarters.find((quarter) => quarter.key === selectedPrevious);
  if (currentMovementLabel) currentMovementLabel.textContent = currentQuarter.label;
  if (previousMovementLabel) previousMovementLabel.textContent = previousQuarter?.label || 'Previous quarter';
  if (currentQuarterControlLabel) currentQuarterControlLabel.textContent = currentQuarter.label;
  if (previousQuarterControlLabel) previousQuarterControlLabel.textContent = previousQuarter?.label || 'Previous quarter';
  const rows = activeEmployees.map((employee) => {
    const current = latestEvaluationInQuarter(employee, selectedCurrent);
    const previous = previousQuarter ? latestEvaluationInQuarter(employee, selectedPrevious) : null;
    const currentScore = current ? Number(current.score) : null;
    const previousScore = previous ? Number(previous.score) : null;
    return { employee, currentScore, previousScore, change: currentScore === null || previousScore === null ? null : currentScore - previousScore };
  }).sort((first, second) => (second.currentScore ?? -1) - (first.currentScore ?? -1));
  const currentScores = rows.filter((row) => row.currentScore !== null).map((row) => row.currentScore);
  const previousScores = rows.filter((row) => row.previousScore !== null).map((row) => row.previousScore);
  const currentAverage = currentScores.length ? currentScores.reduce((sum, score) => sum + score, 0) / currentScores.length : 0;
  const previousAverage = previousScores.length ? previousScores.reduce((sum, score) => sum + score, 0) / previousScores.length : 0;
  const changes = rows.filter((row) => row.change !== null);
  const improvedCount = changes.filter((row) => row.change > 0).length;
  const averageChange = currentScores.length && previousScores.length ? currentAverage - previousAverage : null;
  quarterSummary.innerHTML = `<div><span>${escapeHtml(currentQuarter.label)} average</span><strong>${currentAverage.toFixed(1)}<small>/100</small></strong><small>${currentScores.length} evaluated</small></div><div><span>Average change</span><strong class="${averageChange === null ? 'neutral' : averageChange >= 0 ? 'positive' : 'negative'}">${averageChange === null ? '—' : `${averageChange >= 0 ? '+' : ''}${averageChange.toFixed(1)}`}<small>${averageChange === null ? 'Need two quarters' : 'points'}</small></strong><small>${improvedCount} staff improved</small></div><div><span>Comparison coverage</span><strong>${rows.filter((row) => row.currentScore !== null && row.previousScore !== null).length}<small>/${activeEmployees.length}</small></strong><small>${escapeHtml(previousQuarter?.label || 'Previous quarter')} comparison</small></div>`;
  document.querySelector('#currentQuarterHeading').textContent = currentQuarter.label;
  document.querySelector('#previousQuarterHeading').textContent = previousQuarter?.label || 'Previous';
  quarterProgressRows.innerHTML = rows.map(({ employee, currentScore, previousScore, change }) => {
    const changeClass = change === null ? 'neutral' : change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
    const progressLabel = change === null ? 'Incomplete history' : change > 0 ? 'Improved' : change < 0 ? 'Needs attention' : 'Stable';
    return `<tr><td><div class="employee-cell">${avatarMarkup(employee)}<div>${escapeHtml(employee.name)}<small>${escapeHtml(employee.role || employee.department)}</small></div></div></td><td>${escapeHtml(employee.department)}</td><td><strong class="quarter-score">${currentScore === null ? '—' : `${currentScore}`}<small>/100</small></strong></td><td>${previousScore === null ? '—' : `${previousScore}/100`}</td><td><strong class="quarter-change ${changeClass}">${change === null ? '—' : `${change >= 0 ? '+' : ''}${change.toFixed(1)}`}</strong></td><td><span class="quarter-status ${changeClass}">${progressLabel}</span></td></tr>`;
  }).join('') || '<tr><td colspan="6" class="empty-state">No active employees found.</td></tr>';
  if (departmentMovementChart) {
    const departments = [...new Set(activeEmployees.map((employee) => employee.department))].sort();
    departmentMovementChart.innerHTML = departments.map((department) => {
      const departmentRows = rows.filter((row) => row.employee.department === department);
      const currentDepartmentScores = departmentRows.filter((row) => row.currentScore !== null).map((row) => row.currentScore);
      const previousDepartmentScores = departmentRows.filter((row) => row.previousScore !== null).map((row) => row.previousScore);
      const currentDepartmentAverage = currentDepartmentScores.length ? currentDepartmentScores.reduce((sum, score) => sum + score, 0) / currentDepartmentScores.length : 0;
      const previousDepartmentAverage = previousDepartmentScores.length ? previousDepartmentScores.reduce((sum, score) => sum + score, 0) / previousDepartmentScores.length : 0;
      return `<div class="movement-row"><div class="movement-label"><strong>${escapeHtml(department)}</strong></div><div class="movement-bars"><div class="movement-bar-line"><span class="movement-bar previous" style="width:${previousDepartmentAverage}%"></span><b>${previousDepartmentScores.length ? previousDepartmentAverage.toFixed(1) : '—'}</b></div><div class="movement-bar-line"><span class="movement-bar current" style="width:${currentDepartmentAverage}%"></span><b>${currentDepartmentScores.length ? currentDepartmentAverage.toFixed(1) : '—'}</b></div></div></div>`;
    }).join('') || '<div class="quarter-empty">No departments found.</div>';
  }
}

function updateDashboardMetrics() {
  const activeEmployees = employees.filter((employee) => !employee.deleted);
  const completedEmployees = activeEmployees.filter((employee) => employee.status === 'Completed' || employeeEvaluations(employee).length || Number(employee.score) > 0);
  const pendingCount = Math.max(activeEmployees.length - completedEmployees.length, 0);
  const averageScore = completedEmployees.length ? completedEmployees.reduce((sum, employee) => sum + Number(latestEvaluation(employee)?.score ?? employee.score ?? 0), 0) / completedEmployees.length : 0;
  const departmentNames = [...new Set(activeEmployees.map((employee) => employee.department))];
  const statValues = document.querySelectorAll('.stats-grid .stat-card strong');
  if (statValues.length >= 4) {
    statValues[0].textContent = activeEmployees.length;
    statValues[1].innerHTML = `${averageScore.toFixed(1)}<small>/100</small>`;
    statValues[2].textContent = pendingCount;
    statValues[3].textContent = departmentNames.length;
  }
  const cycleNumber = document.querySelector('.cycle-number strong');
  const cycleTotal = document.querySelector('.cycle-number span');
  const progressBar = document.querySelector('.progress-track.large span');
  const cycleFooter = document.querySelectorAll('.cycle-footer b');
  if (cycleNumber) cycleNumber.textContent = completedEmployees.length;
  if (cycleTotal) cycleTotal.innerHTML = `of ${activeEmployees.length}<br />completed`;
  if (progressBar) progressBar.style.width = `${activeEmployees.length ? Math.round((completedEmployees.length / activeEmployees.length) * 100) : 0}%`;
  if (cycleFooter.length >= 2) { cycleFooter[0].textContent = completedEmployees.length; cycleFooter[1].textContent = pendingCount; }
  const cycleStatus = document.querySelector('.cycle-panel .status-pill');
  if (cycleStatus) cycleStatus.textContent = pendingCount ? 'In progress' : 'Complete';
  const healthList = document.querySelector('.department-list');
  const colors = ['purple', 'coral', 'yellow', 'mint'];
  if (healthList) healthList.innerHTML = departmentNames.map((department, index) => `<div class="department-row"><span class="department-color ${colors[index % colors.length]}"></span><strong>${escapeHtml(department)}</strong><span class="department-count"></span><div class="mini-track"><span></span></div><b>0%</b></div>`).join('');
  const healthRows = document.querySelectorAll('.department-list .department-row');
  healthRows.forEach((row) => {
    const department = row.querySelector('strong')?.textContent.trim();
    const departmentEmployees = activeEmployees.filter((employee) => employee.department === department);
    const departmentCompleted = departmentEmployees.filter((employee) => employee.status === 'Completed' || employeeEvaluations(employee).length || Number(employee.score) > 0);
    const percentage = departmentEmployees.length ? Math.round((departmentCompleted.length / departmentEmployees.length) * 100) : 0;
    const count = row.querySelector('.department-count');
    const bar = row.querySelector('.mini-track span');
    const value = row.querySelector('b');
    if (count) count.textContent = `${departmentEmployees.length} people`;
    if (bar) bar.style.width = `${percentage}%`;
    if (value) value.textContent = `${percentage}%`;
  });
  renderQuarterlyProgress();
}

function renderEmployeeRows() {
  const query = employeeSearchInput.value.toLowerCase().trim();
  const filtered = employees.filter((employee) => !employee.deleted).filter((employee) => `${employee.name} ${employee.department} ${employee.role || ''} ${employee.reportingTo || ''}`.toLowerCase().includes(query));
  const employeeHeader = document.querySelector('#employees thead tr');
  if (employeeHeader && !employeeHeader.querySelector('.employee-actions-header')) employeeHeader.insertAdjacentHTML('beforeend', '<th class="employee-actions-header">Actions</th>');
  employeeRows.innerHTML = filtered.map((employee) => `
    <tr>
      <td><div class="employee-cell">${avatarMarkup(employee)}<div>${employee.name}<small>${employee.id === 'maya' ? 'Employee record' : 'Added manually'}</small></div></div></td>
      <td>${employee.department}</td>
      <td>${employee.role || employee.designation || 'Not assigned'}</td>
      <td>${employee.joiningDate || 'Not provided'}</td>
      <td>${employee.reportingTo || 'Not provided'}</td>
      <td><div class="employee-row-actions"><button type="button" data-employee-action="edit" data-employee-id="${employee.id}">Edit</button><button type="button" data-employee-action="scores" data-employee-id="${employee.id}">Scores</button><button type="button" data-employee-action="delete" data-employee-id="${employee.id}">Delete</button></div></td>
    </tr>`).join('') || '<tr><td colspan="6" class="empty-state">No employees match this search.</td></tr>';
}

function employeeById(id) {
  return employees.find((employee) => employee.id === id);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;
  const input = text.replace(/^\uFEFF/, '');
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const nextCharacter = input[index + 1];
    if (character === '"' && quoted && nextCharacter === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(value.trim());
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && nextCharacter === '\n') index += 1;
      row.push(value.trim());
      if (row.some((cell) => cell)) rows.push(row);
      row = [];
      value = '';
    } else {
      value += character;
    }
  }
  row.push(value.trim());
  if (row.some((cell) => cell)) rows.push(row);
  return rows;
}

async function importEmployeesFromCsv(file) {
  const rows = parseCsv(await file.text());
  if (rows.length < 2) throw new Error('The CSV must include a header row and at least one employee.');
  const headers = rows[0].map((header) => header.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const column = (...names) => names.map((name) => headers.indexOf(name)).find((index) => index >= 0);
  const nameIndex = column('name', 'fullname', 'employeename');
  const departmentIndex = column('department');
  const designationIndex = column('designation', 'role', 'jobtitle');
  const joiningDateIndex = column('joiningdate', 'dateofjoining');
  const reportingToIndex = column('reportingto', 'manager', 'managername');
  if ([nameIndex, departmentIndex, designationIndex].some((index) => index === undefined)) {
    throw new Error('CSV headers must include name, department, and designation.');
  }
  const existingEmployees = new Set(employees.map((employee) => `${employee.name}|${employee.department}`.toLowerCase()));
  const importedEmployees = [];
  rows.slice(1).forEach((row, rowIndex) => {
    const name = row[nameIndex] || '';
    const department = row[departmentIndex] || '';
    const role = row[designationIndex] || '';
    if (!name || !department || !role) return;
    const duplicateKey = `${name}|${department}`.toLowerCase();
    if (existingEmployees.has(duplicateKey)) return;
    existingEmployees.add(duplicateKey);
    importedEmployees.push({
      id: `employee-import-${Date.now()}-${rowIndex}`,
      name,
      initials: name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
      department,
      role,
      designation: role,
      joiningDate: joiningDateIndex === undefined ? '' : row[joiningDateIndex] || '',
      reportingTo: reportingToIndex === undefined ? '' : row[reportingToIndex] || '',
      evaluator: reportingToIndex === undefined ? '' : row[reportingToIndex] || '',
      documents: [],
      evaluations: [],
      evaluation: null,
      score: 0,
      status: 'Pending',
      color: ['blue', 'coral', 'mint', 'purple', 'yellow'][(employees.length + importedEmployees.length) % 5]
    });
  });
  if (!importedEmployees.length) throw new Error('No new employees were found in the CSV.');
  employees.push(...importedEmployees);
  persistSavedEmployees();
  renderEmployeeRows();
  renderRows();
  updateEmployeeOptions();
  await syncCloudData();
  return importedEmployees.length;
}

function persistSavedEmployees() {
  try { localStorage.setItem('northstar-employees', JSON.stringify(employees)); } catch (error) { localStorage.setItem('northstar-employees', JSON.stringify(employees.map((employee) => ({ ...employee, documents: (employee.documents || []).map(({ name, type, size }) => ({ name, type, size })) })))); }
}

function isCloudId(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id || ''));
}

function evaluationFromCloud(record) {
  return {
    cloudId: record.id,
    score: Number(record.score),
    date: record.evaluation_date,
    criteria: record.ratings || [],
    development: record.employee_area_of_development || '',
    improvement: record.employee_improvement || '',
    strength: record.employee_strength || '',
    managerComments: record.direct_manager_comments || '',
    evaluatorComment: record.evaluator_comment || '',
    signatures: {
      employeeSignature: record.employee_signature || '',
      managerSignature: record.manager_signature || '',
      evaluatorSignature: record.evaluator_signature || ''
    }
  };
}

async function loadCloudData() {
  if (!window.supabaseClient) return;
  const [{ data: employeeRowsFromCloud, error: employeeError }, { data: evaluationRowsFromCloud, error: evaluationError }] = await Promise.all([
    window.supabaseClient.from('employees').select('*').order('created_at', { ascending: true }),
    window.supabaseClient.from('evaluations').select('*').order('evaluation_date', { ascending: true })
  ]);
  if (employeeError || evaluationError) {
    console.error('Could not load Supabase data', employeeError || evaluationError);
    toast.textContent = 'Could not load shared data from Supabase.';
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 3500);
    return;
  }
  const evaluationsByEmployee = new Map();
  (evaluationRowsFromCloud || []).forEach((record) => {
    const list = evaluationsByEmployee.get(record.employee_id) || [];
    list.push(evaluationFromCloud(record));
    evaluationsByEmployee.set(record.employee_id, list);
  });
  cloudEmployeeIds.clear();
  employees = (employeeRowsFromCloud || []).map((record, index) => {
    const evaluations = evaluationsByEmployee.get(record.id) || [];
    const latest = evaluations[evaluations.length - 1];
    cloudEmployeeIds.add(record.id);
    return {
      id: record.id,
      name: record.full_name,
      initials: record.full_name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
      department: record.department,
      role: record.designation,
      designation: record.designation,
      joiningDate: record.joining_date || '',
      reportingTo: record.reporting_to || '',
      evaluator: record.reporting_to || '',
      documents: record.job_description_name ? [{ name: record.job_description_name, dataUrl: record.job_description_url }] : [],
      evaluations,
      evaluation: latest || null,
      score: latest?.score || 0,
      status: latest ? 'Completed' : 'Pending',
      color: ['blue', 'coral', 'mint', 'purple', 'yellow'][index % 5]
    };
  });
  persistSavedEmployees();
  renderEmployeeRows();
  renderRows();
  updateEmployeeOptions();
}

async function syncCloudData() {
  if (!window.supabaseClient) return;
  try {
    const currentCloudIds = new Set();
    for (const employee of employees.filter((item) => !item.deleted)) {
      let cloudEmployee;
      const employeePayload = {
        full_name: employee.name,
        department: employee.department,
        designation: employee.role || employee.designation || 'Not assigned',
        joining_date: employee.joiningDate || null,
        reporting_to: employee.reportingTo || employee.evaluator || null,
        job_description_name: employee.documents?.[0]?.name || null,
        job_description_url: employee.documents?.[0]?.dataUrl || null,
        updated_at: new Date().toISOString()
      };
      if (isCloudId(employee.id)) {
        const result = await window.supabaseClient.from('employees').update(employeePayload).eq('id', employee.id).select().single();
        if (result.error) throw result.error;
        cloudEmployee = result.data;
      } else {
        const result = await window.supabaseClient.from('employees').insert(employeePayload).select().single();
        if (result.error) throw result.error;
        cloudEmployee = result.data;
        employee.id = cloudEmployee.id;
      }
      currentCloudIds.add(cloudEmployee.id);
      const deleteEvaluations = await window.supabaseClient.from('evaluations').delete().eq('employee_id', cloudEmployee.id);
      if (deleteEvaluations.error) throw deleteEvaluations.error;
      const evaluations = employeeEvaluations(employee).map((evaluation) => ({
        employee_id: cloudEmployee.id,
        evaluation_date: evaluation.date || new Date().toISOString().slice(0, 10),
        score: Number(evaluation.score || 0),
        previous_score: null,
        ratings: evaluation.criteria || [],
        employee_area_of_development: evaluation.development || null,
        employee_improvement: evaluation.improvement || null,
        employee_strength: evaluation.strength || null,
        direct_manager_comments: evaluation.managerComments || null,
        evaluator_comment: evaluation.evaluatorComment || null,
        employee_signature: evaluation.signatures?.employeeSignature || null,
        manager_signature: evaluation.signatures?.managerSignature || null,
        evaluator_signature: evaluation.signatures?.evaluatorSignature || null
      }));
      if (evaluations.length) {
        const inserted = await window.supabaseClient.from('evaluations').insert(evaluations);
        if (inserted.error) throw inserted.error;
      }
    }
    const removedIds = [...cloudEmployeeIds].filter((id) => !currentCloudIds.has(id));
    if (removedIds.length) {
      const removed = await window.supabaseClient.from('employees').delete().in('id', removedIds);
      if (removed.error) throw removed.error;
      removedIds.forEach((id) => cloudEmployeeIds.delete(id));
    }
    currentCloudIds.forEach((id) => cloudEmployeeIds.add(id));
    persistSavedEmployees();
  } catch (error) {
    console.error('Could not save Supabase data', error);
    toast.textContent = 'Could not save shared data to Supabase.';
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 3500);
  }
}

function getEvaluationForm(department, role) {
  const formKey = designationFormKeys[role];
  const formByKey = { customerSupportRepresentative: customerSupportRepresentativeForm, itManager: itManagerForm, headOfEngineering: headOfEngineeringForm, facilityEngineer: facilityEngineerForm, facilityTechnician: facilityTechnicianForm, facilitySupervisorTeamLeader: facilitySupervisorTeamLeaderForm, operationsManager: operationsManagerForm, procurementManager: procurementManagerForm, purchaseAssistant: purchaseAssistantForm };
  return formByKey[formKey] || departmentForms[department] || departmentForms.Engineering;
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
}

function exportEvaluationPdf(employee, evaluation = latestEvaluation(employee)) {
  const form = getEvaluationForm(employee.department, employee.role);
  evaluation = evaluation || {};
  const sections = [
    { title: form.titles?.common || 'Section A · Common Core Competencies', criteria: form.common || commonCriteria },
    { title: form.titles?.process || `Section B · ${employee.department} Process Evaluation`, criteria: form.process },
    { title: form.titles?.leadership || 'Section C · Leadership', criteria: form.leadership },
    { title: form.titles?.communication || 'Section D · Communication', criteria: form.communication },
    { title: form.titles?.system || 'Section E · System Knowledge', criteria: form.system }
  ];
  const criteriaIndex = evaluation.criteria || [];
  let criterionIndex = 0;
  const sectionsHtml = sections.map((section) => {
    const groups = section.criteria.map((group) => {
      const rows = group.items.map((criterion) => {
        const score = criteriaIndex[criterionIndex++] ?? '';
        const weighted = score === '' ? 0 : (Number(score) / 5) * criterion.weight;
        return { criterion, score, weighted };
      });
      const groupWeight = group.weight || rows.reduce((sum, row) => sum + Number(row.criterion.weight || 0), 0);
      const groupObtained = rows.reduce((sum, row) => sum + row.weighted, 0);
      const rowsHtml = rows.map((row) => `<tr><td>${escapeHtml(row.criterion.name)}</td><td>${row.criterion.weight}</td><td>${row.score === '' ? '—' : `${row.score}/5`}</td><td>${row.score === '' ? '—' : row.weighted.toFixed(1)}</td></tr>`).join('');
      return { html: `<h3>${escapeHtml(group.section)} <span>Obtained ${groupObtained.toFixed(1)} / ${groupWeight} points</span></h3><table><thead><tr><th>Criterion</th><th>Weight</th><th>Score</th><th>Weighted score</th></tr></thead><tbody>${rowsHtml}</tbody><tfoot><tr><td colspan="3">Subsection total</td><td>${groupObtained.toFixed(1)} / ${groupWeight}</td></tr></tfoot></table>`, obtained: groupObtained, weight: groupWeight };
    });
    const sectionObtained = groups.reduce((sum, group) => sum + group.obtained, 0);
    const sectionWeight = groups.reduce((sum, group) => sum + group.weight, 0);
    return `<section><h2>${escapeHtml(section.title)} <span>Obtained ${sectionObtained.toFixed(1)} / ${sectionWeight} points</span></h2>${groups.map((group) => group.html).join('')}</section>`;
  }).join('');
  const signatureLabels = [
    ['employeeSignature', 'Employee Signature'],
    ['managerSignature', 'Manager Signature'],
    ['evaluatorSignature', 'Evaluator Signature']
  ];
  const signatureHtml = `<div class="signatures">${signatureLabels.map(([id, label]) => {
    const signature = evaluation.signatures?.[id];
    return `<div class="signature">${signature ? `<img src="${signature}" alt="${label}" style="display:block;width:100%;height:70px;object-fit:contain;margin-bottom:8px" />` : '<div style="height:70px"></div>'}<span>${label}</span></div>`;
  }).join('')}</div>`;
  const reportHtml = `<!doctype html><html><head><title>Evaluation - ${escapeHtml(employee.name)}</title><style>body{font-family:Arial,sans-serif;color:#202331;margin:36px}h1{color:#013220;margin-bottom:4px}h2{border-bottom:2px solid #013220;padding-bottom:8px;margin-top:28px}h3{font-size:14px;color:#013220;margin:18px 0 6px}h3 span{float:right;font-size:11px;color:#66756e}.meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;background:#f4f7f5;padding:18px}.meta strong{display:block;font-size:11px;color:#64736c;text-transform:uppercase;margin-bottom:4px}.score{font-size:28px;color:#013220;font-weight:700}table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:11px}th,td{border:1px solid #d9e2dd;padding:7px;text-align:left}th{background:#edf4f0;color:#365449}.comments{white-space:pre-wrap;border:1px solid #d9e2dd;padding:12px;min-height:45px;margin-bottom:12px}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:20px}.signature{border-top:1px solid #555;padding-top:7px;font-size:11px}@media print{button{display:none}section{break-inside:avoid}}</style></head><body><h1>Qbel FM &amp; Technical Services</h1><p>Employee Evaluation</p><div class="meta"><div><strong>Employee</strong>${escapeHtml(employee.name)}</div><div><strong>Department</strong>${escapeHtml(employee.department)}</div><div><strong>Designation</strong>${escapeHtml(employee.role || 'Not provided')}</div><div><strong>Joining date</strong>${escapeHtml(employee.joiningDate || 'Not provided')}</div><div><strong>Reporting to</strong>${escapeHtml(employee.reportingTo || 'Not provided')}</div><div><strong>Previous score</strong>${Number(employee.score) > 0 ? `${employee.score}/100` : 'No previous evaluation'}</div></div><h2>Evaluation Summary</h2><p class="score">${evaluation.score ?? employee.score ?? 0}/100</p><p>Evaluation date: ${escapeHtml(evaluation.date || new Date().toLocaleDateString())}</p>${sectionsHtml}<h2>Comments</h2><div class="comments"><strong>Employee Area of Development</strong><br>${escapeHtml(evaluation.development)}</div><div class="comments"><strong>Employee Improvement</strong><br>${escapeHtml(evaluation.improvement)}</div><div class="comments"><strong>Employee Strength</strong><br>${escapeHtml(evaluation.strength)}</div><div class="comments"><strong>Direct Manager Comments</strong><br>${escapeHtml(evaluation.managerComments)}</div><div class="comments"><strong>Evaluator Comment</strong><br>${escapeHtml(evaluation.evaluatorComment)}</div><div class="signatures"><div class="signature">Employee Signature</div><div class="signature">Manager Signature</div><div class="signature">Evaluator Signature</div></div><p>Use the print dialog to select “Save as PDF” or print this evaluation.</p></body></html>`;
  showPrintPreview(reportHtml.replace('<div class="signatures"><div class="signature">Employee Signature</div><div class="signature">Manager Signature</div><div class="signature">Evaluator Signature</div></div>', signatureHtml));
}

function showPrintPreview(reportHtml) {
  let preview = document.querySelector('#printPreview');
  if (!preview) {
    preview = document.createElement('div');
    preview.id = 'printPreview';
    preview.className = 'modal-backdrop open';
    preview.innerHTML = '<section class="print-preview" role="dialog" aria-modal="true"><div class="print-preview-toolbar"><strong>Evaluation preview</strong><div><button class="outline-button" id="closePrintPreview">Close</button><button class="primary-button" id="printPreviewButton">Print / Save PDF</button></div></div><iframe title="Evaluation print preview"></iframe></section>';
    document.body.appendChild(preview);
    const style = document.createElement('style');
    style.textContent = '#printPreview{padding:18px;z-index:30}.print-preview{display:flex;flex-direction:column;width:min(1000px,100%);height:min(92vh,900px);background:#fff;border-radius:12px;overflow:hidden}.print-preview-toolbar{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid var(--line);color:var(--brand)}.print-preview-toolbar button{margin-left:8px}.print-preview iframe{flex:1;width:100%;border:0;background:#fff}@media(max-width:760px){.print-preview-toolbar{align-items:flex-start;gap:10px;flex-direction:column}.print-preview-toolbar button{margin-left:0;margin-right:6px}}';
    document.head.appendChild(style);
    document.querySelector('#closePrintPreview').addEventListener('click', () => preview.remove());
    document.querySelector('#printPreviewButton').addEventListener('click', () => preview.querySelector('iframe').contentWindow.print());
  }
  preview.querySelector('iframe').srcdoc = reportHtml;
}

function deleteEvaluation(employee, evaluationIndex = null) {
  if (!window.confirm(`Delete the evaluation for ${employee.name}? The employee profile will be kept.`)) return;
  const evaluations = [...employeeEvaluations(employee)];
  const targetIndex = Number.isInteger(evaluationIndex) ? evaluationIndex : evaluations.length - 1;
  evaluations.splice(targetIndex, 1);
  employee.evaluations = evaluations;
  employee.evaluation = evaluations[evaluations.length - 1] || null;
  employee.score = employee.evaluation?.score || 0;
  employee.status = employee.evaluation ? 'Completed' : 'Pending';
  persistSavedEmployees();
  void syncCloudData();
  renderEmployeeRows();
  renderRows();
  updateDashboardMetrics();
}

function criteriaMarkup(criteria, group) {
  return criteria.map((section) => `
    <div class="criteria-section-label"><strong>${section.section}</strong><small>${section.weight} points total</small></div>
    ${section.items.map((criterion) => `
      <div class="criteria-item">
        <div><strong>${criterion.name}</strong><small>Weight: ${criterion.weight} points</small></div>
        <div class="score-buttons" data-group="${group}">
          ${[0, 1, 2, 3, 4, 5].map((score) => `<button type="button" class="score-button" data-score="${score}" data-weight="${criterion.weight}" aria-label="${criterion.name}: ${score} out of 5">${score}</button>`).join('')}
        </div>
      </div>`).join('')}`).join('');
}

function updateTotal() {
  const selected = [...document.querySelectorAll('.score-button.selected')];
  const points = selected.reduce((sum, button) => sum + (Number(button.dataset.score) / 5) * Number(button.dataset.weight), 0);
  totalScore.textContent = Math.round(points);
}

function renderCriteria(department, role) {
  const formKey = designationFormKeys[role];
  const formByKey = { customerSupportRepresentative: customerSupportRepresentativeForm, itManager: itManagerForm, headOfEngineering: headOfEngineeringForm, facilityEngineer: facilityEngineerForm, facilityTechnician: facilityTechnicianForm, facilitySupervisorTeamLeader: facilitySupervisorTeamLeaderForm, operationsManager: operationsManagerForm, procurementManager: procurementManagerForm, purchaseAssistant: purchaseAssistantForm };
  const form = formByKey[formKey] || departmentForms[department] || departmentForms.Engineering;
  commonContainer.innerHTML = criteriaMarkup(form.common || commonCriteria, 'common');
  departmentContainer.innerHTML = criteriaMarkup(form.process, 'department');
  leadershipContainer.innerHTML = criteriaMarkup(form.leadership, 'leadership');
  communicationContainer.innerHTML = criteriaMarkup(form.communication, 'communication');
  systemContainer.innerHTML = criteriaMarkup(form.system, 'system');
  commonTitle.textContent = form.titles?.common || 'Section 1 · Common Core Competencies';
  commonWeight.textContent = `${form.weights.common} points total`;
  departmentTitle.textContent = form.titles?.process || `Section 2 · ${department} Process Evaluation`;
  departmentWeight.textContent = `${form.weights.process} points total`;
  leadershipWeight.textContent = `${form.weights.leadership} points total`;
  communicationWeight.textContent = `${form.weights.communication} points total`;
  systemWeight.textContent = `${form.weights.system} points total`;
  const sectionHeaders = document.querySelectorAll('.evaluation-modal .criteria-header span');
  sectionHeaders[2].textContent = form.titles?.leadership || 'Section 3 · Leadership Competencies';
  sectionHeaders[3].textContent = form.titles?.communication || 'Section 4 · Communication Skills';
  sectionHeaders[4].textContent = form.titles?.system || 'Section 5 · System Knowledge & Digital Competency';
  document.querySelectorAll('.score-button').forEach((button) => button.addEventListener('click', () => {
    button.parentElement.querySelectorAll('.score-button').forEach((sibling) => sibling.classList.remove('selected'));
    button.classList.add('selected');
    updateTotal();
  }));
}

function latestEvaluation(employee, evaluationIndex = null) {
  const evaluations = employeeEvaluations(employee);
  if (Number.isInteger(evaluationIndex)) return evaluations[evaluationIndex] || null;
  return employee.evaluation || evaluations[evaluations.length - 1] || null;
}

function applyEvaluationToModal(evaluation) {
  if (!evaluation) return;
  const scores = evaluation.criteria || [];
  document.querySelectorAll('.score-buttons').forEach((group, index) => {
    const savedScore = scores[index];
    if (savedScore === undefined || savedScore === null || savedScore === '') return;
    const selectedButton = group.querySelector(`[data-score="${savedScore}"]`);
    if (selectedButton) selectedButton.classList.add('selected');
  });
  document.querySelector('#evaluationDateInput').value = evaluation.date || new Date().toISOString().slice(0, 10);
  updateEvaluationPeriod();
  document.querySelector('#developmentComments').value = evaluation.development || '';
  document.querySelector('#improvementComments').value = evaluation.improvement || '';
  document.querySelector('#strengthComments').value = evaluation.strength || '';
  document.querySelector('#managerComments').value = evaluation.managerComments || '';
  document.querySelector('#evaluatorComments').value = evaluation.evaluatorComment || '';
  applySignaturesToModal(evaluation.signatures || {});
  updateTotal();
  if (!scores.length && Number(evaluation.score) > 0) totalScore.textContent = evaluation.score;
}

function signatureIds() {
  return ['employeeSignature', 'managerSignature', 'evaluatorSignature'];
}

function getSignatureData() {
  return signatureIds().reduce((signatures, id) => {
    const canvas = document.querySelector(`#${id}`);
    signatures[id] = canvas?.dataset.signed === 'true' ? canvas.toDataURL('image/png') : '';
    return signatures;
  }, {});
}

function applySignaturesToModal(signatures) {
  signatureIds().forEach((id) => {
    const canvas = document.querySelector(`#${id}`);
    const dataUrl = signatures[id];
    if (!canvas || !dataUrl) return;
    const image = new Image();
    image.onload = () => {
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.dataset.signed = 'true';
    };
    image.src = dataUrl;
  });
}

function setEvaluationModalMode(mode) {
  evaluationModalMode = mode;
  const isViewMode = mode === 'view';
  const isExistingEvaluation = mode === 'view' || mode === 'edit';
  const saveButton = document.querySelector('#saveEvaluation');
  document.querySelector('#modalTitle').textContent = isViewMode ? 'View evaluation form' : mode === 'edit' ? 'Edit evaluation' : 'Evaluate an employee';
  if (saveButton) {
    saveButton.hidden = isViewMode;
    saveButton.textContent = mode === 'edit' ? 'Update evaluation' : 'Save evaluation';
  }
  document.querySelectorAll('#evaluationModal input, #evaluationModal select, #evaluationModal textarea, #evaluationModal .score-button, #evaluationModal .clear-signature').forEach((field) => {
    field.disabled = isViewMode;
  });
  employeeSelect.disabled = isExistingEvaluation;
  document.querySelectorAll('#evaluationModal canvas').forEach((canvas) => {
    canvas.style.pointerEvents = isViewMode ? 'none' : '';
  });
}

function openModal(employee = employees[0], options = {}) {
  ensureEvaluationFields();
  editingEvaluationIndex = Number.isInteger(options.evaluationIndex) ? options.evaluationIndex : null;
  employeeSelect.value = employee.id;
  renderCriteria(employee.department, employee.role);
  updateEvaluationMetadata(employee);
  if (options.loadEvaluation) applyEvaluationToModal(latestEvaluation(employee, editingEvaluationIndex));
  setEvaluationModalMode(options.mode || 'new');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function ensureEvaluationFields() {
  if (document.querySelector('#evaluationDateInput')) return;
  const formRow = document.querySelector('#evaluationModal .form-row');
  formRow.insertAdjacentHTML('beforeend', '<label>Evaluation date<input id="evaluationDateInput" type="date" required /></label><label>Previous evaluation score<div class="previous-score" id="previousScore">No previous evaluation</div></label>');
  document.querySelector('#evaluationDateInput').addEventListener('change', updateEvaluationPeriod);
  const footer = document.querySelector('#evaluationModal .modal-footer');
  footer.insertAdjacentHTML('beforebegin', '<div class="evaluation-comments"><label>Employee Area of Development<textarea id="developmentComments" rows="3" placeholder="Add development areas..."></textarea></label><label>Employee Improvement<textarea id="improvementComments" rows="3" placeholder="Add improvement actions..."></textarea></label><label>Employee Strength<textarea id="strengthComments" rows="3" placeholder="Add employee strengths..."></textarea></label><label>Direct Manager Comments<textarea id="managerComments" rows="3" placeholder="Add direct manager comments..."></textarea></label><label>Evaluator Comment<textarea id="evaluatorComments" rows="3" placeholder="Add evaluator comments..."></textarea></label><div class="signature-grid"><label>Employee Signature<div class="signature-pad-wrap"><canvas id="employeeSignature" width="560" height="150"></canvas><button type="button" class="clear-signature" data-pad="employeeSignature">Clear</button></div></label><label>Manager Signature<div class="signature-pad-wrap"><canvas id="managerSignature" width="560" height="150"></canvas><button type="button" class="clear-signature" data-pad="managerSignature">Clear</button></div></label><label>Evaluator Signature<div class="signature-pad-wrap"><canvas id="evaluatorSignature" width="560" height="150"></canvas><button type="button" class="clear-signature" data-pad="evaluatorSignature">Clear</button></div></label></div></div>');
  document.querySelectorAll('.signature-pad-wrap canvas').forEach((canvas) => setupSignaturePad(canvas));
  document.querySelectorAll('.clear-signature').forEach((button) => button.addEventListener('click', () => clearSignaturePad(document.querySelector(`#${button.dataset.pad}`))));
  const style = document.createElement('style');
  style.textContent = '.evaluation-comments{display:grid;gap:10px;margin-top:24px}.evaluation-comments label{color:#777983;font-size:11px;font-weight:700}.evaluation-comments textarea{display:block;width:100%;margin-top:7px;resize:vertical;min-height:64px;border:1px solid var(--line);border-radius:7px;padding:10px;background:#fff;color:var(--ink);font:12px "DM Sans",sans-serif}.signature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px}.signature-pad-wrap{margin-top:7px}.signature-pad-wrap canvas{display:block;width:100%;height:100px;touch-action:none;background:#fff;border:1px solid var(--line);border-radius:7px}.clear-signature{margin-top:5px;background:transparent;color:var(--coral-dark);font-size:10px;font-weight:700;padding:0}.previous-score{display:flex;align-items:center;min-height:38px;margin-top:7px;padding:0 10px;border:1px solid var(--line);border-radius:7px;background:#fafafa;color:var(--ink);font:600 12px "Space Grotesk",sans-serif}@media(max-width:760px){.signature-grid{grid-template-columns:1fr}}';
  document.head.appendChild(style);
}

function setupSignaturePad(canvas) {
  const context = canvas.getContext('2d');
  context.strokeStyle = '#202331';
  context.lineWidth = 2.5;
  context.lineCap = 'round';
  canvas.addEventListener('pointerdown', (event) => {
    canvas.dataset.signed = 'true';
    try { canvas.setPointerCapture(event.pointerId); } catch (error) { }
    const point = signaturePoint(canvas, event);
    context.beginPath();
    context.moveTo(point.x, point.y);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (event.buttons !== 1) return;
    const point = signaturePoint(canvas, event);
    context.lineTo(point.x, point.y);
    context.stroke();
  });
}

function signaturePoint(canvas, event) {
  const bounds = canvas.getBoundingClientRect();
  return { x: (event.clientX - bounds.left) * (canvas.width / bounds.width), y: (event.clientY - bounds.top) * (canvas.height / bounds.height) };
}

function clearSignaturePad(canvas) {
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  canvas.dataset.signed = 'false';
}

function updateEvaluationMetadata(employee) {
  document.querySelector('#evaluationDateInput').value = new Date().toISOString().slice(0, 10);
  updateEvaluationPeriod();
  ['developmentComments', 'improvementComments', 'strengthComments', 'managerComments', 'evaluatorComments'].forEach((id) => { document.querySelector(`#${id}`).value = ''; });
  ['employeeSignature', 'managerSignature', 'evaluatorSignature'].forEach((id) => clearSignaturePad(document.querySelector(`#${id}`)));
}

function updateEmployeeOptions() {
  employeeSelect.innerHTML = employees.filter((employee) => !employee.deleted).map((employee) => `<option value="${employee.id}">${employee.name} · ${employee.role || employee.department}</option>`).join('');
}

function updateDesignationOptions() {
  const department = document.querySelector('#employeeDepartmentInput').value;
  let designationInput = document.querySelector('#designationInput');
  if (designationInput.tagName === 'INPUT') {
    const designationSelect = document.createElement('select');
    designationSelect.id = designationInput.id;
    designationSelect.required = true;
    designationInput.replaceWith(designationSelect);
    designationInput = designationSelect;
  }
  designationInput.innerHTML = `<option value="">Select designation</option>${(departmentRoles[department] || []).map((role) => `<option value="${role}">${role}</option>`).join('')}`;
}

function ensureEmployeeModalStyles() {
  const style = document.createElement('style');
  style.textContent = '#employeeModal .employee-modal{width:min(760px,100%);max-width:760px;padding:34px}.employee-modal .modal-header{padding-bottom:26px}.employee-modal .form-row{grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 18px;padding:26px 0}.employee-modal .form-row label{display:block;min-width:0}.employee-modal .form-row input,.employee-modal .form-row select{display:block;width:100%;height:42px;margin-top:8px;padding:0 12px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);font-size:12px}.employee-modal .modal-footer{margin-top:6px;padding-top:22px}.employee-modal .primary-button,.employee-modal .outline-button{min-height:42px}@media(max-width:760px){#employeeModal .employee-modal{padding:24px 18px}.employee-modal .form-row{grid-template-columns:1fr;gap:14px;padding:20px 0}}';
  document.head.appendChild(style);
}

function ensureBrandStyles() {
  const style = document.createElement('style');
  style.textContent = ':root{--brand:#013220}.brand{align-items:flex-start;color:var(--brand);line-height:1}.brand-mark{background:var(--brand);font-size:18px}.brand-name{display:flex;flex-direction:column;gap:5px;font-size:18px;letter-spacing:-.7px}.brand-name small{color:#58706a;font:600 8px "DM Sans",sans-serif;letter-spacing:.2px;white-space:nowrap}.primary-button{background:var(--brand)}.primary-button:hover{background:#024b31}.dark-button{background:var(--brand)}.row-actions{position:relative;display:inline-block}.action-menu{display:none;position:absolute;right:0;top:30px;z-index:5;width:155px;padding:5px;background:#fff;border:1px solid var(--line);border-radius:8px;box-shadow:0 10px 25px #20233122}.action-menu.open{display:grid}.action-menu button{padding:9px 10px;background:#fff;color:#5f6470;text-align:left;font-size:11px;border-radius:5px}.action-menu button:hover{background:#f3f7f4;color:var(--brand)}.action-menu button[data-action="delete"]{color:#b85c52}';
  document.head.appendChild(style);
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  editingEvaluationIndex = null;
}

function deleteEmployee(employee) {
  if (!window.confirm(`Delete ${employee.name} and all of their evaluations?`)) return;
  employees = employees.filter((item) => item.id !== employee.id);
  persistSavedEmployees();
  renderEmployeeRows();
  renderRows();
  updateEmployeeOptions();
  updateDashboardMetrics();
  toast.textContent = 'Employee deleted successfully.';
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2800);
}

function ensureEmployeeProfileFields() {
  if (document.querySelector('#employeeDocumentsInput')) return;
  const formRow = document.querySelector('#employeeForm .form-row');
  formRow.insertAdjacentHTML('afterend', '<div class="employee-documents"><label>Job description / supporting document<input id="employeeDocumentsInput" type="file" accept=".pdf,.doc,.docx" multiple /></label><div id="employeeDocumentsList" class="employee-documents-list">No documents attached.</div></div>');
  const style = document.createElement('style');
  style.textContent = '.employee-row-actions{display:flex;gap:6px}.employee-row-actions button{border:1px solid var(--line);border-radius:6px;background:#fff;color:var(--brand);font-size:10px;font-weight:700;padding:7px 9px}.employee-row-actions button:hover{background:#f3f7f4}.employee-documents{border-top:1px solid var(--line);padding-top:18px}.employee-documents label{display:block;color:#777983;font-size:11px;font-weight:700}.employee-documents input{display:block;width:100%;margin-top:8px;font-size:11px}.employee-documents-list{margin-top:9px;color:#7d808b;font-size:11px}.employee-document{display:flex;justify-content:space-between;padding:7px 9px;background:#f7faf8;border:1px solid #e3ece7;border-radius:6px;margin-top:5px}.employee-document a{color:var(--brand);font-weight:700}';
  document.head.appendChild(style);
}

function openEmployeeModal() {
  ensureEmployeeProfileFields();
  editingEmployeeId = null;
  employeeForm.reset();
  document.querySelector('#employeeDocumentsList').textContent = 'No documents attached.';
  employeeModal.classList.add('open');
  employeeModal.setAttribute('aria-hidden', 'false');
}

function openEmployeeEditor(employee) {
  ensureEmployeeProfileFields();
  editingEmployeeId = employee.id;
  employeeForm.reset();
  document.querySelector('#fullNameInput').value = employee.name;
  document.querySelector('#employeeDepartmentInput').value = employee.department;
  updateDesignationOptions();
  document.querySelector('#designationInput').value = employee.role || '';
  document.querySelector('#joiningDateInput').value = employee.joiningDate || '';
  document.querySelector('#reportingToInput').value = employee.reportingTo || '';
  renderEmployeeDocuments(employee);
  employeeModal.classList.add('open');
  employeeModal.setAttribute('aria-hidden', 'false');
}

function renderEmployeeDocuments(employee) {
  const documents = employee.documents || [];
  document.querySelector('#employeeDocumentsList').innerHTML = documents.length ? documents.map((document) => `<div class="employee-document"><span>${escapeHtml(document.name)}</span>${document.dataUrl ? `<a href="${document.dataUrl}" download="${escapeHtml(document.name)}">Download</a>` : '<span>Attached</span>'}</div>`).join('') : 'No documents attached.';
}

function readAttachment(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, dataUrl: reader.result });
    reader.onerror = () => resolve({ name: file.name, type: file.type, size: file.size });
    reader.readAsDataURL(file);
  });
}

function closeEmployeeModal() {
  employeeModal.classList.remove('open');
  employeeModal.setAttribute('aria-hidden', 'true');
}

document.querySelector('#newEvaluationButton').addEventListener('click', () => openModal());
document.querySelector('#heroStartButton').addEventListener('click', () => openModal());
document.querySelector('#addEmployeeButton').addEventListener('click', openEmployeeModal);
importEmployeesButton.addEventListener('click', () => employeeCsvInput.click());
employeeCsvInput.addEventListener('change', async () => {
  const file = employeeCsvInput.files?.[0];
  employeeCsvInput.value = '';
  if (!file) return;
  try {
    const count = await importEmployeesFromCsv(file);
    toast.textContent = `${count} employee${count === 1 ? '' : 's'} imported successfully.`;
  } catch (error) {
    toast.textContent = error.message;
  }
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3500);
});
document.querySelector('#closeEmployeeModal').addEventListener('click', closeEmployeeModal);
document.querySelector('#cancelEmployeeModal').addEventListener('click', closeEmployeeModal);
employeeModal.addEventListener('click', (event) => { if (event.target === employeeModal) closeEmployeeModal(); });
employeeSearchInput.addEventListener('input', renderEmployeeRows);
document.querySelector('#employeeDepartmentInput').addEventListener('change', updateDesignationOptions);
employeeForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = document.querySelector('#fullNameInput').value.trim();
  const department = document.querySelector('#employeeDepartmentInput').value;
  const designation = document.querySelector('#designationInput').value.trim();
  const joiningDate = document.querySelector('#joiningDateInput').value;
  const reportingTo = document.querySelector('#reportingToInput').value.trim();
  const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const existing = employeeById(editingEmployeeId);
  const employee = existing || { id: `employee-${Date.now()}`, initials, evaluator: reportingTo, score: 0, status: 'Pending', color: 'blue' };
  const selectedFiles = [...document.querySelector('#employeeDocumentsInput').files];
  const attachments = selectedFiles.length ? await Promise.all(selectedFiles.map(readAttachment)) : [];
  Object.assign(employee, { name, initials, department, role: designation, designation, joiningDate, reportingTo, evaluator: reportingTo });
  employee.documents = [...(employee.documents || []), ...attachments];
  if (!existing) employees.push(employee);
  persistSavedEmployees();
  await syncCloudData();
  renderEmployeeRows();
  renderRows();
  updateEmployeeOptions();
  closeEmployeeModal();
  toast.textContent = existing ? 'Employee updated successfully.' : 'Employee added successfully.';
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2800);
});
employeeRows.addEventListener('click', (event) => {
  const action = event.target.closest('[data-employee-action]');
  if (!action) return;
  const employee = employeeById(action.dataset.employeeId);
  if (!employee) return;
  if (action.dataset.employeeAction === 'edit') openEmployeeEditor(employee);
  if (action.dataset.employeeAction === 'scores') showEmployeeScores(employee);
  if (action.dataset.employeeAction === 'delete') deleteEmployee(employee);
});

function showEmployeeScores(employee) {
  const evaluations = employeeEvaluations(employee);
  let modalElement = document.querySelector('#scoreHistoryModal');
  if (!modalElement) {
    modalElement = document.createElement('div');
    modalElement.id = 'scoreHistoryModal';
    modalElement.className = 'modal-backdrop open';
    modalElement.innerHTML = '<section class="evaluation-modal score-history-modal" role="dialog" aria-modal="true" aria-labelledby="scoreHistoryTitle"><button class="close-button" id="closeScoreHistory" aria-label="Close score history">×</button><span class="section-kicker">Evaluation history</span><h2 id="scoreHistoryTitle"></h2><p class="score-history-subtitle"></p><div class="score-history-list"></div></section>';
    document.body.appendChild(modalElement);
    const style = document.createElement('style');
    style.textContent = '.score-history-modal{width:min(780px,100%);max-height:85vh;overflow:auto}.score-history-subtitle{color:var(--muted);font-size:12px}.score-history-list{display:grid;gap:10px;margin-top:20px}.score-history-row{display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center;padding:14px;background:#f7faf8;border:1px solid #e3ece7;border-radius:8px}.score-history-row strong{font:600 18px "Space Grotesk";color:var(--brand)}.score-history-row small{display:block;color:var(--muted);margin-top:4px}.score-history-score{font:700 22px "Space Grotesk";color:var(--brand);white-space:nowrap}.score-history-actions{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end}.score-history-actions button{border:1px solid var(--line);border-radius:6px;background:#fff;color:var(--brand);font-size:10px;font-weight:700;padding:7px 9px}.score-history-actions button:hover{background:#f3f7f4}.score-history-actions button[data-history-action="delete"]{color:#b85c52}.score-history-empty{padding:20px;text-align:center;background:#fafafa;color:var(--muted)}@media(max-width:760px){.score-history-row{grid-template-columns:1fr}.score-history-actions{justify-content:flex-start}}';
    document.head.appendChild(style);
    document.querySelector('#closeScoreHistory').addEventListener('click', () => modalElement.remove());
    modalElement.addEventListener('click', (event) => {
      if (event.target === modalElement) modalElement.remove();
      const action = event.target.closest('[data-history-action]');
      if (!action) return;
      const selectedEmployee = employeeById(action.dataset.employeeId);
      const evaluationIndex = Number(action.dataset.evaluationIndex);
      if (!selectedEmployee) return;
      const selectedEvaluation = latestEvaluation(selectedEmployee, evaluationIndex);
      if (action.dataset.historyAction === 'view' || action.dataset.historyAction === 'edit') {
        modalElement.remove();
        openModal(selectedEmployee, { loadEvaluation: true, mode: action.dataset.historyAction, evaluationIndex });
      }
      if (action.dataset.historyAction === 'delete') {
        deleteEvaluation(selectedEmployee, evaluationIndex);
        if (document.body.contains(modalElement)) showEmployeeScores(selectedEmployee);
      }
      if (action.dataset.historyAction === 'print') exportEvaluationPdf(selectedEmployee, selectedEvaluation);
    });
  }
  modalElement.querySelector('#scoreHistoryTitle').textContent = `${employee.name} · Evaluation forms`;
  modalElement.querySelector('.score-history-subtitle').textContent = `${employee.department} · ${employee.role || 'Designation not provided'}`;
  modalElement.querySelector('.score-history-list').innerHTML = evaluations.length ? evaluations.map((evaluation, evaluationIndex) => ({ evaluation, evaluationIndex })).reverse().map(({ evaluation, evaluationIndex }) => `<div class="score-history-row"><div><strong>Evaluation ${evaluationIndex + 1}</strong><small>${escapeHtml(evaluation.date || 'Date not recorded')}</small></div><div><div class="score-history-score">${evaluation.score}/100</div><div class="score-history-actions"><button type="button" data-history-action="view" data-employee-id="${employee.id}" data-evaluation-index="${evaluationIndex}">View form</button><button type="button" data-history-action="edit" data-employee-id="${employee.id}" data-evaluation-index="${evaluationIndex}">Edit form</button><button type="button" data-history-action="delete" data-employee-id="${employee.id}" data-evaluation-index="${evaluationIndex}">Delete form</button><button type="button" data-history-action="print" data-employee-id="${employee.id}" data-evaluation-index="${evaluationIndex}">Export PDF</button></div></div></div>`).join('') : '<div class="score-history-empty">No completed evaluation forms yet.</div>';
  modalElement.classList.add('open');
}
document.querySelector('#closeModal').addEventListener('click', closeModal);
document.querySelector('#cancelModal').addEventListener('click', closeModal);
modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
searchInput.addEventListener('input', renderRows);
departmentFilter.addEventListener('change', renderRows);
progressCurrentQuarter.addEventListener('change', renderQuarterlyProgress);
progressPreviousQuarter.addEventListener('change', renderQuarterlyProgress);
rows.addEventListener('click', (event) => {
  const menuButton = event.target.closest('.table-more');
  if (menuButton) {
    event.stopPropagation();
    document.querySelectorAll('.action-menu').forEach((menu) => menu.classList.remove('open'));
    document.querySelector(`[data-menu-for="${menuButton.dataset.employeeId}-${menuButton.dataset.evaluationIndex}"]`).classList.toggle('open');
    return;
  }
  const actionButton = event.target.closest('.action-menu button');
  if (!actionButton) return;
  const employee = employeeById(actionButton.dataset.employeeId);
  const evaluationIndex = Number(actionButton.dataset.evaluationIndex);
  document.querySelectorAll('.action-menu').forEach((menu) => menu.classList.remove('open'));
  if (!employee) return;
  const evaluation = latestEvaluation(employee, evaluationIndex);
  if (actionButton.dataset.action === 'delete-evaluation') deleteEvaluation(employee, evaluationIndex);
  if (actionButton.dataset.action === 'print') exportEvaluationPdf(employee, evaluation);
  if (actionButton.dataset.action === 'view' || actionButton.dataset.action === 'edit') openModal(employee, { loadEvaluation: true, mode: actionButton.dataset.action, evaluationIndex });
});
employeeSelect.addEventListener('change', () => {
  const employee = employees.find((item) => item.id === employeeSelect.value);
  renderCriteria(employee.department, employee.role);
  updateEvaluationMetadata(employee);
  updateTotal();
});
document.querySelector('#saveEvaluation').addEventListener('click', () => {
  const signaturesComplete = ['employeeSignature', 'managerSignature', 'evaluatorSignature'].every((id) => document.querySelector(`#${id}`).dataset.signed === 'true');
  if (!signaturesComplete) {
    toast.textContent = 'Please add all three signatures before saving.';
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 2800);
    return;
  }
  const employee = employees.find((item) => item.id === employeeSelect.value);
  const score = Number(totalScore.textContent);
  if (employee && score > 0) {
    const evaluation = {
      score,
      date: document.querySelector('#evaluationDateInput').value,
      criteria: [...document.querySelectorAll('.score-buttons')].map((group) => group.querySelector('.selected')?.dataset.score ?? ''),
      development: document.querySelector('#developmentComments').value,
      improvement: document.querySelector('#improvementComments').value,
      strength: document.querySelector('#strengthComments').value,
      managerComments: document.querySelector('#managerComments').value,
      evaluatorComment: document.querySelector('#evaluatorComments').value,
      signatures: getSignatureData()
    };
    if (evaluationModalMode === 'edit' && (employee.evaluations?.length || employee.evaluation)) {
      employee.evaluations = [...(employee.evaluations || (employee.evaluation ? [employee.evaluation] : []))];
      const targetIndex = Number.isInteger(editingEvaluationIndex) ? editingEvaluationIndex : employee.evaluations.length - 1;
      employee.evaluations[targetIndex] = evaluation;
    } else {
      employee.evaluations = [...(employee.evaluations || []), evaluation];
    }
    employee.evaluation = employee.evaluations[employee.evaluations.length - 1];
    employee.score = employee.evaluation?.score || score;
    employee.status = 'Completed';
    employee.evaluationDeleted = false;
    deletedEvaluationIds.delete(employee.id);
    localStorage.setItem('northstar-deleted-evaluations', JSON.stringify([...deletedEvaluationIds]));
    persistSavedEmployees();
    void syncCloudData();
    renderRows();
    updateDashboardMetrics();
  }
  closeModal();
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2800);
});
function switchTab(tabName) {
  document.querySelectorAll('[data-tab-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.tabPanel === tabName));
  document.querySelectorAll('.primary-nav .nav-item').forEach((item) => item.classList.toggle('active', item.dataset.tab === tabName));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
document.querySelectorAll('.primary-nav [data-tab]').forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  switchTab(link.dataset.tab);
}));
document.querySelector('#viewAllButton').addEventListener('click', () => {
  searchInput.value = '';
  departmentFilter.value = 'all';
  renderRows();
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
document.addEventListener('click', (event) => { if (!event.target.closest('.row-actions')) document.querySelectorAll('.action-menu').forEach((menu) => menu.classList.remove('open')); });

renderRows();
renderEmployeeRows();
updateEmployeeOptions();
const departmentInput = document.querySelector('#employeeDepartmentInput');
['IT', 'Customer Service'].forEach((department) => {
  if (![...departmentInput.options].some((option) => option.value === department)) departmentInput.insertAdjacentHTML('beforeend', `<option>${department}</option>`);
});
if (![...departmentFilter.options].some((option) => option.value === 'Customer Service')) departmentFilter.insertAdjacentHTML('beforeend', '<option value="Customer Service">Customer Service</option>');
updateDesignationOptions();
ensureEmployeeModalStyles();
ensureBrandStyles();

window.addEventListener('qbel-auth-ready', () => { void loadCloudData(); });
if (typeof Auth !== 'undefined' && Auth.currentUser) void loadCloudData();
