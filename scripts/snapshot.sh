#!/bin/bash

# Smart Universe Task Flow - Automatic Snapshot System
# This script creates automatic snapshots for every code change

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="SmartUniit Task Flow"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
BRANCH=$(git branch --show-current)

# Function to print colored output
print_status() {
    echo -e "${GREEN}[SNAPSHOT]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Function to check if there are changes to commit
has_changes() {
    if git diff-index --quiet HEAD --; then
        return 1 # No changes
    else
        return 0 # Has changes
    fi
}

# Function to get list of changed files
get_changed_files() {
    git diff --name-only HEAD
}

# Function to get a summary of changes
get_changes_summary() {
    local summary=""
    
    # Count different types of changes
    local added=$(git diff --name-only --diff-filter=A HEAD 2>/dev/null | wc -l)
    local modified=$(git diff --name-only --diff-filter=M HEAD 2>/dev/null | wc -l)
    local deleted=$(git diff --name-only --diff-filter=D HEAD 2>/dev/null | wc -l)
    
    if [ "$added" -gt 0 ]; then
        summary="${summary}${added} added"
    fi
    
    if [ "$modified" -gt 0 ]; then
        if [ -n "$summary" ]; then
            summary="${summary}, "
        fi
        summary="${summary}${modified} modified"
    fi
    
    if [ "$deleted" -gt 0 ]; then
        if [ -n "$summary" ]; then
            summary="${summary}, "
        fi
        summary="${summary}${deleted} deleted"
    fi
    
    echo "$summary"
}

# Function to create a descriptive commit message
create_commit_message() {
    local changed_files=$(get_changed_files)
    local changes_summary=$(get_changes_summary)
    
    # Get the most significant changes (focus on main directories)
    local significant_changes=""
    
    if echo "$changed_files" | grep -q "src/"; then
        significant_changes="${significant_changes}frontend "
    fi
    
    if echo "$changed_files" | grep -q "server/"; then
        significant_changes="${significant_changes}backend "
    fi
    
    if echo "$changed_files" | grep -q "package.json\|package-lock.json"; then
        significant_changes="${significant_changes}dependencies "
    fi
    
    if echo "$changed_files" | grep -q "vite.config\|tailwind.config\|tsconfig"; then
        significant_changes="${significant_changes}config "
    fi
    
    # Create the commit message
    local message=""
    
    if [ -n "$significant_changes" ]; then
        message="Update ${significant_changes}- ${changes_summary} files changed"
    else
        message="Update - ${changes_summary} files changed"
    fi
    
    # Add timestamp
    message="${message} (${TIMESTAMP})"
    
    echo "$message"
}

# Function to create snapshot
create_snapshot() {
    print_status "Creating automatic snapshot..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository!"
        exit 1
    fi
    
    # Check if there are any changes
    if ! has_changes; then
        print_warning "No changes to commit"
        return 0
    fi
    
    # Get current branch
    local current_branch=$(git branch --show-current)
    print_info "Current branch: $current_branch"
    
    # Stage all changes
    print_status "Staging changes..."
    git add .
    
    # Create commit message
    local commit_message=$(create_commit_message)
    
    # Create the commit
    print_status "Creating commit with message: $commit_message"
    git commit -m "$commit_message"
    
    # Get the commit hash
    local commit_hash=$(git rev-parse --short HEAD)
    
    print_status "Snapshot created successfully!"
    print_info "Commit hash: $commit_hash"
    print_info "Branch: $current_branch"
    print_info "Timestamp: $TIMESTAMP"
    
    # Show recent commits
    echo ""
    print_info "Recent commits:"
    git log --oneline -5
    
    return 0
}

# Function to create manual snapshot with custom message
create_manual_snapshot() {
    local message="$1"
    
    if [ -z "$message" ]; then
        print_error "Please provide a commit message"
        echo "Usage: $0 manual \"Your commit message\""
        exit 1
    fi
    
    print_status "Creating manual snapshot..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository!"
        exit 1
    fi
    
    # Stage all changes
    print_status "Staging changes..."
    git add .
    
    # Create the commit
    print_status "Creating commit with message: $message"
    git commit -m "$message"
    
    # Get the commit hash
    local commit_hash=$(git rev-parse --short HEAD)
    
    print_status "Manual snapshot created successfully!"
    print_info "Commit hash: $commit_hash"
    print_info "Message: $message"
    
    return 0
}

# Function to show snapshot history
show_history() {
    print_status "Snapshot History:"
    echo ""
    git log --oneline --graph --decorate -20
}

# Function to revert to a specific snapshot
revert_to_snapshot() {
    local commit_hash="$1"
    
    if [ -z "$commit_hash" ]; then
        print_error "Please provide a commit hash"
        echo "Usage: $0 revert <commit-hash>"
        exit 1
    fi
    
    print_warning "This will reset your working directory to commit: $commit_hash"
    print_warning "All uncommitted changes will be lost!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Reverting to commit: $commit_hash"
        git reset --hard "$commit_hash"
        print_status "Successfully reverted to commit: $commit_hash"
    else
        print_info "Revert cancelled"
    fi
}

# Function to show current status
show_status() {
    print_status "Current Status:"
    echo ""
    print_info "Branch: $(git branch --show-current)"
    print_info "Last commit: $(git log --oneline -1)"
    echo ""
    
    if has_changes; then
        print_warning "You have uncommitted changes:"
        git status --short
    else
        print_info "Working directory is clean"
    fi
}

# Function to show help
show_help() {
    echo "Smart Universe Task Flow - Snapshot System"
    echo "=========================================="
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  auto                    Create automatic snapshot (default)"
    echo "  manual <message>        Create manual snapshot with custom message"
    echo "  history                 Show snapshot history"
    echo "  revert <commit-hash>    Revert to specific snapshot"
    echo "  status                  Show current status"
    echo "  help                    Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                      # Create automatic snapshot"
    echo "  $0 manual \"Fix PDF generation\"  # Create manual snapshot"
    echo "  $0 history              # Show history"
    echo "  $0 revert faac997       # Revert to specific commit"
    echo "  $0 status               # Show current status"
}

# Main script logic
case "${1:-auto}" in
    "auto")
        create_snapshot
        ;;
    "manual")
        create_manual_snapshot "$2"
        ;;
    "history")
        show_history
        ;;
    "revert")
        revert_to_snapshot "$2"
        ;;
    "status")
        show_status
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac 