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

# Ensure the table exists with the necessary columns
cursor.execute('''
CREATE TABLE IF NOT EXISTS items (
    ID SERIAL PRIMARY KEY,
    Name TEXT NOT NULL,
    Shop TEXT NOT NULL,
    Price TEXT NOT NULL,
    ItemURL TEXT,
    Description TEXT,
    Promotion TEXT,
    Category TEXT
)
''')
conn.commit()

# Function to process all JSON files in a folder
def process_folder(folder_path):
    all_items = set()  # Track items processed (Name, Shop)

    # Iterate over all JSON files in the folder
    for file_name in os.listdir(folder_path):
        if file_name.endswith('.json'):
            file_path = os.path.join(folder_path, file_name)

            # Read and process each JSON file
            with open(file_path, 'r') as f:
                data = json.load(f)

                for item in data:
                    # Add the item (Name, Shop) combination to the set
                    all_items.add((item['Name'], item['Shop']))

                    # Insert or update the record in the database
                    cursor.execute('''
                    INSERT INTO items (Name, Description, Price, ItemURL,Shop, Promotion, Category)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (Name, Shop)
                    DO UPDATE SET
                        Price = EXCLUDED.Price,
                        ItemURL = EXCLUDED.ItemURL,
                        Description = EXCLUDED.Description,
                        Promotion = EXCLUDED.Promotion,
                        Category = EXCLUDED.Category
                    ''', (
                        item['Name'],
                        item['Shop'],
                        item['Price'],
                        item.get('ItemURL', None),
                        item.get('Description', None),
                        item.get('Promotion', None),
                        item.get('Category', None)
                    ))

    conn.commit()

    # Remove items from the database that are no longer in any JSON file
    cursor.execute('SELECT Name, Shop FROM items')
    db_items = cursor.fetchall()

    for db_item in db_items:
        if db_item not in all_items:
            cursor.execute('''
            DELETE FROM items WHERE Name = %s AND Shop = %s
            ''', db_item)

    conn.commit()

# Process all JSON files in the specified folder
folder_path = './shop_files'  # Replace with the path to your JSON files
process_folder(folder_path)

# Close the database connection
cursor.close()
conn.close()
print("Database updated and connection closed.")
