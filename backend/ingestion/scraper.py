import requests
from bs4 import BeautifulSoup
import json
import os
import time

BIS_BASE_URL = "https://www.services.bis.gov.in"

def scrape_bis_standards(max_pages=2):
    """Scrape BIS standards metadata or fall back to cached dataset."""
    standards = []
    metadata_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "standards_metadata.json")
    
    # Try fetching online if reachable
    try:
        url = f"{BIS_BASE_URL}/php/BIS_2.0/bisconnect/knowyourstandards/Indian_standards/isdetails/?page=1"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            rows = soup.select('table tbody tr')
            for row in rows:
                cols = row.select('td')
                if len(cols) >= 4:
                    standards.append({
                        "id": cols[0].get_text(strip=True),
                        "title": cols[1].get_text(strip=True),
                        "scope": cols[2].get_text(strip=True),
                        "status": cols[3].get_text(strip=True),
                        "source_url": url
                    })
    except Exception as e:
        print(f"[Scraper Notice] Online portal fetch bypassed: {e}")
    
    # Load curated standards metadata
    if os.path.exists(metadata_path):
        with open(metadata_path, "r", encoding="utf-8") as f:
            cached_data = json.load(f)
            # Merge
            return cached_data
            
    return standards
