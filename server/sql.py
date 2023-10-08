import sqlite3
from sqlite3 import Error
import datetime
import hashlib


# This class is a simple handler for all of our SQL database actions
# Practicing a good separation of concerns, we should only ever call 
# These functions from our models

# If you notice anything out of place here, consider it to your advantage and don't spoil the surprise

class SQLDatabase:
    '''
        Our SQL Database

    '''

    # Get the database running
    def __init__(self, database_args):
        self.conn = sqlite3.connect(database_args)
        self.cur = self.conn.cursor()

    # SQLite 3 does not natively support multiple commands in a single statement
    # Using this handler restores this functionality
    # This only returns the output of the last command
    def execute(self, sql_string):
        out = None
        for string in sql_string.split(";"):
            try:
                out = self.cur.execute(string)
            except:
                pass
        return out

    # Commit changes to the database
    def commit(self):
        self.conn.commit()

    # -----------------------------------------------------------------------------

    # Sets up the database
    # Default admin password
    def database_setup(self):

        # Clear the database if needed
        self.execute("DROP TABLE IF EXISTS Users")
        self.execute("DROP TABLE IF EXISTS Friends")
        self.execute("DROP TABLE IF EXISTS Friend_requests")
        self.execute("DROP TABLE IF EXISTS Messages")
        self.execute("DROP TABLE IF EXISTS Posts")
        self.execute("DROP TABLE IF EXISTS Comments")

        self.commit()

        # Create the users table
        self.execute("""CREATE TABLE Users(
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            pHash TEXT,
            salt TEXT,
            publicKey BLOB,
            publicKeySign BLOB,
            admin INTEGER DEFAULT 0,
            muted INTEGER DEFAULT 0
        )""")

        self.execute("""CREATE TABLE Friends(
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            friend_1 TEXT,
            friend_2 TEXT,
            key BLOB
        )""")

        self.execute("""CREATE TABLE Friend_requests(
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            requester TEXT,
            requestee TEXT
        )""")

        self.execute("""CREATE TABLE Messages(
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT,
            receiver TEXT,
            message BLOB,
            msgTime INTEGER
        )""")

        self.execute("""CREATE TABLE Posts(
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            author TEXT,
            body TEXT,
            time_created INTEGER
        )""")

        self.execute("""CREATE TABLE Comments(
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            postId INTEGER,
            author TEXT,
            body TEXT,
            time_created INTEGER,
            FOREIGN KEY(postId) REFERENCES Posts(Id)
        )""")

        self.commit()

        '''# Add dummy users
        for username, password in [('alice', '123'), ('bob', '123')]:

            salt = str(os.urandom(32))
            pHash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
            self.add_user(username, str(pHash), salt, 0)

        # Add dummy friendships
        self.cur.execute("""INSERT INTO Friends(friend_1, friend_2) VALUES(?, ?)""", ['alice', 'bob'])
        self.cur.execute("""INSERT INTO Friends(friend_1, friend_2) VALUES(?, ?)""", ['bob', 'alice'])

        self.commit()
                '''


    # Add friend
    def add_friend(self, one, two, key):
        self.cur.execute("""INSERT INTO Friends(friend_1, friend_2, key) VALUES(?, ?, ?)""", [one, two, key])
        self.cur.execute("""INSERT INTO Friends(friend_1, friend_2, key) VALUES(?, ?, ?)""", [two, one, key])
        self.commit()

    # -----------------------------------------------------------------------------
    # User handling
    # -----------------------------------------------------------------------------

    # Add a user to the database
    def add_user(self, username, pHash, salt, publicKey, publicKeySign, admin):

        sql_cmd = """
                INSERT INTO Users(username, pHash, salt, publicKey, publicKeySign, admin)
                VALUES(?, ?, ?, ?, ?, ?)
            """

        params = [username, pHash, salt, publicKey, publicKeySign, admin]

        self.cur.execute(sql_cmd, params)
        self.commit()

        return True

    def get_friends(self, username):

        sql_cmd = """
                SELECT friend_2 FROM Friends WHERE friend_1 = ?
            """
        params = [username]
        
        friends = []
        for friend, in self.cur.execute(sql_cmd, params):
            friends.append(friend)

        return friends

    def are_friends(self, friend_1, friend_2):

        sql_cmd = """
                SELECT * FROM Friends WHERE ((friend_1 = ? AND friend_2 = ?) OR (friend_1 = ? AND friend_2 = ?))
            """
        params = [friend_1, friend_2, friend_2, friend_1]
        is_friend = self.cur.execute(sql_cmd, params).fetchone() != None
        return is_friend

    def add_message(self, sender, receiver, message, msgTime):

        sql_cmd = """
                INSERT INTO Messages(sender, receiver, message, msgTime)
                VALUES(?, ?, ?, ?)
            """

        params = [sender, receiver, message, msgTime]

        self.cur.execute(sql_cmd, params)
        self.commit()

        return True

    # Get messages
    def get_messages(self, sender, receiver):

        sql_cmd = """
                SELECT * FROM Messages
                WHERE ((sender = ? AND receiver = ?) OR (sender = ? and receiver = ?))
                ORDER BY msgTime
            """

        params = [sender, receiver, receiver, sender]
        return self.cur.execute(sql_cmd, params).fetchall()

    def add_post(self, author, title, body):

        time_created = int(datetime.datetime.now().timestamp()) * 1000

        sql_cmd = """
            INSERT INTO Posts(author, title, body, time_created)
            VALUES(?, ?, ?, ?)
        """

        params = [author, title, body, time_created]

        self.cur.execute(sql_cmd, params)
        self.commit()

        return True

    def get_posts(self):

        sql_cmd = """
                SELECT * FROM Posts
                ORDER BY id DESC
            """

        return self.cur.execute(sql_cmd).fetchall()

    def get_post(self, id):
        sql_query = """
                SELECT * FROM Posts
                WHERE id = ?
            """

        post = self.cur.execute(sql_query, (id,)).fetchone()
        
        sql_query = """
            SELECT * FROM Comments
            WHERE postId = ?
            ORDER BY id DESC
        """

        comments = self.cur.execute(sql_query, (post[0],)).fetchall()
        post = post + (comments,)

        return post


    def add_comment(self, username, body, postId):
        time_created = int(datetime.datetime.now().timestamp()) * 1000

        sql_cmd = """
            INSERT INTO Comments(postId, author, body, time_created)
            VALUES(?, ?, ?, ?)
        """

        params = [postId, username, body, time_created]
        self.cur.execute(sql_cmd, params)
        self.commit()

        return True

    # -----------------------------------------------------------------------------

    def get_salt(self, username):
        sql_query = """
                SELECT salt
                FROM Users
                WHERE username = ?
            """

        #sql_query = sql_query.format(username)
        self.cur.execute(sql_query, (username,))

        salt = self.cur.fetchone()
        return salt[0]


