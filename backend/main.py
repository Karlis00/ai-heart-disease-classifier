from fastapi import FastAPI
from api.predict import router as predict_router

app = FastAPI(title="ECG Classification API")

app.include_router(predict_router)

@app.get("/")
def root():
    return {"message": "ECG Classification API Running"}