from fastapi import APIRouter, UploadFile, File
from services.inference_service import predict_ecg

router = APIRouter(prefix="/predict", tags=["Prediction"])

@router.post("/")
async def predict(
    dat_file: UploadFile = File(...),
    hea_file: UploadFile = File(...)
):
    # read uploaded files
    dat_bytes = await dat_file.read()
    hea_bytes = await hea_file.read()

    result = predict_ecg(dat_bytes, hea_bytes)

    return result