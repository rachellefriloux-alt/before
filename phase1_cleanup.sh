#!/bin/bash

# Phase 1: Safe Deletions Script
# Implements the cleanup strategy outlined in the repository audit

set -e

PROJECT_ROOT="/home/runner/work/Sallie-AI/Sallie-AI"
ARCHIVE_DIR="/tmp/sallie_phase1_archive_$(date +'%Y%m%d_%H%M%S')"
LOG_FILE="/tmp/phase1_cleanup.log"

echo "=== SALLIE AI PHASE 1 CLEANUP ===" | tee "$LOG_FILE"
echo "Project Root: $PROJECT_ROOT" | tee -a "$LOG_FILE"
echo "Archive Dir: $ARCHIVE_DIR" | tee -a "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Create archive directory
mkdir -p "$ARCHIVE_DIR"

cleanup_count=0

# Function to safely archive and remove files
archive_and_remove() {
    local pattern="$1"
    local description="$2"
    
    echo "=== $description ===" | tee -a "$LOG_FILE"
    
    # Create temporary file list to avoid pipeline issues
    local temp_list="/tmp/cleanup_list_$$"
    find "$PROJECT_ROOT" -name "$pattern" -type f > "$temp_list" 2>/dev/null || true
    
    if [ ! -s "$temp_list" ]; then
        echo "No files found matching: $pattern" | tee -a "$LOG_FILE"
        rm -f "$temp_list"
        return
    fi
    
    local count=$(wc -l < "$temp_list")
    echo "Found $count files matching: $pattern" | tee -a "$LOG_FILE"
    
    # Archive files
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            # Create relative path for archive
            local rel_path="${file#$PROJECT_ROOT/}"
            local archive_file="$ARCHIVE_DIR/$rel_path"
            local archive_dir=$(dirname "$archive_file")
            
            mkdir -p "$archive_dir"
            cp "$file" "$archive_file"
            
            # Remove original
            rm -f "$file"
            echo "Archived and removed: $rel_path" | tee -a "$LOG_FILE"
            cleanup_count=$((cleanup_count + 1))
        fi
    done < "$temp_list"
    
    rm -f "$temp_list"
}

# Function to archive and remove directories
archive_and_remove_dir() {
    local dir_name="$1"
    local description="$2"
    
    echo "=== $description ===" | tee -a "$LOG_FILE"
    
    # Create temporary file list
    local temp_list="/tmp/cleanup_dirs_$$"
    find "$PROJECT_ROOT" -name "$dir_name" -type d > "$temp_list" 2>/dev/null || true
    
    if [ ! -s "$temp_list" ]; then
        echo "No directories found matching: $dir_name" | tee -a "$LOG_FILE"
        rm -f "$temp_list"
        return
    fi
    
    local count=$(wc -l < "$temp_list")
    echo "Found $count directories matching: $dir_name" | tee -a "$LOG_FILE"
    
    while IFS= read -r dir; do
        if [ -d "$dir" ]; then
            # Create relative path for archive
            local rel_path="${dir#$PROJECT_ROOT/}"
            local archive_dir_path="$ARCHIVE_DIR/$rel_path"
            
            mkdir -p "$(dirname "$archive_dir_path")"
            cp -r "$dir" "$archive_dir_path"
            
            # Remove original
            rm -rf "$dir"
            echo "Archived and removed directory: $rel_path" | tee -a "$LOG_FILE"
            cleanup_count=$((cleanup_count + 1))
        fi
    done < "$temp_list"
    
    rm -f "$temp_list"
}

# 1. Merge artifacts with __from__ patterns (255 files)
archive_and_remove "*__from__*" "Merge Artifacts with __from__ Patterns"

# 2. Backup files
archive_and_remove "*.backup" "Backup Files"

# 3. Log files from build processes
archive_and_remove "*.log" "Log Files"

# 4. Specific merge and build artifacts
echo "=== Specific Build and Merge Artifacts ===" | tee -a "$LOG_FILE"
specific_files=(
    "merge_plan.json"
    "MERGE_MANIFEST.json"
    "merge_status.txt"
    "MERGE_SUMMARY.md"
    "merge_unmerged.txt"
    "dedupe_report.json"
    "java_pid*.hprof"
)

for pattern in "${specific_files[@]}"; do
    archive_and_remove "$pattern" "Specific artifact: $pattern"
done

# 5. Build artifact directories
echo "=== Build Artifact Directories ===" | tee -a "$LOG_FILE"
build_dirs=(
    "node_modules"
    ".gradle"
    "build"
    "dist"
)

