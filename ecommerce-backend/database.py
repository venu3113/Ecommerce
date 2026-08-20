import pymysql
from config import *

def get_connection():    
    connection = pymysql.connect(
        host="localhost",
        user="root",
        password="@Venu1234",
        database="ecommerce_db",
        cursorclass=pymysql.cursors.DictCursor
    )
    return connection