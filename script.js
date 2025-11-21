let username = "", domain = "", index = 0, score = 0, qs = [];

const API_BASE = "https://quizapplication-backend-siy4.onrender.com/api";

const stepName = document.getElementById("stepName");
const stepDomain = document.getElementById("stepDomain");
const stepQuiz = document.getElementById("stepQuiz");
const stepResult = document.getElementById("stepResult");

async function getDomains() {
  try {
    const res = await fetch(`${API_BASE}/questions/domains`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching domains:", err);
    alert("Unable to load domains. Check backend.");
    return [];
  }
}

async function getQuestions(domain) {
  try {
    const res = await fetch(`${API_BASE}/questions/${domain}`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching questions:", err);
    alert("Unable to load questions!");
    return [];
  }
}

document.getElementById("startBtn").onclick = async function () {
  username = document.getElementById("nameInput").value.trim();
  if (!username) return alert("Enter name");

  stepName.classList.add("hidden");
  stepDomain.classList.remove("hidden");

  const grid = document.getElementById("domainGrid");
  grid.innerHTML = "";

  const domains = await getDomains();

  if (!domains.length) {
    grid.innerHTML = "<p style='color:red;'>No domains found!</p>";
    return;
  }

  domains.forEach(dm => {
    const b = document.createElement("div");
    b.className = "domain-btn";
    b.textContent = dm.toUpperCase();
    b.onclick = () => startQuiz(dm);
    grid.appendChild(b);
  });
};

async function startQuiz(dm) {
  domain = dm;
  index = 0;
  score = 0;

  qs = await getQuestions(dm);

  if (!qs.length) {
    alert("No questions found for this domain!");
    return;
  }

  stepDomain.classList.add("hidden");
  stepQuiz.classList.remove("hidden");

  loadQ();
}

function loadQ() {
  const q = qs[index];

  document.getElementById("qTitle").textContent = q.question || q.q;
  document.getElementById("qNumber").textContent = `${index + 1} / ${qs.length}`;

  const wrap = document.getElementById("optionsWrap");
  wrap.innerHTML = "";

  q.options.forEach((opt, i) => {
    const div = document.createElement("div");
    div.className = "option";
    div.textContent = opt;
    div.onclick = () => choose(i);
    wrap.appendChild(div);
  });
}

function choose(i) {
  if (i === qs[index].answerIndex) score++;

  index++;
  if (index >= qs.length) finish();
  else loadQ();
}

async function finish() {
  stepQuiz.classList.add("hidden");
  stepResult.classList.remove("hidden");

  document.getElementById("finalScore").textContent =
    `${score} / ${qs.length}`;

  try {
    await fetch(`${API_BASE}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        domain,
        score,
        total: qs.length
      })
    });
  } catch (err) {
    console.error("Error saving score:", err);
  }
}

document.getElementById("retryBtn").onclick = () => {
  stepResult.classList.add("hidden");
  stepDomain.classList.remove("hidden");
};

document.getElementById("homeBtn").onclick = () => location.reload();
