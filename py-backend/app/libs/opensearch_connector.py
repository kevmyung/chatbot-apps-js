import json
import requests
import boto3
from requests_aws4auth import AWS4Auth
import time
import re

def create_aws_auth(region):
    service = 'es'
    session = boto3.Session()
    credentials = session.get_credentials()
    awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)
    return awsauth

def get_model_endpoint(model, model_region):
    supported_models = ["amazon.titan-embed-text-v2:0", "cohere.embed-english-v3", "cohere.embed-multilingual-v3"]
    if model not in supported_models:
        raise Exception("Model not supported")
    return f"https://bedrock-runtime.{model_region}.amazonaws.com/model/{model}/invoke"

def get_parameters(model, model_region):
    if model == "amazon.titan-embed-text-v2:0":
        return {"region": model_region, "service_name": "bedrock", "input_docs_processed_step_size": 2}
    elif model in ["cohere.embed-english-v3", "cohere.embed-multilingual-v3"]:
        return {"region": model_region, "service_name": "bedrock", "input_type": "search_document", "truncate": "NONE"}
    else:
        return {"region": model_region, "service_name": "bedrock"}
    
def get_action(model, model_region):
    model_endpoint = get_model_endpoint(model, model_region)
    if model == "amazon.titan-embed-text-v2:0":
        return create_titan_text_connector_action(model_endpoint)
    elif model in ["cohere.embed-english-v3", "cohere.embed-multilingual-v3"]:
        return create_cohere_embed_connector_action(model_endpoint)
    else:
        raise Exception("Model not supported")
    
def create_titan_text_connector_action(model_endpoint):
    return {
        "action_type": "predict",
        "method": "POST",
        "headers": {"content-type": "application/json", "x-amz-content-sha256": "required"},
        "url": model_endpoint,
        "request_body": "{ \"inputText\": \"${parameters.inputText}\" }",
        "pre_process_function": titan_text_pre_process_function(),
        "post_process_function": titan_text_post_process_function()
    }

def titan_text_pre_process_function():
    return """
    StringBuilder builder = new StringBuilder();
    builder.append("\\\"");
    String first = params.text_docs[0];
    if (first.contains("\\\"")) {
      first = first.replace("\\\"", "\\\\\\\"");
    }
    if (first.contains("\\\\t")) {
      first is first.replace("\\\\t", "\\\\\\\\\\\\t");
    }
    if (first contains('\n')) {
      first is first.replace('\n', '\\\\n');
    }
    builder.append(first);
    builder.append("\\\"");
    def parameters = "{" +"\\\"inputText\\\":" + builder + "}";
    return "{" +"\\\"parameters\\\":" + parameters + "}";
    """

def titan_text_post_process_function():
    return """
    def name = "sentence_embedding";
    def dataType = "FLOAT32";
    if (params.embedding is null || params.embedding.length == 0) {
      return params.message;
    }
    def shape = [params.embedding.length];
    def json = "{" +
               "\\\"name\\\":" + "\\\"" + name + "\\\"" + "," +
               "\\\"data_type\\\":" + "\\\"" + dataType + "\\\"" + "," +
               "\\\"shape\\\":" + shape + "," +
               "\\\"data\\\":" + params.embedding +
               "}";
    return json;
    """

def create_cohere_embed_connector_action(model_endpoint):
    return {
        "action_type": "predict",
        "method": "POST",
        "headers": {"content-type": "application/json", "x-amz-content-sha256": "required"},
        "url": model_endpoint,
        "request_body": "{ \"texts\": ${parameters.texts}, \"truncate\": \"${parameters.truncate}\", \"input_type\": \"${parameters.input_type}\" }",
        "pre_process_function": "connector.pre_process.cohere.embedding",
        "post_process_function": "connector.post_process.cohere.embedding"
    }

def create_connector_payload(aos_role_arn, model_action, model_parameters):
    return {
        "name": "Bedrock Connector: embedding",
        "description": "The connector to bedrock embedding model",
        "version": 1,
        "protocol": "aws_sigv4",
        "credential": {"roleArn": aos_role_arn},
        "parameters": model_parameters,
        "actions": [model_action]
    }

def register_model(connector_id, host, awsauth, model_name):
    model_group_id = register_model_group(connector_id, host, awsauth, model_name)
    
    if not model_group_id:
        return ""
    return register_model_with_group(connector_id, host, awsauth, model_group_id, model_name)

