import re 
def validate_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern,email)
def validate_password(password):
    pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%?&]).{8,}$'
    return re.match(pattern,password)