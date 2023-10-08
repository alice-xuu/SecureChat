'''
    This file will handle our typical Bottle requests and responses 
    You should not have anything beyond basic page loads, handling forms and 
    maybe some simple program logic
'''

from bottle import route, get, hook, post, error, request, response, HTTPError
import model

unauthorized_error = HTTPError(401, 'Unauthorised')


def requires_auth(func):
    def decorator(*a, **ka):
        if 'logged_in' not in request.session:
            return unauthorized_error
        elif not request.session['logged_in']:
            return unauthorized_error
        else:
            return func(*a, **ka)

    return decorator


# -----------------------------------------------------------------------------

# Register and save details
@post('/register')
def register():
    username = request.forms.get('username')
    password = request.forms.get('password')
    session = request.session

    pk = request.forms.get('pk')
    pkSign = request.forms.get('pkSign')

    res = model.register_save(username, password, pk, pkSign)

    if res['success']:
        session['username'] = username
        session['logged_in'] = True
        session['admin'] = False
        response.set_cookie("username", username)
        response.set_cookie("logged_in", "true")
        response.set_cookie("admin", "false")

    return res


# -----------------------------------------------------------------------------

# Attempt the login
@post('/login')
def post_login():
    '''
        post_login
        
        Handles login attempts
        Expects a form containing 'username' and 'password' fields
    '''

    # Handle the form processing
    username = request.forms.get('username')
    password = request.forms.get('password')
    session = request.session

    # Call the appropriate method
    res = model.login_check(username, password)
    res_admin = model.admin_check(username)
    if res['success']:
        session['username'] = username
        session['logged_in'] = True

        response.set_cookie("username", username)
        response.set_cookie("logged_in", "true")

        if res_admin['success']:
            session['admin'] = True
            response.set_cookie("admin", "true")
        else:
            session['admin'] = False
            response.set_cookie("admin", "false")

        return res


@get('/logout')
def logout():
    request.session.delete()
    response.delete_cookie('username')
    response.delete_cookie('logged_in')
    return ""


# -----------------------------------------------------------------------------
@get('/getFriends')
@requires_auth
def get_friends_controller():
    username = request.session['username']
    friends = model.get_friends(username)
    return {"friends": friends}


@post('/sendMessage')
@requires_auth
def send_message():
    if 'logged_in' not in request.session:
        return error(unauthorized_error)

    username = request.session['username']
    receiver = request.forms.get('receiver')
    msg = request.forms.get('ct')
    msgTime = request.forms.get('msgTime')
    return model.send_message(username, receiver, msg, msgTime)


@get('/getStoredMessages')
@requires_auth
def get_stored_messages():
    '''
        gets list of stored messsages from db
    '''
    if not request.query.name:
        return "error"

    username, sender = request.session['username'], request.query.name
    return model.get_stored_messages(username, sender)


@get('/getLiveMessages')
@requires_auth
def get_live_messages():
    '''
        get the next live message
    '''
    username, sender = request.session['username'], request.query['sender']
    msg, msgTime = model.get_live_messages(username, sender)
    return {"message": msg, "msgTime": msgTime}


@get('/getFriendPk')
@requires_auth
def get_friend_pk():
    '''
        get friend's pk for encrypting
    '''
    receiver = request.query['receiver']
    pk = model.get_friend_pk(receiver)

    return {"publicKey": pk}


@get('/getFriendPkSign')
@requires_auth
def get_friend_pksign():
    '''
        get friend's pk for verifying
    '''
    receiver = request.query['receiver']
    pkSign = model.get_friend_pksign(receiver)

    return {"publicKeySign": pkSign}


@get('/getSymmKey')
@requires_auth
def get_friend_symmKey():
    '''
        get symmkey
    '''
    receiver = request.query['receiver']
    username = request.session['username']
    k = model.get_friend_symmkey(username, receiver)
    return {"key": k}


# -----------------------------------------------------------------------------

@hook('before_request')
def setup_session():
    request.session = request.environ['beaker.session']


@hook('after_request')
def allow_cors():
    response.set_header('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.add_header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
    response.add_header('Access-Control-Allow-Credentials', 'true')
    response.add_header('Access-Control-Allow-Headers', 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token')


# -----------------------------------------------------------------------------

# Help with debugging
@post('/debug/<cmd:path>')
def post_debug(cmd):
    return model.debug(cmd)


# -----------------------------------------------------------------------------

# add friend
@post('/addFriend')
@requires_auth
def add_friend():
    '''
        add_freidn

        User can input a name, then they are added as friends
    '''

    username = request.session['username']
    friend = request.forms.get('friend')
    key = request.forms.get('key')

    return model.add_friend(username, friend, key)


@get('/getPost')
@requires_auth
def get_post():
    id = request.query['id']
    return model.get_post(id)


@get('/getPostList')
@requires_auth
def get_post_list():
    posts = model.get_posts()
    return {
        "posts": posts
    }


@post('/addPost')
@requires_auth
def add_post():
    author = request.session['username']
    title = request.forms.get('title')
    body = request.forms.get('body')
    return model.add_post(author, title, body)


@post('/addComment')
@requires_auth
def add_comment():
    author = request.session['username']
    body = request.forms.get('body')
    postId = request.forms.get('postId')
    return model.add_comment(author, body, postId)


@post('/becomeAdmin')
@requires_auth
def become_admin():
    user = request.session['username']
    session = request.session
    session['admin'] = True
    response.set_cookie("admin", "true")
    return model.become_admin(user)


@get('/getUserList')
@requires_auth
def get_user_list():
    users = model.get_users()
    return {
        "users": users
    }

@get('/getUser')
@requires_auth
def get_user():
    id = request.query['id']
    return model.get_user(id)


@post('/updateUserMuted')
@requires_auth
def update_User_Muted():
    user = request.forms.get('userId')
    mute_status = request.forms.get('mute_status')
    return model.update_user_muted(user, mute_status)


@post('/deleteUser')
@requires_auth
def delete_User():
    print("posted")
    user = request.forms.get('userId')
    return model.delete_user(user)


@post('/deletePosts')
@requires_auth
def delete_posts():
    posts = request.forms.get('changeList')
    return model.delete_posts(posts)


@get('/getMutedStatus')
@requires_auth
def get_muted_status():
    user = request.session['username']
    muted = model.get_muted_status(user)
    return {
        "muted": muted
    }

