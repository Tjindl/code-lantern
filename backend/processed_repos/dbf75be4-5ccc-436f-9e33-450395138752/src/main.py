
def hello_world():
    print("Hello World")
    greet_user("Alice")

def greet_user(name):
    message = format_greeting(name)
    print(message)

def format_greeting(name):
    return f"Hello, {name}!"
