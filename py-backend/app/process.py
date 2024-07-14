from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from libs.opensearch import OpenSearchClient
from langchain_community.embeddings import BedrockEmbeddings
import re
import sys
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_and_split(file_path):
    docs = []
    logger.info(f"Loading file: {file_path}")
    loader = PyPDFLoader(file_path)
    pages = loader.load()
    docs.extend(pages)

    logger.info("Splitting documents")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        is_separator_regex=False,
    )
    chunks = text_splitter.split_documents(docs)
    return chunks

def main():
    model = sys.argv[1]
    region = sys.argv[2]
    vector_store = sys.argv[3]
    file_paths = sys.argv[4:]

    logger.info(f"Model: {model}, Region: {region}, Vector Store: {vector_store}")
    logger.info(f"File paths: {file_paths}")

    suffix = re.sub(r'[^a-z0-9]', '', model.lower())
    index_name = f'docs-{suffix}'

    embed_model = BedrockEmbeddings(model_id=model, region_name=region)

    for file_path in file_paths:
        chunks = load_and_split(file_path)
        if vector_store == "OpenSearch":
            logger.info(f"Using OpenSearch for index: {index_name}")
            os_client = OpenSearchClient(index_name)
            vector_search = os_client.get_vector_store(embed_model)
            vector_search.add_documents(documents=chunks, bulk_size = 2000)
        else:
            logger.error("Invalid Vector Store.")

    logger.info("Process Completed.")

if __name__ == "__main__":
    main()