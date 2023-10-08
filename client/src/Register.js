import { Form, Button } from 'react-bootstrap'
import { useState } from 'react'
import * as encryption from './encryption'

export default function Register() {
    
    const [validated, setValidated] = useState(false);
    const [invalidUserPass, setInvalidUserPass] = useState(false);

    function handleSubmit(e) {
        const form = e.currentTarget;
        e.preventDefault();
        e.stopPropagation();
        
        if (form.checkValidity()) {
            let username = e.nativeEvent.target[0].value;
            let password = e.nativeEvent.target[1].value;

            handleAsyncMethods(username, password);
        }
        else {
            setValidated(true);
        }
        
    }

    async function handleAsyncMethods(username, password){
        var keys = await encryption.generateRSA();
        let privateKey = await encryption.exportKey(keys.privateKey);
        let publicKey = await encryption.exportKey(keys.publicKey);
    
        var keysSign = await encryption.generateRSASign();
        let privateKeySign = await encryption.exportKey(keysSign.privateKey);
        let publicKeySign = await encryption.exportKey(keysSign.publicKey);
    
        let formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);
        formData.append("pk", JSON.stringify(publicKey));
        formData.append("pkSign", JSON.stringify(publicKeySign));
    
        localStorage.setItem(username, JSON.stringify(privateKey));
        localStorage.setItem(username + "sign", JSON.stringify(privateKeySign));
    
        const response = await fetch('/register', {
            method: "POST",
            body: formData
        });
    
        const data = await response.json();
        if(data.success){
            window.location.href = "/friends"
        }
        else{
            setInvalidUserPass(true);
        }
    
    }

    return (
        <div className="d-flex justify-content-center mt-5">
            <div className="border p-5" style={{width: "500px"}}>
                <h3>
                    Register
                </h3>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" placeholder="Enter username" required/>
                        <Form.Control.Feedback type="invalid">
                            Please enter a username.
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" required/>
                        <Form.Control.Feedback type="invalid">
                            Please enter a password.
                        </Form.Control.Feedback>
                        <div className="invalid-feedback" style={{ display: invalidUserPass ? "initial": "none"}}>
                            Username or password already taken.
                        </div>
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </div>
        </div>
    );
}