

def get(request):
    print("Python has run (get) :)")


def post(request):

    print(request.headers) # dict object
    print(request.body) # bytes
    print(request.body_is_text) # bool

    return "Python has run (post) :)"