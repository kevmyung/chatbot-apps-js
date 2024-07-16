from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from libs.opensearch import OpenSearchClient
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import BedrockEmbeddings
import re
import sys
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

CHROMA_PATH = './vectordb/chroma'

def load_document(file_path):
    logger.info(f"Loading file: {file_path}")
    loader = PyPDFLoader(file_path)
    pages = loader.load()
    return pages

def split_pages(pages, vector_store):
    logger.info("Splitting documents")
    parent_splitter = RecursiveCharacterTextSplitter(
        chunk_size = 2000,
        chunk_overlap = 200,
        is_separator_regex=['\n\n', '\n']
    )
    child_splitter = RecursiveCharacterTextSplitter(
        chunk_size = 400,
        chunk_overlap = 40,
        is_separator_regex=['\n\n', '\n']
    ) 
    
    parent_chunks = parent_splitter.split_documents(pages)
    for i, doc in enumerate(parent_chunks):
        doc.metadata['doc_level'] = "parent"
    
    parent_chunk_ids = vector_store.add_documents(documents=parent_chunks)
    #logger.info("parent_chunk_ids:", parent_chunk_ids)
    
    child_chunks = []
    for i, doc in enumerate(parent_chunks):
        _id = parent_chunk_ids[i]
        sub_docs = child_splitter.split_documents([doc])
        for _doc in sub_docs:
            _doc.metadata['doc_level'] = "child"
            _doc.metadata['parent_doc_id'] = _id
        child_chunks.extend(sub_docs)
    child_chunk_ids = vector_store.add_documents(documents=child_chunks)
    #logger.info("child_chunk_ids:", child_chunk_ids)

    ids = parent_chunk_ids + child_chunk_ids
    return ids

def process_document(file_path, vector_store):
    pages = load_document(file_path)
    ids = split_pages(pages, vector_store)
    num_chunks = len(ids)
    logger.info(f"Processing {num_chunks} Chunks completed.")

def main():
    model = sys.argv[1]
    region = sys.argv[2]
    vector_db_option = sys.argv[3]
    file_paths = sys.argv[4:]

    logger.info(f"Model: {model}, Region: {region}, Vector Store: {vector_db_option}")
    logger.info(f"File paths: {file_paths}")

    suffix = re.sub(r'[^a-z0-9]', '', model.lower())
    index_name = f'docs-{suffix}'

    embed_model = BedrockEmbeddings(model_id=model, region_name=region)
    if vector_db_option == "OpenSearch":
        logger.info(f"Using OpenSearch for index: {index_name}")
        os_client = OpenSearchClient(index_name)
        vector_store = os_client.get_vector_store(embed_model)
    elif vector_db_option == "Chroma":
        logger.info(f"Using Chroma for collection: {index_name}")
        vector_store = Chroma(collection_name=index_name, embedding_function=embed_model, persist_directory=CHROMA_PATH)
    else:
        logger.error("Invalid Vector Store.")

    for file_path in file_paths:
        process_document(file_path, vector_store)
        
    logger.info("Process Completed.")

if __name__ == "__main__":
    main()