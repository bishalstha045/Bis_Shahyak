import { HsCode } from '../models/HsCode.js';
import { normalizeHsCode } from '../utils/hs_helper.js';

export class HsnService {
  /**
   * Find matching HSN document by code or keyword from user query
   */
  async findHsnByQuery(query) {
    if (!query || typeof query !== 'string') return null;
    const trimmed = query.trim();

    // 1. Check if query contains an HS code (4, 6, or 8 digits, e.g. 0101, 0101.29.10, 0101 21 00, 0201.30.00, 8463.10)
    const codeMatch = trimmed.match(/\b\d{4}(?:[.\s]?\d{2}){0,2}\b/);
    if (codeMatch) {
      const normalized = normalizeHsCode(codeMatch[0]);
      if (normalized) {
        try {
          const doc = await HsCode.findOne({ hs_code: normalized }).lean();
          if (doc) return doc;
        } catch (e) {}
      }
    }

    // Direct normalization of entire query
    const directNorm = normalizeHsCode(trimmed);
    if (directNorm) {
      try {
        const doc = await HsCode.findOne({ hs_code: directNorm }).lean();
        if (doc) return doc;
      } catch (e) {}
    }

    // 2. Keyword search on description
    // Only search description keywords if:
    // a) The query is short (<= 4 words, typical of a product search like "boneless", "horses for polo", "tuna")
    // OR b) The query explicitly mentions product, tariff, HSN, or BIS regulatory terms
    const words = trimmed.split(/\s+/);
    const isProductIntent = words.length <= 4 ||
      /\b(hsn|hs\s*code|tariff|product|item|commodity|goods|customs|qco|bis|import|export|gst|standard|standards)\b/i.test(trimmed);

    if (!isProductIntent) {
      return null;
    }

    const stopWords = new Set([
      'write', 'code', 'python', 'javascript', 'react', 'function', 'method', 'class', 
      'string', 'variable', 'check', 'program', 'palindrome', 'solve', 'calculate', 'explain', 
      'create', 'build', 'debug', 'error', 'fix', 'help', 'translate', 'hello', 'hey', 'hi', 
      'how', 'why', 'who', 'where', 'when', 'what', 'which', 'tell', 'about', 'please', 'give', 
      'need', 'is', 'for', 'the', 'and', 'with', 'this', 'that', 'from', 'have', 'does', 'will', 
      'can', 'should', 'would', 'could', 'standard', 'standards', 'indian', 'hsn', 'hscode', 
      'item', 'details', 'apply', 'product', 'items', 'products', 'code', 'codes', 'give', 'ans', 'answer'
    ]);
    const keywords = trimmed.split(/[^a-zA-Z0-9]+/).filter(w => w.length >= 3 && !stopWords.has(w.toLowerCase()));

    if (keywords.length > 0) {
      try {
        // A. Check for exact full phrase match in description
        const escapedFull = keywords.join(' ').replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        let doc = await HsCode.findOne({ description: new RegExp(`\\b${escapedFull}\\b`, 'i') }).lean();
        if (doc) return doc;

        // B. Sort keywords by length descending (e.g. "boneless" > "meat")
        const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
        for (const kw of sortedKeywords) {
          if (kw.length >= 4) {
            const escaped = kw.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            doc = await HsCode.findOne({ description: new RegExp(`\\b${escaped}\\b`, 'i') }).lean();
            if (doc) return doc;
          }
        }
      } catch (e) {}
    }

    return null;
  }

  /**
   * Convert HSN document into an authoritative RAG context chunk
   */
  buildHsnChunk(hsnDoc) {
    if (!hsnDoc) return null;
    return {
      content: `OFFICIAL HSN / ITC-HS REGISTRATION:\n` +
        `• HS Code: ${hsnDoc.hs_code}\n` +
        `• Regulated Item Description: ${hsnDoc.description}\n` +
        `• Classification: National Customs Tariff / DGFT / Bureau of Indian Standards HSN Directory\n` +
        `• Statutory Scope: Goods manufactured, imported, or sold under HS Code ${hsnDoc.hs_code} (${hsnDoc.description}) are subject to applicable Indian Standards (IS), mandatory Quality Control Orders (QCOs), and statutory BIS certification where notified by the Government of India.`,
      standard_id: `HSN ${hsnDoc.hs_code}`,
      standard_title: hsnDoc.description,
      section: "Harmonized System of Nomenclature (HSN)",
      page: "1",
      source: "Directorate General of Foreign Trade (DGFT) & BIS HSN Register",
      source_url: "https://www.services.bis.gov.in",
      score: 40,
      relevance_score: 0.99
    };
  }

  /**
   * Search HSN records with pagination/limit for the Standards page
   */
  async searchHsn(searchTerm, limit = 10) {
    if (!searchTerm) return [];
    const trimmed = searchTerm.trim();
    const normalized = normalizeHsCode(trimmed);

    try {
      if (normalized) {
        const exact = await HsCode.findOne({ hs_code: normalized }).lean();
        if (exact) return [exact];
      }

      const escaped = trimmed.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const results = await HsCode.find({
        $or: [
          { hs_code: new RegExp(escaped, 'i') },
          { description: new RegExp(escaped, 'i') }
        ]
      }).limit(limit).lean();

      return results;
    } catch (e) {
      console.warn("[HsnService search error]", e.message);
      return [];
    }
  }
}

export const hsnService = new HsnService();
