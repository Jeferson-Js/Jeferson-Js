from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

# Initialize FastAPI app
app = FastAPI(title="Brasil Poliglotas API", version="1.0.0")

# MongoDB connection
try:
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = MongoClient(mongo_url)
    db = client['brasil_poliglotas']
    print(f"Connected to MongoDB at {mongo_url}")
except ConnectionFailure:
    print("Failed to connect to MongoDB")
    db = None

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class UserProgress(BaseModel):
    user_id: str
    language: str
    section: str
    level: str
    score: int
    completed: bool
    timestamp: datetime

class Exercise(BaseModel):
    id: str
    language: str
    section: str
    level: str
    question: str
    options: List[str]
    correct_answer: str
    explanation: str

class User(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime
    languages_learning: List[str]

# Language data structure
LANGUAGES = {
    "english": {
        "name": "Inglês",
        "flag": "🇺🇸",
        "alphabet": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
        "basic_words": ["hello", "goodbye", "please", "thank you", "yes", "no", "water", "food", "family", "friend"],
        "phrases": ["How are you?", "What is your name?", "Where are you from?", "Nice to meet you", "See you later"]
    },
    "spanish": {
        "name": "Espanhol",
        "flag": "🇪🇸",
        "alphabet": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "Ñ", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
        "basic_words": ["hola", "adiós", "por favor", "gracias", "sí", "no", "agua", "comida", "familia", "amigo"],
        "phrases": ["¿Cómo estás?", "¿Cómo te llamas?", "¿De dónde eres?", "Mucho gusto", "Hasta luego"]
    },
    "french": {
        "name": "Francês",
        "flag": "🇫🇷",
        "alphabet": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
        "basic_words": ["bonjour", "au revoir", "s'il vous plaît", "merci", "oui", "non", "eau", "nourriture", "famille", "ami"],
        "phrases": ["Comment allez-vous?", "Comment vous appelez-vous?", "D'où venez-vous?", "Enchanté", "À bientôt"]
    },
    "german": {
        "name": "Alemão",
        "flag": "🇩🇪",
        "alphabet": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "Ä", "Ö", "Ü", "ß"],
        "basic_words": ["hallo", "auf wiedersehen", "bitte", "danke", "ja", "nein", "wasser", "essen", "familie", "freund"],
        "phrases": ["Wie geht es Ihnen?", "Wie heißen Sie?", "Woher kommen Sie?", "Freut mich", "Bis bald"]
    },
    "italian": {
        "name": "Italiano",
        "flag": "🇮🇹",
        "alphabet": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "Z"],
        "basic_words": ["ciao", "arrivederci", "per favore", "grazie", "sì", "no", "acqua", "cibo", "famiglia", "amico"],
        "phrases": ["Come stai?", "Come ti chiami?", "Di dove sei?", "Piacere", "A presto"]
    },
    "chinese": {
        "name": "Mandarim",
        "flag": "🇨🇳",
        "alphabet": ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"],
        "basic_words": ["你好", "再见", "请", "谢谢", "是", "不是", "水", "食物", "家庭", "朋友"],
        "phrases": ["你好吗?", "你叫什么名字?", "你来自哪里?", "很高兴认识你", "再见"]
    }
}

# Sample exercises
SAMPLE_EXERCISES = [
    {
        "id": str(uuid.uuid4()),
        "language": "english",
        "section": "vocabulary",
        "level": "basic",
        "question": "What is the English word for 'obrigado'?",
        "options": ["hello", "thank you", "goodbye", "please"],
        "correct_answer": "thank you",
        "explanation": "'Thank you' é como se diz 'obrigado' em inglês."
    },
    {
        "id": str(uuid.uuid4()),
        "language": "spanish",
        "section": "vocabulary",
        "level": "basic",
        "question": "Como se dice 'água' en español?",
        "options": ["agua", "comida", "casa", "amigo"],
        "correct_answer": "agua",
        "explanation": "'Agua' é como se diz 'água' em espanhol."
    },
    {
        "id": str(uuid.uuid4()),
        "language": "french",
        "section": "vocabulary",
        "level": "basic",
        "question": "Comment dit-on 'bonjour' en français?",
        "options": ["au revoir", "bonjour", "merci", "oui"],
        "correct_answer": "bonjour",
        "explanation": "'Bonjour' significa 'bom dia' ou 'olá' em francês."
    }
]

# API Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Brasil Poliglotas API is running"}

@app.get("/api/languages")
async def get_languages():
    return {"languages": LANGUAGES}

@app.get("/api/languages/{language_id}")
async def get_language(language_id: str):
    if language_id not in LANGUAGES:
        raise HTTPException(status_code=404, detail="Language not found")
    return {"language": LANGUAGES[language_id]}

@app.get("/api/languages/{language_id}/alphabet")
async def get_alphabet(language_id: str):
    if language_id not in LANGUAGES:
        raise HTTPException(status_code=404, detail="Language not found")
    return {"alphabet": LANGUAGES[language_id]["alphabet"]}

@app.get("/api/languages/{language_id}/vocabulary")
async def get_vocabulary(language_id: str):
    if language_id not in LANGUAGES:
        raise HTTPException(status_code=404, detail="Language not found")
    return {
        "basic_words": LANGUAGES[language_id]["basic_words"],
        "phrases": LANGUAGES[language_id]["phrases"]
    }

@app.get("/api/languages/{language_id}/exercises")
async def get_exercises(language_id: str, section: str = "vocabulary", level: str = "basic"):
    if language_id not in LANGUAGES:
        raise HTTPException(status_code=404, detail="Language not found")
    
    # Filter exercises by language, section, and level
    filtered_exercises = [
        ex for ex in SAMPLE_EXERCISES 
        if ex["language"] == language_id and ex["section"] == section and ex["level"] == level
    ]
    
    return {"exercises": filtered_exercises}

@app.post("/api/user/progress")
async def save_progress(progress: UserProgress):
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        progress_dict = progress.dict()
        progress_dict["timestamp"] = datetime.now()
        result = db.user_progress.insert_one(progress_dict)
        return {"message": "Progress saved", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving progress: {str(e)}")

@app.get("/api/user/{user_id}/progress")
async def get_user_progress(user_id: str):
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        progress = list(db.user_progress.find({"user_id": user_id}))
        # Convert ObjectId to string for JSON serialization
        for p in progress:
            if "_id" in p:
                del p["_id"]
        return {"progress": progress}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching progress: {str(e)}")

@app.post("/api/users")
async def create_user(user: User):
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        user_dict = user.dict()
        user_dict["created_at"] = datetime.now()
        result = db.users.insert_one(user_dict)
        return {"message": "User created", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)