# 🔐 Password Strength Analyzer

A realistic password strength analyzer that goes beyond counting characters.  
It measures **entropy**, detects **dictionary words**, and flags **patterns** like `1234` or `aaa`.

Built with **Flask (Python)** and **Chart.js (JavaScript)**.

---

## 🚀 Features
- Calculates **true entropy** based on length and character diversity  
- Detects **dictionary / common words** (even with leetspeak like `p@ssw0rd`)  
- Flags **repetitive** and **sequential** patterns  
- Gives **feedback** on how to improve passwords  
- Displays results with a **progress bar** and **polar chart**

---

## ⚙️ How It Works
The analyzer checks each password for:

1. **Entropy** → `length × log2(character_set_size)`  
2. **Dictionary words** → uses `/usr/share/dict/words` or a fallback list  
3. **Patterns** → detects sequences like `1234`, `abcd`, or repeated letters  

Then it adjusts entropy with penalties and classifies:

| Category | Description |
|-----------|--------------|
| Very Weak | Common or short passwords |
| Weak | Some variety but predictable |
| Moderate | Good diversity, average entropy |
| Strong | High entropy or length |
| Very Strong | 14+ chars, high randomness |

---

## 💻 Run Locally
1. **Clone the repo**
   ```bash
   git clone <repo_link>
   cd password-strength-analyzer
   ```

2. **Install Flask**
   ```bash
   pip install flask
   ```

3. **Run the app**
   ```bash
   python app.py
   ```

4. **Open in your browser**
   Go to [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## 🩷 Notes
- Works on any laptop with Python installed  
- “Very Strong” requires both 14+ characters and high entropy  
- No extra setup needed — frontend and backend are already connected


