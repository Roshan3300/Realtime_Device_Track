const socket = io();
let map;
let mapInitialized = false;
const markers = {};
let myMarker = null;

document.addEventListener("DOMContentLoaded", function() {
    map = L.map('map').setView([0, 0], 13);
    console.log("Map initialized");
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'mene banaya haha'
    }).addTo(map);
    
    if(navigator.geolocation){
        navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            const accuracy = position.coords.accuracy;
            console.log("Got location:", latitude, longitude, "Accuracy:", accuracy);
            
            if (myMarker) {
                myMarker.setLatLng([latitude, longitude]);
            } else {
                myMarker = L.circleMarker([latitude, longitude], {
                    radius: 10,
                    fillColor: 'blue',
                    color: 'darkblue',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }).bindPopup("Your Location (This Tab)").addTo(map);
                console.log("My marker added");
            }
            
            if (!mapInitialized) {
                map.setView([latitude, longitude], 16);
                mapInitialized = true;
                console.log("Map centered on my location");
            }
            
            socket.emit("send-location", { latitude, longitude });
        }, (error) => {
            console.error("Geolocation error:", error.code, error.message);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000,
        }
        );
    } else {
        console.error("Geolocation not supported");
    }
});

socket.on("connect", () => {
    console.log("Connected to server with socket ID:", socket.id);
});

socket.on("Receive-location", (data) => {
    if (!map) return;
    const { id, latitude, longitude } = data;
    console.log("Received location from", id, ":", latitude, longitude);
    
    if (id === socket.id) return;
    
    const colors = ['red', 'green', 'purple', 'orange', 'darkred', 'pink', 'grey', 'black'];
    const colorIndex = id.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];
    
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        const offset = Object.keys(markers).length * 0.0001;
        const offsetLat = latitude + offset;
        const offsetLon = longitude + offset;
        
        markers[id] = L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: color,
            color: 'black',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.7
        }).bindPopup(`Tab: ${id.slice(0, 8)}`).addTo(map);
        console.log("New marker added for", id, "- Total markers:", Object.keys(markers).length + 1);
        updateMarkerCount();
    }
});

socket.on("user-disconnected", (data) => {
    const { id } = data;
    console.log("User disconnected:", id);
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
        console.log("Marker removed - Total markers:", Object.keys(markers).length + 1);
        updateMarkerCount();
    }
});

function updateMarkerCount() {
    const count = Object.keys(markers).length + 1; 
    console.log("Total tabs/markers on map:", count);
}
