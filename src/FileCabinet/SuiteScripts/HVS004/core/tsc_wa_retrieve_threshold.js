/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define(['N/search', './tsc_cm_constants.js', 'N/runtime'],

    (search, TSCCONST, runtime) => {
        const SCRIPT_PARAMETERS = {
            APPROVAL_FLOW: 'custscript_tsc_wa_hvs004_approval_flow'
        }
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
            let title = 'HVS004 - Retrieve Threshold';
            try {
                let approvalFlow = runtime.getCurrentScript().getParameter({ name: SCRIPT_PARAMETERS.APPROVAL_FLOW });
                if (approvalFlow){
                    return retrieveApprovalThreshold(approvalFlow);
                }

            } catch (e) {
                log.error(title + ' Error', e);
            }

        }

        const retrieveApprovalThreshold = (approvalFlow) => {
            const filters = [
                [TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.THRESHOLD_TYPE, 'anyof', approvalFlow],
                'AND',
                ['isinactive', 'is', 'F'],
            ];

            const columns = [
                search.createColumn({ name: TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.COMPANY_AUTO_APPROVAL_LIMIT }),
                search.createColumn({ name: TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.TIER_1_APPROVAL_LIMIT }),
                search.createColumn({ name: TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.TIER_2_APPROVAL_LIMIT }),
                search.createColumn({ name: TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.FIELDS.TIER_3_APPROVAL_LIMIT })
            ];

            const approvalThresholdSearch = search.create({
                type: TSCCONST.CUSTOM_RECORDS.APPROVAL_THRESHOLDS.ID,
                filters: filters,
                columns: columns
            });

            const searchResults = approvalThresholdSearch.run().getRange({ start: 0, end: 1 });
            if (searchResults && searchResults.length > 0) {
                return searchResults[0].id;
            }
            return null;
        }

        return { onAction };
    });
