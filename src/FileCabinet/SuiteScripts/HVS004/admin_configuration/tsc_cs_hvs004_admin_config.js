/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * 
 * TSC Admin Configuration Client Script
 * Provides client-side validation for the Admin Configuration Suitelet
 */

define(['N/ui/dialog', 'N/currentRecord', '../core/tsc_cm_constants'],
    
    (dialog, currentRecord, TSCCONST) => {
        
        /**
         * Function to be executed after page is initialized.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create or edit)
         */
        const pageInit = (scriptContext) => {
            // Page initialization logic can be added here if needed
            console.log('check');
        }
        
        /**
         * Function to be executed when field is changed.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.line - Line number. Will be undefined if not a sublist field
         */
        const fieldChanged = (scriptContext) => {
            const { currentRecord, sublistId, fieldId } = scriptContext;
            
            // Validate on Approval Thresholds sublist
            if (sublistId === 'custpage_thresholds_sublist') {
                if (fieldId === 'custpage_threshold_type') {
                    validateUniqueApprovalType(currentRecord, scriptContext.line);
                }
            }
            
            // Validate on Approver Configuration sublist
            if (sublistId === 'custpage_approver_sublist') {
                if (fieldId === 'custpage_config_type') {
                    validateUniqueConfigurationType(currentRecord, scriptContext.line);
                }
            }
            
            // Validate on Delegates sublist
            if (sublistId === 'custpage_delegates_sublist') {
                if (fieldId === 'custpage_delegate_primary') {
                    validateUniquePrimaryApprover(currentRecord, scriptContext.line);
                }
            }
        }
        
        /**
         * Function to be executed when sublist line is committed.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         */
        const validateLine = (scriptContext) => {
            const { currentRecord, sublistId } = scriptContext;
            
            // Validate Approval Thresholds sublist
            if (sublistId === 'custpage_thresholds_sublist') {
                // Validate unique approval type
                if (!validateUniqueApprovalType(currentRecord)) {
                    return false;
                }
                
                // Validate approval limits hierarchy
                if (!validateApprovalLimits(currentRecord)) {
                    return false;
                }
            }
            
            // Validate Approver Configuration sublist
            if (sublistId === 'custpage_approver_sublist') {
                // Validate unique configuration type
                if (!validateUniqueConfigurationType(currentRecord)) {
                    return false;
                }
            }
            
            // Validate Delegates sublist
            if (sublistId === 'custpage_delegates_sublist') {
                // Validate unique primary approver
                if (!validateUniquePrimaryApprover(currentRecord)) {
                    return false;
                }
                
                // Validate date range
                if (!validateDelegatesDates(currentRecord)) {
                    return false;
                }
            }
            
            return true;
        }
        
        /**
         * Function to be executed after sublist is changed.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         */
        const sublistChanged = (scriptContext) => {
            // Can be used for any post-sublist change logic
        }
        
        /**
         * Function to be executed when user saves the record.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         */
        const saveRecord = (scriptContext) => {
            const { currentRecord } = scriptContext;
            
            // Validate all approval threshold entries
            const thresholdLineCount = currentRecord.getLineCount({
                sublistId: 'custpage_thresholds_sublist'
            });
            
            const approvalTypes = [];
            
            for (let i = 0; i < thresholdLineCount; i++) {
                // Check for duplicate approval types
                const approvalType = currentRecord.getSublistValue({
                    sublistId: 'custpage_thresholds_sublist',
                    fieldId: 'custpage_threshold_type',
                    line: i
                });
                
                if (approvalType) {
                    if (approvalTypes.includes(approvalType)) {
                        dialog.alert({
                            title: 'Validation Error',
                            message: 'Duplicate Approval Types found. Each Approval Type must be unique.'
                        });
                        return false;
                    }
                    approvalTypes.push(approvalType);
                    
                    // Validate approval limits for this line
                    currentRecord.selectLine({
                        sublistId: 'custpage_thresholds_sublist',
                        line: i
                    });
                    
                    if (!validateApprovalLimits(currentRecord)) {
                        return false;
                    }
                }
            }
            
            // Validate all approver configuration entries
            const approverLineCount = currentRecord.getLineCount({
                sublistId: 'custpage_approver_sublist'
            });
            
            const configTypes = [];
            
            for (let i = 0; i < approverLineCount; i++) {
                // Check for duplicate configuration types
                const configType = currentRecord.getSublistValue({
                    sublistId: 'custpage_approver_sublist',
                    fieldId: 'custpage_config_type',
                    line: i
                });
                
                if (configType) {
                    if (configTypes.includes(configType)) {
                        dialog.alert({
                            title: 'Validation Error',
                            message: 'Duplicate Configuration Types found in Approver Configuration. Each Configuration Type must be unique.'
                        });
                        return false;
                    }
                    configTypes.push(configType);
                }
            }
            
            // Validate all delegate entries
            const delegateLineCount = currentRecord.getLineCount({
                sublistId: 'custpage_delegates_sublist'
            });
            
            const primaryApprovers = [];
            
            for (let i = 0; i < delegateLineCount; i++) {
                // Check for duplicate primary approvers
                const primaryApprover = currentRecord.getSublistValue({
                    sublistId: 'custpage_delegates_sublist',
                    fieldId: 'custpage_delegate_primary',
                    line: i
                });
                
                if (primaryApprover) {
                    if (primaryApprovers.includes(primaryApprover)) {
                        dialog.alert({
                            title: 'Validation Error',
                            message: 'Duplicate Primary Approvers found in Delegates. Each Primary Approver must be unique.'
                        });
                        return false;
                    }
                    primaryApprovers.push(primaryApprover);
                    
                    // Validate dates for this line
                    currentRecord.selectLine({
                        sublistId: 'custpage_delegates_sublist',
                        line: i
                    });
                    
                    if (!validateDelegatesDates(currentRecord)) {
                        return false;
                    }
                }
            }
            
            return true;
        }
        
        /**
         * Validates that the approval type is unique in the sublist
         * @param {Record} currentRecord - The current record
         * @param {number} currentLine - The current line being edited (optional)
         * @returns {boolean} Returns true if validation passes
         */
        const validateUniqueApprovalType = (currentRecord, currentLine) => {
            const currentApprovalType = currentRecord.getCurrentSublistValue({
                sublistId: 'custpage_thresholds_sublist',
                fieldId: 'custpage_threshold_type'
            });
            
            if (!currentApprovalType) return true;
            
            const lineCount = currentRecord.getLineCount({
                sublistId: 'custpage_thresholds_sublist'
            });
            
            for (let i = 0; i < lineCount; i++) {
                // Skip the current line if we're in edit mode
                if (currentLine !== undefined && i === currentLine) continue;
                
                const existingApprovalType = currentRecord.getSublistValue({
                    sublistId: 'custpage_thresholds_sublist',
                    fieldId: 'custpage_threshold_type',
                    line: i
                });
                
                if (existingApprovalType === currentApprovalType) {
                    dialog.alert({
                        title: 'Validation Error',
                        message: 'This Approval Type already exists. Please select a different type.'
                    });
                    return false;
                }
            }
            
            return true;
        }
        
        /**
         * Validates the approval limit hierarchy
         * @param {Record} currentRecord - The current record
         * @returns {boolean} Returns true if validation passes
         */
        const validateApprovalLimits = (currentRecord) => {
            const autoLimit = parseFloat(currentRecord.getCurrentSublistValue({
                sublistId: 'custpage_thresholds_sublist',
                fieldId: 'custpage_approval_auto_limit'
            }) || 0);
            
            const tier1Limit = parseFloat(currentRecord.getCurrentSublistValue({
                sublistId: 'custpage_thresholds_sublist',
                fieldId: 'custpage_tier1_approval'
            }) || 0);
            
            const tier2Limit = parseFloat(currentRecord.getCurrentSublistValue({
                sublistId: 'custpage_thresholds_sublist',
                fieldId: 'custpage_tier2_approval'
            }) || 0);
            
            // Validate Tier 1 > Auto Approval Limit
            if (tier1Limit > 0 && autoLimit > 0 && tier1Limit <= autoLimit) {
                dialog.alert({
                    title: 'Validation Error',
                    message: 'Tier 1 Approval Limit must be greater than the Auto Approval Limit.'
                });
                return false;
            }
            
            // Validate Tier 2 >= Tier 1
            if (tier2Limit > 0 && tier1Limit > 0 && tier2Limit < tier1Limit) {
                dialog.alert({
                    title: 'Validation Error',
                    message: 'Tier 2 Approval Limit must be greater than or equal to Tier 1 Approval Limit.'
                });
                return false;
            }
            
            return true;
        }
        
        /**
         * Validates that the configuration type is unique in the Approver Configuration sublist
         * @param {Record} currentRecord - The current record
         * @param {number} currentLine - The current line being edited (optional)
         * @returns {boolean} Returns true if validation passes
         */
        const validateUniqueConfigurationType = (currentRecord, currentLine) => {
            const currentConfigType = currentRecord.getCurrentSublistValue({
                sublistId: 'custpage_approver_sublist',
                fieldId: 'custpage_config_type'
            });
            
            if (!currentConfigType) return true;
            
            const lineCount = currentRecord.getLineCount({
                sublistId: 'custpage_approver_sublist'
            });
            
            for (let i = 0; i < lineCount; i++) {
                // Skip the current line if we're in edit mode
                if (currentLine !== undefined && i === currentLine) continue;
                
                const existingConfigType = currentRecord.getSublistValue({
                    sublistId: 'custpage_approver_sublist',
                    fieldId: 'custpage_config_type',
                    line: i
                });
                
                if (existingConfigType === currentConfigType) {
                    dialog.alert({
                        title: 'Validation Error',
                        message: 'This Configuration Type already exists in Approver Configuration. Please select a different type.'
                    });
                    return false;
                }
            }
            
            return true;
        }
        
        /**
         * Validates that the primary approver is unique in the Delegates sublist
         * @param {Record} currentRecord - The current record
         * @param {number} currentLine - The current line being edited (optional)
         * @returns {boolean} Returns true if validation passes
         */
        const validateUniquePrimaryApprover = (currentRecord, currentLine) => {
            const currentPrimaryApprover = currentRecord.getCurrentSublistValue({
                sublistId: 'custpage_delegates_sublist',
                fieldId: 'custpage_delegate_primary'
            });
            
            if (!currentPrimaryApprover) return true;
            
            const lineCount = currentRecord.getLineCount({
                sublistId: 'custpage_delegates_sublist'
            });
            
            for (let i = 0; i < lineCount; i++) {
                // Skip the current line if we're in edit mode
                if (currentLine !== undefined && i === currentLine) continue;
                
                const existingPrimaryApprover = currentRecord.getSublistValue({
                    sublistId: 'custpage_delegates_sublist',
                    fieldId: 'custpage_delegate_primary',
                    line: i
                });
                
                if (existingPrimaryApprover === currentPrimaryApprover) {
                    dialog.alert({
                        title: 'Validation Error',
                        message: 'This Primary Approver already exists in Delegates. Each Primary Approver must be unique.'
                    });
                    return false;
                }
            }
            
            return true;
        }
        
        /**
         * Validates the date range for delegates
         * @param {Record} currentRecord - The current record
         * @returns {boolean} Returns true if validation passes
         */
        const validateDelegatesDates = (currentRecord) => {
            const startDate = currentRecord.getCurrentSublistValue({
                sublistId: 'custpage_delegates_sublist',
                fieldId: 'custpage_delegate_start_date'
            });
            
            const endDate = currentRecord.getCurrentSublistValue({
                sublistId: 'custpage_delegates_sublist',
                fieldId: 'custpage_delegate_end_date'
            });
            
            // Only validate if both dates are entered
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                
                if (end < start) {
                    dialog.alert({
                        title: 'Validation Error',
                        message: 'End Date must be greater than or equal to Start Date.'
                    });
                    return false;
                }
            }
            
            return true;
        }
        
        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            validateLine: validateLine,
            sublistChanged: sublistChanged,
            saveRecord: saveRecord
        };
        
    });