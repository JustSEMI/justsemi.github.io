function updateTime() {
	let now = new Date();
	let hours = now.getHours().toString().padStart(2, '0');
	let minutes = now.getMinutes().toString().padStart(2, '0');
	let seconds = now.getSeconds().toString().padStart(2, '0');

	document.getElementById('hours').textContent = hours;
	document.getElementById('minutes').textContent = minutes;
	document.getElementById('seconds').textContent = seconds;
}

setInterval(updateTime, 1000);