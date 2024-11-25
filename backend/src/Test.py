import psycopg2
import json

# PostgreSQL connection details
db_config = {
    "dbname": "ssh_grocery",
    "user": "ssep1",
    "password": "SSEP123!",
    "host": "localhost",
    "port": 5432
}

# Connect to the PostgreSQL database
try:
    conn = psycopg2.connect(**db_config)
    cursor = conn.cursor()
    print("Connected to the database successfully.")
except Exception as e:
    print(f"Error connecting to the database: {e}")
    exit()

cursor.execute(create_table_query)
conn.commit()

# Function to process JSON data
def process_json(file_name):
    with open(file_name, 'r') as f:
        data = json.load(f)

    for item in data:
        # Check if the entry with same Name and Shop exists
        cursor.execute('''
        SELECT * FROM items WHERE Name = %s AND Shop = %s
        ''', (item['Name'], item['Shop']))
        existing_entry = cursor.fetchone()

        if existing_entry:
            # Update price of existing entry
            cursor.execute('''
            UPDATE items
            SET Price = %s
            WHERE Name = %s AND Shop = %s
            ''', (item['Price'], item['Name'], item['Shop']))
        else:
            # Insert new entry
            cursor.execute('''
            INSERT INTO items (Item_ID, Name, Shop, Price)
            VALUES (%s, %s, %s, %s)
            ''', (item['Item_ID'], item['Name'], item['Shop'], item['Price']))

    conn.commit()

process_json('products.json')

cursor.close()
conn.close()
print("Database connection closed.")

