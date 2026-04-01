from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.predict import router as predict_router

app = FastAPI(title="ECG Classification API")

# Allow requests from the local frontend dev server and any deployed frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router)

@app.get("/")
def root():
    return {"message": "ECG Classification API Running"}
