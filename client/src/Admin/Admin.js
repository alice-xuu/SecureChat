import {Component} from "react";
import {get} from "../Helpers";
import {Button, Container, ListGroup} from "react-bootstrap";
import "./admin.css"

class Admin extends Component {

    constructor(props) {
        super(props);
        this.state = {
            users: [],
            activeIndex: -1,
            user: {}
        }
        this.getUsers();
    }

    getUsers = async () => {
        let { users } = await get("/getUserList");
        this.setState({ users });
        if(users.length > 0) {
            this.getUser(users[0][0]);
        }
        else {
            this.setState({activeIndex: -1});
        }
    }

    getUser = async (id) => {
        let { user } = await get(`/getUser?id=${id}`);
        this.setState({ activeIndex: id, user: user });
    }

    render() {
        return (
            <div className="main-body p-0">
                <div className="inner-wrapper">
                    <div className="user-list-panel">
                        <h5 className="header">User List</h5>
                        <ListGroup bsPrefix="user-list">
                            {
                                this.state.users.map((user) => {
                                    return (

                                        <ListGroup.Item key={user[0]} action bsPrefix="user-list-item" as="div" onClick={() => this.getUser(user[0])} active={this.state.activeIndex === user[0]}>
                                            <div className="user-list-item-single-line">
                                                {user[1]}
                                                <div>
                                                    {user[2]===1 ? 
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" fill="currentColor" class="bi bi-volume-mute-fill" viewBox="5 0 5 15">
                                                            <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zm7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z"/>
                                                        </svg> : 
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" fill="currentColor" class="bi bi-volume-up-fill" viewBox="5 0 5 15">
                                                            <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
                                                            <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
                                                            <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>
                                                        </svg>
                                                    }
                                                </div>
                                            </div>
                                        </ListGroup.Item>
                                    )
                                })
                            }
                        </ListGroup>
                    </div>

                    <div className="button-panel">
                        <div className="button-panel-inner">
                        <div className="header">
                            <h5>Actions</h5>
                        </div>

                        < Button onClick={async () => {
                            const form = new FormData();
                            form.append("userId", this.state.user[0]);
                            form.append("mute_status", 1);
                            const response = await fetch('/updateUserMuted', {
                                method: "POST",
                                body: form
                            });
                            window.location.reload(false)
                        }}>
                            Mute user

                        </Button>
                        &nbsp;
                        < Button onClick={async () => {
                        const form = new FormData();
                        form.append("userId", this.state.user[0]);
                        form.append("mute_status", 0);
                        const response = await fetch('/updateUserMuted', {
                            method: "POST",
                            body: form
                        });
                        window.location.reload(false)
                    }}>
                        Unmute user
                        </Button>
                        &nbsp;
                        < Button onClick={async () => {
                        const form = new FormData();
                        form.append("userId", this.state.user[0]);
                        console.log(this.state.user[0])
                        const response = await fetch('/deleteUser', {
                            method: "POST",
                            body: form
                        });
                        window.location.reload(false)
                    }}>
                        Delete user
                    </Button>

                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Admin;
