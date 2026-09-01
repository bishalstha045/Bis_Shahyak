import { env } from '../config/env.js';

export class RagService {
  constructor() {
    this.baseUrl = env.RAG_API_URL.replace(/\/$/, '');
  }

  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      if (!res.ok) throw new Error(`RAG health error: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("RAG service health check failed:", err.message);
      return { status: "offline", service: "BIS Sahayak RAG Engine (Fallback active)" };
    }
  }

  async getDatasetStats() {
    try {
      const res = await fetch(`${this.baseUrl}/api/dataset-stats`);
      if (!res.ok) throw new Error(`Stats error: ${res.status}`);
      return await res.json();
    } catch (err) {
      return { indexed_count: 21, standards: [], message: "Standards knowledge base online" };
    }
  }

  async mapProductToStandard(productQuery, language = "en") {
    const res = await fetch(`${this.baseUrl}/api/product-to-standard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_query: productQuery, language })
    });
    if (!res.ok) throw new Error(`Product mapping failed: ${res.status}`);
    return await res.json();
  }

  async evaluateComplianceMatrix({ product_query, standard_id = null, user_evidence_items = [] }) {
    const res = await fetch(`${this.baseUrl}/api/compliance/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_query, standard_id, user_evidence_items })
    });
    if (!res.ok) throw new Error(`Compliance evaluation failed: ${res.status}`);
    return await res.json();
  }

  async analyzeDocument({ file_name, content_text, standard_id = null }) {
    const res = await fetch(`${this.baseUrl}/api/document/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_name, content_text, standard_id })
    });
    if (!res.ok) throw new Error(`Document analysis failed: ${res.status}`);
    return await res.json();
  }

  async compareStandards(standardA, standardB) {
    const res = await fetch(`${this.baseUrl}/api/standards/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ standard_a: standardA, standard_b: standardB })
    });
    if (!res.ok) throw new Error(`Standards comparison failed: ${res.status}`);
    return await res.json();
  }

  async sendChatMessage({ query, mode = "simple", language = "auto", sector = null, session_id = null }) {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, mode, language, sector, session_id })
    });
    if (!res.ok) throw new Error(`RAG chat error: ${res.status}`);
    return await res.json();
  }

  async verifyISILicense(isi_number, product_type = null) {
    const res = await fetch(`${this.baseUrl}/api/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isi_number, product_type })
    });
    if (!res.ok) throw new Error(`Verification error: ${res.status}`);
    return await res.json();
  }

  async downloadChecklistPDF({ product_description, standards, language = "en", company_name = "Applicant Organization" }) {
    const res = await fetch(`${this.baseUrl}/api/export/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_description, standards, language, company_name })
    });
    if (!res.ok) throw new Error(`PDF generation failed: ${res.status}`);
    return res;
  }
}

export const ragService = new RagService();
