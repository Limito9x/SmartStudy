from langchain_postgres import PGVectorStore, PGEngine
from langchain_classic.indexes import SQLRecordManager
from core.config import db_url_async, embeddings

# Singleton instances
_vector_store = None
_record_manager = None
_vector_table_initialized = False

async def get_vector_store():
    global _vector_store, _vector_table_initialized
    if _vector_store is None:
        engine = PGEngine.from_connection_string(db_url_async)

        if not _vector_table_initialized:
            try:
                await engine.ainit_vectorstore_table(
                    table_name="document_chunks",
                    vector_size=768,
                    metadata_json_column="langchain_metadata",
                )
            except Exception as exc:
                if "already exists" not in str(exc).lower():
                    raise
            _vector_table_initialized = True
        
        _vector_store = await PGVectorStore.create(
            engine=engine,
            table_name="document_chunks",
            embedding_service=embeddings
        )
    return _vector_store

def get_record_manager():
    global _record_manager
    if _record_manager is None:
        _record_manager = SQLRecordManager(
            namespace="pgvector/document_chunks",
            db_url=db_url_async,
            async_mode=True
        )
    return _record_manager