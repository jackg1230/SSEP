import psycopg2
import json
import os

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


# Function to process all JSON files in a folder
def process_folder(folder_path):
    all_items = set()  # To track all items processed from all files

    # Iterate over all JSON files in the folder
    for file_name in os.listdir(folder_path):
        if file_name.endswith('.json'):
            file_path = os.path.join(folder_path, file_name)

            # Read and process each JSON file
            with open(file_path, 'r') as f:
                data = json.load(f)

                for item in data:
                    # Add the item (Name, Shop) combination to the all_items set
                    all_items.add((item['Name'], item['Shop']))

                    # Check if the entry with the same Name and Shop exists
                    cursor.execute('''
                    SELECT "ID" FROM items WHERE "Name" = %s AND "Shop" = %s
                    ''', (item['Name'], item['Shop']))
                    existing_entry = cursor.fetchone()

                    if existing_entry:
                        # Update the record if it exists
                        cursor.execute('''
                        UPDATE items
                        SET "Price" = %s
                        WHERE "Name" = %s AND "Shop" = %s
                        ''', (item['Price'], item['Name'], item['Shop']))
                    else:
                        # Insert a new record with auto-incremented ID
                        cursor.execute('''
                        INSERT INTO items ("Name", "Shop", "Price")
                        VALUES (%s, %s, %s)
                        ''', (item['Name'], item['Shop'], item['Price']))

    conn.commit()

    # Delete items not present in any of the files
    cursor.execute('SELECT "Name", "Shop" FROM items')
    db_items = cursor.fetchall()  # Fetch all items currently in the database

    for db_item in db_items:
        if db_item not in all_items:
            # Delete the item from the database
            cursor.execute('''
            DELETE FROM items
            WHERE "Name" = %s AND "Shop" = %s
            ''', db_item)

    conn.commit()

folder_path = './shop_files'  
process_folder(folder_path)


# Close the connection
cursor.close()
conn.close()
print("Database connection closed.")
