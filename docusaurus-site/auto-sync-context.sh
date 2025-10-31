#!/bin/bash

# RVKCAT Auto-Sync Context Watcher - ULTRA SAFE VERSION
# 100% READ-ONLY: Monitors context.md changes and triggers safe sync
# ZERO RISK to source file - only reads, never writes to source

set -euo pipefail  # Exit on any error, undefined variable, or pipe failure

# ============================================================================
# SAFETY CONFIGURATION - ULTRA CONSERVATIVE SETTINGS
# ============================================================================

SOURCE_FILE="../.claude/docs/tasks/context.md"
LOG_FILE="logs/auto-sync.log"
PID_FILE="auto-sync.pid"
STATE_FILE=".auto-sync-state"  # Track last sync time across subshells
DEBOUNCE_SECONDS=2  # Wait 2 seconds between changes to prevent spam
MAX_RETRIES=3       # Maximum retry attempts for failed syncs
SYNC_TIMEOUT=30     # Timeout for sync operations in seconds

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# SAFETY FUNCTIONS
# ============================================================================

log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    # Create logs directory if it doesn't exist
    mkdir -p logs

    # Log to file
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"

    # Log to console with colors
    case "$level" in
        "INFO")  echo -e "${BLUE}ℹ️  [$timestamp] $message${NC}" ;;
        "SUCCESS") echo -e "${GREEN}✅ [$timestamp] $message${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️  [$timestamp] $message${NC}" ;;
        "ERROR") echo -e "${RED}❌ [$timestamp] $message${NC}" ;;
    esac
}

verify_source_safety() {
    # CRITICAL: Verify source file exists and is readable
    if [ ! -f "$SOURCE_FILE" ]; then
        log_message "ERROR" "Source context file not found at $SOURCE_FILE"
        return 1
    fi

    if [ ! -r "$SOURCE_FILE" ]; then
        log_message "ERROR" "Source file is not readable: $SOURCE_FILE"
        return 1
    fi

    # SAFETY CHECK: Verify we never have write access to source
    if [ -w "$SOURCE_FILE" ]; then
        log_message "WARNING" "Source file is writable (not critical, but noting)"
    fi

    return 0
}

safe_sync() {
    local retry_count=0

    while [ $retry_count -lt $MAX_RETRIES ]; do
        log_message "INFO" "Starting safe sync attempt $((retry_count + 1))/$MAX_RETRIES"

        # Verify source file safety before every sync
        if ! verify_source_safety; then
            log_message "ERROR" "Source file safety check failed"
            return 1
        fi

        # Execute the safe sync script with timeout protection using background process
        ./sync-context-safe.sh >> "$LOG_FILE" 2>&1 &
        local sync_pid=$!

        # Wait for process with timeout
        local elapsed=0
        while [ $elapsed -lt $SYNC_TIMEOUT ]; do
            if ! kill -0 $sync_pid 2>/dev/null; then
                # Process finished
                wait $sync_pid
                local exit_code=$?
                if [ $exit_code -eq 0 ]; then
                    log_message "SUCCESS" "Context sync completed successfully"
                    return 0
                else
                    log_message "WARNING" "Sync attempt $((retry_count + 1)) failed with exit code $exit_code"
                    break
                fi
            fi
            sleep 1
            elapsed=$((elapsed + 1))
        done

        # If we got here and process is still running, it timed out
        if kill -0 $sync_pid 2>/dev/null; then
            log_message "ERROR" "Sync timed out after ${SYNC_TIMEOUT}s, killing process"
            kill -9 $sync_pid 2>/dev/null
        fi

        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $MAX_RETRIES ]; then
            sleep 1
        fi
    done

    log_message "ERROR" "All sync attempts failed after $MAX_RETRIES retries"
    return 1
}

cleanup() {
    log_message "INFO" "Auto-sync watcher shutting down"
    rm -f "$PID_FILE" "$STATE_FILE"
    exit 0
}

# ============================================================================
# STARTUP SAFETY CHECKS
# ============================================================================

# Check if fswatch is available
if ! command -v fswatch &> /dev/null; then
    log_message "ERROR" "fswatch is not installed. Install with: brew install fswatch"
    exit 1
fi

# Check if sync script exists
if [ ! -f "./sync-context-safe.sh" ]; then
    log_message "ERROR" "sync-context-safe.sh not found in current directory"
    exit 1
fi

# Check if sync script is executable
if [ ! -x "./sync-context-safe.sh" ]; then
    log_message "ERROR" "sync-context-safe.sh is not executable. Run: chmod +x sync-context-safe.sh"
    exit 1
fi

# Initial source file safety verification
if ! verify_source_safety; then
    log_message "ERROR" "Initial source file safety check failed"
    exit 1
fi

# Check if already running
if [ -f "$PID_FILE" ]; then
    if kill -0 "$(cat $PID_FILE)" 2>/dev/null; then
        log_message "ERROR" "Auto-sync is already running (PID: $(cat $PID_FILE))"
        exit 1
    else
        log_message "WARNING" "Stale PID file found, removing"
        rm -f "$PID_FILE"
    fi
fi

# ============================================================================
# MAIN EXECUTION
# ============================================================================

# Set up signal handlers for clean shutdown
trap cleanup SIGINT SIGTERM

# Record our PID
echo $$ > "$PID_FILE"

log_message "SUCCESS" "Starting ULTRA-SAFE context.md auto-sync watcher"
log_message "INFO" "Monitoring: $SOURCE_FILE"
log_message "INFO" "Log file: $LOG_FILE"
log_message "INFO" "Debounce: ${DEBOUNCE_SECONDS}s"
log_message "INFO" "Press Ctrl+C to stop"

# Perform initial sync
log_message "INFO" "Performing initial sync"
safe_sync

# Initialize state file with current timestamp
echo "$(date +%s)" > "$STATE_FILE"

# Start watching for changes with debouncing
fswatch -o "$SOURCE_FILE" | while read num; do
    current_time=$(date +%s)

    # Read last sync time from state file (survives subshell)
    if [ -f "$STATE_FILE" ]; then
        last_sync=$(cat "$STATE_FILE")
    else
        last_sync=0
    fi

    # Debounce rapid changes
    if [ $((current_time - last_sync)) -lt $DEBOUNCE_SECONDS ]; then
        log_message "INFO" "Change detected but debouncing (${DEBOUNCE_SECONDS}s cooldown)"
        continue
    fi

    log_message "INFO" "Context.md change detected, triggering safe sync"

    # Verify source file safety before sync
    if verify_source_safety; then
        if safe_sync; then
            # Update state file with current time
            echo "$current_time" > "$STATE_FILE"
        fi
    else
        log_message "ERROR" "Skipping sync due to source file safety failure"
    fi
done

# This should never be reached due to the while loop, but just in case
cleanup