import csv
import json
import random
import shutil
import os

INPUT_FILE = "archive/DataCoSupplyChainDataset.csv"
OUTPUT_ROOT = "data.json"
OUTPUT_PUBLIC = "dashboard/public/data.json"
SAMPLE_SIZE = 1200
RANDOM_SEED = 42

KEEP_COLS = [
    "Type",
    "Days for shipping (real)",
    "Days for shipment (scheduled)",
    "Benefit per order",
    "Sales per customer",
    "Delivery Status",
    "Late_delivery_risk",
    "Category Name",
    "Customer Country",
    "Customer Segment",
    "Department Name",
    "Market",
    "Order City",
    "Order Country",
    "order date (DateOrders)",
    "Order Item Discount Rate",
    "Order Item Profit Ratio",
    "Order Item Quantity",
    "Sales",
    "Order Item Total",
    "Order Profit Per Order",
    "Order Region",
    "Order State",
    "Order Status",
    "Product Name",
    "Product Price",
    "Shipping Mode",
    "shipping date (DateOrders)",
]

if not os.path.exists(INPUT_FILE):
    raise FileNotFoundError(f"Raw CSV not found at '{INPUT_FILE}'. "
                            "Place DataCoSupplyChainDataset.csv inside the archive/ folder.")

print(f"Reading {INPUT_FILE} …")
with open(INPUT_FILE, encoding="latin-1") as f:
    reader = csv.DictReader(f)
    rows = list(reader)

print(f"Total rows: {len(rows):,}")

random.seed(RANDOM_SEED)
sampled = random.sample(rows, min(SAMPLE_SIZE, len(rows)))

clean = [{k: row[k] for k in KEEP_COLS if k in row} for row in sampled]

payload = json.dumps(clean, ensure_ascii=False)
print(f"Sampled {len(clean):,} rows → {len(payload) / 1024:.1f} KB")

with open(OUTPUT_ROOT, "w", encoding="utf-8") as f:
    f.write(payload)
print(f"Written: {OUTPUT_ROOT}")

if os.path.isdir("dashboard/public"):
    shutil.copy(OUTPUT_ROOT, OUTPUT_PUBLIC)
    print(f"Copied:  {OUTPUT_PUBLIC}")
else:
    print("dashboard/public/ not found — skipping copy (run 'npm install' first).")
