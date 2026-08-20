from database import get_connection

try:
    connection = get_connection()
    print("database connected succesfully")
    connection.close()
except Exception as e:
    print(e)