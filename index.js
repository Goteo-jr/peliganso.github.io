const container = document.getElementById('container');
const overlay = document.getElementById('overlay');
const overlayVideo = document.getElementById('overlayVideo');
const searchInput = document.getElementById('search');
const squaresToLoad = 10;

// Load squares from localStorage
function loadSquaresFromStorage() {
    const storedData = JSON.parse(localStorage.getItem('squaresData')) || [];
    storedData.forEach(data => {
        createSquare(data.imgSrc, data.videoSrc, data.name);
    });
}

// Save squares to localStorage
function saveSquaresToStorage() {
    const squares = document.querySelectorAll('.square');
    const squaresData = Array.from(squares).map(square => {
        const img = square.querySelector('img');
        const video = square.querySelector('video');
        return {
            imgSrc: img ? img.src : '',
            videoSrc: video ? video.src : '',
            name: square.getAttribute('data-name') || ''
        };
    });
    localStorage.setItem('squaresData', JSON.stringify(squaresData));
}

// Function to create a new square
function createSquare(imgSrc = '', videoSrc = '', name = '') {
    const square = document.createElement('div');
    square.classList.add('square');
    square.setAttribute('data-name', name); // Store name in a custom attribute

    const img = document.createElement('img');
    img.src = imgSrc;
    img.style.display = imgSrc ? 'block' : 'none';

    const video = document.createElement('video');
    video.src = videoSrc;
    video.style.display = videoSrc ? 'block' : 'none';

    img.addEventListener('click', () => {
        if (video.src) {
            overlayVideo.src = video.src;
            overlayVideo.play();
            overlay.style.display = 'flex';
        }
    });

    square.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const img = square.querySelector('img');
        if (img.src) {
            img.src = '';
            img.style.display = 'none';
        }
        saveSquaresToStorage();
        return false;
    });

    square.appendChild(img);
    square.appendChild(video);
    container.appendChild(square);
}

// Load initial squares from storage
loadSquaresFromStorage();

// Load more squares on scroll
function loadMoreSquares() {
    for (let i = 0; i < squaresToLoad; i++) {
        createSquare();
    }
}

// Handle image/video upload and naming
document.addEventListener('keydown', (event) => {
    if (event.key === 'f') {
        const square = document.querySelector('.square:hover');
        if (square) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*,video/*';
            input.style.display = 'none';
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const url = URL.createObjectURL(file);
                    const img = square.querySelector('img');
                    const video = square.querySelector('video');
                    if (file.type.startsWith('image')) {
                        img.src = url;
                        img.style.display = 'block';
                        video.style.display = 'none';
                    } else if (file.type.startsWith('video')) {
                        video.src = url;
                        video.style.display = 'block';
                        img.style.display = 'block';
                    }
                    // Solicitar el nombre solo si no ha sido asignado previamente
                    if (!square.getAttribute('data-name')) {
                        const name = prompt("Ingrese el nombre para este cuadrado:", "");
                        if (name) {
                            square.setAttribute('data-name', name); // Store name in a custom attribute
                        }
                    }
                    saveSquaresToStorage();
                }
            });
            document.body.appendChild(input);
            input.click();
        }
    }
});

// Infinite scroll functionality
let isLoading = false;

function onScroll() {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100 && !isLoading) {
        isLoading = true;
        loadMoreSquares();
        setTimeout(() => isLoading = false, 500);
    }
}

window.addEventListener('scroll', onScroll);

// Initial load of squares
loadMoreSquares();

// Close overlay when clicking outside the video
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
        overlay.style.display = 'none';
        overlayVideo.pause();
        overlayVideo.src = '';
    }
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        const name = square.getAttribute('data-name').toLowerCase();
        if (name.includes(query)) {
            square.style.display = 'block';
        } else {
            square.style.display = 'none';
        }
    });
});