for dir_name in "${build_dirs[@]}"; do
    archive_and_remove_dir "$dir_name" "Build artifacts: $dir_name"
done

# 6. Excessive launcher icons (keep only core variants)
echo "=== Launcher Icon Cleanup ===" | tee -a "$LOG_FILE"

# First, let's identify core launcher icons to preserve
core_icons=("ic_launcher.xml" "ic_launcher_round.xml" "ic_launcher_background.xml" "ic_launcher_creative_vision.xml" "ic_launcher_mom.xml")

echo "Preserving core launcher icons:" | tee -a "$LOG_FILE"
for icon in "${core_icons[@]}"; do
    if [ -f "$PROJECT_ROOT/$icon" ]; then
        echo "  Keeping: $icon" | tee -a "$LOG_FILE"
    fi
done

# Find all launcher icons except core ones
temp_icons="/tmp/launcher_icons_$$"
find "$PROJECT_ROOT" -name "ic_launcher*.xml" -type f > "$temp_icons" 2>/dev/null || true

if [ -s "$temp_icons" ]; then
    while IFS= read -r icon_file; do
        icon_name=$(basename "$icon_file")
        
        # Check if this icon is in our core list
        is_core=false
        for core_icon in "${core_icons[@]}"; do
            if [ "$icon_name" = "$core_icon" ]; then
                is_core=true
                break
            fi
        done
        
        # If not core, archive and remove it
        if [ "$is_core" = false ]; then
            rel_path="${icon_file#$PROJECT_ROOT/}"
            archive_file="$ARCHIVE_DIR/$rel_path"
            archive_dir=$(dirname "$archive_file")
            
            mkdir -p "$archive_dir"
            cp "$icon_file" "$archive_file"
            rm -f "$icon_file"
            
            echo "Archived excess launcher icon: $rel_path" | tee -a "$LOG_FILE"
            cleanup_count=$((cleanup_count + 1))
        fi
    done < "$temp_icons"
fi

rm -f "$temp_icons"

# 7. Archive some one-time PowerShell scripts (but don't remove entirely as they may be needed for reference)
echo "=== Archiving One-Time PowerShell Scripts ===" | tee -a "$LOG_FILE"
onetime_scripts=(
    "execute_merge.ps1"
    "generate_icons.ps1"
    "generate_merge_preview.ps1"
    "merge_sallie.ps1"
    "run_merge_one_shot.ps1"
    "verify_merge.ps1"
    "sallie_archive_and_dedupe.ps1"
    "sallie_dedupe.ps1"
)

for script in "${onetime_scripts[@]}"; do
    if [ -f "$PROJECT_ROOT/$script" ]; then
        local archive_file="$ARCHIVE_DIR/$script"
        cp "$PROJECT_ROOT/$script" "$archive_file"
        rm -f "$PROJECT_ROOT/$script"
        echo "Archived one-time script: $script" | tee -a "$LOG_FILE"
        ((cleanup_count++))
    fi
done

# Create tar.gz archive for easy restoration
echo "" | tee -a "$LOG_FILE"
echo "=== Creating Compressed Archive ===" | tee -a "$LOG_FILE"
cd "$(dirname "$ARCHIVE_DIR")"
archive_name="sallie_phase1_archive_$(date +'%Y%m%d_%H%M%S').tar.gz"
tar -czf "/tmp/$archive_name" "$(basename "$ARCHIVE_DIR")"
echo "Created compressed archive: /tmp/$archive_name" | tee -a "$LOG_FILE"

# Clean up temporary directory
rm -rf "$ARCHIVE_DIR"

echo "" | tee -a "$LOG_FILE"
echo "=== PHASE 1 CLEANUP COMPLETE ===" | tee -a "$LOG_FILE"
echo "Files processed: $cleanup_count" | tee -a "$LOG_FILE"
echo "Archive created: /tmp/$archive_name" | tee -a "$LOG_FILE"
echo "Completed: $(date)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Next steps:" | tee -a "$LOG_FILE"
echo "1. Verify project builds: npm install && npm run build (if applicable)" | tee -a "$LOG_FILE"
echo "2. Test core functionality" | tee -a "$LOG_FILE"
echo "3. If issues found, restore from: /tmp/$archive_name" | tee -a "$LOG_FILE"

echo ""
echo "Cleanup completed successfully!"
echo "Log file: $LOG_FILE"
echo "Archive: /tmp/$archive_name"