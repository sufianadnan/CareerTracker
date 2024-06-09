import sqlite3
import threading
import requests
from urllib.parse import urlparse
from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv
import base64
import logging

DATABASE_DIR = 'Database/'
DATABASE_FILE = os.path.join(DATABASE_DIR, 'database.db')
ENV_FILE = os.path.join(DATABASE_DIR, '.env')

# Ensure the directory exists
if not os.path.exists(DATABASE_DIR):
    os.makedirs(DATABASE_DIR)
    print(f"Created directory: {DATABASE_DIR}")

# Ensure the database file exists
if not os.path.isfile(DATABASE_FILE):
    open(DATABASE_FILE, 'w').close()
    print(f"Created file: {DATABASE_FILE}")

# Ensure the .env file exists and is not a directory
if os.path.exists(ENV_FILE) and os.path.isdir(ENV_FILE):
    raise IsADirectoryError(
        f"Expected {ENV_FILE} to be a file but found a directory")

if not os.path.isfile(ENV_FILE):
    open(ENV_FILE, 'w').close()
    print(f"Created file: {ENV_FILE}")

# Load environment variables from .env file
load_dotenv(dotenv_path=ENV_FILE)

# Fetch the encryption key from environment variables
encryption_key = os.getenv('ENCRYPTION_KEY')
if encryption_key is None:
    encryption_key = Fernet.generate_key().decode()
    with open(ENV_FILE, 'a') as f:
        f.write(f"ENCRYPTION_KEY={encryption_key}\n")
    print("Generated and saved a new encryption key.")

    # Reload environment variables to include the new encryption key
    load_dotenv(dotenv_path=ENV_FILE)

# Verify that the encryption key is loaded correctly
encryption_key = os.getenv('ENCRYPTION_KEY')
print(f"ENCRYPTION_KEY={encryption_key}")

cipher_suite = Fernet(encryption_key.encode())

logging.basicConfig(level=logging.DEBUG)

total_applications_count = 0
total_logins_count = 0
total_accounts_checked = 0

DATABASE = DATABASE_FILE


def is_encrypted(data):
    try:
        base64.urlsafe_b64decode(data.encode())
        return True
    except Exception:
        return False


def encrypt_data(data):
    encrypted_data = cipher_suite.encrypt(data.encode()).decode()
    logging.debug(f"Encrypted {data} to {encrypted_data}")
    return encrypted_data


def decrypt_data(data):
    if is_encrypted(data):
        try:
            decrypted_data = cipher_suite.decrypt(data.encode()).decode()
            logging.debug(f"Decrypted {data} to {decrypted_data}")
            return decrypted_data
        except Exception as e:
            logging.error(
                f"Error decrypting data {data}: {e}. Treating as plaintext.")
            return data
    else:
        logging.debug(f"Data {data} is not encrypted. Treating as plaintext.")
        return data


