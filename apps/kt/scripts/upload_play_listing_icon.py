"""Upload Weir Here high-res icon + feature graphic to Play Console listing."""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ["https://www.googleapis.com/auth/androidpublisher"]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--package", default="com.weirhere.mobile")
    parser.add_argument("--icon", required=True, type=Path)
    parser.add_argument("--feature-graphic", type=Path, default=None)
    parser.add_argument("--language", default="en-US")
    parser.add_argument("--json-key", default=os.environ.get("PLAY_STORE_JSON_KEY", ""))
    args = parser.parse_args()

    if not args.icon.exists():
        print(f"Missing icon: {args.icon}", file=sys.stderr)
        return 1

    key_raw = args.json_key.strip()
    if not key_raw:
        print("PLAY_STORE_JSON_KEY is required", file=sys.stderr)
        return 1
    info = json.loads(key_raw)
    creds = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
    service = build("androidpublisher", "v3", credentials=creds, cache_discovery=False)

    edit = service.edits().insert(body={}, packageName=args.package).execute()
    edit_id = edit["id"]
    print(f"Opened edit {edit_id}")

    try:
        media = MediaFileUpload(str(args.icon), mimetype="image/png", resumable=True)
        service.edits().images().upload(
            packageName=args.package,
            editId=edit_id,
            language=args.language,
            imageType="icon",
            media_body=media,
        ).execute()
        print(f"Uploaded listing icon ({args.language})")

        if args.feature_graphic and args.feature_graphic.exists():
            fg = MediaFileUpload(str(args.feature_graphic), mimetype="image/png", resumable=True)
            service.edits().images().upload(
                packageName=args.package,
                editId=edit_id,
                language=args.language,
                imageType="featureGraphic",
                media_body=fg,
            ).execute()
            print(f"Uploaded feature graphic ({args.language})")

        service.edits().commit(packageName=args.package, editId=edit_id).execute()
        print("Committed Play listing image edit")
    except Exception:
        try:
            service.edits().delete(packageName=args.package, editId=edit_id).execute()
        except Exception:
            pass
        raise

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
