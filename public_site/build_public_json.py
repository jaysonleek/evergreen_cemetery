# === CHUNK 1 OF 3 ===
"""
Build Public JSON for Evergreen Cemetery Website
VERSION = "0.1.0"

This script:
- Loads evergreen_master_atomic.csv
- Selects public-safe fields
- Cleans and normalizes values
- Outputs public_site/data.json
- Creates the public_site folder if needed
"""

import pandas as pd
import json
from pathlib import Path

# Input CSV (produced by build_evergreen_master_v5.py)
INPUT_CSV = Path("evergreen_master_atomic.csv")

# Output folder + JSON file
PUBLIC_DIR = Path("public_site")
OUTPUT_JSON = PUBLIC_DIR / "data.json"

# Fields safe for public display
PUBLIC_FIELDS = [
    "Global_Burial_ID",
    "First_Name",
    "Middle_Name",
    "Last_Name",
    "Maiden_Name",
    "Alternate_Name",
    "Birth_Date_ISO",
    "Birth_Year",
    "Death_Date_ISO",
    "Death_Year",
    "Burial_Section",
    "Burial_Lot",
    "Burial_Block",
    "Burial_Grave",
    "Burial_Location_Notes",
    "Relationship_Note",
    "Narrative_Note",
    "Source_File",
    "Source_Row",
]
# === END CHUNK 1 OF 3 ===
# === CHUNK 2 OF 3 ===

def clean_value(v):
    """Convert NaN/None to empty string for JSON cleanliness."""
    if pd.isna(v):
        return ""
    return str(v).strip()


def load_atomic_csv(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Input CSV not found: {path}")
    df = pd.read_csv(path, dtype=str, keep_default_na=False, na_values=[""])
    return df


def build_public_records(df: pd.DataFrame) -> list:
    """Convert DataFrame rows into JSON-safe dicts."""
    records = []

    for _, row in df.iterrows():
        rec = {}
        for field in PUBLIC_FIELDS:
            if field in row:
                rec[field] = clean_value(row[field])
            else:
                rec[field] = ""

        # Construct a simple display name
        name_parts = [
            rec["First_Name"],
            rec["Middle_Name"],
            rec["Last_Name"],
        ]
        rec["Display_Name"] = " ".join([p for p in name_parts if p]).strip()

        # Construct a short burial location string
        burial_parts = []
        if rec["Burial_Section"]:
            burial_parts.append(f"Sec {rec['Burial_Section']}")
        if rec["Burial_Lot"]:
            burial_parts.append(f"Lot {rec['Burial_Lot']}")
        if rec["Burial_Block"]:
            burial_parts.append(f"Block {rec['Burial_Block']}")
        if rec["Burial_Grave"]:
            burial_parts.append(f"Grave {rec['Burial_Grave']}")

        rec["Burial_Location_Short"] = ", ".join(burial_parts)

        records.append(rec)

    return records
# === END CHUNK 2 OF 3 ===
# === CHUNK 3 OF 3 ===

def write_json(records: list, output_path: Path):
    """Write JSON to disk with UTF-8 encoding."""
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

    print(f"Wrote JSON: {output_path}  ({len(records)} records)")


def main():
    print("Building public JSON dataset...")
    print(f"Loading: {INPUT_CSV}")

    df = load_atomic_csv(INPUT_CSV)

    print(f"Loaded {len(df)} rows from atomic CSV.")
    print("Transforming rows...")

    records = build_public_records(df)

    print("Writing JSON...")
    write_json(records, OUTPUT_JSON)

    print("\nDone.")
    print(f"Public dataset is ready at: {OUTPUT_JSON}")
    print("You can now build the static website using this data.")


if __name__ == "__main__":
    main()

# === END CHUNK 3 OF 3 ===
