import React, { Component } from 'react'
import Loader from "react-loader-spinner";
import Radio from '@material-ui/core/Radio';
import {isEmpty } from '../utils';
import { RadioGroup, FormControlLabel, FormControl, Tooltip } from '@material-ui/core';
import HelpIcon from '@material-ui/icons/Help';

export default class Overview extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            vega_spec : {},
            comm_spec: {},
            zip_spec: {},
            isFetching: true,
            radio_value: 'community'
        };
        
        this.getDashboard = this.getDashboard.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentWillMount() {
        this.getDashboard();
        return true;
    }

    handleChange = (radio_value) => {
        console.log("Unit Selected:", radio_value.target.value);

        if (isEmpty(this.state.comm_spec) || isEmpty(this.state.zip_spec)) {
            console.log("HITTING HERE");
            this.setState({radio_value: radio_value.target.value, isFetching: true}, this.getDashboard);
        } else {
            if (radio_value.target.value == 'community') {
                console.log("Unit Selected:", this.state.comm_spec);
                this.setState({radio_value: radio_value.target.value});

                vegaEmbed('#dashboard', this.state.comm_spec).then(function(result) {
                }).catch(console.error);
                
            } else {
                console.log("Unit Selected:", this.state.zip_spec);
                this.setState({radio_value: radio_value.target.value});

                vegaEmbed('#dashboard', this.state.zip_spec).then(function(result) {
                }).catch(console.error);
                
            }
        }
    }

    getDashboard = () => {
        let {radio_value} = this.state;
        console.log("Fetching Overview Dashboard");
        console.log("Unit:", radio_value);
        let request = `http://127.0.0.1:5000/overview?unit=${radio_value}`;
        console.log("REQUEST", request);
        fetch(request, { 
                    headers : { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }}).then(res => res.json()).then(data => {
                    if (data) {

                        if (radio_value == 'community') {
                            // this.setState({comm_spec: JSON.parse(data['chart']), isFetching: false});
                            this.setState({comm_spec: data['chart'], isFetching: false});
                            vegaEmbed('#dashboard', this.state.comm_spec).then(function(result) {
                            }).catch(console.error);
                        } else {
                            // this.setState({zip_spec: JSON.parse(data['chart']), isFetching: false});
                            this.setState({zip_spec: data['chart'], isFetching: false});
                            vegaEmbed('#dashboard', this.state.zip_spec).then(function(result) {
                            }).catch(console.error);
                        }
                    }
        })
    }


    render() {
        const toolTipInstructions = "Use shift + mouse click to make multiple selections. Click anywhere to unselect.";

        return (
            <>
                <div style={{display: 'flex', justifyContent: 'center', flexDirection: 'column'}}>
                    <FormControl component="fieldset">
                        <RadioGroup row aria-label="unit" name="unit" value={this.state.radio_value} style={{justifyContent: 'center'}} onChange={this.handleChange}>
                            <FormControlLabel value="community" control={<Radio />} label="Community" />
                            <FormControlLabel value="zipcode" control={<Radio />} label="Zipcode" />
                        </RadioGroup>
                    </FormControl>
                    <div id="overview" style={{height: 700, marginTop: '-1%'}} >
                        <div id="top_slot" style={{display: 'flex', justifyContent: 'center'}}> 
                            {
                                this.state.isFetching ? (<Loader
                                    type="ThreeDots"
                                    color="#4AA0B5"
                                    height={100}
                                    width={100}
                                    timeout={20000} //20 secs
                                />) : (
                                    <div style={{display: 'flex', flexDirection: 'row', height: '100%'}}>
                                        <div id="dashboard" />
                                        <div style={{marginLeft: 5}}>
                                            <Tooltip title={toolTipInstructions}>
                                                <HelpIcon />
                                            </Tooltip>
                                        </div>
                                    </div>
                                    )
                            }
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

