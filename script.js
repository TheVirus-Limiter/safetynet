
// script.js

const firebaseConfig = {
    apiKey: "AIzaSyC7cZERXozlJB3EnBw0ijPVQohGBcq7StU",
    authDomain: "crimemap-e50a6.firebaseapp.com",
    projectId: "crimemap-e50a6",
    storageBucket: "crimemap-e50a6.appspot.com",
    messagingSenderId: "1043060518339",
    appId: "1:1043060518339:web:16d155d4a74c74341d2176"
}






// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();




function initMap() {
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

    // Open the marker creation modal when clicking on the map
    map.addListener("click", (event) => {
        markerModal.style.display = "block";
    });

    // Close the marker creation modal
    const closeModalButton = document.getElementsByClassName("close")[0];
    closeModalButton.addEventListener("click", () => {
        markerModal.style.display = "none";
    });

    // Handle marker creation when the "Add Marker" button is clicked
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

            // Save the new marker to Firebase and retrieve its ID
            const markersRef = database.ref("markers");
            const newMarkerRef = markersRef.push();
            const markerId = newMarkerRef.key;
            newMarkerRef.set(marker);

            // Clear input fields and close the modal
            crimeDescriptionInput.value = "";
            crimeCategorySelect.selectedIndex = 0;
            markerModal.style.display = "none";

            // Call createMarker with the marker and its ID
            createMarker(marker, markerId);
        } else {
            alert("Please fill in all fields and select a category.");
        }
    });

    

    function clearCookies() {
        const cookies = document.cookie.split(";");
    
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }
    

    

// ...
// ...

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

    let contentContainer = document.createElement('div'); // Declare contentContainer here

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


    // Define userLike and userDislike here
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
                updateNegativeRating(markerId, "dislikes", true); // Decrement dislikes if not previously disliked
            }
            // Update likes text box
            likesDiv.textContent = `Likes: ${marker.likes || 0}`;
            // Update dislikes text box
            dislikesDiv.textContent = `Dislikes: ${marker.dislikes || 0}`;
        } else {
            // Remove the user's like
            updateNegativeRating(markerId, "likes");
            likeButton.disabled = false;
            dislikeButton.disabled = false;
            localStorage.removeItem(`${markerId}_like`);
            // Update likes text box
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
                updateNegativeRating(markerId, "likes", true); // Decrement likes if not previously liked
            }
            // Update likes text box
            likesDiv.textContent = `Likes: ${marker.likes || 0}`;
            // Update dislikes text box
            dislikesDiv.textContent = `Dislikes: ${marker.dislikes || 0}`;
        } else {
            // Remove the user's dislike
            updateNegativeRating(markerId, "dislikes");
            likeButton.disabled = false;
            dislikeButton.disabled = false;
            localStorage.removeItem(`${markerId}_dislike`);
            // Update dislikes text box
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
                    markerData["dislikes"]--; // Decrement dislikes when liking
                } else if (ratingType === "dislikes" && markerData["likes"] > 0) {
                    markerData["likes"]--; // Decrement likes when disliking
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
