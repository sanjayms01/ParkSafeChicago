import React, { Component } from 'react'
import { Nav, Navbar } from 'react-bootstrap';
import GitHubIcon from '@material-ui/icons/GitHub';
import SlideshowIcon from '@material-ui/icons/Slideshow';
import YouTubeIcon from '@material-ui/icons/YouTube';


export default class Title extends Component {
    render() {
        return (
            <>
                <div id="title">
                        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                            <Navbar.Brand style={{fontSize: "150%", fontFamily: "Californian FB"}}>Park Safe Chicago</Navbar.Brand>
                            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                            <Navbar.Collapse id="responsive-navbar-nav">
                                <Nav className="me-auto" style={{width: '80%'}}>
                                    <Nav.Link href="/overview">Overview</Nav.Link>
                                    <Nav.Link href="/address">Search Address</Nav.Link>
                                    <Nav.Link href="/about">About Us</Nav.Link>
                                </Nav>
                                <Nav className="me-auto justify-content-end" style={{width: '20%'}}>
                                    <Nav.Link href="https://github.com/sanjayms01/ParkSafeChicago" target='_blank'><GitHubIcon /></Nav.Link>
                                    <Nav.Link href="https://docs.google.com/presentation/d/1cgpw0gfGpx5mOGu8J_wFnqnJAYnlOMAxpi4Xqynwptk/edit?usp=sharing" target='_blank'><SlideshowIcon /></Nav.Link>
                                    <Nav.Link href="https://www.youtube.com/watch?v=bVO0LygUY7M" target='_blank'><YouTubeIcon /></Nav.Link>
                                </Nav>
                            </Navbar.Collapse>
                        </Navbar>
                </div>
            </>
        )
    }
}

