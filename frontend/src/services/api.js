const API_BASE = import.meta.env.VITE_API_URL || '';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch (err) {
    console.error("Health check error:", err);
    return { status: "offline", service: "BIS Sahayak V2" };
  }
}

export async function getDatasetStats() {
  try {
    const res = await fetch(`${API_BASE}/api/dataset-stats`);
    return await res.json();
  } catch (err) {
    return { indexed_count: 14, standards: [], message: "14 core standards indexed" };
  }
}

// V2 Core Feature: Product -> Applicable BIS Standard Mapping
export async function mapProductToStandard(productQuery, language = "en") {
  const res = await fetch(`${API_BASE}/api/product-to-standard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_query: productQuery, language })
  });
  if (!res.ok) throw new Error(`Product mapping failed: ${res.status}`);
  return await res.json();
}

// V2 Core Feature: Compliance Readiness & Requirement Matrix
export async function evaluateComplianceMatrix({ product_query, standard_id, user_evidence_items }) {
  const res = await fetch(`${API_BASE}/api/compliance/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_query, standard_id, user_evidence_items })
  });
  if (!res.ok) throw new Error(`Compliance evaluation failed: ${res.status}`);
  return await res.json();
}

// V2 Core Feature: Document & Test Report Analyzer
export async function analyzeDocument({ file_name, content_text, standard_id = null }) {
  const res = await fetch(`${API_BASE}/api/document/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_name, content_text, standard_id })
  });
  if (!res.ok) throw new Error(`Document analysis failed: ${res.status}`);
  return await res.json();
}

// V2 Core Feature: Standard Comparator
export async function compareStandards(standardA, standardB) {
  const res = await fetch(`${API_BASE}/api/standards/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ standard_a: standardA, standard_b: standardB })
  });
  if (!res.ok) throw new Error(`Comparison failed: ${res.status}`);
  return await res.json();
}

// Core Chat / Question Answering
export async function sendChatMessage({ query, mode = "simple", language = "auto", sector = null, session_id = null }) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, mode, language, sector, session_id })
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return await res.json();
}

// ISI / CML License Verification
export async function verifyISILicense(isi_number, product_type = null) {
  const res = await fetch(`${API_BASE}/api/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isi_number, product_type })
  });
  if (!res.ok) throw new Error(`Verification error ${res.status}`);
  return await res.json();
}

// User Feedback
export async function submitFeedback({ session_id, message_id, rating, comment = null }) {
  const res = await fetch(`${API_BASE}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, message_id, rating, comment })
  });
  return await res.json();
}

// Official PDF Export
export async function downloadChecklistPDF({ product_description, standards, language = "en", company_name = "Applicant Organization" }) {
  const res = await fetch(`${API_BASE}/api/export/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_description, standards, language, company_name })
  });
  if (!res.ok) throw new Error("PDF generation failed");
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BIS_Compliance_Checklist_${product_description.replace(/\s+/g, '_')}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
