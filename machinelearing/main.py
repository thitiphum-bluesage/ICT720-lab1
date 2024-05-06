from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()


class PredictInput(BaseModel):
    temp_start: float
    humi_start: float
    target_temp: float


model = joblib.load("trained_model.pkl")


@app.post("/predict/")
def predict(input: PredictInput):
    input_df = pd.DataFrame([input.model_dump()])
    try:
        prediction = model.predict(input_df)
        return {"prediction": max(0, prediction[0])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=4000)
next