def create_tables_if_not_exists():
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS stats
            (active INTEGER DEFAULT 0, inactive INTEGER DEFAULT 0)
        ''')
        cursor.execute('''
            INSERT INTO stats (active, inactive)
            SELECT 0, 0 WHERE NOT EXISTS (SELECT 1 FROM stats)
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS results
            (id INTEGER PRIMARY KEY, company TEXT, postingTitle TEXT, status TEXT, dateApplied TEXT)
        ''')
        conn.commit()
        conn.close()
    except Exception as e:
        logging.error("Error creating tables:", e)


create_tables_if_not_exists()


def update_stats(amount, type):
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        if type == 'active':
            cursor.execute('''UPDATE stats SET active = ?''', (amount,))
        if type == 'inactive':
            cursor.execute('''UPDATE stats SET inactive = ?''', (amount,))
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error as e:
        logging.error("SQLite error:", e)
        return False
    except Exception as e:
        logging.error("Error updating 'stats' table:", e)
        return False


def full_requests(email, password, url_login, url_jobs):
    host = url_login.split('/')[2]
    headers = {
        "Host": host,
        "Accept-Language": "en-US",
        "Sec-Ch-Ua-Mobile": "?0",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.160 Safari/537.36",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Accept": "*/*",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
    }
    session = requests.Session()
    response_get = session.get(url_login, headers=headers)
    login_data = {"username": email, "password": password}
    login_response = session.post(url_login, data=login_data)
    response_jobs = session.get(url_jobs, headers=headers)
    return response_jobs.json()


def insert_result(company, posting_title, status, date_applied):
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute('''SELECT * FROM results 
                          WHERE company = ? AND postingTitle = ? AND dateApplied = ?''',
                       (company, posting_title, date_applied))
        existing_record = cursor.fetchone()
        if existing_record:
            cursor.execute('''UPDATE results 
                              SET status = ? 
                              WHERE company = ? AND postingTitle = ? AND dateApplied = ?''',
                           (status, company, posting_title, date_applied))
        else:
            cursor.execute('''INSERT INTO results (company, postingTitle, status, dateApplied)
                              VALUES (?, ?, ?, ?)''',
                           (company, posting_title, status, date_applied))
        conn.commit()
        conn.close()
    except Exception as e:
        logging.error("Error inserting/updating result:", e)


def process_applications(email, password, url_login, url_jobs, count_type, result_list):
    active_applications_count = 0
    closed_applications_count = 0
    response_data = full_requests(email, password, url_login, url_jobs)
    if 'data' in response_data:
        data_list = response_data['data']
        if data_list:
            if count_type == 'open':
                active_applications_count = len(data_list)
            elif count_type == 'closed':
                closed_applications_count = len(data_list)
            for item in data_list:
                company_name = urlparse(url_login).hostname.split('.')[
                    0].capitalize()
                posting_info = {
                    'company': company_name,
                    'postingTitle': item.get('postingTitle', 'N/A'),
                    'status': item.get('status', 'N/A'),
                    'dateApplied': item.get('dateApplied', 'N/A')
                }
                result_list.append(posting_info)
                insert_result(company_name, posting_info['postingTitle'], item.get(
                    'status', 'N/A'), item.get('dateApplied', 'N/A'))
                # print(result_list)
    update_stats(active_applications_count, closed_applications_count)
    return active_applications_count, closed_applications_count


def get_credentials_from_database():
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute("SELECT email, password, website FROM credentials")
        rows = cursor.fetchall()
        conn.close()
        credentials = []
        for row in rows:
            email = row[0]
            password = row[1]
            website = row[2]

            if is_encrypted(email):
                email = decrypt_data(email)
            if is_encrypted(password):
                password = decrypt_data(password)
            if is_encrypted(website):
                website = decrypt_data(website)

            if not website.startswith("http://") and not website.startswith("https://"):
                website = "https://" + website
            credentials.append((email, password, website))
        print(credentials)
        return credentials
    except Exception as e:
        logging.error("Error fetching credentials from database:", e)
        return []


def open_applications():
    result_list = []
    threads = []
    credentials = get_credentials_from_database()
    total_active_count = 0
    for row in credentials:
        email, password, website = row
        if "/en-US/" in website or "/Ext/" in website:
            parsed_url = urlparse(website)
            domain = parsed_url.netloc
            path_segments = parsed_url.path.strip('/').split('/')
            if "/en-US/" in website:
                dynamic_path = path_segments[path_segments.index("en-US") + 1]
            else:
                dynamic_path = path_segments[path_segments.index("Ext") + 1]
            company_name = domain.split('.')[0]
            url_jobs = f"https://{domain}/wday/cxs/{company_name}/{dynamic_path}/applications?type=active&offset=0&limit=6"
            url_login = f"{website}/login"
            thread = threading.Thread(target=process_applications, args=(
                email, password, url_login, url_jobs, 'open', result_list))
            threads.append(thread)
            thread.start()
    for thread in threads:
        thread.join()
    total_active_count = len(result_list)
    update_stats(total_active_count, "active")
    return result_list


def closed_applications():
    result_list = []
    threads = []
    credentials = get_credentials_from_database()
    total_closed_count = 0
    for row in credentials:
        email, password, website = row
        if "/en-US/" in website or "/Ext/" in website:
            parsed_url = urlparse(website)
            domain = parsed_url.netloc
            path_segments = parsed_url.path.strip('/').split('/')
            if "/en-US/" in website:
                dynamic_path = path_segments[path_segments.index("en-US") + 1]
            else:
                dynamic_path = path_segments[path_segments.index("Ext") + 1]
            company_name = domain.split('.')[0]
            url_jobs = f"https://{domain}/wday/cxs/{company_name}/{dynamic_path}/applications?type=inactive&offset=0&limit=6"
            url_login = f"{website}/login"
            thread = threading.Thread(target=process_applications, args=(
                email, password, url_login, url_jobs, 'closed', result_list))
            threads.append(thread)
            thread.start()
    for thread in threads:
        thread.join()
    total_closed_count = len(result_list)
    update_stats(total_closed_count, "inactive")
    return result_list
