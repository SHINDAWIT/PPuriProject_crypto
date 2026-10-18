"""Validate the selected public materials without loading native cryptography."""
from pathlib import Path
import hashlib
import json
import re
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
SKIP = {".git", ".build", "__pycache__", "node_modules"}
patterns = {
    "email": re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}", re.I),
    "mobile": re.compile(r"\b01[016789][ -]?\d{3,4}[ -]?\d{4}\b"),
    "private_key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "token": re.compile(r"\bgh[pousr]_[A-Za-z0-9]{20,}\b"),
    "private_ipv4": re.compile(r"\b(?:10[.]\d+[.]\d+[.]\d+|192[.]168[.]\d+[.]\d+|172[.](?:1[6-9]|2\d|3[01])[.]\d+[.]\d+)\b"),
    "private_path": re.compile(r"/(?:home|Users)/[A-Za-z0-9._-]+/"),
}


def check():
    expected = set(json.loads((ROOT / "evidence/public_files.json").read_text()))
    actual = set()
    errors = []
    for path in ROOT.rglob("*"):
        rel = path.relative_to(ROOT)
        if any(part in SKIP for part in rel.parts):
            continue
        if path.is_symlink():
            errors.append("symlink is outside the public selection: " + str(rel))
        elif path.is_file():
            actual.add(rel.as_posix())
    if actual != expected:
        errors.append("public file allowlist mismatch: " + repr(sorted(actual ^ expected)))

    for name in sorted(actual):
        path = ROOT / name
        try:
            content = path.read_text(encoding="utf-8")
        except (UnicodeError, OSError):
            errors.append("non-text material: " + name)
            continue
        for label, pattern in patterns.items():
            if pattern.search(content):
                errors.append(label + " pattern in " + name)
        if path.suffix == ".md":
            for link in re.findall(r"\[[^\]\n]*\]\(([^)\n]+)\)", content):
                if link.startswith(("https://", "http://", "#")):
                    continue
                target = (path.parent / unquote(link.split("#", 1)[0])).resolve()
                if not target.is_relative_to(ROOT) or not target.exists():
                    errors.append("broken or external file link in " + name)

    manifest = json.loads((ROOT / "evidence/source_manifest.json").read_text())
    for entry in manifest["files"]:
        path = (ROOT / entry["public_path"]).resolve()
        if not path.is_relative_to(ROOT) or not path.is_file():
            errors.append("invalid public source path")
            continue
        if hashlib.sha256(path.read_bytes()).hexdigest() != entry["sha256"]:
            errors.append("selected source hash mismatch: " + entry["public_path"])

    evidence = json.loads((ROOT / "evidence/release_verification.json").read_text())
    if not evidence["summary_generated_by_packaging_template"]:
        errors.append("historical report limitation missing")
    for field in ("raw_execution_logs_independently_verified",
                  "cryptographic_tests_rerun_for_portfolio",
                  "node_red_flow_deployment_proven", "customer_acceptance_proven",
                  "email_receipt_matched_to_archive_hash"):
        if evidence[field] is not False:
            errors.append("unproven historical claim: " + field)
    if len(evidence["checks"]) != 14:
        errors.append("historical summary entry count changed")
    if errors:
        raise SystemExit("\n".join(errors))
    print("Public material checks: PASS (" + str(len(actual)) + " selected text files)")


if __name__ == "__main__":
    check()
