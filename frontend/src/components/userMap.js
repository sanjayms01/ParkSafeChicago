import React, {useState, useEffect, useRef} from 'react';
import ReactMapGL, {Marker, Popup, LinearInterpolator, WebMercatorViewport,  Source, Layer, ScaleControl } from 'react-map-gl';
import bbox from '@turf/bbox';
import * as turf from "@turf/turf";

import {FaCar, FaMapMarkerAlt} from 'react-icons/fa';
import {round, isEmpty } from '../utils';

export default function UserMap(props) {

    //MAPBOX API
    let MAPBOX_TOKEN = '<MAPBOX_API_TOKEN>';
    let COMM_AREA_LABELS = 'mapbox://styles/karthikrbabu/ckrgpfa9d26lb19p3r141dkcw';
    let MAP_STYLE = COMM_AREA_LABELS; 

    //Defaults => Central Downtown Chicago
    const [viewport, setViewport] = useState({
        latitude: 41.834936,
        longitude: -87.688454,
        zoom: 9.75,
        width: '45vw',
        height: '42vw',
        bearing: 0,
        pitch: 0
    });

    //Set the selected park
    const [selectedPark, setSelectedPark] = useState(null);
    const mapRef = useRef(null);

    //Extract Props
    let {coordinates, neighbors, closest_car_theft} = props;
    let {lat, lng} = coordinates;
    console.log("%c UserMap Props:", "color:blue", props);


    // CIRCLES
    
    var center = [lng, lat];
    var options = { steps: 50, units: "miles", properties: {} };

    // LOCAL AREA CIRCLE
    var radius1 = 0.5;
    var circle1 = turf.circle(center, radius1, options);
    var line1 = turf.lineString(...circle1.geometry.coordinates);

    // LARGER AREA CIRCLE
    var radius2 = 2;
    var circle2 = turf.circle(center, radius2, options);
    var line2 = turf.lineString(...circle2.geometry.coordinates);

    //Escape key to close the Popup
    useEffect(() => {
        const listener = e => {
            if (e.key === "Escape") {
                setSelectedPark(null);
            }
        };
        window.addEventListener("keydown", listener);
        return () => {
            window.removeEventListener("keydown", listener);
        }
    }, []);


    const onClick = event => {
        const feature = event.features[0];
        if (feature) {
            // calculate the bounding box of the feature
            const [minLng, minLat, maxLng, maxLat] = bbox(feature);
            // construct a viewport instance from the current state
            const vp = new WebMercatorViewport(viewport);
            const {longitude, latitude, zoom} = vp.fitBounds(
                [
                    [minLng, minLat],
                    [maxLng, maxLat]
                ],
                {
                    padding: 0
                }
            );

            setViewport({
            ...viewport,
            longitude,
            latitude,
            zoom,
            transitionInterpolator: new LinearInterpolator({
                around: [event.offsetCenter.x, event.offsetCenter.y]
            }),
            transitionDuration: 750
            });
        }
    };

    //Top 15 Closest 
    // let top15 = neighbors.slice(0, 30);

    //Neighborhood Markers
    const markers = neighbors.map(
        (theft, i) => (
        <Marker key={theft.unique_key} longitude={theft.longitude} latitude={theft.latitude} >
            
            {(theft.unique_key == closest_car_theft.unique_key) ? 
                (
                    <FaCar key={theft.unique_key+i} size={15} color='red' onClick={(e) => {
                        e.preventDefault();
                        setSelectedPark(theft);
                    }}/>
                )
                : (
                    <FaCar key={theft.unique_key+i} size={15} color='purple' onClick={(e) => {
                        e.preventDefault();
                        setSelectedPark(theft);
                    }}/>
                )
            }

        </Marker>
        )
    );

    //Add User Address to markers
    if (lat && lng) {
        markers.push(

            <Marker latitude={lat} longitude={lng} offsetLeft={-20} offsetTop={-10}>
                <FaMapMarkerAlt size={30} color='blue' onClick={(e) => {
                    e.preventDefault();
                    setSelectedPark()
                }}/>
            </Marker>
        );
    }

    return (
        <div>
            <ReactMapGL {...viewport} 
                mapboxApiAccessToken={MAPBOX_TOKEN}
                mapStyle={MAP_STYLE}
                ref={mapRef}
                onViewportChange={(viewport) => {
                    setViewport(viewport)
                }}
                onClick={onClick}
            >
                <div style={{ position: "absolute", bottom: 100, left: 100 }}>
                    <ScaleControl maxWidth={100} unit={"imperial"} />
                </div>
                <Source id="my-data1" type="geojson" data={circle1}>
                    <Layer
                        id="point-90-hi"
                        type="fill"
                        paint={{
                        "fill-color": "#088",
                        "fill-opacity": 0.2,
                        }}
                    />
                </Source>

                <Source id="my-ata1" type="geojson" data={line1}>
                    <Layer
                        id="point-9-hi"
                        type="line"
                        paint={{
                        "line-color": "salmon",
                        "line-width": 2
                        }}
                    />
                </Source>

                <Source id="my-data2" type="geojson" data={circle2}>
                    <Layer
                        id="point-80-hi"
                    />
                </Source>
                <Source id="my-ata2" type="geojson" data={line2}>
                    <Layer
                        id="point-8-hi"
                        type="line"
                        paint={{
                        "line-color": "black",
                        "line-width": 2
                        }}
                    />
                </Source>

                {!isEmpty(markers) ? markers: null}
                {selectedPark ? (
                    <Popup 
                        latitude={selectedPark.latitude} 
                        longitude={selectedPark.longitude}
                        onClose={ () => {setSelectedPark(null)}
                        }
                    >
                        <div>
                            <h3>{selectedPark.block}</h3>
                            <p>
                                Date: {new Date(selectedPark.date).toLocaleString('en-US', {timeZone: 'America/Chicago', timeZoneName: 'short'})}
                                <br/>
                                Desc: {selectedPark.description}
                                <br/>
                                Distance to <FaMapMarkerAlt color='blue' /> {round(selectedPark.distance_miles)}mi
                                <br/>
                                Community: {selectedPark.community}
                            </p>
                        </div>
                    </Popup>
                ): null}
            </ReactMapGL>
        </div>
    );
}

