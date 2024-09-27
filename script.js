var map;
var markers = [];
var markerClusterMap = new Map(); // To store location and count of markers
var myLocationMarker = null;
var myLocationCircle = null;

// Function to initialize the map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 21.1458, lng: 79.0882 },
        zoom: 13
    });

    addMarkers(locations, 'green'); // Initially add Survey-1 markers (locations)
    addMarkers(locations2, 'red');  // Initially add Survey-2 markers (locations2)

    map.addListener('dblclick', function (e) {
        setMyLocation(e.latLng);
    });

    // Add event listeners for category checkboxes
    document.querySelectorAll('input[name="category"]').forEach(input => {
        input.addEventListener('change', filterMarkers);
    });

    document.getElementById('survey-date').addEventListener('change', filterMarkers);

    // Show all markers when "Show All" is clicked
    document.getElementById('showAll').addEventListener('click', showAllMarkers);

    populateDateOptions(); // Populate the survey date dropdown
}

// Function to add markers to the map
function addMarkers(dataset, color) {
    dataset.forEach(function (location) {
        var latLngKey = `${location.latitude}_${location.longitude}`; // Key for each location

        // Check if there's already a marker at the same lat-lng
        if (markerClusterMap.has(latLngKey)) {
            var clusterInfo = markerClusterMap.get(latLngKey);
            clusterInfo.count += 1;  // Increment count for this location
            updateMarker(clusterInfo.marker, clusterInfo.count); // Update marker label with count
        } else {
            var marker = new google.maps.Marker({
                position: { lat: location.latitude, lng: location.longitude },
                map: map,
                title: location.fileNumber.toString(),
                icon: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
                // label: { text: 'Count-1', color: 'black', fontWeight: 'bold' } // Default count
            });

            var infoWindow = new google.maps.InfoWindow({
                content: `
                    <div style="width: 250px;">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRbcrj53mGyk-u4JwrIb6z1RBAeCpxR78gfQ&s" 
                            alt="Image" style="width: 100%; height: auto;">
                        <p><strong>File Number:</strong> ${location.fileNumber}</p>
                        <p><strong>Date of Survey:</strong> ${location.dateOfSurvey}</p>
                        <p><strong>Address:</strong> ${location.address}</p>
                    </div>`
            });

            marker.addListener('click', function () {
                infoWindow.open(map, marker);
            });

            markers.push(marker);
            markerClusterMap.set(latLngKey, { marker: marker, count: 1 }); // Store marker and count
        }
    });
}

// Function to update the marker label with the count
function updateMarker(marker, count) {
    marker.setLabel({
        text: `Count-${count}`,
        color: 'white', // Label text color
        fontWeight: 'bold', // Make the text bold
        fontSize: '12px', // Adjust the font size
        className: 'custom-marker-label' // Add custom class for extra styling
    });
}

// Function to filter markers based on selected category and date
function filterMarkers() {
    var selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(checkbox => checkbox.value);
    var selectedDate = document.getElementById('survey-date').value;

    markers.forEach(marker => marker.setMap(null)); // Hide all markers
    markerClusterMap.clear(); // Clear marker cluster count map

    // Add markers based on selected survey
    if (selectedCategories.includes('all') || selectedCategories.length === 0) {
        addMarkersWithDateFilter(locations, 'green', selectedDate);
        addMarkersWithDateFilter(locations2, 'red', selectedDate);
    } else {
        if (selectedCategories.includes('survey1')) {
            addMarkersWithDateFilter(locations, 'green', selectedDate);
        }
        if (selectedCategories.includes('survey2')) {
            addMarkersWithDateFilter(locations2, 'red', selectedDate);
        }
    }
}

// Function to add markers filtered by survey date
function addMarkersWithDateFilter(dataset, color, selectedDate) {
    dataset.forEach(function (location) {
        if (selectedDate === 'all' || location.dateOfSurvey === selectedDate) {
            var latLngKey = `${location.latitude}_${location.longitude}`;

            // Check if there's already a marker at the same lat-lng
            if (markerClusterMap.has(latLngKey)) {
                var clusterInfo = markerClusterMap.get(latLngKey);
                clusterInfo.count += 1;
                updateMarker(clusterInfo.marker, clusterInfo.count);
            } else {
                var marker = new google.maps.Marker({
                    position: { lat: location.latitude, lng: location.longitude },
                    map: map,
                    title: location.fileNumber.toString(),
                    icon: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
                    // label: { text: 'Count-1', color: 'black', fontWeight: 'bold' }
                });

                markers.push(marker);
                markerClusterMap.set(latLngKey, { marker: marker, count: 1 });
            }
        }
    });
}

// Function to set a marker and circle for my location
function setMyLocation(latLng) {
    if (myLocationMarker) myLocationMarker.setMap(null);
    if (myLocationCircle) myLocationCircle.setMap(null);

    myLocationMarker = new google.maps.Marker({
        position: latLng,
        map: map,
        title: "My Location",
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });

    myLocationCircle = new google.maps.Circle({
        map: map,
        radius: 200,
        fillColor: '#00AAFF',
        strokeColor: '#0000FF',
        strokeOpacity: 0.35,
        fillOpacity: 0.2,
        center: latLng
    });

    hideMarkersOutsideRadius(latLng);
}

// Function to hide markers outside a certain radius
function hideMarkersOutsideRadius(latLng) {
    markers.forEach(function (marker) {
        var distance = google.maps.geometry.spherical.computeDistanceBetween(marker.getPosition(), latLng);
        marker.setVisible(distance <= 200);
    });
}

// Function to show all markers and reset filters
// Function to show all markers and reset filters
function showAllMarkers() {
    // Clear existing markers from the map
    markers.forEach(function (marker) {
        marker.setMap(null);
    });
    markers = []; // Reset the markers array
    markerClusterMap.clear(); // Clear the marker cluster count map

    // Add markers for Survey-1 (green)
    addMarkers(locations, 'green');

    // Add markers for Survey-2 (red)
    addMarkers(locations2, 'red');

    // Remove myLocationMarker and myLocationCircle if they exist
    if (myLocationMarker) myLocationMarker.setMap(null);
    if (myLocationCircle) myLocationCircle.setMap(null);

    // Reset the date filter and category checkboxes
    document.getElementById('survey-date').value = 'all';
    document.querySelectorAll('input[name="category"]').forEach(checkbox => checkbox.checked = false);
    document.querySelector('input[name="category"][value="all"]').checked = true;
}


// Function to populate the survey date dropdown based on available data
function populateDateOptions() {
    var allDates = new Set();

    // Collect dates from both datasets
    locations.forEach(function (location) {
        allDates.add(location.dateOfSurvey);
    });
    locations2.forEach(function (location) {
        allDates.add(location.dateOfSurvey);
    });

    var dateSelector = document.getElementById('survey-date');
    allDates.forEach(function (date) {
        var option = document.createElement('option');
        option.value = date;
        option.textContent = date;
        dateSelector.appendChild(option);
    });
}
