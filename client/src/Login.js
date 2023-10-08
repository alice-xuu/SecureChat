import { Form, Button } from 'react-bootstrap'
import { useState } from 'react'

function Login() {
    
    const [validated, setValidated] = useState(false);
    const [invalidUserPass, setInvalidUserPass] = useState(false);

    async function handleSubmit(e) {
        const form = e.currentTarget;
        e.preventDefault();
        e.stopPropagation();
        
        if (form.checkValidity()) {
            let formData = new FormData();
            formData.append("username", e.nativeEvent.target[0].value);
            formData.append("password", e.nativeEvent.target[1].value);

            let response = await fetch('/login', {
                method: "POST",
                body: formData
            });

            let body = await response.json();
            if(body.success) {
                window.location.href = "/friends";
            }
            else {
                setInvalidUserPass(true);
            }
        }
        else {
            setInvalidUserPass(false);
            setValidated(true);
        }
    }

    return (
        <div className="d-flex justify-content-center mt-5">
            <div className="border p-5" style={{width: "500px"}}>
                <h3>
                    Login
                </h3>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formBasicUser">
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
                            Please enter a valid username or password.
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

// Login.prototype.handleSubmit = function(e) {
//     e.preventDefault();
//     console.log("heheh");
// }

export default Login;