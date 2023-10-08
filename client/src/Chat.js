import { useEffect, useRef, useState } from 'react';
import {Button, Col, Container, Form, Row} from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getCookie, get, post } from './Helpers';
import * as encryption from './encryption';
import Friends from "./Friends";

function Chat() {
    const [chatMessages, setChatMessages] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const receiver = searchParams.get("name");
    const username = getCookie("username");
    const navigate = useNavigate();

    let symmKey = useRef('');
    let privateKey = useRef('');
    
    function formatText(name, plaintext, msgTime){
        let dateTime = new Date(msgTime);
        let timeStr = dateTime.toLocaleDateString() + " " + dateTime.toLocaleTimeString();
        return (
            <div ref={scrollBottomChat}>
                <b>{name}:</b>&nbsp;{plaintext}<br/><small style={{ "fontSize": "0.5em"}}>{timeStr}</small><br/>
            </div>
        )
    }

    function goBack(){
        setChatMessages([]);
        navigate(-1);
    }

    async function getKeys() {
        const localStorageKey = username+receiver+'sk';
        symmKey.current = localStorage.getItem(localStorageKey);
        if(!symmKey.current){
            privateKey.current = localStorage.getItem(username);
            privateKey.current = await encryption.importPrivateKey(privateKey.current);
            let data = await get(`/getSymmKey?receiver=${receiver}`);
            const symmKeyObj = new encryption.EncryptedMessage(data.key);
            symmKey.current = await symmKeyObj.decrypt(privateKey.current);
            localStorage.setItem(localStorageKey, symmKey.current);
            
        }
        symmKey.current = await encryption.importAESKey(symmKey.current);
    }

    async function getStoredMessages() {
        let data = await get(`/getStoredMessages?name=${receiver}`);

        for (let message of data.messages) {
            let encMsgObj = new encryption.EncryptedMessage(message[3]);
            let plainText = await encMsgObj.decrypt(symmKey.current);
            // 1: sender, 3: message, 4: timestamp
            await updateChat(message[1], plainText, message[4]);
        }
    }

    async function updateChat(name, message, msgTime){
        let text = formatText(name, message, msgTime);
        setChatMessages(prev => prev.concat([text]));
    }
    
    function scrollBottomChat(){
        let elem = document.getElementById('chatBox');
        elem.scrollTop = elem.scrollHeight;
    }

    async function getLiveMessages(){
        while(true){
            let encMsg = await get(`/getLiveMessages?sender=${receiver}`);
            let msgObj = new encryption.EncryptedMessage(encMsg.message);
            let msg = await msgObj.decrypt(symmKey.current);
            await updateChat(receiver, msg, parseInt(encMsg.msgTime));
        }
    }
    
    async function sendMessage(e) {
        e.preventDefault();
        let msg = e.nativeEvent.target[0].value;
        e.target.reset();
        if(!msg) return;
        
        const msgTime = Date.now()
        let msgObj = new encryption.PlaintextMessage(msg);
        const encMsg = await msgObj.encrypt(symmKey.current);

        const form = new FormData();
        form.append("ct", encMsg);
        form.append("receiver", receiver);
        form.append("msgTime", msgTime);

        await post("/sendMessage", form);
        await updateChat(username, msg, msgTime);

    }

    useEffect(() => {
        async function init() {
            await getKeys();
            await getStoredMessages();
            await getLiveMessages();
        } 
        init()
    }, []);

    return (
        <Container>
            <Row>
                <Col>
                    <Friends/>
                </Col>
                <Col>
        <div className="d-flex justify-content-center mt-5">
            <div style={{width: '100%'}}>
                <div className="row mb-3">
                    <div className="col-sm-8">
                        <h3>Chatting With {receiver}</h3>
                    </div>
                    <div className="col-sm-4">
                        <Button variant="outline-dark" style={{float: 'right'}} onClick={goBack}>Back</Button>
                    </div>
                </div>
                <div className="row">
                    <div className="p-3 border rounded" id="chatBox" style={{height: '300px', 'overflowY': 'scroll'}}>
                        {chatMessages.map(e => e)}
                    </div>
                </div>
                <div className="row">
                    <Form onSubmit={sendMessage}>
                        <Form.Group className="row form-group mt-2">
                            <div className="col-sm-8">
                                <Form.Control type="text" placeholder="Send Message"/>
                            </div>
                            <Button className="col-sm-4" variant="outline-dark" type="submit" style={{float: 'right'}}>
                                Send
                            </Button>
                        </Form.Group>
                    </Form>
                </div>
            </div>
        </div>
                </Col>
            </Row>

        </Container>
    );
}

export default Chat;