import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

export default class AboutUs extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            vega_spec : {},
            isFetching: true
        };
    }

    componentWillMount() {
        return true;
    }

    render() {
        return (
            <div id="about" style={{width: '100%', height: 700}}>
                <h2 style={{textAlign: 'center'}}>Where is a safe place to park my car?</h2>
                <div style={{width: '90%', marginLeft: '2%'}}>
                    <h4>Goal</h4>
                    <p>
                        Our goal is to create an interactive visualization that lets users (anyone who drives a car) analyze auto theft data around Chicago.
                        <ul>
                            <li>Following the mantra “Overview first, zoom & filter, then details on demand,” the visualization allows users to see auto thefts for the entire city of Chicago over time.</li>
                            <li>Users can zoom and filter on neighborhood(s) or year(s).</li>
                            <li>Finally, users can get detailed auto theft information on any specific address in the city.</li> 
                        </ul>
                    </p>
                    <h4>Audience</h4>
                    <p>Any driver comfortable with common interactive maps (e.g., Google maps) where maps and data are displayed simultaneously.</p>
                    <h4>Tasks</h4>
                    <p>
                        (1) A driver <b>discovers</b> how safe a neighborhood is to park in by seeing auto theft data for all neighborhoods in Chicago as well as any neighborhoods they select while interacting with the map and charts. The user can also explore features over different years.
                        <br /><br />
                        (2) A driver enters a <b>specific address</b> to identify location-specific trends and features in the surrounding local area of the address. A zoomed in map shows nearby auto theft locations and also visualizations on number of cars stolen per month for certain days/times. All this data allows the driver to decide whether they should park there or somewhere else.
                    </p>
                    <h4>Data</h4>
                    <p>
                        Our dataset contains reported crimes in the City of Chicago from 2001 to present (excluding the most recent seven days).
                        <br />
                        Data is extracted from the <a href="https://data.cityofchicago.org"><b>Chicago Police Department's CLEAR</b></a> (Citizen Law Enforcement Analysis and Reporting) system and is provided to us via <a href="https://console.cloud.google.com/marketplace/product/city-of-chicago-public-data/chicago-crime"><b>Google BigQuery</b></a>.
                    </p>
                </div>

                <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                    <Card style={{width: '75%', height: '90%', display: 'flex', justifyContent: 'center'}}>
                        <CardContent>
                            <Container style={{width: '100%'}}>
                                <h3 style={{textAlign: 'center', fontFamily: 'Avant Garde'}}>Meet the Team</h3><br />
                                <Row className='justify-content-md-center'>
                                    <Col md={3} style={{display: 'flex', justifyContent: 'center', flexDirection: 'column'}}>
                                        <a href="https://www.linkedin.com/in/sanjaysaravanan1">
                                            <Image src="../../images/Sanjay.jpeg" width='100%' height='100%' style={{display: 'flex', justifyContent: 'center'}} roundedCircle></Image>
                                        </a><br />
                                        <h5 style={{textAlign: 'center'}}>Sanjay Saravanan</h5>
                                    </Col>
                                    <Col md={3} style={{display: 'flex', justifyContent: 'center', flexDirection: 'column'}}>
                                        <a href="https://www.linkedin.com/in/harvinder-singh-654a4a7">
                                            <Image src="../../images/Harvi.jpg" width='100%' height='100%' style={{display: 'flex', justifyContent: 'center'}} roundedCircle></Image>
                                        </a><br />
                                        <h5 style={{textAlign: 'center'}}>Harvi Singh</h5>
                                    </Col>
                                    <Col md={3} style={{display: 'flex', justifyContent: 'center', flexDirection: 'column'}}>
                                        <a href="https://www.linkedin.com/in/ghtully">
                                            <Image src="../../images/Greg.jpg" width='100%' height='100%' style={{display: 'flex', justifyContent: 'center'}} roundedCircle></Image>
                                        </a><br />
                                        <h5 style={{textAlign: 'center'}}>Greg Tully</h5>
                                    </Col>
                                    <Col md={3} style={{display: 'flex', justifyContent: 'center', flexDirection: 'column'}}>
                                        <a href="https://www.linkedin.com/in/karthikrbabu">
                                            <Image src="../../images/Karthik.png" width='100%' height='100%' style={{display: 'flex', justifyContent: 'center'}} roundedCircle></Image>
                                        </a><br />
                                        <h5 style={{textAlign: 'center'}}>Karthik Rameshbabu</h5>
                                    </Col>
                                </Row>
                        </Container>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }
}

