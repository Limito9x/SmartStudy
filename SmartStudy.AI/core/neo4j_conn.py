import os
from neo4j import AsyncGraphDatabase

uri = "bolt://smartstudy_neo4j:7687" 
user = "neo4j"
password = os.getenv("NEO4J_PASSWORD")

def get_neo4j_driver():
    return AsyncGraphDatabase.driver(uri, auth=(user,password))