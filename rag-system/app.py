import json
import chromadb
from fastapi import FastAPI
from sentence_transformers import SentenceTransformer

app = FastAPI()

# JSON oku
with open("data.json", "r", encoding="utf-8") as file:
    data = json.load(file)

texts = [item["content"] for item in data]
ids = [item["id"] for item in data]

# model yükle
model = SentenceTransformer("all-MiniLM-L6-v2")

# embedding oluştur
embeddings = model.encode(texts)

# chromadb
client = chromadb.Client()
collection = client.create_collection(name="dyslexia_data")

collection.add(
    documents=texts,
    embeddings=embeddings.tolist(),
    ids=ids
)

@app.get("/")
def home():
    return {"message": "RAG API çalışıyor 🚀"}

@app.get("/search")
def search(query: str):
    query_embedding = model.encode([query])

    results = collection.query(
        query_embeddings=query_embedding.tolist(),
        n_results=3
    )

    return {
        "query": query,
        "results": results["documents"][0]
    }