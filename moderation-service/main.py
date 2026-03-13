import os
from fastapi import FastAPI
from pydantic import BaseModel
from detoxify import Detoxify

app = FastAPI()

# load model once at startup
model = Detoxify("multilingual")

# thresholds (can come from env)
TOXICITY_THRESHOLD = float(os.getenv("TOXICITY_THRESHOLD", 0.75))
INSULT_THRESHOLD = float(os.getenv("INSULT_THRESHOLD", 0.7))
THREAT_THRESHOLD = float(os.getenv("THREAT_THRESHOLD", 0.5))


class ModerationInput(BaseModel):
    text: str
    language: str | None = None


@app.post("/moderate")
def moderate(data: ModerationInput):
    scores = model.predict(data.text)

    # convert numpy → python float
    scores = {k: float(v) for k, v in scores.items()}

    # moderation decision
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