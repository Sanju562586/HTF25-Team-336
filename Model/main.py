import pickle
import pandas as pd
import torch
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import util, SentenceTransformer
from sklearn.linear_model import LogisticRegression

# ----------------------------
# Load pipeline once on startup
# ----------------------------
with open("DoctorTextPipeline.pkl", "rb") as f:
    pipeline = pickle.load(f)

symptom_columns = pipeline["symptom_columns"]
symptom_embeddings = pipeline["symptom_embeddings"]

# Force CPU-only operation
device = torch.device("cpu")
embed_model = SentenceTransformer("all-MiniLM-L6-v2", device=str(device))

model = pipeline["classifier_model"]

app = FastAPI(title="MedVault Doctor Text Classifier API")

# ----------------------------
# Request model
# ----------------------------
class TextRequest(BaseModel):
    text: str
    threshold: float = 0.45  # optional override


# ----------------------------
# Core functions
# ----------------------------
def text_to_symptom_vector(text, threshold=0.45):
    # Always encode on CPU
    text_embedding = embed_model.encode(text, convert_to_tensor=True, device=str(device))
    text_embedding = text_embedding.to(device)

    # Ensure embeddings are tensors on CPU
    if not isinstance(symptom_embeddings, torch.Tensor):
        symptom_tensors = torch.tensor(symptom_embeddings, device=device)
    else:
        symptom_tensors = symptom_embeddings.to(device)

    similarities = util.cos_sim(text_embedding, symptom_tensors)[0]

    # Convert similarities to binary symptom vector
    symptom_vector = pd.DataFrame([[0] * len(symptom_columns)], columns=symptom_columns)
    for i, sim in enumerate(similarities):
        if sim > threshold:
            symptom_vector.iloc[0, i] = 1
    return symptom_vector


def predict_from_text(patient_text, threshold=0.45):
    input_vector = text_to_symptom_vector(patient_text, threshold)
    prediction = model.predict(input_vector)
    return prediction[0]


# ----------------------------
# Routes
# ----------------------------
@app.get("/")
def home():
    return {"message": "MedVault DoctorText Microservice is running 🚀"}


@app.post("/predict")
def predict(req: TextRequest):
    result = predict_from_text(req.text, req.threshold)
    return {"prediction": result}


# ----------------------------
# Run locally:
# ----------------------------
# uvicorn main:app --reload
