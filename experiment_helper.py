import csv
from analyzer import analyze_password

def run_experiment(input_file="data/rockyou_subset.txt", output_file="data/experiment_results.csv"):
    results = []

    with open(input_file, "r", errors="ignore") as f:
        passwords = [line.strip() for line in f if line.strip()]

    for pw in passwords[:1000]:  # limit to 500–1000 for report
        res = analyze_password(pw)
        results.append({
            "password": pw,
            "entropy": res["entropy"],
            "category": res["category"],
            "feedback": "; ".join(res["feedback"])
        })

    # Save to CSV for visualization or analysis
    with open(output_file, "w", newline="") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=["password", "entropy", "category", "feedback"])
        writer.writeheader()
        writer.writerows(results)

    print(f"✅ Experiment complete. Results saved to {output_file}")

if __name__ == "__main__":
    run_experiment()
