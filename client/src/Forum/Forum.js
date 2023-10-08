import { Component } from 'react';
import { ListGroup, Button, Form, InputGroup, FormControl, Modal } from 'react-bootstrap'
import {timestampToTimeString, get, post, getCookie} from '../Helpers'
import "./forum.css"
import {forEach} from "react-bootstrap/ElementChildren";

var [BLANK, ADD_POST, SHOW_POST] = [0, 1, 2];

class Forum extends Component {

    constructor(props) {
        super(props);
        this.state = {
            mainPanel: BLANK,
            activeIndex: -1, //-1 is a filler for no posts being active
            posts: [],
            displayedPosts: [],
            post: {},
            addPostFormValidated: false,
            changeList: [],
            muted: false,
            showDeletePostModal: false
        }
        this.isAdmin = getCookie('admin');

        this.getPosts();
        this.getMuted();
    }

    getMuted = async () => {
        let muted = await get("/getMutedStatus");
        console.log(muted["muted"])
        this.state.muted = muted["muted"];
        return muted["muted"];
    }

    getPosts = async () => {
        let { posts } = await get("/getPostList");
        this.setState({ posts });
        this.setState({ displayedPosts: posts });
        if(posts.length > 0) {
            this.getPost(posts[0][0]);
        }
        else {
            this.setState({ activeIndex: -1 });
            this.setState({ mainPanel: ADD_POST });
        }
    }

    getPost = async (id) => {
        let { post } = await get(`/getPost?id=${id}`);
        this.setState({ activeIndex: id, mainPanel: SHOW_POST, post: post });
    }

    filterPosts = (e) => {
        let text = e.target.value.toLowerCase();
        if (text === "" && (this.state.displayedPosts !== this.state.posts)) {
            this.setState({ displayedPosts: this.state.posts });
        }
        else {
            let filteredPosts = this.state.posts.filter((post) => {
                return post[1].toLowerCase().indexOf(text) > -1 
                || post[2].toLowerCase().indexOf(text) > -1
                || post[3].toLowerCase().indexOf(text) > -1;
            });
            this.setState({ displayedPosts: filteredPosts });
        }
    }

    addPost = async (e) => {
        const form = e.currentTarget;

        e.preventDefault();
        e.stopPropagation();
        
        if (form.checkValidity()) {
            let title = e.nativeEvent.target[0].value;
            let body = e.nativeEvent.target[1].value;

            let formData = new FormData();
            formData.append("title", title);
            formData.append("body", body);

            await post('/addPost', formData);
            await this.getPosts();
        }
        else {
            this.setState({ addPostFormValidated: true });
        }
    }

    closeModal = () => {
        this.setState({ showDeletePostModal: false });
    }

    openModal = () => {
        this.setState({ showDeletePostModal: true });
    }

    deletePosts = async () => {
        for (const e of this.state.changeList) {
            const form = new FormData();
            form.append("changeList", e);
            await post('/deletePosts', form);
        }
        await this.getPosts();
    }

    addComment = async (e) => {
        const form = e.currentTarget;
        e.preventDefault();
        e.stopPropagation();
        let comment = e.nativeEvent.target[0].value;
        
        if (comment !== "") {
            let formData = new FormData();
            formData.append("body", comment);
            formData.append("postId", this.state.activeIndex);
            await post('/addComment', formData);
            await this.getPost(this.state.activeIndex);
            form.reset();
        }

    }

    updateChangeList(id){

        if (this.state.changeList.includes(id)){
            const index = this.state.changeList.indexOf(id);
            if (index > -1) {
                this.state.changeList.splice(index, 1);
            }
        }
        else{
            this.state.changeList.push(id)
        }
        console.log( this.state.changeList)
    }

