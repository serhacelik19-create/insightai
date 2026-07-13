from pydantic import BaseModel

class MenuCreate(BaseModel):
    item_name: str
    category: str
    sale_price: float
    portion_cost: float
