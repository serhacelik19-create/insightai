from fastapi import APIRouter, Depends
from backend.database import get_db_connection
from backend.security import get_current_user
from backend.schemas.scenarios import ScenarioRequest
from backend.repositories.financials import get_financial_records, get_products
from backend.repositories.scenarios import insert_scenario_result
from backend.services.scenario import run_scenario_analysis_service

router = APIRouter(prefix="/api/scenario", tags=["Scenario Analysis"])

@router.post("")
def run_scenario_analysis(scenario: ScenarioRequest, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        records = get_financial_records(current_user["id"], conn)
        products = get_products(current_user["id"], conn)
        
        response_data = run_scenario_analysis_service(
            scenario.scenario_type,
            scenario.params,
            records,
            products,
            current_user["business_type"]
        )
        
        try:
            insert_scenario_result(current_user["id"], scenario.scenario_type, scenario.params, response_data, conn)
            conn.commit()
        except Exception as e:
            print("Scenario save error:", str(e))
            
        return response_data
    finally:
        conn.close()
