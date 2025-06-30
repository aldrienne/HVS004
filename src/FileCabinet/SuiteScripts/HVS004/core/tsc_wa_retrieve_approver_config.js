/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define(['N/search', './tsc_cm_constants.js', 'N/runtime'],
    
    (search,TSCCONST, runtime) => {
        const SCRIPT_PARAMETERS = {
            APPROVAL_FLOW: 'custscript_tsc_wa_approval_flow'
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
                let approvalFlow = runtime.getCurrentScript().getParameter({ name: SCRIPT_PARAMETERS.APPROVAL_FLOW });
                if (approvalFlow) {
                    return retrieveApproverConfig(approvalFlow);
                }

            }catch(e){
                log.error("Error", e)
            }
        }

        const retrieveApproverConfig = (approvalFlow) => {
            const filters = [
                [TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.CONFIG_TYPE, 'anyof', approvalFlow],
                'AND',
                ['isinactive', 'is', 'F'],
            ];

            log.debug('filtrs   ', filters);

            const approverConfigSearch = search.create({
                type: TSCCONST.CUSTOM_RECORDS.APPROVER_CONFIG.ID,
                filters: filters,
                columns: []
            });

            const searchResults = approverConfigSearch.run().getRange({ start: 0, end: 1 });
            if (searchResults && searchResults.length > 0) {
                log.debug("Approver Config ID", searchResults[0].id);
                return searchResults[0].id;
            }
            return null;
        }

        return {onAction};
    });
