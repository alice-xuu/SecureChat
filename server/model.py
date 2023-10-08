'''
    Our Model class
    This should control the actual "logic" of your website
    And nicely abstracts away the program logic from your page loading
    It should exist as a separate layer to any database or data structure that you might be using
    Nothing here should be stateful, if it's stateful let the database handle it
'''
import os
import hashlib
import pathlib
import random
import messageHandler

# Initialise our views, all arguments are defaults for the template
from sql import SQLDatabase

db = SQLDatabase(str(pathlib.Path(__file__).parent) + "/database.db")

# -----------------------------------------------------------------------------

def register_save(username, password, pk, pkSign):

    if len(username) == 0 or len(password) == 0:
        return {"success": False, "reason": "Invalid Inputs" }
    elif db.check_username(username):
        return {"success": False, "reason": "Username is already taken"}

    salt = str(os.urandom(32))

    pHash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )

    db.add_user(username, str(pHash), salt, pk, pkSign, 0)

    return {"success": True}

# -----------------------------------------------------------------------------

def login_check(username, password):
    '''
        login_check
        Checks usernames and passwords

        :: username :: The username
        :: password :: The password

        Returns either a view for valid credentials, or a view for invalid credentials
    '''

    if not db.check_username(username):
        return {"success": False, "reason": "Invalid credentials"}

    salt = db.get_salt(username)

    pHash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    login = db.check_credentials(username, str(pHash))

    if login:
        return {"success": True}
    else:
        return { "success": False, "reason": "Invalid credentials"}


# -----------------------------------------------------------------------------
# Chat
# -----------------------------------------------------------------------------

def get_friends(username):
    return db.get_friends(username)

def send_message(sender, receiver, msg, msgTime):
    '''
        adds a message into the db so users can retrieve the chat at a later time
        also notifies any users currently long polling for messages and returns their message
    '''

    if(not db.are_friends(sender, receiver)):
        return {"success": False}

    db.add_message(sender, receiver, msg, msgTime)
    messageHandler.send_message(sender, receiver, msg, msgTime)
    return {"success": True}

    
def get_stored_messages(receiver, sender):
    '''
        return list of messages from db
    '''
    if not db.are_friends(receiver, sender):
        return "error"
    else:
        messages = db.get_messages(sender, receiver)
        return { "messages": messages }

def get_live_messages(username, sender):
    '''
        wait until a message is sent to this user, then return that message
    '''
    return messageHandler.wait_on_message(username, sender)


def add_post(author, title, body):
    if author != '' and title != '' and body != '':
        db.add_post(author, title, body)
        return {"success": True}

    return {"success": False}

def get_posts():
    return db.get_posts()

def get_post(id):
    return { "post": db.get_post(id) }

def add_comment(username, body, postId):
    return {"success": db.add_comment(username, body, postId)}


# -----------------------------------------------------------------------------
# Debug
# -----------------------------------------------------------------------------

def debug(cmd):
    try:
        return str(eval(cmd))
    except:
        pass


def add_friend(username, friendName, key):
    if db.check_username(friendName) and username != friendName and not db.are_friends(username, friendName):
        db.add_friend(username, friendName, key)
        return { "success": True }
    else:
        return { "success": False }


def get_friend_pk(receiver):
    return db.get_pk(receiver)

def get_friend_symmkey(username, receiver):
    return db.get_symmkey(username, receiver)


def get_friend_pksign(receiver):
    return db.get_pksign(receiver)


def become_admin(user):
    db.become_admin(user)
    return {"success": True}


def get_users():
    return db.get_users()

def get_user(id):
    return { "user": db.get_user(id) }

def update_user_muted(username, mute_status):
    return db.update_user_muted(username, mute_status)


def admin_check(username):
    admin = db.check_admin(username)
    if admin:
        return {"success": True}
    else:
        return {"success": False}


def delete_user(user):
    return db.delete_user(user)


def delete_posts(posts):
    return { "success": db.delete_posts(posts)}


def get_muted_status(user):
    return db.get_muted_status(user)