    renderMainPanel() {
        switch(this.state.mainPanel) {
            case ADD_POST:
                return (
                    <div className="post-main-panel-inner">
                        <div className="header">Add Post</div>
                        <div className="body">
                            <Form noValidate validated={this.state.addPostFormValidated} onSubmit={this.addPost}>
                                <Form.Group className="mb-3 form-row" controlId="postTitle">
                                    <Form.Label className="form-label">Title</Form.Label>
                                    <Form.Control className="form-input" type="text" required/>
                                    <Form.Control.Feedback type="invalid">Please enter a title.</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3 form-row" controlId="postContent">
                                    <Form.Control type="text" required as="textarea" placeholder="Enter post here" style={{ height: "200px", resize: "none"}}/>
                                    <Form.Control.Feedback type="invalid">Please enter a post.</Form.Control.Feedback>
                                </Form.Group>

                                {
                                this.state.muted === false ?

                                    <Button variant="primary" type="submit">
                                        Submit
                                    </Button> :
                                    <Button variant="primary" type="submit" disabled>
                                        Submit
                                    </Button>
                                }
                            </Form>
                        </div>
                    </div>
                );
            case SHOW_POST:
                return (
                    <div className="post-main-panel-inner">
                        <div className="header">
                            {this.state.post[1]}
                        </div>
                        <div className="body">
                            <div className="post-body">
                                <div className="author">
                                    {this.state.post[2]}
                                </div>
                                <div className="time">
                                    Posted on {timestampToTimeString(this.state.post[4])}
                                </div>
                                <div className="content">
                                    {this.state.post[3]}
                                </div>
                                <Form onSubmit={this.addComment}>
                                    <InputGroup className="mb-3">
                                        <FormControl placeholder="Add a comment" aria-label="Comment" aria-describedby="add-comment"/>

                                        {
                                            this.state.muted === false ?

                                                <Button variant="outline-dark" id="add-comment" type="submit">
                                                    Send
                                                </Button>
                                                :
                                                <Button variant="outline-dark" id="add-comment" type="submit" disabled>
                                                    Send
                                                </Button>
                                        }
                                    </InputGroup>
                                </Form>
                                {
                                    this.state.post[5].map((comment) => {
                                        return (
                                            <div className="comment-box">
                                                <div className="comment-author">{comment[2]} <span className="comment-time">{timestampToTimeString(comment[4])}</span></div>
                                                <div className="comment">{comment[3]}</div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div></div>
                )
                    
        }
    }

    render() {
        return (
            <div className="main-body p-0">
                <div className="inner-wrapper">
                    <div className="post-list-panel">
                        <div className="header">
                            <Button className="new-post-button" onClick={() => { this.setState({ mainPanel: ADD_POST, activeIndex: -1}) }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                            </svg>
                            &nbsp;Add Post
                            </Button>
                        </div>
                        <InputGroup className="search-bar">
                            <FormControl aria-label="Small" aria-describedby="inputGroup-sizing-md" placeholder="Search for post" onChange={this.filterPosts}/>
                        </InputGroup>
                        <ListGroup bsPrefix="post-list">
                            {
                                this.state.displayedPosts.map((post) => {
                                    return (
                                        <div>
                                        <ListGroup.Item key={post[0]} action bsPrefix="post-list-item" as="div" onClick={() => this.getPost(post[0])} active={this.state.activeIndex === post[0]}>
                                            <div className="post-list-item-header">{post[1]}</div>
                                            <div className="post-list-item-body">
                                                <div className="post-list-item-author">{post[2]}</div>
                                                <div className="post-list-item-time">{timestampToTimeString(post[4])}</div>
                                                {this.isAdmin === "true" ?
                                                <div className="form-check" >
                                                    <input className="form-check-input" type="checkbox" value={post[0]}
                                                           id={"check"+post[0]} onClick={()=>
                                                        this.updateChangeList(post[0])
                                                    }/>
                                                </div> : null
                                                }
                                            </div>

                                        </ListGroup.Item>

                                        </div>
                                    )
                                })
                            }
                        </ListGroup>
                        <Modal show={this.state.showDeletePostModal} onHide={this.closeModal}>
                            <Modal.Header closeButton>
                            <Modal.Title>Delete Posts</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>Are you sure you want to delete the selected posts?</Modal.Body>
                            <Modal.Footer>
                            <Button variant="secondary" onClick={this.closeModal}>
                                Close
                            </Button>
                            <Button variant="danger" onClick={async () => {
                                this.closeModal();
                                await this.deletePosts();
                            }}>
                                Delete
                            </Button>
                            </Modal.Footer>
                        </Modal>
                        <div className="delete-button" style={{ display: this.isAdmin ? "block": "none" }}>
                            <Button variant="danger" onClick={this.openModal}>
                                Delete selected posts
                            </Button>
                        </div>

                    </div>

                    <div className="post-main-panel">
                        { this.state.activeIndex || this.state.mainPanel || true ? this.renderMainPanel() : "" }
                    </div>
                </div>
            </div>
        )
    }
    
}

export default Forum;