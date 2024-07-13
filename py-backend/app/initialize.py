import sys
import re
from libs.opensearch import OpenSearchClient

def main():
    embedding_model = sys.argv[1]

    suffix = re.sub(r'[^a-z0-9]', '', embedding_model.lower())
    index_name = f'docs-{suffix}'
    os_client = OpenSearchClient(index_name)
    os_client.delete_index()
    print(f"Index Deleted.")

if __name__ == "__main__":
    main()
