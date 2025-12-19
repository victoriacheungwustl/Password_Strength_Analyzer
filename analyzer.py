import math
import re
import os

def normalize_password(password: str) -> str:
    """Translates leetspeak to plain text for dictionary checking."""
    leet_map = {'0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's', '!': 'i'}
    lowered = password.lower()
    for char, replacement in leet_map.items():
        lowered = lowered.replace(char, replacement)
    return re.sub(r'[^a-z]', '', lowered)

def load_dictionary():
    # Attempt to load local words file or use a fallback list
    paths = ["/usr/share/dict/words", os.path.join(os.getcwd(), "data/words.txt")]
    for path in paths:
        if os.path.exists(path):
            with open(path, errors="ignore") as f:
                return set(w.strip().lower() for w in f if len(w) >= 3)
    return {"password", "qwerty", "admin", "welcome", "monkey", "sunshine", "123456"}

DICTIONARY = load_dictionary()

def analyze_password(password: str) -> dict:
    pw_lower = password.lower()
    normalized = normalize_password(password)
    length = len(password)
    
    # 1. Base Entropy Calculation
    charset = 0
    if re.search(r"[a-z]", password): charset += 26
    if re.search(r"[A-Z]", password): charset += 26
    if re.search(r"\d", password): charset += 10
    if re.search(r"[^a-zA-Z0-9]", password): charset += 33
    
    base_entropy = round(length * math.log2(max(charset, 1)), 2) if charset > 0 else 0

    # 2. Hard Penalties (The "Bad" Stuff)
    feedback = []
    dictionary_hit = normalized in DICTIONARY or any(word in pw_lower for word in ["password", "qwerty"])
    sequential = bool(re.search(r"(1234|abcd|qwerty|asdf|zxcv)", pw_lower))
    repeating = bool(re.search(r"(.)\1{2,}", password))

    penalty = 0
    if dictionary_hit:
        penalty += 45
        feedback.append("Contains common words or predictable substitutions.")
    if sequential:
        penalty += 20
        feedback.append("Avoid keyboard sequences (e.g., '1234' or 'qwerty').")
    if repeating:
        penalty += 10
        feedback.append("Avoid repeating characters (e.g., 'aaa').")

    adjusted_entropy = max(base_entropy - penalty, 0)

    # 3. Categorization (14-char threshold for Very Strong)
    if adjusted_entropy < 30: 
        category = "Very Weak"
    elif adjusted_entropy < 50: 
        category = "Weak"
    elif adjusted_entropy < 70: 
        category = "Moderate"
    elif adjusted_entropy < 90 or length < 14: # Forced 'Strong' if under 14 chars
        category = "Strong"
    else:
        category = "Very Strong"

    # 4. Constructive Feedback to reach "Very Strong"
    if category != "Very Strong":
        if length < 14:
            feedback.append(f"Length is {length}. Aim for 14+ characters for 'Very Strong' security.")
        if not re.search(r"[A-Z]", password):
            feedback.append("Add uppercase letters to increase diversity.")
        if not re.search(r"[^a-zA-Z0-9]", password):
            feedback.append("Add symbols (e.g., !, @, #) to increase entropy.")
        if category == "Strong" and length >= 14:
            feedback.append("Almost there! Try removing predictable patterns to hit 'Very Strong'.")

    return {
        "entropy": round(adjusted_entropy, 2),
        "category": category,
        "feedback": feedback,
        "details": {
            "dictionary_hit": dictionary_hit,
            "sequential": sequential,
            "repeating": repeating,
            "base_entropy": base_entropy
        }
    }