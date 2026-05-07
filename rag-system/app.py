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
labels = [item["label"] for item in data]
types = [item["type"] for item in data]
sources = [item["source"] for item in data]

# model yükle
model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

# embedding oluştur
embeddings = model.encode(texts)

# chromadb
client = chromadb.Client()
collection = client.create_collection(name="dyslexia_data")

collection.add(
    documents=texts,
    embeddings=embeddings.tolist(),
    ids=ids,
    metadatas=[
        {
            "label": labels[i],
            "type": types[i],
            "source": sources[i]
        }
        for i in range(len(texts))
    ]
)

@app.get("/")
def home():
    return {"message": "RAG API çalışıyor 🚀"}

@app.get("/search")
def search(query: str, top_k: int = 3, label: str = None):
    query_embedding = model.encode([query])

    if label:
       results = collection.query(
        query_embeddings=query_embedding.tolist(),
        n_results=top_k,
        where={"label": label}
    )
    else:
      results = collection.query(
        query_embeddings=query_embedding.tolist(),
        n_results=top_k
    )

    formatted_results = []

    for i in range(len(results["documents"][0])):
        formatted_results.append({
            "content": results["documents"][0][i],
            "label": results["metadatas"][0][i]["label"],
            "type": results["metadatas"][0][i]["type"],
            "source": results["metadatas"][0][i]["source"]
        })

    return {
        "query": query,
        "top_k": top_k,
        "results": formatted_results
    }

