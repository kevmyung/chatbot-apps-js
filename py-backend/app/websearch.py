from langchain_community.tools.tavily_search import TavilySearchResults
import json
import os
import sys

def main():
    text = sys.argv[1]
    tavily_search_key = sys.argv[3]
    
    os.environ["TAVILY_API_KEY"] = tavily_search_key
    tool = TavilySearchResults()

    result = tool.invoke({"query": text})
    json_result = json.dumps(result)
    print(json_result)

if __name__ == "__main__":
    main()