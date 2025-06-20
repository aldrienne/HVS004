/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * 
 * TSC Constants Module
 * Contains all custom record types, custom lists, and custom fields constants
 * for the TSC Approval Management System
 */

define([], function() {
    
    // Custom Lists
    const CUSTOM_LISTS = {
        APPROVAL_ACTIONS: {
            ID: 'customlist_tsc_approval_actions',
            NAME: 'Approval Actions',
            VALUES: {
                APPROVED: 'val_106610_8172786_sb1_682',
                REJECTED: 'val_106611_8172786_sb1_396'
            }
        },
        CONFIG_TYPES: {
            ID: 'customlist_tsc_config_types',
            NAME: 'Approval Config Types',
            VALUES: {
                COMPANY_ROLE: 'val_106601_8172786_sb1_316',
                DEPARTMENT: 'val_106602_8172786_sb1_885'
            }
        }
    };

    // Custom Body Fields (Transaction Fields)
    const CUSTOM_BODY_FIELDS = {
        APPROVAL_FLOW: 'custbody_tsc_approval_flow',
        APPROVAL_LEVEL: 'custbody_tsc_approval_level',
        ASSIGNED_DELEGATE_APPROVER: 'custbody_tsc_assigned_delegate_approv',
        CREATED_BY: 'custbody_tsc_created_by',
        IS_DELEGATE_ACTIVE: 'custbody_tsc_is_delegate_active'
    };

    // Custom Records
    const CUSTOM_RECORDS = {
        APPROVAL_HISTORY: {
            ID: 'customrecord_tsc_approval_history',
            NAME: 'Approval History',
            FIELDS: {
                TRANSACTION: 'custrecord_tsc_transaction',
                TRANSACTION_TYPE: 'custrecord_tsc_transaction_type',
                ORIGINAL_APPROVER: 'custrecord_tsc_original_approver',
                ACTUAL_APPROVER: 'custrecord_tsc_actual_approver',
                APPROVAL_ACTION: 'custrecord_tsc_approval_action',
                APPROVAL_DATE: 'custrecord_tsc_approval_date',
                AMOUNT: 'custrecord_tsc_amount_action',
                APPROVAL_LEVEL: 'custrecord_tsc_approval_level'
            }
        },
        APPROVAL_THRESHOLDS: {
            ID: 'customrecord_tsc_approval_thresholds',
            NAME: 'Approval Thresholds',
            FIELDS: {
                THRESHOLD_TYPE: 'custrecord_tsc_threshold_type',
                COMPANY_AUTO_APPROVAL_LIMIT: 'custrecord_tsc_comp_auto_approval_limit',
                COO_APPROVAL_LIMIT: 'custrecord_tsc_coo_approval_limit',
                CFO_APPROVAL_LIMIT: 'custrecord_tsc_cfo_approval_limit',
                CEO_APPROVAL_LIMIT: 'custrecord_tsc_ceo_approval_limit',
                DEPT_AUTO_APPROVAL_LIMIT: 'custrecord_tsc_dept_auto_approval_limit',
                TIER_1_APPROVAL_LIMIT: 'custrecord_tsc_tier_1_approval_limit',
                TIER_2_APPROVAL_LIMIT: 'custrecord_tsc_tier_2_approver_limit',
                TIER_3_APPROVAL_LIMIT: 'custrecord_tsc_tier_3_approver_limit'
            }
        },
        APPROVER_CONFIG: {
            ID: 'customrecord_tsc_approver_config',
            NAME: 'Approver Config',
            FIELDS: {
                CONFIG_TYPE: 'custrecordtsc_config_type',
                ROLE_TYPE: 'custrecord_tsc_role_type',
                DEPARTMENT: 'custrecord_tsc_department',
                PRIMARY_APPROVER: 'custrecord_tsc_primary_approver',
                SECONDARY_APPROVER: 'custrecord_tsc_secondary_approver',
                TERTIARY_APPROVER: 'custrecord_tsc_tertiary_approver',
                EFFECTIVE_DATE: 'custrecord_tsc_effective_date',
                END_DATE: 'custrecord_tsc_end_date'
            }
        },
        DELEGATE_APPROVERS: {
            ID: 'customrecord_tsc_delegate_approvers',
            NAME: 'Delegate Approvers',
            FIELDS: {
                PRIMARY_APPROVER: 'custrecord_tsc_delegate_primary_approver',
                DELEGATE_APPROVER: 'custrecord_tsc_delegate_approver',
                START_DATE: 'custrecord_delegate_start_date',
                END_DATE: 'custrecord_tsc_delegate_end_date'
            }
        }
    };

    // NetSuite Internal List IDs
    const NS_INTERNAL_IDS = {
        RECORD_TYPES: {
            EMPLOYEE: '-4',
            TRANSACTION: '-30',
            TRANSACTION_TYPE: '-100',
            DEPARTMENT: '-102'
        }
    };

    // Field Types
    const FIELD_TYPES = {
        TEXT: 'TEXT',
        SELECT: 'SELECT',
        DATE: 'DATE',
        CURRENCY: 'CURRENCY',
        CHECKBOX: 'CHECKBOX'
    };

    // Display Types
    const DISPLAY_TYPES = {
        NORMAL: 'NORMAL',
        INLINE: 'INLINE',
        HIDDEN: 'HIDDEN',
        LOCKED: 'LOCKED',
        DISABLED: 'DISABLED'
    };

    // Transaction Types (for field applicability)
    const TRANSACTION_TYPES = {
        PURCHASE: 'PURCHASE',
        SALE: 'SALE'
    };

    // Utility function to get custom list value text
    function getCustomListValueText(listId, valueId) {
        for (var list in CUSTOM_LISTS) {
            if (CUSTOM_LISTS[list].ID === listId) {
                for (var value in CUSTOM_LISTS[list].VALUES) {
                    if (CUSTOM_LISTS[list].VALUES[value] === valueId) {
                        return value.replace(/_/g, ' ').toLowerCase()
                            .replace(/\b\w/g, function(l) { return l.toUpperCase(); });
                    }
                }
            }
        }
        return null;
    }

    // Utility function to get field ID by name
    function getFieldId(recordType, fieldName) {
        for (var record in CUSTOM_RECORDS) {
            if (CUSTOM_RECORDS[record].ID === recordType) {
                return CUSTOM_RECORDS[record].FIELDS[fieldName] || null;
            }
        }
        return null;
    }

    // Export public API
    return {
        CUSTOM_LISTS: CUSTOM_LISTS,
        CUSTOM_BODY_FIELDS: CUSTOM_BODY_FIELDS,
        CUSTOM_RECORDS: CUSTOM_RECORDS,
        NS_INTERNAL_IDS: NS_INTERNAL_IDS,
        FIELD_TYPES: FIELD_TYPES,
        DISPLAY_TYPES: DISPLAY_TYPES,
        TRANSACTION_TYPES: TRANSACTION_TYPES,
        getCustomListValueText: getCustomListValueText,
        getFieldId: getFieldId
    };
    
});