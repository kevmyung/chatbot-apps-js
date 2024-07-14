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

def process_document(file_path, vector_search):
    logger.info(f"Loading file: {file_path}")
    loader = PyPDFLoader(file_path)
    pages = loader.load()

    logger.info("Splitting documents")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500,
        chunk_overlap=300,
        length_function=len,
        is_separator_regex=False,
    )
    chunks = text_splitter.split_documents(pages)
    vector_search.add_documents(documents=chunks, bulk_size = 2000)


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
    if vector_store == "OpenSearch":
        logger.info(f"Using OpenSearch for index: {index_name}")
        os_client = OpenSearchClient(index_name)
        vector_search = os_client.get_vector_store(embed_model)
    else:
        logger.error("Invalid Vector Store.")

    for file_path in file_paths:
        process_document(file_path, vector_search)
        
    logger.info("Process Completed.")

if __name__ == "__main__":
    main()