from langchain_neo4j import Neo4jGraph

import os
from dotenv import load_dotenv

load_dotenv()

uri = "bolt://smartstudy_neo4j:7687" 
user = "neo4j"
password = os.getenv("NEO4J_PASSWORD")

_graph: Neo4jGraph | None = None

def get_graph() -> Neo4jGraph:
    global _graph
    if _graph is None:
        _graph = Neo4jGraph(
            url=uri,
            username=user,
            password=password,
            enhanced_schema=True
        )
    return _graph


def run_cypher(query: str, params: dict | None = None) -> list[dict]:
    graph = get_graph()
    return graph.query(query, params or {})