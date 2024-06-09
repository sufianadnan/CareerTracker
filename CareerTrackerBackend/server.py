from flask import Response, Flask, request, jsonify, g
import sqlite3
import socket
from functions.applications import open_applications, closed_applications
from datetime import datetime
import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv
import logging
import base64
from urllib.parse import urlparse

app = Flask(__name__)

load_dotenv('Database/.env')
DATABASE = 'Database/database.db'
ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY')
cipher_suite = Fernet(ENCRYPTION_KEY.encode())

web_server_host = '0.0.0.0'
web_server_port = 5000

logging.basicConfig(level=logging.DEBUG)


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


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.execute('''
            CREATE TABLE IF NOT EXISTS credentials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                password TEXT NOT NULL,
                website TEXT NOT NULL
            )
        ''')
    return db


def clean_url(url):
    parsed_url = urlparse(url)
    path_parts = parsed_url.path.split('/')

    # Remove empty strings resulting from leading/trailing slashes
    path_parts = [part for part in path_parts if part]

    if len(path_parts) > 2:
        truncated_path = '/' + '/'.join(path_parts[:2])
    else:
        truncated_path = parsed_url.path

    cleaned_url = f"{parsed_url.scheme}://{parsed_url.netloc}{truncated_path}"
    return cleaned_url


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
            CREATE TABLE IF NOT EXISTS results (
                id INTEGER PRIMARY KEY,
                company TEXT,
                postingTitle TEXT,
                status TEXT,
                dateApplied TEXT
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS config (
                ntfy_endpoint TEXT,
                discord_webhook TEXT
            )
        ''')
        conn.commit()
        conn.close()
    except Exception as e:
        logging.error("Error creating tables: %s", e)


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


@app.route('/api/save_entries', methods=['POST'])
def save_entries():
    data = request.json
    if data:
        email = data.get('email')
        password = data.get('password')
        website = data.get('url')

        if email and password and website:
            cleaned_website = clean_url(website)
            try:
                db = get_db()
                cursor = db.cursor()
                cursor.execute('''
                    INSERT INTO credentials (email, password, website) VALUES (?, ?, ?)
                ''', (encrypt_data(email), encrypt_data(password), encrypt_data(cleaned_website)))
                db.commit()
                return jsonify({"message": "Data saved successfully"}), 200
            except Exception as e:
                return jsonify({"error": str(e)}), 500

    return jsonify({"error": "Invalid data"}), 400


@app.route('/api/active_applications', methods=['GET'])
def check_open_applications():
    global global_resultlist
    global_resultlist = open_applications()
    return jsonify(global_resultlist)


@app.route('/api/inactive_applications', methods=['GET'])
def check_closed_applications():
    global global_resultlist
    global_resultlist = closed_applications()
    return jsonify(global_resultlist)


@app.route('/api/stats', methods=['GET'])
def stats():
    try:
        db = get_db()
        cursor = db.cursor()

        cursor.execute('SELECT COUNT(*) FROM credentials')
        count_result = cursor.fetchone()
        if count_result:
            credentials_count = count_result[0]
        else:
            credentials_count = 0

        cursor.execute('SELECT * FROM stats')
        stats_rows = cursor.fetchall()

        if stats_rows:
            if len(stats_rows) > 0:
                active_count = stats_rows[0][0]
                inactive_count = stats_rows[0][1]
            else:
                active_count = 0
                inactive_count = 0

            response = {
                "credentials_count": credentials_count,
                "active": active_count,
                "inactive": inactive_count,
                "total": active_count + inactive_count
            }
            return jsonify(response), 200
        else:
            return jsonify({"message": "No stats found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/applied_dates', methods=['GET'])
def get_applied_dates():
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute("SELECT dateApplied FROM results")
        rows = cursor.fetchall()
        conn.close()

        processed_dates = []
        for row in rows:
            date_str = row[0]
            try:
                date = datetime.strptime(date_str, '%B %d, %Y').date()
                processed_dates.append(date)
            except ValueError:
                logging.warning(f"Ignoring invalid date format: {date_str}")

        return jsonify({'applied_dates': [str(date) for date in processed_dates]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/logins', methods=['GET'])
def view_credentials():
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT * FROM credentials')
        customers = cursor.fetchall()
        decrypted_customers = []
        for row in customers:
            try:
                decrypted_row = (
                    row[0],
                    decrypt_data(row[1]),
                    decrypt_data(row[2]),
                    decrypt_data(row[3])
                )
                decrypted_customers.append(decrypted_row)
            except Exception as e:
                logging.error(f"Error decrypting row {row}: {e}")
        return jsonify(decrypted_customers)
    except Exception as e:
        logging.error(f"Error retrieving customers: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/delete', methods=['DELETE'])
def delete_customers():
    try:
        data = request.json
        deleted_ids = data.get('deletedIds', [])
        if deleted_ids:
            db = get_db()
            cursor = db.cursor()
            for id in deleted_ids:
                cursor.execute('DELETE FROM credentials WHERE id = ?', (id,))
            db.commit()
            return jsonify({"message": "Credentials deleted successfully"})
        else:
            return jsonify({"message": "No credentials to delete"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/update', methods=['PATCH'])
def update_credentials():
    try:
        data = request.json
        updated_records = data.get('updatedRecords', [])

        if updated_records:
            db = get_db()
            cursor = db.cursor()
            for record in updated_records:
                cursor.execute('UPDATE credentials SET email = ?, password = ?, website = ? WHERE id = ?',
                               (encrypt_data(record['Email']), encrypt_data(record['Password']), encrypt_data(record['Website']), record['DatabaseID']))
            db.commit()
            return jsonify({"message": "Credentials updated successfully"})
        else:
            return jsonify({"message": "No credentials to update"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def get_all_ips():
    ips = [ip for ip in socket.gethostbyname_ex(socket.gethostname())[
        2] if not ip.startswith("127.")]
    return ips


if __name__ == '__main__':
    create_tables_if_not_exists()
    if web_server_host == '0.0.0.0':
        host_ips = get_all_ips()
        for host_ip in host_ips:
            print(f"Web server running on http://{host_ip}:{web_server_port}")
    else:
        print(
            f"Web server running on http://{web_server_host}:{web_server_port}")
    app.run(host=web_server_host, port=web_server_port, debug=False)
