const passwordInput = document.getElementById("password");
const fillBar = document.getElementById("fill");
const resultText = document.getElementById("result");
const feedbackText = document.getElementById("feedback");
const form = document.getElementById("password-form");
const chartCard = document.getElementById("chart-card");
let strengthChart = null;

// Tooltip Message Map for the Chart
const strengthMessages = {
    Length: ["Critical: Too short", "Weak", "Acceptable", "Good", "Excellent (14+ chars)!"],
    Diversity: ["One type only", "Basic mix", "Good variety", "Strong diversity", "Perfect variety!"],
    Dictionary: ["Common word found", "Predictable", "Mostly safe", "Secure", "No common words!"],
    Pattern: ["Obvious pattern", "Repeating/Sequential", "Neutral", "Randomized", "Perfectly random!"],
    Entropy: ["Very low", "Low", "Moderate", "High", "Maximum randomness!"]
};

// Password visibility toggle
document.getElementById("toggle-password").addEventListener("click", (e) => {
    const icon = e.currentTarget.querySelector("i");
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = passwordInput.value.trim();
    if (!password) return;
    try {
        const response = await fetch("/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password, threat_model: "offline" }),
        });
        const data = await response.json();
        updateUI(data);
    } catch (err) { console.error("Error:", err); }
});

function updateUI(data) {
    const {
        entropy,
        category,
        feedback,
        estimated_crack_time,
        details
    } = data;
    const colorMap = { 
        "Very Weak": "#ef4444", 
        "Weak": "#f97316", 
        "Moderate": "#facc15", 
        "Strong": "#16a34a", 
        "Very Strong": "#22c55e" 
    };
    const color = colorMap[category] || "#9ca3af";

    const barPercent = {"Very Weak": 20, "Weak": 40, "Moderate": 60, "Strong": 80, "Very Strong": 100}[category] || 0;
    fillBar.style.width = `${barPercent}%`;
    fillBar.style.backgroundColor = color;

    // resultText.innerHTML = `
    //     ${category}
    //     <span class="text-gray-400 text-sm block mt-1">
    //         Offline crack estimate: <strong>${estimated_crack_time.offline_attack}</strong><br>
    //         Online crack estimate: <strong>${estimated_crack_time.online_attack}</strong>
    //     </span>
    // `;

    // resultText.innerHTML = `${category} <span class="text-gray-400 text-sm">(Entropy: ${entropy})</span>`;
    resultText.innerHTML = `
    ${category}
    <span class="text-gray-400 text-sm block mt-1">
        Offline crack estimate: <strong>${estimated_crack_time.offline_attack}</strong><br>
        Online crack estimate: <strong>${estimated_crack_time.online_attack}</strong>
    </span>
    <span class="text-gray-400 text-sm">(Entropy: ${entropy})</span>
    `;

    
    // Feedback Logic - Shows "Excellent" for Very Strong, otherwise shows tips
    if (category === "Very Strong") {
        feedbackText.innerHTML = `
          <div class="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-center mt-2">
              <p class="text-green-400 font-bold">✨ Excellent Security!</p>
              <p class="text-xs text-green-200 mt-1">This password is highly resistant to modern cracking methods.</p>
          </div>`;
    } else {
        feedbackText.innerHTML = `
          <p class="text-pink-400 font-bold mb-1 mt-2">Improvement Tips:</p>
          <ul class="space-y-1 text-gray-300 text-sm text-left px-2">
              ${feedback.map(f => `<li class="flex items-start"><span class="mr-2">•</span>${f}</li>`).join("")}
          </ul>`;
    }

    chartCard.classList.remove("hidden");
    renderChart(details, passwordInput.value.trim());
}

function renderChart(details, password) {
    const ctx = document.getElementById("strengthAspectChart").getContext("2d");
    if (strengthChart) strengthChart.destroy();

    const L = password.length;
    // Length Score: 5 requires 14+ characters
    const lengthScore = L < 8 ? 1 : L < 10 ? 2 : L < 12 ? 3 : L < 14 ? 4 : 5;

    const divCount = [/[a-z]/, /[A-Z]/, /\d/, /[^a-z0-9]/i].filter(r => r.test(password)).length;
    const diversityScore = divCount === 1 ? 1 : divCount === 2 ? 2 : divCount === 3 ? 4 : 5;
    
    const dictionaryScore = (details.dictionary_hit) ? 1 : 5;
    const patternScore = (details.sequential || details.repeating) ? 1 : 5;

    // FIX: Scaled strictly so "1" or "hello" stays low. 
    // No "+1" offset used here to prevent pushing low scores to the next tier.
    const entropyScore = Math.max(1, Math.min(Math.ceil(details.base_entropy / 30), 5));

    strengthChart = new Chart(ctx, {
        type: "polarArea",
        data: {
            labels: ["Length", "Diversity", "Dictionary", "Pattern", "Entropy"],
            datasets: [{
                data: [lengthScore, diversityScore, dictionaryScore, patternScore, entropyScore],
                backgroundColor: ["#f472b6BB", "#fb7185BB", "#fb923cBB", "#facc15BB", "#4ade80BB"],
                borderColor: "#ffffff33",
                borderWidth: 2
            }]
        },
        options: {
            scales: { 
                r: { 
                    min: 0, 
                    max: 5, 
                    grid: { color: "rgba(255,255,255,0.1)" }, 
                    ticks: { 
                        display: true, 
                        stepSize: 1,
                        color: "#fff",
                        backdropColor: "transparent"
                    },
                    pointLabels: {
                        display: true,
                        color: "#f9a8d4"
                    }
                } 
            },
            plugins: { 
                legend: { 
                    display: true,
                    labels: { color: "#f9a8d4" } 
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.label;
                            const score = context.raw;
                            // Maps the calculated score to your custom hover messages
                            const msg = strengthMessages[label][score - 1] || "";
                            return `${label}: ${msg} (${score}/5)`;
                        }
                    }
                }
            }
        }
    });
}