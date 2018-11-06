console.log('Client-side code running');

// 'started' will be true if the timer is still running, and false if it has been stopped
var started = false;

// 'table' will hold the table element
var table;
// generate the table element with headers, and initialize webstorage data
generateTable();

const startButton = document.getElementById('start-stop');
startButton.addEventListener('click', startStopHandler);

const resetButton = document.getElementById('reset');
resetButton.addEventListener('click', resetHandler);

var timerLabel = document.getElementsByTagName('h2')[0];
var seconds = 0, minutes = 0, hours = 0, t;

function resetHandler() {
    /*
        Called when reset button is clicked.
    */
    console.log("reset button clicked");
    // remove the table element, and re-generate it
    removeTable();
    generateTable();
    // set timer values back to 0
    timerLabel.textContent = "00:00:00";
    seconds = 0; minutes = 0; hours = 0;
}

function startStopHandler() {
    /*
        Called when the start/stop button is clicked
    */
    console.log('start-stop button clicked');

    if(this.value == "Start") {
        this.value = "Stop";
        startTimer();
    } else {
        this.value = "Start";
        stopTimer();
    }
}

function startTimer() {
    timerLabel.textContent = "00:00:00";
    seconds = 0; minutes = 0; hours = 0;
    started = true;
    timer();
    // get the starting time
    captureTime();
    // get the starting location
    getLocation();
}

function stopTimer() {
    started = false;
    clearTimeout(t);
    // get the ending time
    captureTime();
    // get the ending location
    getLocation();
}

//---------------------- Time & Location Capture Functions ----------------------//
function captureTime() {
    // get the current time
    var time = new Date();
    // populate webstorage
    addTimeData(time);
}

function addTimeData(time) {
    var data = JSON.parse(window.localStorage.getItem('data'));
    if (started) {
        // add a new array to our 2d 'data' array
        // we initialize all 5 values so that the rest of the data can be inserted asynchronously into proper index
        var row = [time, "", "", "", ""];
        data.push(row);
    } else {
        // create new Date object from date string stored in 'data'
        var startTime = new Date(data[data.length-1][0]);
        // standerdize the dates, to accomodate for changing timezones
        var shiftedStartTime = shiftDateToUTC(startTime);
        var shiftedEndTime = shiftDateToUTC(time);
        var elapsedTime = shiftedEndTime.getTime() - shiftedStartTime.getTime(); 
        // place values into correct indices (as they would show up in the table)
        data[data.length-1][2] = time;
        data[data.length-1][4] = elapsedTime/1000;
    }
    // only strings in webstorage, so convert 'data' to string
    var dataString = JSON.stringify(data);
    window.localStorage.setItem('data', dataString);
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(addLocationData);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function addLocationData(position) {
    var data = JSON.parse(window.localStorage.getItem('data'));
    // convert position to lat,long formatted string
    var locationString = String(position.coords.latitude).concat(",", String(position.coords.longitude));
    // place the retreived location in correct index (1 for start location, and 3 for end location)
    if (started) {
        data[data.length-1][1] = locationString;
    } else {
        data[data.length-1][3] = locationString;
    }
    var dataString = JSON.stringify(data);
    window.localStorage.setItem('data', dataString);
    // add row once all data is collected
    if (!started)addRowToTable();
}
//-------------------------------------------------------------------------------------//


//---------------------- Table Creation & Manipulation Functions ----------------------//
function generateTable() {
    table = document.createElement("TABLE");
    table.setAttribute('id', "dataTable");
    table.border = "1";

    var headers = ["Start time", "Start lat, long", "End time", "End lat, long", "Elapsed time"];
    var columnCount = headers.length;
    //Add the header row.
    var row = table.insertRow(-1);
    for (var i = 0; i < columnCount; i++) {
        var headerCell = document.createElement("TH");
        headerCell.innerHTML = headers[i];
        row.appendChild(headerCell);
    }
    var dvTable = document.getElementById("dvTable");
    dvTable.innerHTML = "";
    dvTable.appendChild(table);

    // initialzie data structure to be a 2d array, with each 'row' mapping to a row in the table
    var data = [];
    var dataString = JSON.stringify(data);
    window.localStorage.setItem('data', dataString);
}

function addRowToTable() {
    /*
        This function adds a row to table and populates with data retreived from webstorage 
    */
    var data = JSON.parse(window.localStorage.getItem('data'));
    var row = table.insertRow(-1);
    for (var j = 0; j < 5; j++) {
        var cell = row.insertCell(-1);
        cell.innerHTML = data[data.length-1][j];
    }
}

function removeTable() {
    var parent = document.getElementById("dvTable");
    parent.removeChild(table);  
}
//-------------------------------------------------------------//


//---------------------- Timer Functions ----------------------//
function add() {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }
    }
    timerLabel.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
    timer();
}

function timer() {
    t = setTimeout(add, 1000);
}

function shiftDateToUTC(date){
    return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
}
//-------------------------------------------------------------//