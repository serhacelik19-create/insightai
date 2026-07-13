import re
from datetime import datetime
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
import pandas as pd
from backend.database import get_db_connection
from backend.security import get_current_user
from backend.schemas.financials import FinancialRecordCreate, ProductCreate
from backend.repositories.financials import (
    get_financial_records, get_products, delete_all_financial_records,
    delete_all_products, insert_financial_record, insert_product,
    get_financial_record_by_id, get_product_by_id, delete_financial_record,
    delete_product
)

router = APIRouter(tags=["Financials"])

@router.get("/api/data")
def get_financial_data(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        records = get_financial_records(current_user["id"], conn)
        products = get_products(current_user["id"], conn)
    finally:
        conn.close()
    
    # API endpoints response format includes removing unwanted database fields like 'id' from record response?
    # Actually, in main.py:
    # "SELECT date, revenue, expenses, profit, rent_expense, personnel_expense, marketing_expense, material_expense, other_expense FROM financial_records WHERE user_id = ?"
    # "SELECT name, revenue, units, cost_per_unit FROM products WHERE user_id = ?"
    # So we should clean or select only the required fields to match original API behaviour exactly!
    # Let's clean the dictionary for safety.
    cleaned_records = []
    for r in records:
        cleaned_records.append({
            "date": r["date"],
            "revenue": r["revenue"],
            "expenses": r["expenses"],
            "profit": r["profit"],
            "rent_expense": r["rent_expense"],
            "personnel_expense": r["personnel_expense"],
            "marketing_expense": r["marketing_expense"],
            "material_expense": r["material_expense"],
            "other_expense": r["other_expense"]
        })
        
    cleaned_products = []
    for p in products:
        cleaned_products.append({
            "name": p["name"],
            "revenue": p["revenue"],
            "units": p["units"],
            "cost_per_unit": p["cost_per_unit"]
        })
        
    return {
        "records": cleaned_records,
        "products": cleaned_products
    }

@router.post("/api/upload")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    filename = file.filename.lower()
    
    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(file.file)
        elif filename.endswith((".xls", ".xlsx")):
            df = pd.read_excel(file.file)
        else:
            raise HTTPException(status_code=400, detail="Only CSV or Excel files are supported.")
        
        df.columns = [c.strip().lower() for c in df.columns]
        
        records = []
        products = []
        
        date_syns = ["date", "tarih", "ay", "month", "tarihler", "dönem", "donem", "yıl", "yil"]
        rev_syns = ["revenue", "gelir", "ciro", "kazanç", "kazanc", "satis", "satış", "tutar", "gelirler", "satış tutarı"]
        exp_syns = ["expenses", "gider", "giderler", "maliyet", "expense", "harcama", "harcamalar"]
        prod_syns = ["product", "ürün", "urun", "hizmet", "ürünler", "urunler", "ad", "isim", "ürün adı"]
        units_syns = ["units", "adet", "miktar", "sales", "satışlar", "satıslar", "sayı", "sayi", "satış adedi"]
        rent_syns = ["rent", "kira", "kiralar", "kira gideri", "rent_expense"]
        personnel_syns = ["personnel", "personel", "staff", "maaş", "maas", "personel gideri", "personnel_expense"]
        marketing_syns = ["marketing", "pazarlama", "reklam", "reklam gideri", "tanıtım", "marketing_expense"]
        material_syns = ["material", "malzeme", "hammadde", "cogs", "ürün maliyeti", "urun maliyeti", "malzeme gideri", "material_expense"]
        cost_per_unit_syns = ["cost_per_unit", "birim_maliyet", "maliyet_adet", "maliyet", "birim maliyet"]
        
        date_col = next((c for c in df.columns if c in date_syns), None)
        rev_col = next((c for c in df.columns if c in rev_syns), None)
        exp_col = next((c for c in df.columns if c in exp_syns), None)
        prod_col = next((c for c in df.columns if c in prod_syns), None)
        units_col = next((c for c in df.columns if c in units_syns), None)
        rent_col = next((c for c in df.columns if c in rent_syns), None)
        personnel_col = next((c for c in df.columns if c in personnel_syns), None)
        marketing_col = next((c for c in df.columns if c in marketing_syns), None)
        material_col = next((c for c in df.columns if c in material_syns), None)
        cost_per_unit_col = next((c for c in df.columns if c in cost_per_unit_syns), None)
        
        quality_score = 100
        strong_points = []
        missing_points = []
        
        total_cells = df.size
        empty_cells = int(df.isna().sum().sum())
        empty_ratio = empty_cells / total_cells if total_cells > 0 else 0
        if empty_ratio > 0.2:
            quality_score -= 20
            missing_points.append(f"Data contains {empty_ratio*100:.0f}% empty cells.")
        elif empty_ratio > 0:
            quality_score -= 5
            missing_points.append(f"A small amount ({empty_ratio*100:.0f}%) of empty cells detected.")
        else:
            strong_points.append("No empty cells, data integrity is perfect.")
        
        negative_issues = False
        if rev_col and pd.to_numeric(df[rev_col], errors='coerce').fillna(0).lt(0).any():
            negative_issues = True
            missing_points.append("Negative values found in Revenue column.")
        if exp_col and pd.to_numeric(df[exp_col], errors='coerce').fillna(0).lt(0).any():
            negative_issues = True
            missing_points.append("Negative values found in Expenses column.")
        if units_col and pd.to_numeric(df[units_col], errors='coerce').fillna(0).lt(0).any():
            negative_issues = True
            missing_points.append("Negative values found in Units column.")
        if negative_issues:
            quality_score -= 15
            
        if date_col:
            converted = pd.to_datetime(df[date_col], errors='coerce')
            if converted.isna().all():
                quality_score -= 10
                missing_points.append("Date formats are non-standard (could be text-based).")
            else:
                strong_points.append("Dates detected in standard format.")
        else:
            quality_score -= 20
            missing_points.append("Date/Period column is missing.")
            
        if not rev_col:
            quality_score -= 20
            missing_points.append("Revenue column is missing.")
        if not exp_col and not prod_col:
            quality_score -= 20
            missing_points.append("Expenses or product details are missing.")
        if len(df) >= 6:
            quality_score = min(100, quality_score + 10)
            strong_points.append("At least 6 periods of data detected (strong trend analysis).")
        elif len(df) < 3:
            quality_score -= 10
            missing_points.append("Dataset is too short for trend analysis.")
            
        quality_score = max(0, min(100, int(quality_score)))
        
        if prod_col:
            for _, row in df.iterrows():
                try:
                    rev_val = float(row[rev_col]) if (rev_col and not pd.isna(row[rev_col])) else 0.0
                except (ValueError, TypeError):
                    rev_val = 0.0
                try:
                    units_val = int(row[units_col]) if (units_col and not pd.isna(row[units_col])) else 0
                except (ValueError, TypeError):
                    units_val = 0
                try:
                    cpu_val = float(row[cost_per_unit_col]) if (cost_per_unit_col and not pd.isna(row[cost_per_unit_col])) else 0.0
                except (ValueError, TypeError):
                    cpu_val = 0.0
                
                if cpu_val == 0.0 and rev_val > 0 and units_val > 0:
                    cpu_val = round((rev_val / units_val) * 0.4, 2)
                    
                products.append({
                    "name": str(row[prod_col]) if not pd.isna(row[prod_col]) else "Unknown Product",
                    "revenue": rev_val,
                    "units": units_val,
                    "cost_per_unit": cpu_val
                })
        else:
            for _, row in df.iterrows():
                try:
                    rev_val = float(row[rev_col]) if (rev_col and not pd.isna(row[rev_col])) else 0.0
                except (ValueError, TypeError):
                    rev_val = 0.0
                try:
                    exp_val = float(row[exp_col]) if (exp_col and not pd.isna(row[exp_col])) else 0.0
                except (ValueError, TypeError):
                    exp_val = 0.0
                try:
                    rent_val = float(row[rent_col]) if (rent_col and not pd.isna(row[rent_col])) else 0.0
                except (ValueError, TypeError):
                    rent_val = 0.0
                try:
                    pers_val = float(row[personnel_col]) if (personnel_col and not pd.isna(row[personnel_col])) else 0.0
                except (ValueError, TypeError):
                    pers_val = 0.0
                try:
                    mark_val = float(row[marketing_col]) if (marketing_col and not pd.isna(row[marketing_col])) else 0.0
                except (ValueError, TypeError):
                    mark_val = 0.0
                try:
                    mat_val = float(row[material_col]) if (material_col and not pd.isna(row[material_col])) else 0.0
                except (ValueError, TypeError):
                    mat_val = 0.0
                
                if rent_val == 0.0 and pers_val == 0.0 and mark_val == 0.0 and mat_val == 0.0 and exp_val > 0:
                    rent_val = round(exp_val * 0.15, 2)
                    pers_val = round(exp_val * 0.30, 2)
                    mark_val = round(exp_val * 0.10, 2)
                    mat_val = round(exp_val * 0.35, 2)
                    
                other_val = max(0.0, round(exp_val - (rent_val + pers_val + mark_val + mat_val), 2))
                
                records.append({
                    "date": str(row[date_col]) if (date_col and not pd.isna(row[date_col])) else "Unknown Date",
                    "revenue": rev_val,
                    "expenses": exp_val,
                    "profit": rev_val - exp_val,
                    "rent_expense": rent_val,
                    "personnel_expense": pers_val,
                    "marketing_expense": mark_val,
                    "material_expense": mat_val,
                    "other_expense": other_val
                })
                
        if not records and not products:
            raise HTTPException(status_code=400, detail="File content could not be matched with valid financial or product data.")
            
        conn = get_db_connection()
        try:
            if records:
                delete_all_financial_records(current_user["id"], conn)
                for rec in records:
                    insert_financial_record(current_user["id"], rec, conn)
            if products:
                delete_all_products(current_user["id"], conn)
                for prod in products:
                    insert_product(current_user["id"], prod, conn)
            conn.commit()
        finally:
            conn.close()
            
        return {
            "status": "success",
            "message": "File uploaded successfully and database updated.",
            "records_count": len(records),
            "products_count": len(products),
            "quality_score": quality_score,
            "strong_points": strong_points,
            "missing_points": missing_points
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred while processing the file: {str(e)}")

@router.post("/api/data/record")
def create_financial_record_endpoint(record: FinancialRecordCreate, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    
    year_match = re.search(r'\b(20\d{2})\b', record.date)
    year_val = int(year_match.group(1)) if year_match else datetime.now().year
    
    profit = record.revenue - record.expenses
    
    rent = record.rent_expense
    pers = record.personnel_expense
    mark = record.marketing_expense
    mat = record.material_expense
    other = record.other_expense
    
    total_sub = rent + pers + mark + mat + other
    if total_sub == 0 and record.expenses > 0:
        rent = round(record.expenses * 0.15, 2)
        pers = round(record.expenses * 0.30, 2)
        mark = round(record.expenses * 0.10, 2)
        mat = round(record.expenses * 0.35, 2)
        other = max(0.0, round(record.expenses - (rent + pers + mark + mat), 2))
        
    data = {
        "date": record.date,
        "year": year_val,
        "revenue": record.revenue,
        "expenses": record.expenses,
        "profit": profit,
        "rent_expense": rent,
        "personnel_expense": pers,
        "marketing_expense": mark,
        "material_expense": mat,
        "other_expense": other
    }
    
    try:
        insert_financial_record(current_user["id"], data, conn)
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error occurred while adding record: {str(e)}")
    finally:
        conn.close()
        
    return {"status": "success", "message": "Financial record added successfully.", "profit": profit}

@router.post("/api/data/product")
def create_product_endpoint(product: ProductCreate, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    data = {
        "name": product.name,
        "revenue": product.revenue,
        "units": product.units,
        "cost_per_unit": product.cost_per_unit
    }
    try:
        insert_product(current_user["id"], data, conn)
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error occurred while adding product: {str(e)}")
    finally:
        conn.close()
    return {"status": "success", "message": "Product added successfully."}

@router.delete("/api/data/record/{record_id}")
def delete_financial_record_endpoint(record_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        record = get_financial_record_by_id(current_user["id"], record_id, conn)
        if not record:
            raise HTTPException(status_code=404, detail="Record not found or you don't have permission to delete.")
            
        delete_financial_record(current_user["id"], record_id, conn)
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "message": "Financial record deleted successfully."}

@router.delete("/api/data/product/{product_id}")
def delete_product_endpoint(product_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        product = get_product_by_id(current_user["id"], product_id, conn)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found or you don't have permission to delete.")
            
        delete_product(current_user["id"], product_id, conn)
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "message": "Product deleted successfully."}


