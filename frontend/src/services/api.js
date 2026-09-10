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

// -------------------------------------------------------------
// Dedicated Administrative API Client (Secured with Admin Token)
// -------------------------------------------------------------
const getAdminHeaders = () => {
  const token = localStorage.getItem('bis_token') || 'admin-demo-token-12345';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export async function getAdminStats() {
  const res = await fetch(`${API_BASE}/api/admin/dashboard/stats`, {
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error(`Failed to load admin stats: ${res.status}`);
  const json = await res.json();
  return json.data;
}

export async function getAdminVerifications({ search = '', status = 'ALL', category = 'ALL' } = {}) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status && status !== 'ALL') params.append('status', status);
  if (category && category !== 'ALL') params.append('category', category);

  const res = await fetch(`${API_BASE}/api/admin/verifications?${params.toString()}`, {
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error(`Failed to load verifications: ${res.status}`);
  const json = await res.json();
  return json.data?.submissions || [];
}

export async function getAdminVerificationById(id) {
  const res = await fetch(`${API_BASE}/api/admin/verifications/${id}`, {
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error(`Failed to load submission: ${res.status}`);
  const json = await res.json();
  return json.data?.submission;
}

export async function approveAdminVerification(id) {
  const res = await fetch(`${API_BASE}/api/admin/verifications/${id}/approve`, {
    method: 'POST',
    headers: getAdminHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Approval failed (${res.status})`);
  }
  const json = await res.json();
  return json.data?.submission;
}

export async function rejectAdminVerification(id, rejectionReason) {
  const res = await fetch(`${API_BASE}/api/admin/verifications/${id}/reject`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify({ rejection_reason: rejectionReason })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Rejection failed (${res.status})`);
  }
  const json = await res.json();
  return json.data?.submission;
}

export async function getAdminUsers({ search = '', role = 'ALL', status = 'ALL' } = {}) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (role && role !== 'ALL') params.append('role', role);
  if (status && status !== 'ALL') params.append('status', status);

  const res = await fetch(`${API_BASE}/api/admin/users?${params.toString()}`, {
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error(`Failed to load users: ${res.status}`);
  const json = await res.json();
  return json.data?.users || [];
}

export async function updateAdminUserStatus(id, status) {
  const res = await fetch(`${API_BASE}/api/admin/users/${id}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Status update failed (${res.status})`);
  }
  const json = await res.json();
  return json.data?.user;
}

export async function deleteAdminUser(id) {
  const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Delete failed (${res.status})`);
  }
  return await res.json();
}

export async function getAdminReports({ search = '', status = 'ALL' } = {}) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status && status !== 'ALL') params.append('status', status);

  const res = await fetch(`${API_BASE}/api/admin/reports?${params.toString()}`, {
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error(`Failed to load reports: ${res.status}`);
  const json = await res.json();
  return json.data?.reports || [];
}

export async function resolveAdminReport(id, { resolution_notes, action_taken } = {}) {
  const res = await fetch(`${API_BASE}/api/admin/reports/${id}/resolve`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify({ resolution_notes, action_taken })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Resolution failed (${res.status})`);
  }
  const json = await res.json();
  return json.data?.report;
}

export async function dismissAdminReport(id, { notes } = {}) {
  const res = await fetch(`${API_BASE}/api/admin/reports/${id}/dismiss`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify({ notes })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Dismiss failed (${res.status})`);
  }
  const json = await res.json();
  return json.data?.report;
}

export async function getAdminActivity({ limit = 50, target_type = 'ALL' } = {}) {
  const params = new URLSearchParams();
  params.append('limit', limit);
  if (target_type && target_type !== 'ALL') params.append('target_type', target_type);

  const res = await fetch(`${API_BASE}/api/admin/activity?${params.toString()}`, {
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error(`Failed to load activity logs: ${res.status}`);
  const json = await res.json();
  return json.data?.activities || [];
}

export async function getAdminContent() {
  const res = await fetch(`${API_BASE}/api/admin/content`, {
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error(`Failed to load content stats: ${res.status}`);
  const json = await res.json();
  return json.data;
}

export async function getAdminSettings() {
  const res = await fetch(`${API_BASE}/api/admin/settings`, {
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error(`Failed to load admin settings: ${res.status}`);
  const json = await res.json();
  return json.data;
}

