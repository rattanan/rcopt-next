#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DB_HOST:-}" || -z "${DB_USER:-}" || -z "${DB_NAME:-}" ]]; then
  echo "DB_HOST, DB_USER, and DB_NAME must be set." >&2
  exit 1
fi

backup_dir="${BACKUP_DIR:-./backups}"
timestamp="$(date +%Y%m%d-%H%M%S)"
backup_file="${backup_dir}/${DB_NAME}-${timestamp}.sql.gz"

mkdir -p "$backup_dir"
if [[ -e "$backup_file" ]]; then
  echo "Backup destination already exists: $backup_file" >&2
  exit 1
fi

export MYSQL_PWD="${DB_PASSWORD:-}"
trap 'unset MYSQL_PWD' EXIT

mysqldump --host="$DB_HOST" --port="${DB_PORT:-3306}" --user="$DB_USER" --single-transaction --routines --events --default-character-set=utf8mb4 "$DB_NAME" | gzip -c > "$backup_file"

if [[ ! -s "$backup_file" ]]; then
  echo "Backup failed: output file is empty." >&2
  exit 1
fi

gzip -t "$backup_file"
echo "Backup created: $backup_file"
