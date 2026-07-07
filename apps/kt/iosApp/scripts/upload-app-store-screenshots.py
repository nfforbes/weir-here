#!/usr/bin/env python3
"""Upload App Store screenshots via the App Store Connect API.

Uses the reserve -> PUT chunks -> commit (MD5) protocol documented by Apple.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import struct
import sys
import time
from pathlib import Path
from typing import Any
from urllib import error, request

try:
    import jwt
except ImportError as exc:  # pragma: no cover
    print("Missing dependency: pip install PyJWT cryptography", file=sys.stderr)
    raise SystemExit(1) from exc

API_BASE = "https://api.appstoreconnect.apple.com"

# Map PNG dimensions to App Store Connect screenshot display types.
DIMENSION_TO_DISPLAY_TYPE: dict[tuple[int, int], str] = {
    (1284, 2778): "APP_IPHONE_65",
    (2778, 1284): "APP_IPHONE_65",
    (1242, 2688): "APP_IPHONE_65",
    (2688, 1242): "APP_IPHONE_65",
    (1320, 2868): "APP_IPHONE_69",
    (2868, 1320): "APP_IPHONE_69",
    (1290, 2796): "APP_IPHONE_67",
    (2796, 1290): "APP_IPHONE_67",
}

# Filename prefix preference when multiple files target the same display type.
PREFIX_TO_DISPLAY_TYPE: dict[str, str] = {
    "iphone-67": "APP_IPHONE_65",
    "iphone-65": "APP_IPHONE_65",
    "iphone-69": "APP_IPHONE_69",
}

DISPLAY_TYPE_PRIORITY = {
    "APP_IPHONE_65": ["iphone-67", "iphone-65"],
    "APP_IPHONE_69": ["iphone-69"],
    "APP_IPHONE_67": ["iphone-67"],
}

EDITABLE_VERSION_STATES = {
    "PREPARE_FOR_SUBMISSION",
    "METADATA_REJECTED",
    "DEVELOPER_REJECTED",
    "REJECTED",
    "WAITING_FOR_REVIEW",
    "IN_REVIEW",
    "PENDING_DEVELOPER_RELEASE",
    "PENDING_APPLE_RELEASE",
}


class AppStoreConnectClient:
    def __init__(self, key_id: str, issuer_id: str, private_key_path: Path) -> None:
        self.key_id = key_id
        self.issuer_id = issuer_id
        self.private_key = private_key_path.read_text(encoding="utf-8")

    def _token(self) -> str:
        now = int(time.time())
        return jwt.encode(
            {
                "iss": self.issuer_id,
                "iat": now,
                "exp": now + 1200,
                "aud": "appstoreconnect-v1",
            },
            self.private_key,
            algorithm="ES256",
            headers={"kid": self.key_id, "typ": "JWT"},
        )

    def request(
        self,
        method: str,
        path: str,
        body: dict[str, Any] | None = None,
    ) -> dict[str, Any] | None:
        url = f"{API_BASE}{path}"
        headers = {
            "Authorization": f"Bearer {self._token()}",
            "Content-Type": "application/json",
        }
        data = None
        if body is not None:
            data = json.dumps(body).encode("utf-8")

        req = request.Request(url, data=data, headers=headers, method=method)
        try:
            with request.urlopen(req, timeout=120) as resp:
                raw = resp.read().decode("utf-8")
                if not raw:
                    return None
                return json.loads(raw)
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"{method} {path} failed ({exc.code}): {detail}") from exc


def png_dimensions(path: Path) -> tuple[int, int]:
    with path.open("rb") as handle:
        handle.read(8)
        while True:
            length_bytes = handle.read(4)
            if len(length_bytes) < 4:
                break
            chunk_len = struct.unpack(">I", length_bytes)[0]
            chunk_type = handle.read(4)
            if chunk_type == b"IHDR":
                width, height = struct.unpack(">II", handle.read(8))
                return width, height
            handle.seek(chunk_len + 4, 1)
    raise ValueError(f"Could not read PNG dimensions for {path}")


def display_type_for_file(path: Path) -> str | None:
    for key, display_type in PREFIX_TO_DISPLAY_TYPE.items():
        if path.name.startswith(f"{key}-"):
            return display_type

    width, height = png_dimensions(path)
    return DIMENSION_TO_DISPLAY_TYPE.get((width, height))


def select_upload_groups(screenshots_dir: Path) -> dict[str, list[Path]]:
    files = sorted(screenshots_dir.glob("*.png"))
    if not files:
        raise RuntimeError(f"No PNG screenshots found in {screenshots_dir}")

    grouped: dict[str, list[Path]] = {}
    for file_path in files:
        display_type = display_type_for_file(file_path)
        if not display_type:
            width, height = png_dimensions(file_path)
            print(f"Skipping {file_path.name}: unsupported dimensions {width}x{height}")
            continue
        grouped.setdefault(display_type, []).append(file_path)

    selected: dict[str, list[Path]] = {}
    for display_type, paths in grouped.items():
        prefixes = DISPLAY_TYPE_PRIORITY.get(display_type, [])
        chosen: list[Path] | None = None
        for prefix in prefixes:
            matches = [p for p in paths if p.name.startswith(f"{prefix}-")]
            if matches:
                chosen = sorted(matches)
                break
        selected[display_type] = chosen or sorted(paths)

    return selected


def find_app_id(client: AppStoreConnectClient, bundle_id: str, app_id: str | None) -> str:
    if app_id:
        return app_id

    response = client.request("GET", f"/v1/apps?filter[bundleId]={bundle_id}&limit=1")
    assert response is not None
    apps = response.get("data", [])
    if not apps:
        raise RuntimeError(f"No App Store Connect app found for bundle ID {bundle_id}")
    return apps[0]["id"]


def find_editable_version_id(client: AppStoreConnectClient, app_id: str) -> str:
    response = client.request(
        "GET",
        f"/v1/apps/{app_id}/appStoreVersions?filter[platform]=IOS&limit=20",
    )
    assert response is not None
    versions = response.get("data", [])
    if not versions:
        raise RuntimeError("No iOS app store versions found for this app")

    for state in [
        "PREPARE_FOR_SUBMISSION",
        "METADATA_REJECTED",
        "DEVELOPER_REJECTED",
        "REJECTED",
        "WAITING_FOR_REVIEW",
    ]:
        for version in versions:
            if version.get("attributes", {}).get("appStoreState") == state:
                version_string = version["attributes"].get("versionString", "?")
                print(f"Using app store version {version_string} ({state})")
                return version["id"]

    for version in versions:
        state = version.get("attributes", {}).get("appStoreState", "")
        if state in EDITABLE_VERSION_STATES:
            version_string = version["attributes"].get("versionString", "?")
            print(f"Using app store version {version_string} ({state})")
            return version["id"]

    latest = versions[0]
    version_string = latest["attributes"].get("versionString", "?")
    state = latest["attributes"].get("appStoreState", "UNKNOWN")
    print(f"Using latest app store version {version_string} ({state})")
    return latest["id"]


def find_or_create_localization(
    client: AppStoreConnectClient,
    version_id: str,
    locale: str,
) -> str:
    response = client.request(
        "GET",
        f"/v1/appStoreVersions/{version_id}/appStoreVersionLocalizations?limit=50",
    )
    assert response is not None
    localizations = response.get("data", [])
    for loc in localizations:
        if loc.get("attributes", {}).get("locale") == locale:
            return loc["id"]

    if localizations:
        fallback = localizations[0]
        fallback_locale = fallback.get("attributes", {}).get("locale", "unknown")
        print(f"Locale {locale} not found; using existing localization {fallback_locale}")
        return fallback["id"]

    body = {
        "data": {
            "type": "appStoreVersionLocalizations",
            "attributes": {"locale": locale},
            "relationships": {
                "appStoreVersion": {
                    "data": {"type": "appStoreVersions", "id": version_id},
                },
            },
        },
    }
    created = client.request("POST", "/v1/appStoreVersionLocalizations", body)
    assert created is not None
    print(f"Created localization {locale}")
    return created["data"]["id"]


def find_or_create_screenshot_set(
    client: AppStoreConnectClient,
    localization_id: str,
    display_type: str,
) -> str:
    response = client.request(
        "GET",
        f"/v1/appStoreVersionLocalizations/{localization_id}/appScreenshotSets?limit=50",
    )
    assert response is not None
    for screenshot_set in response.get("data", []):
        if screenshot_set.get("attributes", {}).get("screenshotDisplayType") == display_type:
            return screenshot_set["id"]

    body = {
        "data": {
            "type": "appScreenshotSets",
            "attributes": {"screenshotDisplayType": display_type},
            "relationships": {
                "appStoreVersionLocalization": {
                    "data": {
                        "type": "appStoreVersionLocalizations",
                        "id": localization_id,
                    },
                },
            },
        },
    }
    try:
        created = client.request("POST", "/v1/appScreenshotSets", body)
    except RuntimeError as exc:
        if display_type == "APP_IPHONE_69" and "APP_IPHONE_69" in str(exc):
            print("APP_IPHONE_69 unavailable; falling back to APP_IPHONE_67")
            return find_or_create_screenshot_set(client, localization_id, "APP_IPHONE_67")
        raise
    assert created is not None
    print(f"Created screenshot set {display_type}")
    return created["data"]["id"]


def clear_screenshot_set(client: AppStoreConnectClient, set_id: str) -> None:
    response = client.request("GET", f"/v1/appScreenshotSets/{set_id}/appScreenshots?limit=50")
    assert response is not None
    for screenshot in response.get("data", []):
        screenshot_id = screenshot["id"]
        client.request("DELETE", f"/v1/appScreenshots/{screenshot_id}")
        print(f"Deleted existing screenshot {screenshot_id}")


def upload_screenshot(client: AppStoreConnectClient, set_id: str, file_path: Path) -> None:
    data = file_path.read_bytes()
    checksum = hashlib.md5(data).hexdigest()
    body = {
        "data": {
            "type": "appScreenshots",
            "attributes": {
                "fileName": file_path.name,
                "fileSize": len(data),
            },
            "relationships": {
                "appScreenshotSet": {
                    "data": {"type": "appScreenshotSets", "id": set_id},
                },
            },
        },
    }
    reserved = client.request("POST", "/v1/appScreenshots", body)
    assert reserved is not None
    screenshot_id = reserved["data"]["id"]
    operations = reserved["data"]["attributes"].get("uploadOperations", [])

    for operation in operations:
        offset = int(operation["offset"])
        length = int(operation["length"])
        chunk = data[offset : offset + length]
        upload_req = request.Request(
            operation["url"],
            data=chunk,
            method=operation.get("method", "PUT"),
        )
        for header in operation.get("requestHeaders", []):
            upload_req.add_header(header["name"], header["value"])
        try:
            with request.urlopen(upload_req, timeout=300):
                pass
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Screenshot binary upload failed: {detail}") from exc

    patch_body = {
        "data": {
            "type": "appScreenshots",
            "id": screenshot_id,
            "attributes": {
                "uploaded": True,
                "sourceFileChecksum": checksum,
            },
        },
    }
    client.request("PATCH", f"/v1/appScreenshots/{screenshot_id}", patch_body)
    width, height = png_dimensions(file_path)
    print(f"Uploaded {file_path.name} ({width}x{height})")


def main() -> int:
    parser = argparse.ArgumentParser(description="Upload App Store screenshots to App Store Connect")
    parser.add_argument("--screenshots-dir", required=True, type=Path)
    parser.add_argument("--bundle-id", default="com.weirhere.mobile")
    parser.add_argument("--app-id", default=None, help="Optional App Store Connect app ID")
    parser.add_argument("--locale", default="en-US")
    parser.add_argument("--key-id", required=True)
    parser.add_argument("--issuer-id", required=True)
    parser.add_argument("--private-key-path", required=True, type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    groups = select_upload_groups(args.screenshots_dir)
    if not groups:
        raise RuntimeError("No uploadable screenshots after filtering by size/prefix")

    print("Screenshot upload plan:")
    for display_type, files in groups.items():
        print(f"  {display_type}: {[f.name for f in files]}")

    if args.dry_run:
        print("Dry run complete.")
        return 0

    client = AppStoreConnectClient(args.key_id, args.issuer_id, args.private_key_path)
    app_id = find_app_id(client, args.bundle_id, args.app_id)
    version_id = find_editable_version_id(client, app_id)
    localization_id = find_or_create_localization(client, version_id, args.locale)

    for display_type, files in groups.items():
        set_id = find_or_create_screenshot_set(client, localization_id, display_type)
        clear_screenshot_set(client, set_id)
        for file_path in files:
            upload_screenshot(client, set_id, file_path)

    print("All screenshots uploaded to App Store Connect.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # pragma: no cover
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
