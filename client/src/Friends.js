import { useEffect, useState } from 'react';
import {Table, Form, Button, Container, Col, Row} from 'react-bootstrap';
import * as encryption from './encryption';
import { getCookie, post, get } from './Helpers';
import Chat from "./Chat";

function Friends() {
    const [isLoading, setIsLoading] = useState(true);
    const [friends, setFriends] = useState([]);
    const username = getCookie('username');

    async function getFriends() {
        let response = await fetch('/getFriends');
        let data = await response.json();
        setIsLoading(false);
        setFriends(data.friends);
    }

    async function addFriend(e) {
        e.preventDefault();
        e.stopPropagation();

        let friend = e.nativeEvent.target[0].value;
        if(friend === "") {
            return;
        }

        const storageKeyName = username+friend+'sk';
        let symmKey = localStorage.getItem(storageKeyName);
        if(symmKey)
            return;
        symmKey = await encryption.generateAESKey();
        symmKey = await encryption.exportKey(symmKey);
        symmKey = JSON.stringify(symmKey);

        let data = await get(`/getFriendPk?receiver=${friend}`);
        const friendPk = await encryption.importPublicKey(data.publicKey);
        const msgObj = new encryption.PlaintextMessage(symmKey);
        const encSymmKey = await msgObj.encrypt(friendPk);

        let formData = new FormData();
        formData.append('friend', friend);
        formData.append('key', encSymmKey);
        await post('/addFriend', formData);
        localStorage.setItem(storageKeyName, symmKey);
        await getFriends();
    }

    function friendsTable() {
        const table = friends.map(friend => {
            const href = { href: `/chat?name=${friend}`};
            return (
                <tr>
                    <td>{friend}</td>
                    <td><a {...href}>Chat</a></td>
                </tr>
            )
        });
        return (
            <tbody>
                {table}
            </tbody>
        )
    }

    useEffect(() => {
        getFriends()
    }, []);

    return (

        <div className="d-flex justify-content-center mt-5">
            <div style={{width: '100%'}}>

                <h3>Friends List</h3>
                {
                    isLoading || friends.length === 0 ? 'There are currently no friends.':
                    <Table striped bordered hover>


                        <thead>
                            <tr>
                                <th>Username</th>
                                <th></th>
                            </tr>
                        </thead>
                        {friendsTable()}
                    </Table>
                }

                <Form onSubmit={addFriend}>
                    <Form.Group className="row form-group mt-2">
                        <div className="col-sm-8">
                            <Form.Control type="text" placeholder="Username"/>
                        </div>
                        <Button className="col-sm-3" variant="outline-dark" type="submit">
                            Add Friend
                        </Button>
                    </Form.Group>
                </Form>

            </div>
        </div>

    );
}

export default Friends;