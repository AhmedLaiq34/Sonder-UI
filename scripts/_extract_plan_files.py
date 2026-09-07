"""Extract complete-file code blocks from BOLD-TYPOGRAPHY-PLAN.md."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
plan = (ROOT / "BOLD-TYPOGRAPHY-PLAN.md").read_text(encoding="utf-8")

heading_re = re.compile(
    r"^(#{2,4})[^\n]*?`([^`]+)`[^\n]*\n(.*?)(?=^#{2,4} |\Z)",
    re.MULTILINE | re.DOTALL,
)
code_re = re.compile(r"```(?:tsx|ts|css|jsx)?\n(.*?)```", re.DOTALL)
path_in_comment = re.compile(
    r"^//\s+((?:app|components|lib)/[\w./-]+\.(?:tsx|ts|css))\s*$"
)
looks_like_path = re.compile(
    r"^(?:app|components|lib)/[\w./-]+\.(?:tsx|ts|css)$"
)

complete_starts = (
    "import ",
    '"use client"',
    "'use client'",
    "export ",
    "/* ",
    "/**",
    "@import",
    "const ",
    "function ",
    "type ",
)

extracted: list[dict] = []
seen: set[str] = set()

for m in heading_re.finditer(plan):
    heading_path = m.group(2).strip()
    body = m.group(3)
    blocks = code_re.findall(body)
    candidates: list[tuple[str, str]] = []

    if looks_like_path.match(heading_path) and blocks:
        candidates.append((heading_path, blocks[0]))

    for block in blocks:
        first = next((ln.strip() for ln in block.splitlines() if ln.strip()), "")
        cm = path_in_comment.match(first)
        if cm:
            rest = "\n".join(block.splitlines()[1:]).lstrip("\n")
            candidates.append((cm.group(1), rest))

    for path, content in candidates:
        if not looks_like_path.match(path):
            continue
        stripped = content.lstrip()
        if not stripped.startswith(complete_starts):
            continue
        if path in seen:
            continue
        if not content.endswith("\n"):
            content += "\n"
        seen.add(path)
        extracted.append({"path": path, "chars": len(content), "content": content})

out = ROOT / "scripts" / "_plan_extracted.json"
out.write_text(json.dumps(extracted, indent=2), encoding="utf-8")
print(f"extracted {len(extracted)} files")
for item in extracted:
    print(f"  {item['path']} ({item['chars']})")
