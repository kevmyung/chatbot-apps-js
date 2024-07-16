import json
import sys
import re
import os
from typing import List, Dict, Any

from libs.opensearch import OpenSearchClient
from langchain_community.embeddings import BedrockEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_cohere import CohereRerank

# Constants
CHROMA_PATH = './vectordb/chroma'

# Document formatting functions
def format_opensearch_document(doc: Dict[str, Any]) -> Dict[str, str]:
    source_data = doc['_source']
    page_no = source_data['metadata']['page']
    source = source_data['metadata']['source']
    return {
        "content": source_data['text'],
        "source": f"Page {page_no} of {source}"
    }

def format_chroma_document(doc: Dict[str, Any]) -> Dict[str, str]:
    page_no = doc['metadatas'][0]['page']
    source = doc['metadatas'][0]['source']
    return {
        "content": doc['documents'][0],
        "source": f"Page {page_no} of {source}"
    }

def format_document(doc: Dict[str, Any], vector_db_option: str) -> Dict[str, str]:
    if vector_db_option == "OpenSearch":
        return format_opensearch_document(doc)
    elif vector_db_option == "Chroma":
        return format_chroma_document(doc)
    else:
        raise ValueError(f"Unsupported vector_db_option: {vector_db_option}")

def process_documents(docs: List[Dict[str, Any]], vector_db_option: str) -> str:
    formatted_docs = [format_document(doc, vector_db_option) for doc in docs]
    return json.dumps(formatted_docs, ensure_ascii=False, indent=2)

# RAG-related functions
def get_vector_store(vector_db_option: str, index_name: str, embed_model: BedrockEmbeddings):
    if vector_db_option == "OpenSearch":
        os_client = OpenSearchClient(index_name)
        return os_client.get_vector_store(embed_model), {"term": {"metadata.doc_level": "child"}}
    elif vector_db_option == "Chroma":
        if os.path.exists(CHROMA_PATH):
            return Chroma(persist_directory=CHROMA_PATH, collection_name=index_name, embedding_function=embed_model), {"doc_level": "child"}
    raise ValueError(f"Unsupported vector_db_option: {vector_db_option}")

def get_similar_documents_by_RAG(text: str, vector_db_option: str, index_name: str, embed_model: BedrockEmbeddings, reranker_api: str) -> List[Dict[str, Any]]:
    reranker = CohereRerank(cohere_api_key=reranker_api, model='rerank-multilingual-v3.0') if reranker_api else None
    
    vector_store, filter = get_vector_store(vector_db_option, index_name, embed_model)
    docs = vector_store.max_marginal_relevance_search(query=text, k=5, fetch_k=20, filter=filter)
    
    if reranker:
        ordered_docs = reranker.compress_documents(query=text, documents=docs)
    else:
        ordered_docs = docs

    parent_ids = set(doc.metadata['parent_doc_id'] for doc in ordered_docs)
    
    parent_docs = []
    for doc_id in parent_ids:
        if vector_db_option == "OpenSearch":   
            os_client = OpenSearchClient(index_name) 
            parent_doc = os_client.conn.get(index=index_name, id=doc_id, _source=['text', 'metadata.page', 'metadata.source'])
        elif vector_db_option == "Chroma":
            parent_doc = vector_store.get(ids=doc_id)
        parent_docs.append(parent_doc)
    
    return parent_docs

# Main function
def main():
    text, chat_mode, search_settings, reranker_api = sys.argv[1:]
    search_settings_dict = json.loads(search_settings)
    
    region = search_settings_dict.get('embRegion', '')
    model = search_settings_dict.get('embeddingModel', '')
    vector_db_option = search_settings_dict.get('vectorStore', '')
    
    suffix = re.sub(r'[^a-z0-9]', '', model.lower())
    index_name = f'docs-{suffix}'
    
    embed_model = BedrockEmbeddings(model_id=model, region_name=region)
    
    if chat_mode == "RAG":
        docs = get_similar_documents_by_RAG(text, vector_db_option, index_name, embed_model, reranker_api)
        formatted_docs = process_documents(docs, vector_db_option)
        print(formatted_docs)
    else:
        print("Invalid Chat Mode.")

if __name__ == "__main__":
    main()