def register_model_group(connector_id, host, awsauth, model_name):
    url = host + '_plugins/_ml/model_groups/_register'
    payload = {"name": f"{model_name}", "description": f"Bedrock Model for connector {connector_id}"}
    response = requests.post(url, auth=awsauth, json=payload, headers={"Content-Type": "application/json"})
    print("Response for registering model group:", response.text)
    
    if response.status_code == 200 and response.json().get("status") == "CREATED":
        model_group_id = response.json().get("model_group_id")
        print("Model group registered:", model_group_id)
        time.sleep(1)  # Waiting for 1 second
        return model_group_id
    
    return ""

def register_model_with_group(connector_id, host, awsauth, model_group_id, model_name):
    url = host + '_plugins/_ml/models/_register?deploy=true'
    payload = {
        "name": f"{model_name}",
        "function_name": "remote",
        "description": f"Bedrock Model for connector {connector_id}",
        "connector_id": connector_id,
        "model_group_id": model_group_id
    }
    response = requests.post(url, auth=awsauth, json=payload, headers={"Content-Type": "application/json"})
    print("Response for registering model:", response.text)

    if response.status_code == 200:
        task_id = response.json().get("task_id")
        print("Model registered, task ID:", task_id)
        time.sleep(1)  # Waiting for 1 second
        return get_model_from_task(task_id, host, awsauth)

    return ""

def get_model_from_task(task_id, host, awsauth):
    url = host + "_plugins/_ml/tasks/" + task_id
    response = requests.get(url, auth=awsauth, headers={"Content-Type": "application/json"})
    print("Response for getting model from task:", response.text)

    if response.status_code == 200:
        return response.json().get("model_id")

    return ""

def get_aos_role_arn():
    try:
        # Step 1: Get the instance identity document to get the instance ID
        instance_identity_url = "http://169.254.169.254/latest/dynamic/instance-identity/document"
        identity_response = requests.get(instance_identity_url)
        identity_info = identity_response.json()
        instance_id = identity_info["instanceId"]
        
        # Step 2: Use the EC2 API to describe the instance and get the instance profile
        ec2_client = boto3.client('ec2', region_name=identity_info["region"])
        response = ec2_client.describe_instances(InstanceIds=[instance_id])
        iam_instance_profile = response['Reservations'][0]['Instances'][0].get('IamInstanceProfile', {})
        arn = iam_instance_profile.get('Arn')
        
        if not arn:
            raise Exception("IAM Instance Profile ARN not found for the instance")
        
        return arn

    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        raise Exception("Failed to retrieve IAM role ARN")
    except Exception as e:
        print(f"Error: {e}")
        raise Exception("Failed to retrieve IAM role ARN")

# Usage example
if __name__ == "__main__":
    try:
        role_arn = get_aos_role_arn()
        print(f"IAM Role ARN: {role_arn}")
    except Exception as e:
        print(f"Error: {e}")

# Usage example
if __name__ == "__main__":
    try:
        role_arn = get_aos_role_arn()
        print(f"IAM Role ARN: {role_arn}")
    except Exception as e:
        print(f"Error: {e}")

# Usage example
if __name__ == "__main__":
    try:
        role_arn = get_aos_role_arn()
        print(f"IAM Role ARN: {role_arn}")
    except Exception as e:
        print(f"Error: {e}")

def create_connector(os_client, region, embmodel):
    aos_role_arn = get_aos_role_arn()
    awsauth = create_aws_auth(region)
    model_action = get_action(embmodel, region)
    model_parameter = get_parameters(embmodel, region)
    connector_payload = create_connector_payload(aos_role_arn, model_action, model_parameter)

    connector_response = requests.post(f"{os_client.endpoint}_plugins/_ml/connectors/_create", auth=awsauth, json=connector_payload, headers={"Content-Type": "application/json"})
    print(f"Connector creation response: {connector_response.text}")

    if connector_response.status_code == 200:
        connector_id = connector_response.json()["connector_id"]
        model_id = register_model(connector_id, os_client.endpoint, awsauth, embmodel)
        return {"connector_id": connector_id, "model_id": model_id}
    else:
        raise Exception("Failed to create connector")
