/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * 
 * TSC Admin Configuration Suitelet
 * Provides interface for managing Approver Configuration, Delegates, and Approval Thresholds
 */
define(['N/ui/serverWidget', 'N/search', 'N/record', 'N/redirect', '../core/tsc_cm_constants'],
    
    (serverWidget, search, record, redirect, TSCCONST) => {
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
                    title: 'Administrator Configuration'
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
                    id: 'custpage_config_id',
                    type: serverWidget.FieldType.TEXT,
                    label: 'ID'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

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
                    id: 'custpage_delegate_id',
                    type: serverWidget.FieldType.TEXT,
                    label: 'ID'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

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
                    id: 'custpage_threshold_id',
                    type: serverWidget.FieldType.TEXT,
                    label: 'ID'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

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
                
                // Populate sublists with existing data
                populateApproverConfigSublist(form);
                populateDelegatesSublist(form);
                populateThresholdsSublist(form);
                
                // Write the form to response
                scriptContext.response.writePage(form);
                
            } else {
                // Handle POST request
                handleFormSubmission(scriptContext);
            }
        }

        /**
         * Populate Approver Configuration sublist with existing data
         * @param {Object} form - The form object
         */
        function populateApproverConfigSublist(form) {
            const title = "populateApproverConfigSublist";
            
            try {
                // Search for existing approver configuration records
                const searchObj = search.create({
                    type: TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.ID,
                    filters: [
                        ['isinactive', 'is', 'F']
                    ],
                    columns: [
                        search.createColumn({ name: 'internalid' }),
                        search.createColumn({ name: TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.CONFIG_TYPE }),
                        search.createColumn({ name: TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.PRIMARY_APPROVER }),
                        search.createColumn({ name: TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.SECONDARY_APPROVER }),
                        search.createColumn({ name: TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.TERTIARY_APPROVER })
                    ]
                });

                const sublist = form.getSublist({
                    id: 'custpage_approver_sublist'
                });

                let lineNumber = 0;
                searchObj.run().each(function(result) {
                    // Set values for each field
                    sublist.setSublistValue({
                        id: 'custpage_config_id',
                        line: lineNumber,
                        value: result.id
                    });

                    sublist.setSublistValue({
                        id: 'custpage_config_type',
                        line: lineNumber,
                        value: result.getValue(TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.CONFIG_TYPE)
                    });

                    sublist.setSublistValue({
                        id: 'custpage_primary_approver',
                        line: lineNumber,
                        value: result.getValue(TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.PRIMARY_APPROVER)
                    });

                    const secondaryApprover = result.getValue(TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.SECONDARY_APPROVER);
                    if (secondaryApprover) {
                        sublist.setSublistValue({
                            id: 'custpage_secondary_approver',
                            line: lineNumber,
                            value: secondaryApprover
                        });
                    }

                    const tertiaryApprover = result.getValue(TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.TERTIARY_APPROVER);
                    if (tertiaryApprover) {
                        sublist.setSublistValue({
                            id: 'custpage_tertiary_approver',
                            line: lineNumber,
                            value: tertiaryApprover
                        });
                    }

                    lineNumber++;
                    return true; // Continue iteration
                });

                log.debug(title, `Populated ${lineNumber} approver configuration records`);
            } catch (e) {
                log.error(title, 'Error: ' + e.toString());
            }
        }

        /**
         * Populate Delegates sublist with existing data
         * @param {Object} form - The form object
         */
        function populateDelegatesSublist(form) {
            const title = "populateDelegatesSublist";
            
            try {
                // Search for existing delegate records
                const searchObj = search.create({
                    type: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.ID,
                    filters: [
                        ['isinactive', 'is', 'F']
                    ],
                    columns: [
                        search.createColumn({ name: 'internalid' }),
                        search.createColumn({ name: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.PRIMARY_APPROVER }),
                        search.createColumn({ name: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.DELEGATE_APPROVER }),
                        search.createColumn({ name: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.START_DATE }),
                        search.createColumn({ name: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.END_DATE })
                    ]
                });

                const sublist = form.getSublist({
                    id: 'custpage_delegates_sublist'
                });

                let lineNumber = 0;
                searchObj.run().each(function(result) {
                    // Set values for each field
                    sublist.setSublistValue({
                        id: 'custpage_delegate_id',
                        line: lineNumber,
                        value: result.id
                    });

                    sublist.setSublistValue({
                        id: 'custpage_delegate_primary',
                        line: lineNumber,
                        value: result.getValue(TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.PRIMARY_APPROVER)
                    });

                    sublist.setSublistValue({
                        id: 'custpage_delegate_approver',
                        line: lineNumber,
                        value: result.getValue(TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.DELEGATE_APPROVER)
                    });

                    const startDate = result.getValue(TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.START_DATE);
                    if (startDate) {
                        sublist.setSublistValue({
                            id: 'custpage_delegate_start_date',
                            line: lineNumber,
                            value: startDate
                        });
                    }

                    const endDate = result.getValue(TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.END_DATE);
                    if (endDate) {
                        sublist.setSublistValue({
                            id: 'custpage_delegate_end_date',
                            line: lineNumber,
                            value: endDate
                        });
                    }

                    lineNumber++;
                    return true; // Continue iteration
                });

                log.debug(title, `Populated ${lineNumber} delegate records`);
            } catch (e) {
                log.error(title, 'Error: ' + e.toString());
            }
        }

        /**
         * Populate Approval Thresholds sublist with existing data
         * @param {Object} form - The form object
         */
        function populateThresholdsSublist(form) {
            const title = "populateThresholdsSublist";
            
            try {
                // Search for existing threshold records
                const searchObj = search.create({
                    type: TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.ID,
                    filters: [
                        ['isinactive', 'is', 'F']
                    ],
                    columns: [
                        search.createColumn({ name: 'internalid' }),
                        search.createColumn({ name: TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.THRESHOLD_TYPE }),
                        search.createColumn({ name: TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.COMPANY_AUTO_APPROVAL_LIMIT }),
                        search.createColumn({ name: TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.TIER_1_APPROVAL_LIMIT }),
                        search.createColumn({ name: TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.TIER_2_APPROVAL_LIMIT })
                    ]
                });

                const sublist = form.getSublist({
                    id: 'custpage_thresholds_sublist'
                });

                let lineNumber = 0;
                searchObj.run().each(function(result) {
                    // Set values for each field
                    sublist.setSublistValue({
                        id: 'custpage_threshold_id',
                        line: lineNumber,
                        value: result.id
                    });

                    sublist.setSublistValue({
                        id: 'custpage_threshold_type',
                        line: lineNumber,
                        value: result.getValue(TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.THRESHOLD_TYPE)
                    });

                    const autoLimit = result.getValue(TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.COMPANY_AUTO_APPROVAL_LIMIT);
                    if (autoLimit) {
                        sublist.setSublistValue({
                            id: 'custpage_approval_auto_limit',
                            line: lineNumber,
                            value: autoLimit
                        });
                    }

                    const tier1Limit = result.getValue(TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.TIER_1_APPROVAL_LIMIT);
                    if (tier1Limit) {
                        sublist.setSublistValue({
                            id: 'custpage_tier1_approval',
                            line: lineNumber,
                            value: tier1Limit
                        });
                    }

                    const tier2Limit = result.getValue(TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.TIER_2_APPROVAL_LIMIT);
                    if (tier2Limit) {
                        sublist.setSublistValue({
                            id: 'custpage_tier2_approval',
                            line: lineNumber,
                            value: tier2Limit
                        });
                    }

                    lineNumber++;
                    return true; // Continue iteration
                });

                log.debug(title, `Populated ${lineNumber} threshold records`);
            } catch (e) {
                log.error(title, 'Error: ' + e.toString());
            }
        }

        /**
         * Handles form submission for POST requests
         * @param {Object} scriptContext - The script context
         */
        function handleFormSubmission(scriptContext) {
            const title = "handleFormSubmission";
            
            try {
                // Determine which tab was active when form was submitted
                const activeTab = scriptContext.request.parameters.selectedtab || 'custpage_approver_tab';
                
                if (activeTab === 'custpage_approver_tab') {
                    processApproverConfigRecords(scriptContext.request);
                } else if (activeTab === 'custpage_delegates_tab') {
                    processDelegateRecords(scriptContext.request);
                } else if (activeTab === 'custpage_thresholds_tab') {
                    processThresholdRecords(scriptContext.request);
                }

                // Redirect back to the same suitelet after processing
                redirect.toSuitelet({
                    scriptId: scriptContext.request.parameters.script,
                    deploymentId: scriptContext.request.parameters.deploy,
                    parameters: {
                        'success': 'true',
                        'selectedtab': activeTab
                    }
                });
            } catch (e) {
                log.error(title, 'Error in handleFormSubmission: ' + e.toString());
                throw e;
            }
        }

        /**
         * Process approver configuration records for CRUD operations
         * @param {Object} request - The request object from scriptContext
         * @returns {Object} Result object with operation details
         */
        function processApproverConfigRecords(request) {
            const title = "processApproverConfigRecords";
            
            const results = {
                success: true,
                created: 0,
                updated: 0,
                deleted: 0,
                errors: []
            };

            try {
                const lineCount = request.getLineCount({
                    group: 'custpage_approver_sublist'
                });

                const configTypes = new Set();
                const submittedIds = new Set();

                // Process each line
                for (let i = 0; i < lineCount; i++) {
                    try {
                        const configId = request.getSublistValue({
                            group: 'custpage_approver_sublist',
                            name: 'custpage_config_id',
                            line: i
                        });

                        const configType = request.getSublistValue({
                            group: 'custpage_approver_sublist',
                            name: 'custpage_config_type',
                            line: i
                        });

                        const primaryApprover = request.getSublistValue({
                            group: 'custpage_approver_sublist',
                            name: 'custpage_primary_approver',
                            line: i
                        });

                        const secondaryApprover = request.getSublistValue({
                            group: 'custpage_approver_sublist',
                            name: 'custpage_secondary_approver',
                            line: i
                        });

                        const tertiaryApprover = request.getSublistValue({
                            group: 'custpage_approver_sublist',
                            name: 'custpage_tertiary_approver',
                            line: i
                        });

                        // Validate required fields
                        if (!configType || !primaryApprover) {
                            results.errors.push(`Line ${i + 1}: Configuration Type and Primary Approver are required`);
                            continue;
                        }

                        // Check for duplicate config types
                        if (configTypes.has(configType)) {
                            results.errors.push(`Line ${i + 1}: Duplicate Configuration Type detected`);
                            continue;
                        }
                        configTypes.add(configType);

                        if (configId) {
                            // Update existing record
                            record.submitFields({
                                type: TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.ID,
                                id: configId,
                                values: {
                                    [TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.CONFIG_TYPE]: configType,
                                    [TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.PRIMARY_APPROVER]: primaryApprover,
                                    [TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.SECONDARY_APPROVER]: secondaryApprover || '',
                                    [TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.TERTIARY_APPROVER]: tertiaryApprover || ''
                                }
                            });
                            submittedIds.add(String(configId));
                            results.updated++;
                        } else {
                            // Create new record
                            const newRecord = record.create({
                                type: TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.ID,
                                isDynamic: true
                            });

                            newRecord.setValue({
                                fieldId: TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.CONFIG_TYPE,
                                value: configType
                            });

                            newRecord.setValue({
                                fieldId: TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.PRIMARY_APPROVER,
                                value: primaryApprover
                            });

                            if (secondaryApprover) {
                                newRecord.setValue({
                                    fieldId: TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.SECONDARY_APPROVER,
                                    value: secondaryApprover
                                });
                            }

                            if (tertiaryApprover) {
                                newRecord.setValue({
                                    fieldId: TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.TERTIARY_APPROVER,
                                    value: tertiaryApprover
                                });
                            }

                            const recordId = newRecord.save();
                            submittedIds.add(String(recordId));
                            results.created++;
                        }
                    } catch (lineError) {
                        results.errors.push(`Line ${i + 1}: ${lineError.message}`);
                        results.success = false;
                    }
                }

                // Handle deletions - mark records not in submission as inactive
                const existingRecords = searchRecords(TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.ID, [['isinactive', 'is', 'F']]);
                for (const existingRecord of existingRecords) {
                    if (!submittedIds.has(String(existingRecord.internalid))) {
                        record.submitFields({
                            type: TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.ID,
                            id: existingRecord.internalid,
                            values: { 'isinactive': 'T' }
                        });
                        results.deleted++;
                    }
                }

            } catch (e) {
                log.error(title, 'Error: ' + e.toString());
                results.success = false;
                results.errors.push('General error: ' + e.message);
            }

            return results;
        }

        /**
         * Process delegate records for CRUD operations
         * @param {Object} request - The request object from scriptContext
         * @returns {Object} Result object with operation details
         */
        function processDelegateRecords(request) {
            const title = "processDelegateRecords";
            
            const results = {
                success: true,
                created: 0,
                updated: 0,
                deleted: 0,
                errors: []
            };

            try {
                const lineCount = request.getLineCount({
                    group: 'custpage_delegates_sublist'
                });

                const delegateCombinations = new Set();
                const submittedIds = new Set();

                // Process each line
                for (let i = 0; i < lineCount; i++) {
                    try {
                        const delegateId = request.getSublistValue({
                            group: 'custpage_delegates_sublist',
                            name: 'custpage_delegate_id',
                            line: i
                        });

                        const primaryApprover = request.getSublistValue({
                            group: 'custpage_delegates_sublist',
                            name: 'custpage_delegate_primary',
                            line: i
                        });

                        const delegateApprover = request.getSublistValue({
                            group: 'custpage_delegates_sublist',
                            name: 'custpage_delegate_approver',
                            line: i
                        });

                        const startDate = request.getSublistValue({
                            group: 'custpage_delegates_sublist',
                            name: 'custpage_delegate_start_date',
                            line: i
                        });

                        const endDate = request.getSublistValue({
                            group: 'custpage_delegates_sublist',
                            name: 'custpage_delegate_end_date',
                            line: i
                        });

                        // Validate required fields
                        if (!primaryApprover || !delegateApprover) {
                            results.errors.push(`Line ${i + 1}: Primary Approver and Delegate Approver are required`);
                            continue;
                        }

                        if (primaryApprover === delegateApprover) {
                            results.errors.push(`Line ${i + 1}: Primary and Delegate Approvers cannot be the same`);
                            continue;
                        }

                        // Check for duplicates
                        const delegateKey = `${primaryApprover}_${delegateApprover}_${startDate || ''}_${endDate || ''}`;
                        if (delegateCombinations.has(delegateKey)) {
                            results.errors.push(`Line ${i + 1}: Duplicate delegation found`);
                            continue;
                        }
                        delegateCombinations.add(delegateKey);

                        if (delegateId) {
                            // Update existing record
                            record.submitFields({
                                type: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.ID,
                                id: delegateId,
                                values: {
                                    [TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.PRIMARY_APPROVER]: primaryApprover,
                                    [TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.DELEGATE_APPROVER]: delegateApprover,
                                    [TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.START_DATE]: startDate || '',
                                    [TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.END_DATE]: endDate || ''
                                }
                            });
                            submittedIds.add(String(delegateId));
                            results.updated++;
                        } else {
                            // Create new record
                            const newRecord = record.create({
                                type: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.ID,
                                isDynamic: true
                            });

                            newRecord.setValue({
                                fieldId: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.PRIMARY_APPROVER,
                                value: primaryApprover
                            });

                            newRecord.setValue({
                                fieldId: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.DELEGATE_APPROVER,
                                value: delegateApprover
                            });

                            if (startDate) {
                                newRecord.setText({
                                    fieldId: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.START_DATE,
                                    text: startDate
                                });
                            }

                            if (endDate) {
                                newRecord.setText({
                                    fieldId: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.END_DATE,
                                    text: endDate
                                });
                            }

                            const recordId = newRecord.save();
                            submittedIds.add(String(recordId));
                            results.created++;
                        }
                    } catch (lineError) {
                        results.errors.push(`Line ${i + 1}: ${lineError.message}`);
                        results.success = false;
                    }
                }

                // Handle deletions
                const existingRecords = searchRecords(TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.ID, [['isinactive', 'is', 'F']]);
                for (const existingRecord of existingRecords) {
                    if (!submittedIds.has(String(existingRecord.internalid))) {
                        record.submitFields({
                            type: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.ID,
                            id: existingRecord.internalid,
                            values: { 'isinactive': 'T' }
                        });
                        results.deleted++;
                    }
                }

            } catch (e) {
                log.error(title, 'Error: ' + e.toString());
                results.success = false;
                results.errors.push('General error: ' + e.message);
            }

            return results;
        }

        /**
         * Process threshold records for CRUD operations
         * @param {Object} request - The request object from scriptContext
         * @returns {Object} Result object with operation details
         */
        function processThresholdRecords(request) {
            const title = "processThresholdRecords";
            
            const results = {
                success: true,
                created: 0,
                updated: 0,
                deleted: 0,
                errors: []
            };

            try {
                const lineCount = request.getLineCount({
                    group: 'custpage_thresholds_sublist'
                });

                const thresholdTypes = new Set();
                const submittedIds = new Set();

                // Process each line
                for (let i = 0; i < lineCount; i++) {
                    try {
                        const thresholdId = request.getSublistValue({
                            group: 'custpage_thresholds_sublist',
                            name: 'custpage_threshold_id',
                            line: i
                        });

                        const thresholdType = request.getSublistValue({
                            group: 'custpage_thresholds_sublist',
                            name: 'custpage_threshold_type',
                            line: i
                        });

                        const autoLimit = request.getSublistValue({
                            group: 'custpage_thresholds_sublist',
                            name: 'custpage_approval_auto_limit',
                            line: i
                        });

                        const tier1Limit = request.getSublistValue({
                            group: 'custpage_thresholds_sublist',
                            name: 'custpage_tier1_approval',
                            line: i
                        });

                        const tier2Limit = request.getSublistValue({
                            group: 'custpage_thresholds_sublist',
                            name: 'custpage_tier2_approval',
                            line: i
                        });

                        // Validate required fields
                        if (!thresholdType) {
                            results.errors.push(`Line ${i + 1}: Approval Type is required`);
                            continue;
                        }

                        // Check for duplicate threshold types
                        if (thresholdTypes.has(thresholdType)) {
                            results.errors.push(`Line ${i + 1}: Duplicate Approval Type detected`);
                            continue;
                        }
                        thresholdTypes.add(thresholdType);

                        if (thresholdId) {
                            // Update existing record
                            record.submitFields({
                                type: TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.ID,
                                id: thresholdId,
                                values: {
                                    [TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.THRESHOLD_TYPE]: thresholdType,
                                    [TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.COMPANY_AUTO_APPROVAL_LIMIT]: autoLimit || '',
                                    [TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.TIER_1_APPROVAL_LIMIT]: tier1Limit || '',
                                    [TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.TIER_2_APPROVAL_LIMIT]: tier2Limit || ''
                                }
                            });
                            submittedIds.add(String(thresholdId));
                            results.updated++;
                        } else {
                            // Create new record
                            const newRecord = record.create({
                                type: TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.ID,
                                isDynamic: true
                            });

                            newRecord.setValue({
                                fieldId: TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.THRESHOLD_TYPE,
                                value: thresholdType
                            });

                            if (autoLimit) {
                                newRecord.setValue({
                                    fieldId: TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.COMPANY_AUTO_APPROVAL_LIMIT,
                                    value: autoLimit
                                });
                            }

                            if (tier1Limit) {
                                newRecord.setValue({
                                    fieldId: TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.TIER_1_APPROVAL_LIMIT,
                                    value: tier1Limit
                                });
                            }

                            if (tier2Limit) {
                                newRecord.setValue({
                                    fieldId: TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.TIER_2_APPROVAL_LIMIT,
                                    value: tier2Limit
                                });
                            }

                            const recordId = newRecord.save();
                            submittedIds.add(String(recordId));
                            results.created++;
                        }
                    } catch (lineError) {
                        results.errors.push(`Line ${i + 1}: ${lineError.message}`);
                        results.success = false;
                    }
                }

                // Handle deletions
                const existingRecords = searchRecords(TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.ID, [['isinactive', 'is', 'F']]);
                for (const existingRecord of existingRecords) {
                    if (!submittedIds.has(String(existingRecord.internalid))) {
                        record.submitFields({
                            type: TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.ID,
                            id: existingRecord.internalid,
                            values: { 'isinactive': 'T' }
                        });
                        results.deleted++;
                    }
                }

            } catch (e) {
                log.error(title, 'Error: ' + e.toString());
                results.success = false;
                results.errors.push('General error: ' + e.message);
            }

            return results;
        }

        /**
         * Search records utility function
         * @param {string} recordType - The record type to search
         * @param {Array} filters - Search filters
         * @returns {Array} Array of search results
         */
        function searchRecords(recordType, filters) {
            const title = "searchRecords";
            
            try {
                const searchObj = search.create({
                    type: recordType,
                    filters: filters || [],
                    columns: [
                        search.createColumn({ name: 'internalid' })
                    ]
                });

                const searchPagedData = searchObj.runPaged({ pageSize: 1000 });
                let results = [];

                for (let i = 0; i < searchPagedData.pageRanges.length; i++) {
                    const searchPage = searchPagedData.fetch({ index: i });
                    searchPage.data.forEach((result) => {
                        results.push({
                            internalid: result.id
                        });
                    });
                }

                return results;
            } catch (e) {
                log.error(title, 'Error: ' + e.toString());
                return [];
            }
        }

        return {onRequest}

    });
