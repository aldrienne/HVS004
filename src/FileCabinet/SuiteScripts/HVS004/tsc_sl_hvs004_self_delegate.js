/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * 
 * HVS004 Self-Service Delegation Management Suitelet
 * Allows approvers to manage their own delegation assignments
 */
define(['N/runtime', 'N/ui/serverWidget', 'N/record', 'N/search', './core/tsc_cm_constants'],

    (runtime, serverWidget, record, search, TSCCONST) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            if (scriptContext.request.method === 'GET') {
                // Create the self-service delegate management form
                createSelfDelegateForm(scriptContext);
            } else if (scriptContext.request.method === 'POST') {
                // Handle form submission
                handleFormSubmission(scriptContext);
            }
        }

        /**
         * Creates the self-service delegate management form
         * @param {Object} scriptContext - The script context
         */
        const createSelfDelegateForm = (scriptContext) => {
            const currentUser = runtime.getCurrentUser();
            log.debug('Current User', `ID: ${currentUser.id}, Name: ${currentUser.name}`);
            const userId = currentUser.id;
            
            // Perform validation - ensure current user is an approver
            if (!checkIfUserIsApprover(userId)) {
                scriptContext.response.write({
                    output: 'You do not have permission to access this page. Please contact your administrator.'
                });
                return;
            }

            // Create the form
            let form = serverWidget.createForm({
                title: 'HVS004 Delegate Management - Self Service'
            });

            // Check for success/error messages
            const request = scriptContext.request;
            const successMessage = request.parameters.success;
            const errorMessage = request.parameters.error;

            if (successMessage) {
                const successField = form.addField({
                    id: 'custpage_success_message',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Success'
                });
                successField.defaultValue = `
                    <div style="background-color: #d4edda; color: #155724; padding: 10px; border: 1px solid #c3e6cb; border-radius: 5px; margin-bottom: 15px;">
                        <strong>Success:</strong> ${successMessage}
                    </div>
                `;
            }

            if (errorMessage) {
                const errorField = form.addField({
                    id: 'custpage_error_message',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Error'
                });
                errorField.defaultValue = `
                    <div style="background-color: #f8d7da; color: #721c24; padding: 10px; border: 1px solid #f5c6cb; border-radius: 5px; margin-bottom: 15px;">
                        <strong>Error:</strong> ${errorMessage}
                    </div>
                `;
            }

            // Current user info section
            const userInfoGroup = form.addFieldGroup({
                id: 'custpage_user_info_group',
                label: 'Current User Information'
            });

            const currentUserField = form.addField({
                id: 'custpage_current_user',
                type: serverWidget.FieldType.TEXT,
                label: 'Your Name',
                container: 'custpage_user_info_group'
            });
            currentUserField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });
            currentUserField.defaultValue = currentUser.name;

            // Add help text
            const helpField = form.addField({
                id: 'custpage_help_text',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Instructions',
                container: 'custpage_user_info_group'
            });

            helpField.defaultValue = `
                <div style="background-color: #f8f9fa; padding: 15px; border: 1px solid #dee2e6; border-radius: 5px; margin-bottom: 20px;">
                    <h3 style="margin-top: 0; color: #495057;">HVS004 Delegate Management Instructions</h3>
                    <ul style="margin-bottom: 0;">
                        <li><strong>Add Delegate:</strong> Select an employee to act as your delegate during a specific time period</li>
                        <li><strong>Date Range:</strong> Set start and end dates for the delegation period</li>
                        <li><strong>Active Status:</strong> View which delegations are currently active</li>
                        <li><strong>Approval Coverage:</strong> Your delegate will handle approvals for all your approval flows (Materials, Project Services, Construction)</li>
                    </ul>
                </div>
            `;

            // Hidden field for current user ID
            const currentUserIdField = form.addField({
                id: 'custpage_current_user_id',
                type: serverWidget.FieldType.TEXT,
                label: 'User ID'
            });
            currentUserIdField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            currentUserIdField.defaultValue = userId;

            // Delegate management section
            const delegateGroup = form.addFieldGroup({
                id: 'custpage_delegate_group',
                label: 'Delegate Assignment'
            });

            // Hidden field for delegate record ID (for updates)
            const delegateIdField = form.addField({
                id: 'custpage_delegate_id',
                type: serverWidget.FieldType.TEXT,
                label: 'Delegate Record ID',
                container: 'custpage_delegate_group'
            });
            delegateIdField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });

            // Delegate employee selection
            const delegateApproverField = form.addField({
                id: 'custpage_delegate_approver',
                type: serverWidget.FieldType.SELECT,
                source: 'employee',
                label: 'Delegate Employee',
                container: 'custpage_delegate_group'
            });
            delegateApproverField.setHelpText({
                help: 'Select an employee who will act as your delegate for approvals during the specified time period.'
            });
            delegateApproverField.isMandatory = true;

            // Start date
            const startDateField = form.addField({
                id: 'custpage_delegate_start_date',
                type: serverWidget.FieldType.DATE,
                label: 'Start Date',
                container: 'custpage_delegate_group'
            });
            startDateField.setHelpText({
                help: 'The date when the delegation becomes effective.'
            });

            // End date
            const endDateField = form.addField({
                id: 'custpage_delegate_end_date',
                type: serverWidget.FieldType.DATE,
                label: 'End Date',
                container: 'custpage_delegate_group'
            });
            endDateField.setHelpText({
                help: 'The date when the delegation expires. Leave empty for indefinite delegation.'
            });

            // Status field (read-only)
            const statusField = form.addField({
                id: 'custpage_delegate_status',
                type: serverWidget.FieldType.TEXT,
                label: 'Current Status',
                container: 'custpage_delegate_group'
            });
            statusField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });
            statusField.setHelpText({
                help: 'Shows whether your delegation is currently active, inactive, or expired.'
            });

            // Populate existing delegation data
            populateExistingDelegation(form, userId);

            // Add buttons
            form.addSubmitButton({
                label: 'Save Delegation'
            });

            form.addButton({
                id: 'custpage_clear',
                label: 'Clear Delegation',
                functionName: 'clearDelegation()'
            });

            form.addButton({
                id: 'custpage_cancel',
                label: 'Cancel',
                functionName: 'history.back()'
            });

            // Write the form to the response
            scriptContext.response.writePage(form);
        }

        /**
         * Handles form submission for delegation management
         * @param {Object} scriptContext - The script context
         */
        const handleFormSubmission = (scriptContext) => {
            let title = "handleFormSubmission";
            try {
                const currentUser = runtime.getCurrentUser();
                const userId = currentUser.id;

                // Validate user permissions
                if (!checkIfUserIsApprover(userId)) {
                    scriptContext.response.write({
                        output: 'You do not have permission to perform this action.'
                    });
                    return;
                }

                const request = scriptContext.request;
                const delegateId = request.parameters.custpage_delegate_id;
                const delegateApprover = request.parameters.custpage_delegate_approver;
                const startDate = request.parameters.custpage_delegate_start_date;
                const endDate = request.parameters.custpage_delegate_end_date;

                log.debug(title, `Processing delegation: User=${userId}, Delegate=${delegateApprover}, Start=${startDate}, End=${endDate}`);

                // Validate that user is not trying to delegate to themselves
                if (delegateApprover && delegateApprover === userId.toString()) {
                    scriptContext.response.sendRedirect({
                        type: 'SUITELET',
                        identifier: runtime.getCurrentScript().id,
                        id: runtime.getCurrentScript().deploymentId,
                        parameters: {
                            error: 'You cannot delegate to yourself'
                        }
                    });
                    return;
                }

                if (delegateApprover && startDate) {
                    // Create or update delegation record
                    let delegateRecord;

                    if (delegateId) {
                        // Update existing record
                        delegateRecord = record.load({
                            type: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.ID,
                            id: delegateId
                        });
                        log.debug(title, `Updating existing delegation record ${delegateId}`);
                    } else {
                        // Create new record
                        delegateRecord = record.create({
                            type: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.ID
                        });
                        delegateRecord.setValue({
                            fieldId: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.PRIMARY_APPROVER,
                            value: userId
                        });
                        log.debug(title, 'Creating new delegation record');
                    }

                    // Set field values
                    delegateRecord.setValue({
                        fieldId: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.DELEGATE_APPROVER,
                        value: delegateApprover
                    });
                    delegateRecord.setValue({
                        fieldId: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.START_DATE,
                        value: new Date(startDate)
                    });

                    if (endDate) {
                        delegateRecord.setValue({
                            fieldId: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.END_DATE,
                            value: new Date(endDate)
                        });
                    } else {
                        delegateRecord.setValue({
                            fieldId: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.END_DATE,
                            value: ''
                        });
                    }

                    const recordId = delegateRecord.save();
                    log.debug(title, `Delegation record saved with ID: ${recordId}`);

                    // Redirect back to form with success message
                    scriptContext.response.sendRedirect({
                        type: 'SUITELET',
                        identifier: runtime.getCurrentScript().id,
                        id: runtime.getCurrentScript().deploymentId,
                        parameters: {
                            success: 'Delegation saved successfully'
                        }
                    });

                } else if (delegateId && !delegateApprover) {
                    // Delete delegation if delegate is cleared
                    record.delete({
                        type: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.ID,
                        id: delegateId
                    });
                    log.debug(title, `Deleted delegation record ${delegateId}`);

                    scriptContext.response.sendRedirect({
                        type: 'SUITELET',
                        identifier: runtime.getCurrentScript().id,
                        id: runtime.getCurrentScript().deploymentId,
                        parameters: {
                            success: 'Delegation removed successfully'
                        }
                    });
                } else {
                    // No valid data provided
                    scriptContext.response.sendRedirect({
                        type: 'SUITELET',
                        identifier: runtime.getCurrentScript().id,
                        id: runtime.getCurrentScript().deploymentId,
                        parameters: {
                            error: 'Please provide delegate and start date'
                        }
                    });
                }

            } catch (e) {
                log.error(title, `Error processing form submission: ${e.message}`);
                scriptContext.response.sendRedirect({
                    type: 'SUITELET',
                    identifier: runtime.getCurrentScript().id,
                    id: runtime.getCurrentScript().deploymentId,
                    parameters: {
                        error: 'An error occurred while saving your delegation'
                    }
                });
            }
        }

        /**
         * Populates the form with existing delegation data for the current user
         * @param {Object} form - The form object
         * @param {string} userId - Current user ID
         */
        const populateExistingDelegation = (form, userId) => {
            let title = "populateExistingDelegation";
            try {
                log.debug(title, `Loading existing delegation for user ${userId}`);

                // Search for existing delegation record for this user
                const filters = [
                    [TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.PRIMARY_APPROVER, 'anyof', userId],
                    'AND',
                    ['isinactive', 'is', 'F']
                ];

                const delegateSearch = search.create({
                    type: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.ID,
                    filters: filters,
                    columns: [
                        TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.DELEGATE_APPROVER,
                        TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.START_DATE,
                        TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.END_DATE
                    ]
                });

                const searchResults = delegateSearch.run().getRange({
                    start: 0,
                    end: 1
                });

                if (searchResults.length > 0) {
                    const delegation = searchResults[0];
                    const delegateId = delegation.getValue(TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.DELEGATE_APPROVER);
                    const startDate = delegation.getValue(TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.START_DATE);
                    const endDate = delegation.getValue(TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.END_DATE);

                    // Set form field values
                    form.getField('custpage_delegate_id').defaultValue = delegation.id;
                    form.getField('custpage_delegate_approver').defaultValue = delegateId;
                    form.getField('custpage_delegate_start_date').defaultValue = startDate;
                    form.getField('custpage_delegate_end_date').defaultValue = endDate || '';

                    // Determine status
                    const today = new Date();
                    const startDateObj = startDate ? new Date(startDate) : null;
                    const endDateObj = endDate ? new Date(endDate) : null;

                    let status = 'Inactive';
                    if (startDateObj && startDateObj <= today) {
                        if (!endDateObj || endDateObj >= today) {
                            status = 'Active';
                        } else {
                            status = 'Expired';
                        }
                    } else if (startDateObj && startDateObj > today) {
                        status = 'Scheduled';
                    }

                    form.getField('custpage_delegate_status').defaultValue = status;

                    log.debug(title, `Loaded delegation: Delegate=${delegateId}, Start=${startDate}, End=${endDate}, Status=${status}`);
                } else {
                    form.getField('custpage_delegate_status').defaultValue = 'No delegation configured';
                    log.debug(title, 'No existing delegation found for user');
                }

            } catch (e) {
                log.error(title, `Error loading existing delegation: ${e.message}`);
                form.getField('custpage_delegate_status').defaultValue = 'Error loading delegation data';
            }
        }

        /**
         * Checks if the current user is configured as an approver in HVS004
         * @param {string} userId - User ID to check
         * @returns {boolean} - True if user is an approver
         */
        const checkIfUserIsApprover = (userId) => {
            let title = "checkIfUserIsApprover";
            try {
                log.debug(title, `Checking if user ${userId} is an approver`);

                // Search for approver config records where the user is listed as any type of approver
                const filters = [
                    [
                        [TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.PRIMARY_APPROVER, 'anyof', userId],
                        'OR',
                        [TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.SECONDARY_APPROVER, 'anyof', userId],
                        'OR',
                        [TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.TERTIARY_APPROVER, 'anyof', userId]
                    ],
                    'AND',
                    ['isinactive', 'is', 'F'], // Only active records
                ];
                log.debug(title, `Filters for approver search: ${JSON.stringify(filters)}`);

                const approverConfigSearch = search.create({
                    type: TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.ID,
                    filters: filters,
                    columns: [
                    ]
                });

                const searchResults = approverConfigSearch.run().getRange({
                    start: 0,
                    end: 1000
                });

                log.debug(title, `Found ${searchResults.length} approver config records for user ${userId}`);

                return searchResults.length > 0;

            } catch (e) {
                log.error(title, `Error checking if user is approver: ${e.message}`);
                return false;
            }
        }

        return { onRequest }

    });