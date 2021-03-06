/* Loading.js
 * Loading component for our app
 * Dependencies: react, prop-types modules, components, services, classes
 * Author: Joshua Carter
 * Created: March 3, 2021
 */
"use strict";
//import modules
import React from 'react';
import PropTypes from 'prop-types';

//create our Loading component
function Loading (props) {
    return (
        <div className="loading">
            Loading...
        </div>
    );
};
//define props
Loading.propTypes = {
    
};

//export Loading component
export { Loading };
