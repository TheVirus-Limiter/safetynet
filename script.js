
// script.js

const firebaseConfig = {
    apiKey: "AIzaSyC7cZERXozlJB3EnBw0ijPVQohGBcq7StU",
    authDomain: "crimemap-e50a6.firebaseapp.com",
    projectId: "crimemap-e50a6",
    storageBucket: "crimemap-e50a6.appspot.com",
    messagingSenderId: "1043060518339",
    appId: "1:1043060518339:web:16d155d4a74c74341d2176"
}


window.addEventListener("load", () => {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }})



firebase.initializeApp(firebaseConfig);
const database = firebase.database();





function initMap() {
    let userLocationMarker;
let proximityCircle;
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 29.4241, lng: -98.4936 },
        zoom: 12,
    });

    const mapContainer = document.getElementById("map");
    mapContainer.style.height = `${(mapContainer.offsetWidth * 9) / 16}px`;

    const infoWindow = new google.maps.InfoWindow();
    const markerModal = document.getElementById("markerModal");
    const addMarkerButton = document.getElementById("addCrimeMarker");
    const crimeDescriptionInput = document.getElementById("crimeDescription");
    const crimeCategorySelect = document.getElementById("crimeCategory");

    map.addListener("click", (event) => {
        markerModal.style.display = "block";
    });

    const closeModalButton = document.getElementsByClassName("close")[0];
    closeModalButton.addEventListener("click", () => {
        markerModal.style.display = "none";
    });

    addMarkerButton.addEventListener("click", () => {
        const crimeDescription = crimeDescriptionInput.value;
        const selectedOption = crimeCategorySelect.options[crimeCategorySelect.selectedIndex];

        if (crimeDescription && selectedOption) {
            const crimeEmoji = selectedOption.getAttribute("data-emoji");

            const marker = {
                lat: map.getCenter().lat(),
                lng: map.getCenter().lng(),
                details: `${crimeDescription} (${selectedOption.value})`,
                emoji: crimeEmoji,
                likes: 0,
                dislikes: 0,
            };

            const markersRef = database.ref("markers");
            const newMarkerRef = markersRef.push();
            const markerId = newMarkerRef.key;
            newMarkerRef.set(marker);

            crimeDescriptionInput.value = "";
            crimeCategorySelect.selectedIndex = 0;
            markerModal.style.display = "none";

            createMarker(marker, markerId);
        } else {
            alert("Please fill in all fields and select a category.");
        }
    });


const proximitySlider = document.getElementById("proximitySlider");
const proximityValue = document.getElementById("proximity-value");

let proximityThreshold = 1;

proximitySlider.addEventListener("input", () => {
    proximityThreshold = parseInt(proximitySlider.value);
    proximityValue.textContent = `${proximityThreshold} mile${proximityThreshold > 1 ? "s" : ""}`;
});

function checkProximityToFirebaseMarkers(userLocation) {
    const markersRef = database.ref("markers");
    const proximity = document.getElementById("proximitySlider").value;

    markersRef.on("value", (snapshot) => {
        const markers = snapshot.val();

        if (markers) {
            Object.keys(markers).forEach((markerKey) => {
                const marker = markers[markerKey];
                const markerLocation = {
                    lat: marker.lat,
                    lng: marker.lng,
                };

                const distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    markerLocation.lat,
                    markerLocation.lng
                );

                if (distance < proximityThreshold) {
           
                        const notification = new Notification("Crime Alert", {
                            body: `You are within ${proximityThreshold} mile${proximityThreshold > 1 ? "s" : ""} of ${marker.details}`,
                        })
                       
                    alert(`You are within ${proximityThreshold} mile${proximityThreshold > 1 ? "s" : ""} of ${marker.details}`);
                }
                updateMarkerBoundary(userLocation, proximity);
            });
        }
    })
}

proximityValue.textContent = `${proximityThreshold} mile${proximityThreshold > 1 ? "s" : ""}`;

function updateMarkerBoundary(userLocation, proximity) {
    const markerBoundary = document.getElementById("markerBoundary");

    const pixelsPerMile = 10; 
    const radiusPixels = proximity * pixelsPerMile;

    markerBoundary.style.width = `${2 * radiusPixels}px`;
    markerBoundary.style.height = `${2 * radiusPixels}px`;
    markerBoundary.style.left = `${userLocation.pixelX - radiusPixels}px`;
    markerBoundary.style.top = `${userLocation.pixelY - radiusPixels}px`;
}


    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
    
            userLocationMarker = new google.maps.Marker({
                position: userLocation,
                map: map,
                title: "Your Location",
            });
    
            proximityCircle = new google.maps.Circle({
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.35,
                map: map,
                center: userLocation,
                clickable:false,
                radius: proximityThreshold * 1609.34, 
            });
    
            checkProximityToFirebaseMarkers(userLocation);
        });
    }
proximitySlider.addEventListener("input", () => {
    proximity = parseInt(proximitySlider.value, 10);
    proximityCircle.setRadius(proximity * 1609.34); 
});
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; 
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; 
        return distance;
    }


                   

    function clearCookies() {
        const cookies = document.cookie.split(";");
    
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    
    }

    


