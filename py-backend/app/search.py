import json
import sys
import re
from libs.opensearch import OpenSearchClient
from langchain_community.embeddings import BedrockEmbeddings

def get_similar_documents_by_RAG(text, vector_store, index_name, embed_model):
    if vector_store == "OpenSearch":
        os_client = OpenSearchClient(index_name)
        vector_search = os_client.get_vector_store(embed_model)
        docs = vector_search.similarity_search_with_score(
            query=text,
            k=5,
            score_threshold=0.4,
        )

    return docs

def format_document(doc_tuple):
    doc, score = doc_tuple
    page_no = doc.metadata['page']
    source = doc.metadata['source']
    return {
        "content": doc.page_content,
        "source": f"Page {page_no} of {source}",
        "score": score
    }

def process_documents(docs):
    formatted_docs = [format_document(doc) for doc in docs]
    return json.dumps(formatted_docs, ensure_ascii=False, indent=2)

def main():
    text = sys.argv[1]
    chat_mode = sys.argv[2]
    search_settings = sys.argv[3]
    
    search_settings_dict = json.loads(search_settings)

    region = search_settings_dict.get('embRegion', '') 
    model = search_settings_dict.get('embeddingModel', '')
    vector_store = search_settings_dict.get('vectorStore', '')  

    suffix = re.sub(r'[^a-z0-9]', '', model.lower())
    index_name = f'docs-{suffix}'
    
    embed_model = BedrockEmbeddings(model_id=model, region_name=region)

    if chat_mode == "RAG":
        docs = get_similar_documents_by_RAG(text, vector_store, index_name, embed_model)
        formatted_json = process_documents(docs)
        print(formatted_json)

if __name__ == "__main__":
    main()