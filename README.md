# About

WeirdHTTPServer (for lack of a better name) is an HTTP server written in Node.js. This server does not use libraries or built-in functions to handle HTTP but relies solely on raw sockets. It is capable of serving pages to browsers and handling all basic request types as per the HTTP/1.1 specification. The server also implements a backend scripting system similar in functionality to PHP, but written in Python. I'll explain this further in its own section.

### Usage

By default, the server acts as a static file server, serving anything in the `./pages` directory.

You can run it simply with:

```
node server.js
```

### Dependencies

This server has only two dependencies:
- Node.js
- Python 3

My goal while writing this was to avoid using external libraries in favor of writing everything myself.

# Scripting

The server takes inspiration from PHP's implementation of backend scripting but uses Python as its language. There is no logical reason behind this choice other than creating something unique and challenging (otherwise, I would have just scripted in JavaScript). Simply creating a Python file (`.py` extension) within the `./pages` directory will automatically count it as a backend script. When the path is called via any HTTP method, the script will be executed, and `STDOUT` will be sent as the response body.

**NOTE:** There is no sandbox, so Python scripts must be trusted by the server owner.

#### Example Script

```py
def get(request):
    print("Python has run (GET) :)")

def post(request):
    print(request.headers)  # dict object
    print(request.body)  # bytes
    print(request.body_is_text)  # bool

    return "Python has run (POST) :)"
```

Scripts do not need any boilerplate code other than defining specific functions for each HTTP method that should be handled. Methods that do not have a corresponding function will return a 405 (Method Not Allowed) response.

#### The Request Object

```py
class Request:
    def __init__(self, headers: dict, body, body_is_text: bool):
        self.headers = headers
        self.body = body
        self.body_is_text = body_is_text
        self.response = Response()
```

The request object is used to pass information between the HTTP server and the script. The first two variables allow the script to read the body and the headers of the HTTP request. The headers are always represented as a Python dictionary with key-value pairs, while the body is either UTF-8 encoded text or binary data. The variable `body_is_text` can be used to determine the body type without messy interpretations.

The fourth variable, `response`, allows the user to modify the response headers sent back to the client. Headers are stored in a dictionary, and anything can be edited. By default, this dictionary contains only the request line and server field.

```py
class Response:
    def __init__(self):
        self.headers = {
            "request": {
                "version": "HTTP/1.1",
                "status": 200,
                "message": "OK"
            },
            "fields": {
                "Server": "bread.py",
            }
        }
```

**NOTE:** `Content-Length`, `Content-Encoding`, and `Connection: close` headers are handled automatically by the HTTP server. These are not part of the response object, and modifying them will have no effect as they will be overwritten.

# Project Goals

What this project has:
- A web server written in Node.js using only the socket API
- A custom backend scripting system
  > I've implemented the backend scripting system using individual Python scripts similarly to how PHP functions. I know it's an odd system, but it was interesting to implement.

Working on:
- Basic error management

Planned features:
- Example website  
  > Creating an example website will help iron out bugs and complete the error management system.
- Documentation

# Why?

I like building weird projects, and I enjoy proving to myself that programs, where the common consensus is "Do not build yourself but use a library," can still be built by regular people—albeit with much more limited features. For this reason, I am also considering attempting a custom SSL implementation for my server in the future. 
