from pydantic import BaseModel
from typing import Optional

class FinancialRecordCreate(BaseModel):
    date: str
    revenue: float
    expenses: float
    rent_expense: Optional[float] = 0
    personnel_expense: Optional[float] = 0
    marketing_expense: Optional[float] = 0
    material_expense: Optional[float] = 0
    other_expense: Optional[float] = 0

class ProductCreate(BaseModel):
    name: str
    revenue: float
    units: int
    cost_per_unit: Optional[float] = 0

class ActionCreate(BaseModel):
    title: str
    impact: Optional[str] = None
    financial_impact_value: Optional[float] = 0.0

class ActionUpdate(BaseModel):
    status: str
