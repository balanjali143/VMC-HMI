# VMC Operator HMI

A responsive full-stack Human-Machine Interface (HMI) for a VMC machine operator.

## Project Overview

This application guides the machine operator through the complete machine startup and operation workflow.

The operator must complete each step before proceeding to the next stage.

## Workflow

1. Machine Power ON
2. Machine Checks
3. Tool Loading
4. Workpiece Setup
5. Machine Ready
6. Operation Start / Stop

## Features

- Machine power ON/OFF control
- Machine safety and readiness checks
- Tool confirmation
- Workpiece setup confirmation
- Step-by-step workflow navigation
- Ready-state validation
- CNC operation START/STOP controls
- Responsive operator interface
- Backend API integration

## Technology Stack

- Java
- Spring Boot
- HTML5
- CSS3
- JavaScript
- REST API
- Maven

## Application Flow

```text
POWER ON
   ↓
MACHINE CHECKS
   ↓
TOOLS
   ↓
WORKPIECE
   ↓
READY
   ↓
OPERATION
   ↓
START / STOP
