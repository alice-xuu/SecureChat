import image from './header.jpg';
import {getCookie, post} from "./Helpers";
import {Button, Nav} from "react-bootstrap";

function Home() {
    let isLoggedIn = getCookie('logged_in');
    let isAdmin = getCookie('admin');
    console.log("admin" + isAdmin + "logged" + isLoggedIn)
    if (isLoggedIn == null || isLoggedIn === ""){
        isLoggedIn = false;
    }
    console.log("admin" + isAdmin + "logged" + isLoggedIn)

    return (

        <div className="row pt-5 text-center align-items-center">
            <div className="col-sm-12 my-auto">
                <h2>Simple Student Templating Solutions</h2>
                    <h3><i>Because the usability is more important than the back end for now.</i></h3>
                    <p>
                    <img src={image} alt="Some stuff that popped out of tensor flow" height={200}/>
                    </p>

                    <p/>
                    <p style={{color:'#FF0000'}}>Try our new <u>Student Website Template</u> Today!</p>
                {

                    isAdmin === 'false' && isLoggedIn === 'true' &&
                    < Button className="become-admin-button" onClick={async () => {
                        const response = await fetch('/becomeAdmin', {
                            method: "POST"
                        });
                        window.location.reload(false)
                    }}>
                        Become Admin
                    </Button>
                }
            </div>
        </div>
    );
}

export default Home;