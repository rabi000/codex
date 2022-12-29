import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('.chat_container');

let loadInterval;

function loader(element) {
	//l'element de depart est vide
	element.textContent = '';

	loadInterval = setInterval(() => {
		// mettre à jour le contenu du text lors du lancement de l'indicateur (loading indicayor)
		element.textContent += '.';

		// si le lancement d'indicateur atteint 3 points, on le met à zero

		if (element.textContent === '....') {
			element.textContent = '';
		}
	}, 300);
}

function typeText(element, text) {
	let index = 0;

	let interval = setInterval(() => {
		if (index < text.length) {
			element.innerHTML += text.charAt(index);
			index++;
		} else {
			clearInterval(interval);
		}
	}, 20);
}

//Generer un Id unique pour chaque message div du bot,
//sinon le text aura affiché sur chaque éléments
function generateUniqueId() {
	const timestamp = Date.now();
	const randomNumber = Math.random();
	const hexadecimalString = randomNumber.toString(16);

	return `id-${timestamp}-${hexadecimalString}`;
}

//Créer une fonction pour le chat
function chatStripe(isAi, value, uniqueId) {
	return `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `;
}

const handleSubmit = async (e) => {
	e.preventDefault();

	const data = new FormData(form);

	// Utilisateur chat
	chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

	// Effacer l'entrée de text dans le textarea
	form.reset();

	// bot's chatstripe
	const uniqueId = generateUniqueId();
	chatContainer.innerHTML += chatStripe(true, ' ', uniqueId);

	// focus scroll to the bottom
	chatContainer.scrollTop = chatContainer.scrollHeight;

	// specific message div
	const messageDiv = document.getElementById(uniqueId);

	// messageDiv.innerHTML = "..."
	loader(messageDiv);

	const response = await fetch('http://localhost:5000', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			prompt: data.get('prompt')
		})
	});

	clearInterval(loadInterval);
	messageDiv.innerHTML = ' ';

	if (response.ok) {
		const data = await response.json();
		const parsedData = data.bot.trim(); // trims les espaces/'\n'
		console.log(parsedData);

		typeText(messageDiv, parsedData);
	} else {
		const err = await response.text();

		messageDiv.innerHTML = 'quelque chose ne va pas';
		alert(err);
	}
};

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
	if (e.keyCode === 13) {
		handleSubmit(e);
	}
});
