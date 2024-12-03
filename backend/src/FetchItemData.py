import psycopg2
import json
import os
db_config = {
    "dbname": "ssh_grocery",
    "user": "ssep1",
    "password": "SSEP123!",
    "host": "localhost",
    "port": 5432
}
try:
    conn = psycopg2.connect(**db_config)
    cursor = conn.cursor()
except Exception as e:
    print(e)

def process_folder(folder_path):
    all_items = set() 

    for file_name in os.listdir(folder_path):
        file_path = os.path.join(folder_path, file_name)
        with open(file_path, 'r') as f:
            data = json.load(f)
            for item in data:
                all_items.add((item['Name'], item['Shop']))
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
    cursor.execute('SELECT Name, Shop FROM items')
    db_items = cursor.fetchall()
    for db_item in db_items:
        if db_item not in all_items:
            cursor.execute('''
            DELETE FROM items WHERE Name = %s AND Shop = %s
            ''', db_item)

    conn.commit()

process_folder('./shop_files'  )

cursor.close()
conn.close()
