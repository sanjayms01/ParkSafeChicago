import React from 'react';
import Button from 'react-bootstrap/Button';
import {geocodeByAddress, getLatLng} from 'react-places-autocomplete';
import UserMap from '../components/userMap';
import Loader from 'react-loader-spinner';
import AddressModal from '../components/addressModal';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

class UserAddress extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            user_address: "",
            coordinates: {
                lat: null,
                lng: null
            },
            radioValue:'custom',
            neighbors: [],
            isFetching: false,
            closest_car_theft: {},
            car_thefts_per_month: 0,
            chicago_bottom_left: [-87.953099, 41.630474],
            chicago_top_right: [-87.510900, 42.031590],
            vega_spec1: {},
            vega_spec2: {},
            selectedOption: null,
            showModal: false,
            validAddress: null
        };
    
        // Handling state changes
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleRadioValue = this.handleRadioValue.bind(this);
        this.getAddressNeighbors = this.getAddressNeighbors.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    componentDidMount() {
        this.handleShow();
        return true;
    }

    handleShow = () => {
        this.setState({showModal: true, user_address: "", radioValue: "custom", isFetching: false, selectedOption: null, validAddress: null});
    }

    handleClose = () => {
        let {lat, lng} = this.state.coordinates;
        if (this.isInChicago([lng, lat])) {
            this.setState({showModal: false, validAddress: true});
            this.getAddressNeighbors();
        } else {
            this.setState({showModal: true, userAddress: "", validAddress: false});
        }
    }
    
    handleTextChange = user_address => {
        this.setState({ user_address });
    }

    handleRadioValue = radioValue => {
        console.log(radioValue.target.value);
        this.setState({ radioValue: radioValue.target.value });
    }

    handleSelect = user_address => {
        if (typeof user_address === 'string' || user_address instanceof String) {
            console.log("Selected autocomplete: ", user_address);
            this.setState({ user_address });
        } else {
            this.setState({selectedOption: user_address});

            if (user_address) {
                user_address = user_address.value;
                console.log("Selected box: ", user_address);
                this.setState({ user_address});
            }
        }

        geocodeByAddress(user_address)
        .then(results => getLatLng(results[0]))
        .then(latLng => {
            console.log("Success", latLng);
            this.setState({ coordinates: latLng });
        })
        .catch(error => console.error("Error", error));
    }

    getAddressNeighbors = () => {
        let {lat, lng} = this.state.coordinates;

        this.setState({isFetching: true});
        console.log("Getting address neighbors");
        console.log("Latitude", lat);
        console.log("Longitude", lng);

        if (lat && lng) {
            let request = `http://127.0.0.1:5000/neighbors?latitude=${lat}&longitude=${lng}`;
            
            console.log("REQUEST", request);
            fetch(request, { 
                        headers : { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    }}).then(res => res.json()).then(data => {
                        if (data) {
                            console.log("DATA RESPONSE", data['time_stats']);
                            let {neighbors, barChart, line1DChart, closest_car_theft, car_thefts_per_month, fail} = data;

                            if (fail) {
                                this.setState({
                                    closest_car_theft: fail,
                                });
                            } else {
                                this.setState({
                                    neighbors,
                                    closest_car_theft,
                                    car_thefts_per_month,
                                    vega_spec1: JSON.parse(barChart),
                                    vega_spec2: JSON.parse(line1DChart), 
                                    isFetching: false
                                });
                                vegaEmbed('#barChart', this.state.vega_spec1).then(function(result) {
                                }).catch(console.error);
                                vegaEmbed('#line1dChart', this.state.vega_spec2).then(function(result) {
                                }).catch(console.error);
                            } 
                        }
            })
        }
    }

    isInChicago(user_point) {
        let { chicago_bottom_left, chicago_top_right} = this.state;

        if (user_point[0] > chicago_bottom_left[0] && user_point[0] < chicago_top_right[0] && user_point[1] > chicago_bottom_left[1] && user_point[1] < chicago_top_right[1]) {
            return true;
        }
        return false;
    }

    render() {        
        return (
            <div id='your_address' style={{display: 'flex', justifyContent: 'center', flexDirection: 'row', height: 720}}>
                {
                    this.state.showModal == false ? (
                        <div style={{display: 'flex', justifyContent: 'center', flexDirection: 'row', alignItems: 'center', width: '100%'}}>
                            {
                                this.state.isFetching ? (<Loader
                                    type="Grid"
                                    color="#4AA0B5"
                                    height={100}
                                    width={100}
                                    timeout={20000} //20 secs
                                />) : (
                                    <div style={{display: 'flex', flexDirection: 'row', height: '100%', width: '100%'}}>
                                        <div style={{display: 'flex', justifyContent: 'center', flexDirection: 'column', width: '50%', height: '100%'}}>
                                            <div style={{display: 'flex', justifyContent: 'center', flexDirection: 'column'}}>
                                                <h6 color='#606060' style={{textAlign: 'center'}}> 
                                                    <b>Address:</b> {this.state.user_address}   <Button variant="danger" style={{width: '5%'}} onClick={this.handleShow}>X</Button>
                                                </h6>
                                                <h6 color='#606060' style={{textAlign: 'center'}}> <b>Today's Date:</b> {new Date().toLocaleString('en-US', {timeZone: 'America/Chicago', timeZoneName: 'short'})}</h6>
                                                <div style={{display: 'flex', justifyContent: 'center'}}>
                                                    <UserMap {...this.state}/>
                                                </div>
                                                <p style={{textAlign: 'center'}}><i>Data shown from last 90 days</i></p>
                                            </div>
                                        </div>
                                        <div style={{display: 'flex', flexDirection: 'column', width: '50%', height: '100%'}}>
                                            <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly'}}>
                                                <div id='highlights' style={{width: '90%', display: 'flex', justifyContent: 'center'}}>
                                                    <Card style={{width: '75%'}}>
                                                        <CardContent>
                                                            <Typography color="textPrimary" align='center' variant='h5' gutterBottom>Highlights</Typography>
                                                            <Typography color="textSecondary"><b>Current Community:</b> {this.state.closest_car_theft['community']}</Typography>
                                                            <br />
                                                            <Typography color="textSecondary"><b>Most Recent Car Theft Near Your Location</b></Typography>
                                                            <ul>
                                                                <li><Typography color="textSecondary" variant='body1'>
                                                                    <b>Date:</b> {new Date(this.state.closest_car_theft['date']).toLocaleString('en-US', {timeZone: 'America/Chicago', timeZoneName: 'short'})}
                                                                </Typography></li>
                                                                <li><Typography color="textSecondary" variant="body1">
                                                                    <b>Distance:</b> {this.state.closest_car_theft['distance']} miles
                                                                </Typography></li>
                                                            </ul>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                                <div id="barChart" style={{width: '90%', display: 'flex', justifyContent: 'center'}} />
                                                <div id="line1dChart" style={{width: '90%', display: 'flex', justifyContent: 'center'}} />
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    ) : (<AddressModal 
                            {...this.state}
                            handleRadioValue = {this.handleRadioValue}
                            handleSelect = {this.handleSelect}
                            handleTextChange = {this.handleTextChange}
                            handleClose = {this.handleClose}
                    />)
                }
            </div>
        );
    }
}

/**
 * Export
 */
 export default UserAddress;