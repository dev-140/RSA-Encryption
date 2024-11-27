let publicKey = {};
let privateKey = {};
let n = 0;
let processLog = [];

function logProcess(message) {
  processLog.push(message);
  document.getElementById("processLog").textContent = processLog.join("\n");
}

function clearLog() {
  processLog = [];
  document.getElementById("processLog").textContent = "";
}

function gcd(a, b) {
  if (b === 0) return a;
  return gcd(b, a % b);
}

function modInverse(e, phi) {
  let m0 = phi;
  let y = 0;
  let x = 1;

  if (phi === 1) return 0;

  while (e > 1) {
    let q = Math.floor(e / phi);
    let t = phi;

    phi = e % phi;
    e = t;
    t = y;

    y = x - q * y;
    x = t;
  }

  if (x < 0) x += m0;
  return x;
}

function modPow(base, exponent, modulus) {
  if (modulus === 1) return 0;
  let result = 1;
  base = base % modulus;
  while (exponent > 0) {
    if (exponent % 2 === 1) {
      result = (result * base) % modulus;
    }
    base = (base * base) % modulus;
    exponent = Math.floor(exponent / 2);
  }
  return result;
}

function generateKeys() {
  clearLog();
  const p = parseInt(document.getElementById("p").value);
  const q = parseInt(document.getElementById("q").value);

  if (!p || !q) {
    alert("Please enter valid prime numbers");
    return;
  }

  logProcess(`Using prime numbers: p=${p}, q=${q}`);

  n = p * q;
  const phi = (p - 1) * (q - 1);
  logProcess(`Calculating n = p × q = ${n}`);
  logProcess(`Calculating φ(n) = (p-1) × (q-1) = ${phi}`);

  let e = 65537;
  while (e < phi) {
    if (gcd(e, phi) === 1) break;
    e++;
  }
  logProcess(`Choosing public exponent e = ${e}`);

  const d = modInverse(e, phi);
  logProcess(`Calculating private exponent d = ${d}`);

  publicKey = { e, n };
  privateKey = { d, n };

  document.getElementById("publicKey").textContent = `e: ${e}, n: ${n}`;
  document.getElementById("privateKey").textContent = `d: ${d}, n: ${n}`;
}

function chunkString(str, size) {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
}

function encrypt() {
  clearLog();
  const message = document.getElementById("message").value;
  if (!message) {
    alert("Please enter a message to encrypt");
    return;
  }

  if (!publicKey.e) {
    alert("Please generate keys first");
    return;
  }

  logProcess("Starting encryption process...");
  logProcess(`Original message: "${message}"`);

  // Convert text to numbers (ASCII)
  const numbers = [];
  for (let i = 0; i < message.length; i++) {
    numbers.push(message.charCodeAt(i));
  }
  logProcess(`ASCII values: ${numbers.join(", ")}`);

  // Encrypt each number
  const encrypted = numbers.map((num) => {
    const enc = modPow(num, publicKey.e, n);
    logProcess(`Encrypting ${num} → ${enc}`);
    return enc;
  });

  // Log the full array of encrypted values
  logProcess(`All encrypted values: ${encrypted.join(", ")}`);

  // Convert to Base64 for easier display
  const encryptedStr = btoa(encrypted.join(","));
  document.getElementById("encryptedMessage").textContent = encryptedStr;
  logProcess("Encryption complete!");

  console.log(encrypted);
}

function decrypt() {
  clearLog();
  const encryptedStr = document.getElementById("encryptedMessage").textContent;
  if (encryptedStr === "-") {
    alert("Please encrypt a message first");
    return;
  }

  logProcess("Starting decryption process...");

  // Convert from Base64 and split into numbers
  const encrypted = atob(encryptedStr).split(",").map(Number);

  // Decrypt each number
  const decrypted = encrypted.map((num) => {
    const dec = modPow(num, privateKey.d, n);
    logProcess(`Decrypting ${num} → ${dec} (${String.fromCharCode(dec)})`);
    return String.fromCharCode(dec);
  });

  const decryptedMessage = decrypted.join("");
  document.getElementById("decryptedMessage").textContent = decryptedMessage;
  logProcess(`Decryption complete! Message: "${decryptedMessage}"`);
}
