 let countdownInterval;

// 1. NAVIGATION & TAB LOGIC

function showTab(tabId) {
    const glassBox = document.querySelector('.glass-box');
    const activeTab = document.getElementById(tabId);

    if (glassBox.style.display === 'block' && activeTab.style.display === 'block') {
        glassBox.style.display = 'none';
    } else {
        glassBox.style.display = 'block';
        const tabs = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => tab.style.display = 'none');

        if (activeTab) {
            activeTab.style.display = 'block';
            if (tabId === 'character') {
                loadGallery();
            }
        }
    }
}

// 2. RESIN CALCULATOR LOGIC

function startCountdown(targetTime) {
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetTime - now;
        const display = document.getElementById('time-result');
        const message = document.getElementById('noelle-message');

        if (distance < 0) {
            display.innerText = "Resin Full! ✨";
            message.innerText = '"All tasks are complete! Your resin is ready, Ewa!"';
            clearInterval(countdownInterval);
            return;
        }

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        display.innerText = hours + "h " + minutes + "m " + seconds + "s remaining";

        if (hours >= 16) {
            message.innerText = '"You have plenty of time for other duties, Ewa!"';
        } else if (hours >= 8) {
            message.innerText = '"It seems there is still time for a tea break!"';
        } else if (hours < 2) {
            message.innerText = '"The resin is almost ready. Shall I prepare your gear?"';
        } else {
            message.innerText = '"Leave it to me! I\'ll track your resin while you rest."';
        }
    }, 1000);
}

document.querySelector('.calculation-btn').addEventListener('click', function() {
    const current = document.getElementById('current-resin').value;

    if (current !== "" && current >= 0 && current < 200) {
        const minutesLeft = (200 - current) * 8;
        const targetTimestamp = new Date(Date.now() + minutesLeft * 60000).getTime();
        localStorage.setItem('resinTargetTime', targetTimestamp);
        startCountdown(targetTimestamp);
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const savedTarget = localStorage.getItem('resinTargetTime');

    if (savedTarget) {
        document.querySelector('.glass-box').style.display = 'block';
        document.getElementById('resin').style.display = 'block';
        startCountdown(parseInt(savedTarget));
    }
});

// 3. ASCENSION PLANNER / GALLERY LOGIC
async function loadGallery() {
    const gallery = document.getElementById('char-gallery');

    if (gallery.children.length > 0) return;
    gallery.innerHTML = '<p>Loading Characters...</p>';
    try {
        const response = await fetch('https://genshin.jmp.blue/characters');
        const characters = await response.json();
        gallery.innerHTML = '';
        characters.forEach(char => {
            const card = document.createElement('div');
            card.className = 'char-card';
            const iconUrl = 'https://genshin.jmp.blue/characters/' + char + '/icon';
            card.innerHTML =
                '<img src="' + iconUrl + '" onerror="this.src=\'https://genshin.jmp.blue/characters/characters/traveler-anemo/icon\'">' +
                '<p>' + char.charAt(0).toUpperCase() + char.slice(1) + '</p>';
            card.onclick = () => showCharDetails(char);
            gallery.appendChild(card);
        });
    } catch (error) {
        gallery.innerHTML = '<p>Error loading characters. Check your connection!</p>';
        console.error("Error:", error);
    }
}

function filterCharacters() {
    const input = document.getElementById('char-search').value.toLowerCase();
    const cards = document.getElementsByClassName('char-card');

    Array.from(cards).forEach(card => {
        const name = card.getElementsByTagName('p')[0].innerText.toLowerCase();
        card.style.display = name.includes(input) ? "block" : "none";
    });
}

async function showCharDetails(charId) {
    document.getElementById('char-gallery').style.display = 'none';
    document.querySelector('.search-container').style.display = 'none';
    document.getElementById('char-details').style.display = 'block';

    try {
        const response = await fetch('https://genshin.jmp.blue/characters/' + charId);
        const data = await response.json();

        document.getElementById('det-icon').src = 'https://genshin.jmp.blue/characters/' + charId + '/icon';
        document.getElementById('det-name').innerText = data.name;
        document.getElementById('det-title').innerText = data.title || "";
        
        document.getElementById('det-meta').innerText = data.vision + ' | ' + data.weapon + ' | ' + '⭐'.repeat(data.rarity);
        document.getElementById('det-desc').innerText = '"' + data.description + '"';

        const grid = document.getElementById('mat-grid');
        grid.innerHTML = "";

        if (data.ascension_materials) {
            const allMats = Object.values(data.ascension_materials).flat();
            const uniqueMats = [...new Set(allMats.map(m => typeof m === 'object' ? m.name : m))];

            uniqueMats.forEach(matName => {
                const matId = matName.toLowerCase().replace(/\s+/g, '-').replace(/[']/g, '');
                
                const matCard = document.createElement('div');
                matCard.className = 'mat-card';
                
                matCard.innerHTML = 
                    '<div class="mat-icon-box">' +
                        '<img src="https://genshin.jmp.blue/materials/common-ascension/' + matId + '" onerror="this.src=\'https://genshin.jmp.blue/materials/cooking-ingredients/sugar\'">' +
                    '</div>' +
                    '<span>' + matName + '</span>';
                
                grid.appendChild(matCard);
            });
        }
    } catch (error) {
        console.error("Error loading character:", error);
    }
}

function closeDetails() {
    document.getElementById('char-gallery').style.display = 'grid';
    document.querySelector('.search-container').style.display = 'block';
    document.getElementById('char-details').style.display = 'none';
}