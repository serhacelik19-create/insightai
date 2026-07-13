from pydantic import BaseModel

class ScenarioRequest(BaseModel):
    scenario_type: str
    params: dict
