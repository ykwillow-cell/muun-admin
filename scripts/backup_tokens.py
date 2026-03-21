import os
import json
import requests
from datetime import datetime

def backup_tokens():
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        print("❌ Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.")
        return

    print("🎨 Fetching design themes from Supabase...")
    
    try:
        # Fetch all design themes
        response = requests.get(
            f"{supabase_url}/rest/v1/design_themes?select=*&order=created_at.asc",
            headers={
                "apikey": supabase_key,
                "Authorization": f"Bearer {supabase_key}",
                "Content-Type": "application/json",
            }
        )
        response.raise_for_status()
        themes = response.json()
        
        print(f"✅ Successfully fetched {len(themes)} themes.")

        # Ensure backup directory exists
        os.makedirs("backups/design-tokens", exist_ok=True)
        os.makedirs("backups/design-tokens/snapshots", exist_ok=True)

        now = datetime.utcnow()
        timestamp = now.strftime("%Y-%m-%dT%H-%M-%S")
        
        # 1. Save Snapshot (Historical)
        snapshot_path = f"backups/design-tokens/snapshots/{timestamp}.json"
        with open(snapshot_path, "w", encoding="utf-8") as f:
            json.dump(themes, f, indent=2, ensure_ascii=False)
        print(f"📸 Snapshot saved: {snapshot_path}")

        # 2. Save Latest (For quick recovery)
        latest_path = "backups/design-tokens/latest.json"
        with open(latest_path, "w", encoding="utf-8") as f:
            json.dump(themes, f, indent=2, ensure_ascii=False)
        print(f"📄 Latest state saved: {latest_path}")

        # 3. Save Active Theme
        active_theme = next((t for t in themes if t.get("is_active")), None)
        if active_theme:
            active_path = "backups/design-tokens/active-theme.json"
            with open(active_path, "w", encoding="utf-8") as f:
                json.dump(active_theme, f, indent=2, ensure_ascii=False)
            print(f"⭐ Active theme saved: {active_path} ({active_theme.get('name')})")

        # 4. Save Metadata
        meta_path = "backups/design-tokens/backup-meta.json"
        meta = {
            "last_backup": now.isoformat() + "Z",
            "total_themes": len(themes),
            "active_theme": active_theme.get("name") if active_theme else None,
            "active_theme_id": active_theme.get("id") if active_theme else None,
            "snapshot_file": snapshot_path
        }
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2, ensure_ascii=False)
        print(f"📋 Metadata updated: {meta_path}")

    except Exception as e:
        print(f"❌ Error during backup: {str(e)}")
        exit(1)

if __name__ == "__main__":
    backup_tokens()
