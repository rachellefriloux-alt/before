#!/bin/bash

# Sallie Docker Management Script
# Usage: ./docker.sh [command]

set -e

PROJECT_NAME="sallie"
COMPOSE_FILE="docker-compose.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
check_env() {
    if [ ! -f ".env" ]; then
        log_warning ".env file not found. Copying from .env.docker..."
        cp .env.docker .env
        log_error "Please edit .env file with your actual configuration values before proceeding."
        exit 1
    fi
}

# Build Docker images
build() {
    log_info "Building Sallie Docker images..."
    docker-compose -f $COMPOSE_FILE build
    log_success "Build completed successfully!"
}

# Start production environment
start() {
    check_env
    log_info "Starting Sallie in production mode..."
    docker-compose -f $COMPOSE_FILE up -d
    log_success "Sallie is now running!"
    log_info "Access the application at: http://localhost:5000"
}

# Start development environment
dev() {
    check_env
    log_info "Starting Sallie in development mode..."
    docker-compose -f $COMPOSE_FILE --profile dev up -d
    log_success "Sallie development environment is now running!"
    log_info "Frontend: http://localhost:3000"
    log_info "Backend API: http://localhost:5001"
}

# Stop all services
stop() {
    log_info "Stopping all Sallie services..."
    docker-compose -f $COMPOSE_FILE down
    log_success "All services stopped."
}

# View logs
logs() {
    if [ -n "$2" ]; then
        docker-compose -f $COMPOSE_FILE logs -f $2
    else
        docker-compose -f $COMPOSE_FILE logs -f
    fi
}

# Restart services
restart() {
    stop
    sleep 2
    start
}

# Clean up Docker resources
clean() {
    log_warning "This will remove all Docker images, containers, and volumes for Sallie."
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cleaning up Docker resources..."
        docker-compose -f $COMPOSE_FILE down -v --rmi all
        docker system prune -f
        log_success "Cleanup completed."
    fi
}

# Show status
status() {
    log_info "Sallie Docker Status:"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    log_info "Docker Images:"
    docker images | grep sallie
    echo ""
    log_info "Docker Volumes:"
    docker volume ls | grep sallie
}

# Execute command in running container
exec() {
    if [ -z "$2" ]; then
        log_error "Please specify a command to execute."
        exit 1
    fi
    docker-compose -f $COMPOSE_FILE exec sallie $2
}

# Show help
help() {
    echo "Sallie Docker Management Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  build     Build Docker images"
    echo "  start     Start production environment"
    echo "  dev       Start development environment"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  logs      Show logs (add service name for specific logs)"
    echo "  status    Show status of all services"
    echo "  exec      Execute command in running container"
    echo "  clean     Clean up Docker resources (WARNING: destructive)"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start          # Start production"
    echo "  $0 dev            # Start development"
    echo "  $0 logs sallie    # Show sallie logs"
    echo "  $0 exec bash      # Open bash in container"
}

# Main command handling
case "${1:-help}" in
    build)
        build
        ;;
    start)
        start
        ;;
    dev)
        dev
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs "$@"
        ;;
    status)
        status
        ;;
    exec)
        exec "$@"
        ;;
    clean)
        clean
        ;;
    help|*)
        help
        ;;
esac
