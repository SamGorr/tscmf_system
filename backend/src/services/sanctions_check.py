import json
import os
import re
from fuzzywuzzy import fuzz
from datetime import datetime

# Load the watchlist data
def load_watchlist_data():
    """
    Load sanctioned entities from the watchlist data file
    """
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(current_dir, '..', '..', 'data', 'watchlists', 'sanctioned_banks.json')
        
        with open(file_path, 'r', encoding='utf-8') as file:
            watchlist_data = json.load(file)
        
        return watchlist_data
    except Exception as e:
        print(f"Error loading watchlist data: {str(e)}")
        return []

def preprocess_name(name):
    """
    Preprocess a name for better matching:
    - Convert to lowercase
    - Remove special characters and extra spaces
    - Remove common words like "bank", "ltd", etc.
    """
    if not name:
        return ""
    
    # Convert to lowercase
    name = name.lower()
    
    # Remove special characters and extra spaces
    name = re.sub(r'[^\w\s]', ' ', name)
    name = re.sub(r'\s+', ' ', name).strip()
    
    # Remove common words that don't add to entity identity
    common_words = ['bank', 'ltd', 'limited', 'corporation', 'corp', 'inc', 'incorporated']
    name_parts = name.split()
    name_parts = [part for part in name_parts if part not in common_words]
    
    return ' '.join(name_parts)

def check_entity_against_watchlist(entity_name, entity_country=None):
    """
    Check if an entity matches against any entry in the watchlist
    Returns match status and details of potential matches
    """
    watchlist = load_watchlist_data()
    
    # Preprocess the entity name
    processed_entity_name = preprocess_name(entity_name)
    
    matches = []
    
    for watchlist_entry in watchlist:
        basic_info = watchlist_entry.get('basic_information', {})
        watchlist_name = basic_info.get('entity_name', '')
        watchlist_country = basic_info.get('country', '')
        
        # Preprocess the watchlist entity name
        processed_watchlist_name = preprocess_name(watchlist_name)
        
        # Calculate name similarity score
        name_similarity = fuzz.ratio(processed_entity_name, processed_watchlist_name)
        
        # Boost score if country matches (if provided)
        country_bonus = 0
        if entity_country and watchlist_country:
            if entity_country.lower() == watchlist_country.lower():
                country_bonus = 10
        
        # If similarity exceeds threshold or country matches exactly, consider it a match
        if name_similarity >= 75 or (name_similarity >= 60 and country_bonus > 0):
            match_details = {
                "match_name": watchlist_name,
                "match_score": name_similarity + country_bonus,
                "country": watchlist_country,
                "full_address": basic_info.get('full_address', ''),
                "swift_code": basic_info.get('swift_code', ''),
                "entity_type": basic_info.get('entity_type', ''),
                "sanctions": watchlist_entry.get('sanction_information', []),
                "adverse_news": watchlist_entry.get('adverse_news', [])
            }
            matches.append(match_details)
    
    # Sort matches by score (descending)
    matches.sort(key=lambda x: x["match_score"], reverse=True)
    
    # Determine status based on matches
    if matches:
        status = "Reviewed"  # Potential match found, needs review
    else:
        status = "Cleared"   # No matches found
    
    return {
        "status": status,
        "matches": matches,
        "check_timestamp": datetime.utcnow().isoformat()
    }

def check_transaction_entities(transaction_entities):
    """
    Check all entities associated with a transaction
    Returns a dictionary of entity names to their sanction check results
    """
    results = {}
    
    for entity in transaction_entities:
        entity_name = entity.get('name')
        entity_country = entity.get('country')
        
        if entity_name:
            check_result = check_entity_against_watchlist(entity_name, entity_country)
            results[entity_name] = check_result
    
    return results 