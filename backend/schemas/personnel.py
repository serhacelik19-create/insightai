from pydantic import BaseModel
from typing import Optional

class PersonnelCreate(BaseModel):
    name: str
    surname: str
    role: str
    monthly_salary: float
    overtime_hours: Optional[float] = 0.0
    overtime_rate: float
