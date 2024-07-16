import sys
import re
from libs.opensearch import OpenSearchClient
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import BedrockEmbeddings


CHROMA_PATH = './vectordb/chroma'

def main():
    embedding_model = sys.argv[1]
    region = sys.argv[2]
    vector_db_option = sys.argv[3]

    suffix = re.sub(r'[^a-z0-9]', '', embedding_model.lower())
    index_name = f'docs-{suffix}'
    
    embeddings = BedrockEmbeddings(model_id=embedding_model, region_name=region)
    if vector_db_option == "OpenSearch":
        os_client = OpenSearchClient(index_name)
        os_client.delete_index()
    elif vector_db_option == "Chroma":
        vector_store = Chroma(collection_name=index_name, embedding_function=embeddings, persist_directory=CHROMA_PATH)
        vector_store.delete_collection(index_name)

    print(f"Index Deleted.")

if __name__ == "__main__":
    main()
