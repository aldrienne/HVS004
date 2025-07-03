# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HVS004** is a NetSuite Account Customization Project (ACP) implementing an **Approval Management System**. The system provides:

- Multi-tiered approval workflows for transactions
- Delegate approver management with date-based activations
- Threshold-based approval routing (company-wide and department-specific)
- Email notifications for pending approvals
- Administrative interface for configuration management

## Architecture & Data Model

### Core Components

The system is built around four main custom records that form the approval management backbone:

1. **Approval History** (`customrecord_tsc_approval_history`) - Tracks all approval actions
2. **Approval Thresholds** (`customrecord_tsc_approval_thresholds`) - Defines approval limits by tier
3. **Approver Config** (`customrecord_tsc_approver_config`) - Maps approvers to roles/departments
4. **Delegate Approvers** (`customrecord_tsc_delegate_approvers`) - Manages temporary delegations

### Constants Module Pattern

All custom field and record IDs are centralized in `src/FileCabinet/SuiteScripts/HVS004/core/tsc_cm_constants.js`. This module exports:
- `CUSTOM_RECORDS` - Record type IDs and field mappings
- `CUSTOM_BODY_FIELDS` - Transaction-level custom fields
- `CUSTOM_LISTS` - Custom list IDs and values
- Utility functions for field lookups

**Always reference this constants module** rather than hardcoding IDs throughout scripts.

### Script Organization

Scripts are organized into functional modules:
- `core/` - Shared constants and workflow actions
- `admin_configuration/` - Administrative interfaces and batch processes
- `email/` - Notification systems
- `delegate/` - Delegation management (empty but reserved)

## Development Commands

### SuiteCloud CLI Commands

```bash
# Deploy to sandbox (default auth: HVS_SB1)
suitecloud project:deploy

# Deploy specific objects
suitecloud object:import

# Validate project
suitecloud project:validate

# Compare environments
suitecloud object:list
```

### Authentication Setup
Default authentication ID is `HVS_SB1` (configured in project.json). Ensure this points to your sandbox environment.

## Naming Conventions

**Critical**: All custom components use the `tsc_` prefix:
- Scripts: `customscript_tsc_*`
- Records: `customrecord_tsc_*` 
- Fields: `custbody_tsc_*`, `custrecord_tsc_*`
- Lists: `customlist_tsc_*`

## Script Development Patterns

### Module Definition (SuiteScript 2.x)
```javascript
define(['N/module1', 'N/module2', '../core/tsc_cm_constants'], 
    (module1, module2, TSCCONST) => {
        // Always import constants module for field/record IDs
    }
);
```

### Workflow Actions
Custom workflow actions are located in `core/` and follow the pattern:
- `tsc_wa_retrieve_*` - Data retrieval actions
- Use constants module for all field references
- Return structured data for workflow consumption

### Map/Reduce Scripts
- `tsc_mr_align_approvers_orders.js` - Bulk approver assignment
- `tsc_mr_email_approvers.js` - Notification processing
- Follow NetSuite governance limits in processing

### Administrative Interface
The main admin interface (`tsc_sl_hvs004_admin_configuration.js`) provides:
- Tab-based configuration (Approvers, Delegates, Thresholds)
- Sublist-based data entry
- Client-side validation via companion client script

## Key Integration Points

### Transaction-Level Fields
Approval flow tracking uses these custom body fields:
- `custbody_tsc_approval_flow` - Current approval status
- `custbody_tsc_approval_level` - Current approval tier
- `custbody_tsc_assigned_delegate_approv` - Active delegate
- `custbody_tsc_is_delegate_active` - Delegation status flag

### Workflow Integration
Main workflow: `customworkflow_tsc_wf_approval_process`
- Triggered on transaction events
- Uses workflow actions in `core/` for approver determination
- Updates approval history throughout process

### Search Integration
Key saved searches:
- `customsearch_tsc_pending_approvals` - Dashboard integration
- `customsearch_tsc_pending_email_approvals` - Email notifications

## Required NetSuite Features
- CUSTOMRECORDS (required)
- DEPARTMENTS (required)
- Additional features: MULTILANGUAGE, EXPREPORTS, ADVRECEIVING, etc. (optional)