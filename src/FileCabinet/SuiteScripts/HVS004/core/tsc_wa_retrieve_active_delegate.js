/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define(['N/search', './tsc_cm_constants.js', 'N/runtime'],
    
    (search, TSCCONST, runtime) => {
        const SCRIPT_PARAMETERS = {
            PRIMARY_APPROVER: "custscript_tsc_wa_hvs004_primary_approve",
        };
        /**
         * Defines the WorkflowAction script trigger point.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.workflowId - Internal ID of workflow which triggered this action
         * @param {string} scriptContext.type - Event type
         * @param {Form} scriptContext.form - Current form that the script uses to interact with the record
         * @since 2016.1
         */
        const onAction = (scriptContext) => {
            try{                
                let primaryApprover = runtime.getCurrentScript().getParameter({ name: SCRIPT_PARAMETERS.PRIMARY_APPROVER});
                log.debug("Primary Approver", primaryApprover);
                if (primaryApprover) {
                    return retrieveActiveDelegate(primaryApprover);
                }

            }catch(e){
                log.error("Error", e);
            }
        }

        const retrieveActiveDelegate = (primaryApprover) => {
            let title = "retrieveActiveDelegate: ";
            log.debug(title + "Primary Approver", primaryApprover);
            const filters = [
                [TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.PRIMARY_APPROVER, 'anyof', primaryApprover],
                'AND',
                ['isinactive', 'is', false],
                'AND',
                [TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.START_DATE, 'onorbefore', 'today'],
                'AND',
                [
                    [TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.END_DATE, 'onorafter', 'today'],
                    'OR',
                    [TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.END_DATE, 'isempty', '']
                ]
            ];

            const columns = [
                search.createColumn({ name: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.DELEGATE_APPROVER }),
            ];

            const delegateSearch = search.create({
                type: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.ID,
                filters: filters,
                columns: columns
            });

            const searchResults = delegateSearch.run().getRange({ start: 0, end: 1 });
            if (searchResults && searchResults.length > 0) {
                return searchResults[0].getValue({ name: TSCCONST.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.DELEGATE_APPROVER });
            }
            return null;
        }

        return {onAction};
    });