# Check login credentials
    # return salt and hpas
    def check_credentials(self, username, pHash):
        sql_query = """
                SELECT 1
                FROM Users
                WHERE username = ? and pHash = ?
            """

        params = [username, pHash]
        self.cur.execute(sql_query, params)

        # If our query returns

        if self.cur.fetchone():
            return True
        else:
            return False


    def check_username(self, username):
        sql_query = """
                    SELECT 1
                    FROM Users
                    WHERE username = ?
                """

        params = [username]
        self.cur.execute(sql_query, params)

        if self.cur.fetchone():
            return True
        else:
            return False

    def get_pk(self, username):
        sql_query = """
                    SELECT publicKey
                    FROM Users
                    WHERE username = ?
                    """

        params = [username]
        self.cur.execute(sql_query, params)

        pk = self.cur.fetchone()
        return pk[0]

    def get_symmkey(self, username, receiver):
        sql_query = """
                    SELECT key
                    FROM Friends
                    WHERE friend_1 = ? AND friend_2 = ?
                    """

        params = [username, receiver]
        self.cur.execute(sql_query, params)

        k = self.cur.fetchone()
        return k[0]

    def get_pksign(self, username):
        sql_query = """
                    SELECT publicKeySign
                    FROM Users
                    WHERE username = ?
                    """

        params = [username]
        self.cur.execute(sql_query, params)

        pk = self.cur.fetchone()
        return pk[0]

    # admin functions
    def become_admin(self, username):
        sql_query = """
                    UPDATE Users
                    SET admin = ?
                    WHERE username = ?;
                    """

        params = [1, username]
        self.cur.execute(sql_query, params)
        self.commit()

        return True

    def check_admin(self, username):
        sql_query = """
                SELECT 1
                FROM Users
                WHERE username = ? and admin = 1
            """

        params = [username]
        self.cur.execute(sql_query, params)

        # If our query returns

        if self.cur.fetchone():
            return True
        else:
            return False

    def get_users(self):
        sql_query = """
                        SELECT Id, username, muted
                        FROM Users
                    """

        return self.cur.execute(sql_query).fetchall()

    # mute_status = 0 : not muted
    # mute_status = 1 : muted
    def update_user_muted(self, id, mute_status):
        sql_query = """
                        UPDATE Users
                        SET muted = ?
                        WHERE Id = ?
                    """
        params = [mute_status, id]
        self.cur.execute(sql_query, params)
        self.commit()
        return True

    def get_user(self, id):
        sql_query = """
                SELECT * FROM Users
                WHERE id = ?
            """

        user = self.cur.execute(sql_query, (id,)).fetchone()
        return user

    def delete_user(self, user):
        sql_query = """
                DELETE FROM Users
                WHERE id = ?
            """
        params = [user]
        self.cur.execute(sql_query, params)
        self.commit()
        return True

    def delete_posts(self, posts):
        sql_query = """
                DELETE FROM Posts
                WHERE id = ?
            """

        params = [posts]
        self.cur.execute(sql_query, params)
        self.commit()
        return True

    def get_muted_status(self, user):
        sql_query = """
                SELECT muted
                FROM Users
                WHERE username = ?
            """

        params = [user]
        self.cur.execute(sql_query, params)

        response = self.cur.fetchone()
        if response[0] == 1:
            return True
        else:
            return False





