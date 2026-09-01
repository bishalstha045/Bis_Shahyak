import asyncio
import httpx
from app.services.rag_pipeline import process_query
from app.routes.verify import verify_isi_license
from app.models.schemas import VerifyRequest
from app.utils.pdf_generator import generate_compliance_pdf

async def test_all():
    print("Testing BIS Sahayak Backend Services...")
    
    # 1. Test Query 1: Electric Kettles
    res1 = await process_query("What safety standards apply to electric kettles?", mode="simple")
    print("\n--- TEST 1: Electric Kettles ---")
    print(f"Confidence: {res1['confidence']}%")
    print(f"Citations count: {len(res1['citations'])}")
    print(f"Answer snippet: {res1['answer'][:150]}...")
    assert len(res1['citations']) > 0
    assert "IS 302" in res1['citations'][0]['standard_id']
    
    # 2. Test Query 2: Hindi IS 3196 LPG cylinders
    res2 = await process_query("IS 3196 के बारे में बताइए", mode="simple")
    print("\n--- TEST 2: Hindi IS 3196 ---")
    print(f"Language: {res2['language']}")
    print(f"Confidence: {res2['confidence']}%")
    print(f"Answer snippet: {res2['answer'][:150]}...")
    assert "IS 3196" in res2['answer'] or "3196" in str(res2['citations'])
    
    # 3. Test Verify: CM/L-7128394
    v_req = VerifyRequest(isi_number="CM/L-7128394")
    v_res = await verify_isi_license(v_req)
    print("\n--- TEST 3: CML License Verification ---")
    print(f"Valid: {v_res.is_valid}, Manufacturer: {v_res.manufacturer_name}, Standard: {v_res.standard_id}")
    assert v_res.is_valid is True
    assert "Bajaj" in v_res.manufacturer_name
    
    # 4. Test PDF Export
    pdf_bytes = generate_compliance_pdf(
        product_description="Electric Kettle 1.5L Stainless Steel",
        standards=[{"standard_id": "IS 302-2-15", "title": "Electric Kettles", "section": "Clause 7 & 19"}]
    )
    print("\n--- TEST 4: PDF Generation ---")
    print(f"Generated PDF bytes: {len(pdf_bytes)} bytes")
    assert len(pdf_bytes) > 1000
    
    print("\nALL BACKEND UNIT TESTS PASSED!")

if __name__ == "__main__":
    asyncio.run(test_all())
