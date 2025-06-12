/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * 
 * TSC Admin Configuration Suitelet
 * Provides interface for managing Approver Configuration, Delegates, and Approval Thresholds
 */
define(['N/ui/serverWidget', 'N/search', 'N/record', '../core/tsc_cm_constants'],
    
    (serverWidget, search, record, TSCCONST) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            
            if (scriptContext.request.method === 'GET') {
                
                // Create form
                const form = serverWidget.createForm({
                    title: 'TSC Admin Configuration'
                });
                
                // Add client script for validation
                form.clientScriptModulePath = './tsc_cs_hvs004_admin_config.js';
                
                // Create tabs
                const approverTab = form.addTab({
                    id: 'custpage_approver_tab',
                    label: 'Approver Configuration'
                });
                
                const delegatesTab = form.addTab({
                    id: 'custpage_delegates_tab',
                    label: 'Delegates'
                });
                
                const thresholdsTab = form.addTab({
                    id: 'custpage_thresholds_tab',
                    label: 'Approval Thresholds'
                });
                
                // Create Approver Configuration sublist
                const approverSublist = form.addSublist({
                    id: 'custpage_approver_sublist',
                    type: serverWidget.SublistType.EDITOR,
                    label: 'Approver Configuration',
                    tab: 'custpage_approver_tab'
                });
                
                // Add fields to Approver Configuration sublist
                approverSublist.addField({
                    id: 'custpage_config_type',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Configuration Type',
                    source: TSCCONST.CUSTOM_LISTS.CONFIG_TYPES.ID
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.ENTRY
                }).isMandatory = true;
                
                approverSublist.addField({
                    id: 'custpage_primary_approver',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Primary Approver',
                    source: 'employee'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.ENTRY
                }).isMandatory = true;
                
                approverSublist.addField({
                    id: 'custpage_secondary_approver',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Secondary Approver',
                    source: 'employee'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.ENTRY
                }).isMandatory = true;
                
                approverSublist.addField({
                    id: 'custpage_tertiary_approver',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Tertiary Approver',
                    source: 'employee'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.ENTRY
                }).isMandatory = true;
                
                // Create Delegates sublist
                const delegatesSublist = form.addSublist({
                    id: 'custpage_delegates_sublist',
                    type: serverWidget.SublistType.EDITOR,
                    label: 'Delegate Approvers',
                    tab: 'custpage_delegates_tab'
                });
                
                // Add fields to Delegates sublist
                delegatesSublist.addField({
                    id: 'custpage_delegate_primary',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Primary Approver',
                    source: 'employee'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.ENTRY
                }).isMandatory = true;
                
                delegatesSublist.addField({
                    id: 'custpage_delegate_approver',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Delegate Approver',
                    source: 'employee'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.ENTRY
                }).isMandatory = true;
                
                delegatesSublist.addField({
                    id: 'custpage_delegate_start_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'Start Date'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.ENTRY
                });
                
                delegatesSublist.addField({
                    id: 'custpage_delegate_end_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'End Date'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.ENTRY
                });
                
                // Create Approval Thresholds sublist
                const thresholdsSublist = form.addSublist({
                    id: 'custpage_thresholds_sublist',
                    type: serverWidget.SublistType.EDITOR,
                    label: 'Approval Thresholds',
                    tab: 'custpage_thresholds_tab'
                });
                
                // Add fields to Approval Thresholds sublist
                thresholdsSublist.addField({
                    id: 'custpage_threshold_type',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Approval Type',
                    source: TSCCONST.CUSTOM_LISTS.CONFIG_TYPES.ID
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.ENTRY
                }).isMandatory = true;
                
                thresholdsSublist.addField({
                    id: 'custpage_approval_auto_limit',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Approval Auto Limit'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.ENTRY
                }).isMandatory = true;
                
                thresholdsSublist.addField({
                    id: 'custpage_tier1_approval',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Tier 1 Approval Limit'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.ENTRY
                }).isMandatory = true;
                
                thresholdsSublist.addField({
                    id: 'custpage_tier2_approval',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Tier 2 Approval Limit'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.ENTRY
                }).isMandatory = true;
                
                // Add Submit button
                form.addSubmitButton({
                    label: 'Save'
                });
                
                // Add Reset button
                form.addResetButton({
                    label: 'Reset'
                });
                
                // Write the form to response
                scriptContext.response.writePage(form);
                
            } else {
                // POST request handling will be implemented later
                // This is where we'll process the form submission
            }
        }

        return {onRequest}

    });
