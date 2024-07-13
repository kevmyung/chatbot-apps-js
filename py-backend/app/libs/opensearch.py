from opensearchpy import OpenSearch, RequestsHttpConnection
from langchain_community.vectorstores import OpenSearchVectorSearch
import os
import yaml

class OpenSearchClient:
    def __init__(self, index_name) -> None:
        self.config = self.init_config()
        self.conn = self.connect_opensearch()
        
        self.index_name = index_name
        self.create_index()

    def init_config(self):
        file_dir = os.path.dirname(os.path.abspath(__file__))
        config_path = os.path.join(file_dir, "opensearch.yml")
        with open(config_path, 'r', encoding='utf-8') as file:
            config = yaml.safe_load(file)
        
        self.config = config
        self.auth = (config['opensearch-auth']['user_id'], config['opensearch-auth']['user_password'])
        self.endpoint = config['opensearch-auth']['domain_endpoint']
        self.mapping = {"settings": config['settings'], "mappings": config['mappings-rag']}

    def connect_opensearch(self):
        connection = OpenSearch(
            hosts=[{'host': self.endpoint.replace("https://", ""), 'port': 443}],
            http_auth=self.auth, 
            use_ssl=True,
            verify_certs=True,
            connection_class=RequestsHttpConnection
        ) 
        return connection
    
    def is_index_present(self):
        return self.conn.indices.exists(self.index_name)
    
    def create_index(self):
        if not self.is_index_present():
            self.conn.indices.create(self.index_name, body=self.mapping)

    def delete_index(self):
        if self.is_index_present():
            self.conn.indices.delete(self.index_name)

    def get_vector_store(self, embed_model):
        vector_store = OpenSearchVectorSearch(
            index_name=self.index_name,
            opensearch_url=self.endpoint,
            embedding_function=embed_model,
            http_auth=self.auth,
        )
        return vector_store
