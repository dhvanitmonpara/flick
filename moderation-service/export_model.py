# export_model.py — run once locally, not in Docker
from detoxify import Detoxify
import torch

model = Detoxify('multilingual')

# Export tokenizer
model.tokenizer.save_pretrained("model/tokenizer")

# Dummy input for tracing
dummy = model.tokenizer(
    "hello world", return_tensors="pt",
    padding=True, truncation=True, max_length=128
)

torch.onnx.export(
    model.model,
    (dummy["input_ids"], dummy["attention_mask"]),
    "model/detoxify.onnx",
    input_names=["input_ids", "attention_mask"],
    output_names=["logits"],
    dynamic_axes={
        "input_ids": {0: "batch", 1: "seq"},
        "attention_mask": {0: "batch", 1: "seq"},
    },
    opset_version=18,
)
print("Done. Commit the model/ directory.")