import json
import sys
import re
from libs.opensearch import OpenSearchClient
from langchain_community.embeddings import BedrockEmbeddings


def get_similar_documents_by_RAG(text, vector_store, index_name, embed_model):
    if vector_store == "OpenSearch":
        os_client = OpenSearchClient(index_name)
        vector_search = os_client.get_vector_store(embed_model)
        docs = vector_search.similarity_search(
            text,
            k=5,
            vector_field="vector_field",
            text_field="text",
            metadata_field="source"
        )

    return docs


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
        for doc in docs:
            print(doc.page_content)


if __name__ == "__main__":
    main()