import os
import numpy as np
import onnxruntime as ort
from transformers import AutoTokenizer
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Load tokenizer and ONNX session once at startup
tokenizer = AutoTokenizer.from_pretrained("model/tokenizer")
session = ort.InferenceSession(
    "model/detoxify.onnx",
    providers=["CPUExecutionProvider"]
)

LABELS = [
    "toxicity", "severe_toxicity", "obscene",
    "threat", "insult", "identity_attack", "sexual_explicit"
]

# Thresholds (can come from env)
TOXICITY_THRESHOLD = float(os.getenv("TOXICITY_THRESHOLD", 0.75))
INSULT_THRESHOLD   = float(os.getenv("INSULT_THRESHOLD", 0.7))
THREAT_THRESHOLD   = float(os.getenv("THREAT_THRESHOLD", 0.5))


class ModerationInput(BaseModel):
    text: str
    language: str | None = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/moderate")
def moderate(data: ModerationInput):
    # Tokenize
    enc = tokenizer(
        data.text,
        return_tensors="np",
        padding=True,
        truncation=True,
        max_length=128
    )

    # Run ONNX inference
    logits = session.run(
        ["logits"],
        {
            "input_ids":      enc["input_ids"].astype(np.int64),
            "attention_mask": enc["attention_mask"].astype(np.int64),
        }
    )[0]

    # Sigmoid to get scores (same as Detoxify internally)
    raw_scores = 1 / (1 + np.exp(-logits[0]))
    scores = {label: float(score) for label, score in zip(LABELS, raw_scores)}

    # Moderation decision — same logic as before
    decision = "allow"

    if scores["toxicity"] > TOXICITY_THRESHOLD:
        decision = "block"
    elif scores["insult"] > INSULT_THRESHOLD:
        decision = "review"
    elif scores["threat"] > THREAT_THRESHOLD:
        decision = "block"

    return {
        "language": data.language,
        "decision": decision,
        "scores": scores
    }