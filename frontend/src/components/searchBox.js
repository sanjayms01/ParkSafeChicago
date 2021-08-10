import React from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';
import { FaMapMarkerAlt } from 'react-icons/fa';
import scriptLoader from 'react-async-script-loader';

class SearchBox extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        const { isScriptLoaded, isScriptLoadSucceed } = this.props
        let {user_address} = this.props;
        let {handleTextChange, handleSelect} = this.props;

        if (isScriptLoaded && isScriptLoadSucceed) {
            return (
                <PlacesAutocomplete
                    value={user_address}
                    onChange={handleTextChange}
                    onSelect={handleSelect}
                >
                    {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                    <div>
                        <input
                        {...getInputProps({
                            placeholder: 'Enter Address ...',
                            className: 'location-search-input',
                        })}
                        style={{width: '100%'}}
                        />
                        <div className="autocomplete-dropdown-container">
                        {loading && <div>Loading...</div>}
                        {suggestions.map(suggestion => {
                            const className = suggestion.active
                            ? 'suggestion-item--active'
                            : 'suggestion-item';
                            // inline style for demonstration purpose
                            const style = suggestion.active
                            ? { backgroundColor: '#77B9C9', cursor: 'pointer' }
                            : { backgroundColor: '#ffffff', cursor: 'pointer' };
                            return (
                            <div key={`div:` + suggestion.placeId}
                                {...getSuggestionItemProps(suggestion, {
                                className,
                                style,
                                })}
                            >
                                <span key={`item:` + suggestion.placeId}><FaMapMarkerAlt/> {suggestion.description}</span>
                            </div>
                            );
                        })}
                        </div>
                    </div>
                    )}
                </PlacesAutocomplete>
                );
        } else {
            return <div></div>;
        }
    }
}


// IN THE BELOW SCRIPT LOADER YOU MUST SPECIFIY YOUR --> GOOGLE MAPS API PUBLIC KEY STRING
export default scriptLoader([`https://maps.googleapis.com/maps/api/js?key=${SPECIFY_HERE_GOOGLE_MAPS_API_PUBLIC_KEY_STRING}&libraries=places`])(SearchBox);
