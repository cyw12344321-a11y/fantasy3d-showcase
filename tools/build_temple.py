"""Reproduce the public, browser-ready assets of the pinned original temple."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
import json
from pathlib import Path, PurePosixPath
import subprocess
from urllib.parse import quote

ORIGIN = "https://yinian-quiet-temple.cyw12344321.chatgpt.site"
LOCKFILE = Path(__file__).with_name("release.json")


def artifact_path(root, name):
    path = PurePosixPath(name)
    if path.is_absolute() or ".." in path.parts or str(path) != name:
        raise ValueError(f"Invalid asset path: {name!r}")
    return root.joinpath(*path.parts)


def verify(data, digest, name):
    if sha256(data).hexdigest() != digest:
        raise ValueError(f"Public asset differs from the pinned version: {name}")


def download(root, name, spec):
    query, digest, size = spec
    target = artifact_path(root, name)
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.is_file() and target.stat().st_size == size:
        if sha256(target.read_bytes()).hexdigest() == digest:
            return
    # Pin generated HTML itself. Edge-injected scripts can vary between regions.
    if name in {"index.html", "about.html", "privacy.html"}:
        data = (LOCKFILE.parent / "public-pages" / name).read_bytes()
        verify(data, digest, name)
        target.write_bytes(data)
        return
    path = "/" + quote(name, safe="/")
    part = target.with_name(target.name + ".partial")
    try:
        subprocess.run([
            "curl", "--fail", "--silent", "--show-error", "--location",
            "--proto", "=https", "--proto-redir", "=https", "--compressed",
            "--connect-timeout", "10", "--max-time", "75", "--retry", "3",
            "--retry-all-errors", "--output", str(part), ORIGIN + path + query
        ], check=True)
        data = part.read_bytes()
        verify(data, digest, name)
        part.replace(target)
    finally:
        part.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("outdir", type=Path)
    args = parser.parse_args()
    root = args.outdir.resolve()
    root.mkdir(parents=True, exist_ok=True)
    manifest = json.loads(LOCKFILE.read_text())
    with ThreadPoolExecutor(max_workers=8) as pool:
        tasks = [pool.submit(download, root, name, spec)
                 for name, spec in manifest["files"].items()]
        failures = []
        for task in tasks:
            try:
                task.result()
            except Exception as error:
                failures.append(str(error))
        if failures:
            raise RuntimeError("\n".join(failures))
    for name, (digest, members) in manifest["merged"].items():
        data = b"".join(artifact_path(root, member).read_bytes() for member in members)
        verify(data, digest, name)
        artifact_path(root, name).write_bytes(data)
    print(f"Verified {len(manifest['files'])} public files and {len(manifest['merged'])} reassembled assets.")


if __name__ == "__main__":
    main()
