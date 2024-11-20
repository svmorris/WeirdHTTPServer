# The purpose for this file is to act as a bridge between
# the node js server and the individual scripts for pages.

import os
import sys
import json
import importlib


# TODO:
# - config file
# - error handling


# NOTE: The current config file is in javascript,
# we will need to make a config file both can use
# and transfer this config to that page.
allowed_directory = os.path.abspath("./pages")


# ONLY methods within this are accepted!!!
method_typedef = {
        "GET": "get",
        "POST": "post",
        "PUT": "put",
        "PATCH": "patch",
        "DELETE": "delete"
    }
methods_w_body = ["POST", "PUT", "PATCH"]


# The server will always give a different, random port number
# that it will connect from.
PATH = sys.argv[1]# Path needs to be sanitized


def run_user_function(module_path, function_name, *args, **kwargs):
    """
    Dynamically imports a module and executes a specified function.

    Args:
        module_path (str): The path to the module.
        function_name (str): The name of the function to execute.
        *args: Positional arguments for the function.
        **kwargs: Keyword arguments for the function.

    Returns:
        The return value of the executed function.
    """

    try:
        # Import the module
        module = importlib.import_module(module_path)

        # Get the function object
        func = getattr(module, function_name)

        # Execute the function
        result = func(*args, **kwargs)
        return result

    except ImportError as e:
        print(f"Error importing module: {e}")
    except AttributeError as e:
        print(f"Error accessing function: {e}")
    except Exception as e:
        print(f"Error executing function: {e}")



class Request:
    def __init__(self, headers: dict, body, body_is_text: bool):
        self.headers = headers
        self.body = body
        self.body_is_text = body_is_text

def main(PATH: str,allowed_directory: str):

    absolute_module_path = os.path.abspath(os.path.join(allowed_directory, PATH))
    print(absolute_module_path)
    if not absolute_module_path.startswith(allowed_directory):
        raise ValueError("Module path is not within the allowed directory.")


    header_data = sys.stdin.readline()

    # clean up and parse the header data
    header_data = header_data.replace("\r\n", "")
    header_data = header_data.strip(" ")
    header_data = header_data.replace("\r\n", "")
    header_json = json.loads(header_data)
    
        
    body_data = sys.stdin.buffer.read()
    if len(body_data) > 1:
        # Check if the body can be converted to text (ei is not binary)
        body_is_text = True
        try:
            body_data = body_data.decode('utf-8')
        except UnicodeDecodeError:
            body_is_text = False
    
    # If no body was sent, just make sure its an empty string
    # (if a single newline was sent id remove that too)
    else:
        body_data = ""
        body_is_text = True


    method = method_typedef.get(header_json.get("request", {}).get("method", None))
    request = Request(header_json, body_data, body_is_text)
    # Only run valid methods
    if method is not None:
        run_user_function(absolute_module_path, request) 
    else:
        print("Invalid method")
        sys.exit(1)





        


if __name__ == "__main__":
    main(PATH, allowed_directory)