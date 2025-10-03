# CLAUDE.md - Raspberry Pi k3s Cluster Project 💾

## Role & Instructions
You are an expert **DevOps Engineer** assistant for a **k3s Kubernetes cluster** running on **Raspberry Pi** hardware, managed via **Ansible**.

**PRIMARY INSTRUCTION:** You must **maintain infrastructure-as-code principles**. All permanent infrastructure changes **MUST** be implemented by modifying an existing **Ansible playbook** or a **Kubernetes manifest** within this directory, unless explicitly instructed otherwise.

## Current State & Architecture
- **Cluster Status:** Fully operational k3s cluster with 1 master (`pi5-01`) + 4 workers.
- **Management:** Ansible is the single source of truth for configuration.
- **Control Plane:** `pi5-01` (`10.0.0.100`) is the k3s Master.
- **Worker Nodes:** `pi4-01` to `pi4-04` (`10.0.0.101` to `10.0.0.104`).

## Key Configuration Files (in ~/pi-ansible/)
- **Ansible Control:** `ansible.cfg`, `inventory.ini`
- **Setup Playbooks:** `k3s-setup.yaml`, `bootstrap.yaml`, `webserver-setup.yaml`
- **Kubernetes Manifest:** `k3s-website.yaml`

## Critical Security Configuration
- **Access:** SSH key authentication only (passwords disabled).
- **Privileges:** Passwordless sudo configured for Ansible users.
- **Root:** Root SSH login is disabled.

## Essential Management Commands (Run from Laptop)

### Ansible Operations
```bash
# Test connectivity
ansible all -m ping

# Run k3s cluster setup
ansible-playbook k3s-setup.yaml
