import os
import logging
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from sqlalchemy import create_engine

load_dotenv()

# Cấu hình Logging đồng nhất cho toàn hệ thống
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("SmartStudy.AI")

# Khai báo các API Key
LLAMA_CLOUD_API_KEY = os.getenv("LLAMA_CLOUD_API_KEY")
if not LLAMA_CLOUD_API_KEY:
    logger.warning("CẢNH BÁO: Chưa cấu hình LLAMA_CLOUD_API_KEY!")

OPEN_ROUTER_API_KEY = os.getenv("OPEN_ROUTER_API_KEY")
if not OPEN_ROUTER_API_KEY:
    logger.warning("CẢNH BÁO: Chưa cấu hình OPENROUTER_API_KEY!")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.warning("CẢNH BÁO: Chưa cấu hình GEMINI_API_KEY!")

primary_llm = ChatOpenAI(
    api_key=OPEN_ROUTER_API_KEY,
    model="minimax/minimax-m2.5:free",
    openai_api_base="https://openrouter.ai/api/v1",
    temperature=0.1,
    streaming=True
)

fallback_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    temperature=0,
    google_api_key=GEMINI_API_KEY
)

llm = primary_llm.with_fallbacks([fallback_llm])

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    api_key=GEMINI_API_KEY,
    output_dimensionality=768
)

# Đọc chuỗi gốc từ file .env
raw_db_url = os.getenv("DATABASE_URL")

db_url_sync = raw_db_url
db_url_async = raw_db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
engine = create_engine(db_url_sync)

