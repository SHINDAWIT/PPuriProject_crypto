"""Run public-interface checks; never builds or loads the private crypto core."""
from datetime import datetime, timezone
from pathlib import Path
import argparse
import json
import platform
import re
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def version(command):
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, check=True)
    return (result.stdout + result.stderr).strip().splitlines()[0]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--record", action="store_true",
                        help="write this local public-check result to evidence/portfolio_checks.json")
    args = parser.parse_args()
    for command in ("node", "cc", "javac"):
        if shutil.which(command) is None:
            raise SystemExit("required tool not found: " + command)

    output_dir = ROOT / ".build/java"
    output_dir.mkdir(parents=True, exist_ok=True)
    java_sources = sorted((ROOT / "adapters/java").rglob("*.java"))
    java_sources += sorted((ROOT / "examples/java").rglob("*.java"))
    # Java 8 bytecode is intentional. JDK 21 marks that target as obsolete;
    # suppress option-age warnings while retaining all code warnings as errors.
    commands = [
        ("public materials", [sys.executable, "tools/check_portfolio.py"]),
        ("Node wrapper syntax", ["node", "--check", "adapters/node/index.js"]),
        ("Node example syntax", ["node", "--check", "examples/node/encrypt-payload.cjs"]),
        ("Node contract tests", ["node", "--test", "tests/node-contract.test.cjs"]),
        ("C public header", ["cc", "-std=c99", "-Wall", "-Wextra", "-Werror",
                             "-fsyntax-only", "-Iapi", "tests/header_compile.c"]),
        ("Java API and example", ["javac", "--release", "8", "-Xlint:all,-options", "-Werror",
                                  "-d", ".build/java"] +
                                 [str(path.relative_to(ROOT)) for path in java_sources]),
    ]
    checks = []
    scenario_count = 0
    for name, command in commands:
        print("Checking: " + name, flush=True)
        result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
        combined = result.stdout + result.stderr
        if combined:
            print(combined, end="" if combined.endswith("\n") else "\n")
        if result.returncode:
            raise SystemExit(result.returncode)
        if name == "Node contract tests":
            match = re.search(r"^# tests (\d+)$", result.stdout, re.M)
            if match:
                scenario_count = int(match.group(1))
        public_command = ["python3", *command[1:]] if command[0] == sys.executable else command
        checks.append({"name": name, "command": public_command, "status": "PASS"})

    if args.record:
        system = platform.freedesktop_os_release() if sys.platform.startswith("linux") else {}
        report = {
            "record_type": "public_contract_checks",
            "executed_at_utc": datetime.now(timezone.utc).isoformat(),
            "status": "PASS",
            "environment": {
                "os": system.get("PRETTY_NAME", platform.system()),
                "architecture": platform.machine(),
                "python": platform.python_version(),
                "node": version(["node", "--version"]),
                "javac": version(["javac", "-version"]),
                "cc": version(["cc", "--version"]),
            },
            "checks": checks,
            "node_contract_scenarios": scenario_count,
            "native_cryptography_executed": False,
            "target_container_tests_executed": False,
            "kafka_or_customer_system_contacted": False,
            "scope": "Public adapter contracts, syntax, compilation, documentation and file selection only",
        }
        (ROOT / "evidence/portfolio_checks.json").write_text(
            json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("All public contract and compile checks: PASS")


if __name__ == "__main__":
    main()
