import ANavBar from './Navbar'
import Home from './Home'
import About from './About'
import Friends from './Friends'
import Chat from './Chat'
import Register from './Register'
import Login from './Login'
import Error from './Error'
import Forum from './Forum/Forum'
import Admin from './Admin/Admin';

import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Container, Navbar } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { getCookie } from './Helpers'


function App() {
  const isLoggedIn = getCookie('logged_in');
  const isAdmin = getCookie('admin');

  return (
    <Router>
      <ANavBar />
      <Container>
        <Routes>
          <Route exact path='/' element={<Home/>}/>
          <Route exact path='/home' element={<Home/>}/>
          <Route exact path='/about' element={<About/>}/>
          <Route exact path='/friends' element={ isLoggedIn ? <Friends/> : <Navigate to="/login"/>}/>
          <Route path='/chat' element={ isLoggedIn ? <Chat/> : <Navigate to="/login"/>}/>
          <Route path='/forum' element={ isLoggedIn ? <Forum/> : <Navigate to="/login"/>}/>
          <Route path='/admin' element={ isLoggedIn === 'true' && isAdmin === 'true' ? <Admin/> : <Navigate to="/login"/>}/>
          <Route exact path='/register' element={<Register/>}/>
          <Route exact path='/login' element={<Login/>}/>
          <Route exact path='*' element={<Error/>}/>
        </Routes>
      </Container>
      <Navbar bg="dark" variant="dark" fixed="bottom"></Navbar>
    </Router>
  );
}

export default App;

// <li id="home"><a class="active" href="/home">Home</a></li>
// <li id="signup" class="hidden"><a href="/signup">Signup</a></li>
// <li id="login" class="hidden"><a href="/login">Login</a></li>
// <li id="friends" class="hidden" style="display: none"><a href="/friends">Friends</a></li>
// <li id="about"><a href="/about">About</a></li>
// <li id="logout" class="hidden" style="float:right"><a href="/logout">Logout</a></li>