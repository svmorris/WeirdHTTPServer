# The purpose for this file is to act as a bridge between
# the node js server and the individual scripts for pages.

import os
import sys
import json
import sock
import sockets
import threading
import importlib


# TODO:
# - config file
# - error handling


# NOTE: The current config file is in javascript,
# we will need to make a config file both can use
# and transfer this config to that page.
allowed_directory = "./pages"


# ONLY methods within this are accepted!!!
method_typedef = [
        "GET", "get",
        "POST", "post",
        "PUT", "put",
        "PATCH", "patch",
        "DELETE", "delete"
    ]
methods_w_body = ["POST", "PUT", "PATCH"]


# The server will always give a different, random port number
# that it will connect from.
TYPE = sys.argv[1]
PATH = sys.argv[2]# Path needs to be sanitized
HEADER_PORT = int(sys.argv[3])
if TYPE in methods_w_body:
    BODY_PORT = int(sys.argv[4])

def threadable_listener(port):
    # This is a function so we can thread it or not at will
    socket = sockets.open_socket(port)
    data = sockets.recv_data(socket)
    sockets.close_socket(socket)
    return data


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




def main(TYPE: str, PATH: str, HEADER_PORT: int, BODY_PORT: int, allowed_directory: str):

    absolute_module_path = os.path.abspath(os.path.join(allowed_directory, PATH))
    if not absolute_module_path.startswith(allowed_directory):
        raise ValueError("Module path is not within the allowed directory.")


    if TYPE in methods_w_body:
        header_data = threadable_listener(HEADER_PORT)

        # clean up and parse the header data
        header_data = header_data.decode('utf-8')
        header_data = header_data.replace("\r\n", "")
        header_data = header_data.strip(" ")
        header_data = header_data.replace("\r\n", "")
        header_data = json.loads(header_data)
        
        
        if method_typedef.get(TYPE) is not None:
            run_user_function(absolute_module_path, method_typedef.get(TYPE), {"header": header_data})



    elif TYPE in methods_w_body:

        # The server will send the data as two separate connections for better reliability.
        # This will avoid having to re-process the http request in python as well as it has
        # already been done in javascript.

        # Its best to do this on threads as the server is asynchronous and will not wait.
        threads = []
        threads.append(Threading.Thread(target=threaded_listener, args=(HEADER_PORT,)))
        threads.append(Threading.Thread(target=threaded_listener, args=(BODY_PORT,)))

        for thread in threads:
            thread.join()

        header_data = threads[0].result
        body_data = threads[1].result


        # clean up and parse the header data
        header_data = header_data.decode('utf-8')
        header_data = header_data.replace("\r\n", "")
        header_data = header_data.strip(" ")
        header_data = header_data.replace("\r\n", "")
        header_data = json.loads(header_data)


        # Check if the body can be converted to text (ei is not binary)
        body_is_text = True
        try:
            body_data = body_data.decode('utf-8')
        except UnicodeDecodeError:
            body_is_text = False

        if method_typedef.get(TYPE) is not None:
            run_user_function(absolute_module_path, method_typedef.get(TYPE), {
                "header": header_data,
                "body": body_data,
                "body_is_text": body_is_text
            })

        


if __name__ == "__main__":
    main(TYPE, PATH, HEADER_PORT, BODY_PORT, allowed_directory)