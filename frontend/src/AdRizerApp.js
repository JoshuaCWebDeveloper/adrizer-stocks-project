/* AdRizerApp.js
 * Main app component
 * Dependencies: react, prop-types modules, components, services, classes
 * Author: Joshua Carter
 * Created: March, 3, 2021
 */
"use strict";
//import modules
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { AutoComplete, DateRangePicker, Button } from 'rsuite';
import moment from 'moment-timezone';
import rsuiteClasses from 'rsuite/dist/styles/rsuite-default.min.css';
import agClasses from 'ag-grid-community/dist/styles/ag-grid.css';
import agThemeClasses from 'ag-grid-community/dist/styles/ag-theme-alpine.css';
//import components
import { Loading } from './Loading.js';

const pingApi = async function () {
    const url = `${window.ADRIZER_CONFIG.get("API_ROOT")}/ping`;
    const response = await fetch(url);
    return response.json();
};

const getSymbolList = async function (searchString) {
    const s = encodeURIComponent(searchString),
        url = `${window.ADRIZER_CONFIG.get("API_ROOT")}/stocks/search?searchString=${s}`;
    const response = await fetch(url);
    return response.json();
};

const getTimeSeries = async function (startString, endString, symbol) {
    const s = encodeURIComponent(symbol),
        parsedStart = moment(startString),
        parsedEnd = moment(endString),
        shiftedStart = moment(parsedStart).utc().add(parsedStart.utcOffset(), 'm'),
        shiftedEnd = moment(parsedEnd).utc().add(parsedEnd.utcOffset(), 'm'),
        start = encodeURIComponent(shiftedStart.toISOString()),
        end = encodeURIComponent(shiftedEnd.toISOString()),
        url = `${window.ADRIZER_CONFIG.get("API_ROOT")}/stocks/timeSeries?symbol=${s}&start=${start}&end=${end}`;
    const response = await fetch(url);
    return response.json();
};

//create our AdRizerApp component
function AdRizerApp (props) {
    var [symbolList, setSymbolList] = useState([]),
        [loading, setLoading] = useState(false),
        [data, setData] = useState([]),
        dateRange = useRef([]),
        symbol = useRef(""),
        acTimeout = useRef(null);
    
    function handleDateRangeChange ([start, end]) {
        dateRange.current = [start, end];
    }
    
    function handleSymbolChange (value) {
        // update stored value
        symbol.current = value;
        if (acTimeout.current) {
            return;
        }
        // update symbol list
        acTimeout.current = setTimeout(() => {
            acTimeout.current = null;
            getSymbolList(symbol.current).then(data => {
                if (data && Array.isArray(data)) {
                    setSymbolList(data.map(it => it.symbol));
                }
            });
        }, 1000);
    }
  
    function handleSymbolSelect (item) {
        // update stored value
        symbol.current = item;
    }
    
    function handleSubmit (e) {
        var [start, end] = dateRange.current;
        setLoading(true);
        // get data
        getTimeSeries(start, end, symbol.current).then(data => {
            setLoading(false);
            if (data && Array.isArray(data)) {
                setData(data);
            }
        });
    }
    
    return (
        <section id="stock-viewer">
            <h1>AdRizer Stocks Project</h1>
            
            <form>
                <DateRangePicker
                    appearance="subtle" onChange={handleDateRangeChange}
                />
                
                <AutoComplete
                    data={symbolList} onChange={handleSymbolChange} onSelect={handleSymbolSelect}
                />
                
                <Button appearance="primary" onClick={handleSubmit}>Submit</Button>
            </form>
            
            {
                loading ?
                
                    <Loading /> :

                    <AgGridReact rowData={data}>
                        <AgGridColumn headerName="Timestamp (UTC)" field="timestamp" />
                        <AgGridColumn headerName="Total Volume" field="totalVolume" />
                        <AgGridColumn headerName="Min. Price" field="low" />
                        <AgGridColumn headerName="Max. Price" field="high" />
                        <AgGridColumn headerName="Opening Price" field="open" />
                        <AgGridColumn headerName="Closing Price" field="close" />
                    </AgGridReact>
            }
        </section>
    );
};
//define props
AdRizerApp.propTypes = {
    
};

//export AdRizerApp component
export { AdRizerApp };
