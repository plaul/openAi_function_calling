let currentListener = undefined;

function createSignal(initialValue) {
	let value = initialValue;

	const subscribers = new Set();

	const read = () => {
		if (currentListener !== undefined) {
			subscribers.add(currentListener);
		}
		return value;
	};
	const write = (newValue) => {
		value = newValue;
		subscribers.forEach((fn) => fn());
	};

	return [read, write];
}

function createEffect(callback) {
	currentListener = callback;
	callback();
	currentListener = undefined;
}
const [count, setCount] = createSignal(0);


document.getElementById("input_1").addEventListener("input", (e) => {
  setCount(Number(e.target.value));
})
const button = document.createElement('button');
createEffect(() => {
	button.innerText = count();
});
button.addEventListener('click', () => {
	setCount(count() + 1);
});

createEffect(() => {
	document.getElementById("input_1").value = count();
});
document.body.append(button);

const p1 = document.createElement('h2');
createEffect(() => {
	p1.innerText = count();
});

createEffect(() => {
	document.getElementById("h2_1").innerText = count();
});
createEffect(() => {
	document.getElementById("h2_2").innerText = count();
});

document.body.append(button);

