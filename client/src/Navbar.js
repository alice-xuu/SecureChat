import { Navbar, Container, Nav, Button, NavDropdown } from 'react-bootstrap'
import { getCookie }  from './Helpers';

function ANavBar() {
    let isLoggedIn = getCookie('logged_in');
    let isAdmin = getCookie('admin');


    async function logout() {
        await fetch('/logout');
        window.location.href = "/";
    }

    return (
        <Navbar bg="dark" variant="dark">
            <Container>
                <Navbar.Brand>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-chat-left-heart me-2" viewBox="0 0 16 16">
                    <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12ZM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2Z"/>
                    <path d="M8 3.993c1.664-1.711 5.825 1.283 0 5.132-5.825-3.85-1.664-6.843 0-5.132Z"/>
                </svg>
                Student Central
                </Navbar.Brand>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/">Home</Nav.Link>
                        <Nav.Link href="/about">About</Nav.Link>
                        { isLoggedIn ? 
                            <Nav.Link href="/friends">Chat</Nav.Link> : null
                        }
                        { isLoggedIn ? 
                            <Nav.Link href="/forum">Q&amp;A Forum</Nav.Link> : null
                        }
                        { isLoggedIn === 'true' && isAdmin === 'true' ?
                            <NavDropdown title="Admin" variant="dark" id="basic-nav-dropdown">
                                <NavDropdown.Item href="/admin">Mute/Delete User</NavDropdown.Item>
                                <NavDropdown.Item href="/forum">Delete Post</NavDropdown.Item>
                            </NavDropdown>
                             : null
                        }
                    </Nav>
                    <Nav>
                        { isLoggedIn ? 
                            <Button variant="outline-light" href="/logout" onClick={logout}>Logout</Button> :
                            <div>
                                <Button variant="outline-light" className="me-2" href="/register">Register</Button>
                                <Button variant="outline-light" href="/login">Login</Button>
                            </div>
                        }
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default ANavBar;