function createMarker(marker, markerId) {
    const emojiIcon = {
        url: `emoji/${marker.emoji}.png`,
        scaledSize: new google.maps.Size(40, 40),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(20, 40),
    };

    const markerObj = new google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map: map,
        title: marker.details,
        icon: emojiIcon,
    });

    function listenForMarkerChanges(markerId, likesDiv, dislikesDiv) {
        const markerRef = database.ref('markers/' + markerId);
        markerRef.on('value', (snapshot) => {
            const markerData = snapshot.val();
            if (markerData) {
                likesDiv.textContent = 'Likes: ' + (markerData.likes || 0);
                dislikesDiv.textContent = 'Dislikes: ' + (markerData.dislikes || 0);
            }
        });
    }
    
   
    const likeButton = document.createElement("button");
    likeButton.textContent = "Like";

    const dislikeButton = document.createElement("button");
    dislikeButton.textContent = "Dislike";

    let contentContainer = document.createElement('div'); 

    const descriptionDiv = document.createElement('div');
    descriptionDiv.textContent = marker.details;
    contentContainer.appendChild(descriptionDiv);

    const likesDiv = document.createElement('div');
    likesDiv.textContent = 'Likes: ' + (marker.likes || 0);
    contentContainer.appendChild(likesDiv);

    const dislikesDiv = document.createElement('div');
    dislikesDiv.textContent = 'Dislikes: ' + (marker.dislikes || 0);
    contentContainer.appendChild(dislikesDiv);

    listenForMarkerChanges(markerId, likesDiv, dislikesDiv);

    listenForMarkerChanges(markerId, likesDiv, dislikesDiv);



likeButton.classList.add("like-button");
dislikeButton.classList.add("dislike-button");


    let userLike = localStorage.getItem(`${markerId}_like`);
    let userDislike = localStorage.getItem(`${markerId}_dislike`);

    if (userLike) {
        likeButton.disabled = true;
        dislikeButton.disabled = false;
    } else if (userDislike) {
        likeButton.disabled = false;
        dislikeButton.disabled = true;
    }

    likeButton.addEventListener("click", () => {
        if (!userLike) {
            updateRating(markerId, "likes");
            likeButton.disabled = true;
            dislikeButton.disabled = false;
            localStorage.setItem(`${markerId}_like`, 'true');
            if (userDislike) {
                updateNegativeRating(markerId, "dislikes");
                updateNegativeRating(markerId, "likes", true);
                localStorage.removeItem(`${markerId}_dislike`);
            } else if (!userDislike) {
                updateNegativeRating(markerId, "dislikes", true); 
            }
         
            likesDiv.textContent = `Likes: ${marker.likes || 0}`;
            
            dislikesDiv.textContent = `Dislikes: ${marker.dislikes || 0}`;
        } else {
            
            updateNegativeRating(markerId, "likes");
            likeButton.disabled = false;
            dislikeButton.disabled = false;
            localStorage.removeItem(`${markerId}_like`);
           
            likesDiv.textContent = `Likes: ${marker.likes || 0}`;
        }
    });
    
    dislikeButton.addEventListener("click", () => {
        if (!userDislike) {
            updateRating(markerId, "dislikes");
            likeButton.disabled = false;
            dislikeButton.disabled = true;
            localStorage.setItem(`${markerId}_dislike`, 'true');
            if (userLike) {
                updateNegativeRating(markerId, "likes");
                updateNegativeRating(markerId, "dislikes", true);
                localStorage.removeItem(`${markerId}_like`);
            } else if (!userLike) {
                updateNegativeRating(markerId, "likes", true);
            }
            likesDiv.textContent = `Likes: ${marker.likes || 0}`;
            dislikesDiv.textContent = `Dislikes: ${marker.dislikes || 0}`;
        } else {
            updateNegativeRating(markerId, "dislikes");
            likeButton.disabled = false;
            dislikeButton.disabled = false;
            localStorage.removeItem(`${markerId}_dislike`);
            dislikesDiv.textContent = `Dislikes: ${marker.dislikes || 0}`;
        }
    });
    
    

        function updateLikesText(markerId, callback) {
            const markersRef = database.ref("markers").child(markerId);
            markersRef.on("value", (snapshot) => {
                const marker = snapshot.val();
                callback(marker.likes || 0);
            });
        }
        
        function updateDislikesText(markerId, callback) {
            const markersRef = database.ref("markers").child(markerId);
            markersRef.on("value", (snapshot) => {
                const marker = snapshot.val();
                callback(marker.dislikes || 0);
            });
        }
        
    
    markerObj.addListener("click", () => {
        const contentContainer = document.createElement("div");
        const descriptionDiv = document.createElement("div");
        descriptionDiv.textContent = marker.details;
        contentContainer.appendChild(descriptionDiv);

        contentContainer.appendChild(likesDiv);
        contentContainer.appendChild(dislikesDiv);

        contentContainer.appendChild(likeButton);
        contentContainer.appendChild(dislikeButton);

        infoWindow.setContent(contentContainer);
        infoWindow.open(map, markerObj);
    });
}


  

    function updateRating(markerId, ratingType) {
        const markersRef = database.ref("markers").child(markerId);
    
        markersRef.transaction((markerData) => {
            if (markerData) {
                if (!markerData[ratingType]) {
                    markerData[ratingType] = 1;
                } else {
                    markerData[ratingType]++;
                }
                if (ratingType === "likes" && markerData["dislikes"] > 0) {
                    markerData["dislikes"]--; 
                } else if (ratingType === "dislikes" && markerData["likes"] > 0) {
                    markerData["likes"]--; 
                    
                }
                return markerData;
            }
        });
    }
    
    
    

    

    function loadMarkersFromFirebase() {
        const markersRef = database.ref("markers");
        markersRef.on("value", (snapshot) => {
            snapshot.forEach((markerSnapshot) => {
                const marker = markerSnapshot.val();
                createMarker(marker, markerSnapshot.key);
            });
        });
    }

    window.addEventListener("load", loadMarkersFromFirebase);
    window.addEventListener("load", clearCookies);
    window.addEventListener("load",localStorage.clear())
    window.addEventListener("load",sessionStorage.clear())

}
