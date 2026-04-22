from sentence_transformers import SentenceTransformer
import chromadb

# model
model = SentenceTransformer("all-MiniLM-L6-v2")

# mock data
texts = [
    "Öğrenci harf atlama hatası yapıyor",
    "Okuma hızı düşük seviyede",
    "Heceleme problemi gözlemlendi"
]

# embedding oluştur
embeddings = model.encode(texts)

# chroma başlat
client = chromadb.Client()
collection = client.create_collection(name="students")

# veriyi ekle
collection.add(
    documents=texts,
    embeddings=embeddings.tolist(),
    ids=["1", "2", "3"]
)

print("Veriler vector DB'ye eklendi ✅")

# SORGULAMA (RAG kısmı)
query = "öğrencinin okuma problemi nedir?"

query_embedding = model.encode([query])

results = collection.query(
    query_embeddings=query_embedding.tolist(),
    n_results=2
)

print("\nEn alakalı sonuçlar:")
print(results["documents"])