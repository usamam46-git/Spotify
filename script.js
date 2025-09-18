// console.log("Script is running")
let currentSong = new Audio();
let play = document.getElementById("play");
let previous = document.getElementById("previous");
let next = document.getElementById("next");
let volumeSlider = document.querySelector(".volume input");
let songs = [];
let currentIndex = 0;
let volumeIcon = document.getElementById("volumeIcon");
let isMuted = false;
let followBtn = document.querySelector(".follow");
let playLibrary = document.querySelector(".music-library");

function getRandomColor() {
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}
document.querySelectorAll(".card-playlist").forEach((card) => {
    card.addEventListener("mouseenter", () => {
        document.querySelector(".second").style.boxShadow = `inset 0 200px 200px -200px ${getRandomColor()}`;
    });

    card.addEventListener("mouseleave", () => {
        document.querySelector(".second").style.boxShadow = `inset 0 80px 80px -80px rgba(207, 203, 203, 0.5)`;
    });
});


async function getSongs() {
    let a = await fetch("http://127.0.0.1:3001/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("songs")[1]);
        }
    }
    return songs;
}

function playMusic(track, index) {
    if (currentSong.src) currentSong.pause();
    currentIndex = index;
    currentSong = new Audio("/songs" + track);
    currentSong.play();

    play.classList.remove("fa-circle-play");
    play.classList.add("fa-circle-pause");

    document.querySelector(".song-info").innerHTML = track.replace(".mp3", "").replace("%5", "").slice(0, 26);
    document.querySelector(".duration").innerHTML = "00:00/00:00";

    currentSong.addEventListener("loadedmetadata", () => {
        document.querySelector(".duration").innerHTML =
            `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".duration").innerHTML =
            `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;

        let percent = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".circle").style.left = percent + "%";
    });

    document.querySelector(".seekbar").onclick = (e) => {
        let rect = e.target.getBoundingClientRect();
        let percent = (e.offsetX / rect.width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    };

    currentSong.addEventListener("ended", () => {
        if (currentIndex < songs.length - 1) {
            playMusic(songs[currentIndex + 1], currentIndex + 1);
        } else {
            currentSong.pause();
            play.classList.remove("fa-circle-pause");
            play.classList.add("fa-circle-play");
        }
    });
}
function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    if (minutes < 10) minutes = "0" + minutes;
    if (secs < 10) secs = "0" + secs;
    return `${minutes}:${secs}`;
}
followBtn.addEventListener("click", () => {
    if (followBtn.classList.contains("followed")) {
        followBtn.classList.remove("followed");
        followBtn.innerHTML = 'Follow';
    } else {
        followBtn.classList.add("followed");
        followBtn.innerHTML = 'Followed <i class="fa-regular fa-circle-check"></i>';
    }
});

async function main() {
    songs = await getSongs();
    console.log(songs);

    let listSongs = document.querySelector(".song-list ul");
    listSongs.innerHTML = "";

    songs.forEach((song, index) => {
        listSongs.innerHTML += `
            <li>
                <div class="music-library">
                     <i class="fa-solid fa-circle-play fa-lg"></i>
                </div>
                <div class="artist">
                <div class="name">
                Usama's Playlist
                </div>
                    <div class="track">${song.replace(".mp3", "").replace("%5C", "").slice(0, 28).replace("__", "").replace("___", "")}</div>
                </div>
            </li>`;
    });
    Array.from(document.querySelectorAll(".song-list li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            playMusic(songs[index], index);
            e.style.color = " rgb(12, 185, 12)";
        });
    });
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.classList.remove("fa-circle-play");
            play.classList.add("fa-circle-pause");
        } else {
            currentSong.pause();
            play.classList.remove("fa-circle-pause");
            play.classList.add("fa-circle-play");
        }
    });
    previous.addEventListener("click", () => {
        if (currentIndex > 0) {
            playMusic(songs[currentIndex - 1], currentIndex - 1);
        }
    });
    next.addEventListener("click", () => {
        if (currentIndex < songs.length - 1) {
            playMusic(songs[currentIndex + 1], currentIndex + 1);
        }
    });
    document.querySelectorAll(".play-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            let randomIndex = Math.floor(Math.random() * songs.length);
            playMusic(songs[randomIndex], randomIndex);
        });
    });
    volumeSlider.addEventListener("input", () => {
        currentSong.volume = volumeSlider.value / 100;
    });
    volumeIcon.addEventListener("click", () => {
        if (!isMuted) {
            currentSong.muted = true;
            volumeIcon.classList.remove("fa-volume-high");
            volumeIcon.classList.add("fa-volume-xmark");
            isMuted = true;
        } else {
            currentSong.muted = false;
            volumeIcon.classList.remove("fa-volume-xmark");
            volumeIcon.classList.add("fa-volume-high");
            isMuted = false;
        }
    });
}

main();