import json

def insert_scenario_result(user_id: int, scenario_type: str, params: dict, result: dict, conn):
    conn.execute(
        "INSERT INTO scenario_results (user_id, scenario_type, params, result) VALUES (?, ?, ?, ?)",
        (user_id, scenario_type, json.dumps(params, ensure_ascii=False), json.dumps(result, ensure_ascii=False))
    )
