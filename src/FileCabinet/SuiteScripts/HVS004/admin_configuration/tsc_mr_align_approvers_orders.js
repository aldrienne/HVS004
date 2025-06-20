/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/runtime', 'N/search', 'N/record', '../core/tsc_cm_constants'],
    /**
 * @param{runtime} runtime
 * @param{search} search
 * @param{record} record
 * @param{constants} constants
 */
    (runtime, search, record, constants) => {
        const SCRIPT_PARAMS = {
            ALIGN_TYPE: "custscript_tsc_hvs004_align_type",
        };

        const MAPPING_TIERS = {
            [constants.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.PRIMARY_APPROVER]: "TIER 1",
            [constants.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.SECONDARY_APPROVER]: "TIER 2",
            [constants.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.TERTIARY_APPROVER]: "TIER 3"
        }

        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => {
            let title = "getInputData: ";
            try {
                let alignType = runtime.getCurrentScript().getParameter({ name: SCRIPT_PARAMS.ALIGN_TYPE });

                switch (alignType) {
                    case 'APPROVERS':
                        return retrieveActiveApprovers();
                    case 'DELEGATES':
                        return retrieveActiveDelegates();
                    case 'ACTIVATE_NEW_DELEGATIONS':
                        return retrieveActiveDelegates();
                    case 'UNASSIGN_EXPIRED_DELEGATES':
                        return inactiveDelegates();
                    default:
                        throw new Error("Invalid align type specified: " + alignType);
                }
            } catch (e) {
                log.error(title + "Error", e);
            }

        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const map = (mapContext) => {
            let title = "map: ";
            try {
                let key = mapContext.key;
                let value = JSON.parse(mapContext.value)['values'];
                let alignType = runtime.getCurrentScript().getParameter({ name: SCRIPT_PARAMS.ALIGN_TYPE });

                if (alignType == 'APPROVERS') {
                    let approvalFlow = value[constants.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.CONFIG_TYPE][0]['value'];
                    // Define approver fields to process
                    const approverFields = [
                        constants.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.PRIMARY_APPROVER,
                        constants.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.SECONDARY_APPROVER,
                        constants.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.TERTIARY_APPROVER
                    ];
                    // Process each approver field
                    approverFields.forEach(field => {
                        if (value[field] && value[field][0] && value[field][0]['value']) {
                            let approverId = value[field][0]['value'];
                            let orders = retrieveOrders(approverId, MAPPING_TIERS[field], approvalFlow);
                            let mapKey = approverId + '|' + approvalFlow;

                            log.debug(`Processing ${field}`, { approverId, mapKey, orderCount: orders.length });
                            if (orders.length > 0) {
                                mapContext.write({
                                    key: mapKey,
                                    value: orders
                                });
                            } else {
                                log.audit(title + "No Ordrers found for Approver", { approverId, approvalFlow });
                            }
                        }
                    });
                } else if (alignType == 'DELEGATES') {
                    let primaryApprover = value[constants.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.PRIMARY_APPROVER]['value'];
                    let delegateApprover = value[constants.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.DELEGATE_APPROVER]['value'];
                    log.debug(title + "Processing Delegate Approver", { primaryApprover, delegateApprover });
                    let orders = retrieveOrdersDelegate(primaryApprover, delegateApprover);
                    if (orders.length > 0) {
                        mapContext.write({
                            key: primaryApprover + '|' + delegateApprover,
                            value: orders
                        });
                    } else {
                        log.audit(title + "No Orders found for Delegate Approver", { primaryApprover, delegateApprover });
                    }
                } else if (alignType == 'UNASSIGN_EXPIRED_DELEGATES') {
                    log.debug(title + "Unassigning Expired Delegates", { key, value });
                    let primaryApprover = value[constants.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.PRIMARY_APPROVER]['value'];
                    let delegateApprover = value[constants.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.DELEGATE_APPROVER]['value'];
                    let orders = retrieveOrdersDelegate(primaryApprover, delegateApprover, true);
                    if (orders.length > 0) {
                        log.audit(title + "Orders found for Expired Delegate Approver", { primaryApprover, delegateApprover, orders });
                        mapContext.write({
                            key: primaryApprover + '|' + delegateApprover,
                            value: orders
                        });
                    } else {
                        log.audit(title + "No Orders found for Expired Delegate Approver", { primaryApprover, delegateApprover });
                    }
                }else if (alignType == 'ACTIVATE_NEW_DELEGATIONS') {
                    log.debug(title + "Activating New Delegations", { key, value });
                    let primaryApprover = value[constants.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.PRIMARY_APPROVER]['value'];
                    let delegateApprover = value[constants.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.DELEGATE_APPROVER]['value'];
                    let orders = retrieveOrdersDelegate(primaryApprover, delegateApprover, false, true);
                    if (orders.length > 0) {
                        log.audit(title + "Orders found for Activating New Delegate Approver", { primaryApprover, delegateApprover, orders });
                        mapContext.write({
                            key: primaryApprover + '|' + delegateApprover,
                            value: orders
                        });
                    } else {
                        log.audit(title + "No Orders found for Activating New Delegate Approver", { primaryApprover, delegateApprover });
                    }
                }




            } catch (e) {
                log.error(title + "Error", e);
            }
        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {
            let title = "reduce: ";
            try {
                let key = reduceContext.key;
                let values = reduceContext.values;
                let alignType = runtime.getCurrentScript().getParameter({ name: SCRIPT_PARAMS.ALIGN_TYPE });

                if (alignType == 'APPROVERS') {
                    let approverId = key.split('|')[0];
                    let approvalFlow = key.split('|')[1];


                    for (let i = 0; i < values.length; i++) {
                        let value = JSON.parse(values[i]);
                        log.debug(title + "Processing Order", { approverId, approvalFlow, value });
                        log.debug(title + 'value', value);
                        for (let j = 0; j < value.length; j++) {
                            switch (alignType) {
                                case 'APPROVERS':
                                    record.submitFields({
                                        type: record.Type.PURCHASE_ORDER,
                                        id: value[j],
                                        values: {
                                            nextapprover: approverId
                                        },
                                        options: {
                                            enableSourcing: false,
                                            ignoreMandatoryFields: true
                                        }
                                    })
                                    break;
                                default:
                                    throw new Error("Invalid align type specified: " + alignType);
                            }
                        }
                    }
                } else if (alignType == 'DELEGATES') {
                    let primaryApprover = key.split('|')[0];
                    let delegateApprover = key.split('|')[1];

                    for (let i = 0; i < values.length; i++) {
                        let value = JSON.parse(values[i]);
                        log.debug(title + "Processing Order for Delegate Approver", { primaryApprover, delegateApprover, value });
                        log.debug(title + 'value', value);
                        for (let j = 0; j < value.length; j++) {
                            record.submitFields({
                                type: record.Type.PURCHASE_ORDER,
                                id: value[j],
                                values: {
                                    [constants.CUSTOM_BODY_FIELDS.ASSIGNED_DELEGATE_APPROVER]: delegateApprover,
                                },
                                options: {
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                }
                            })
                        }
                    }
                } else if (alignType == 'UNASSIGN_EXPIRED_DELEGATES') {
                    log.debug(title + "Unassigning Expired Delegates", { key, values });
                    let primaryApprover = key.split('|')[0];
                    let delegateApprover = key.split('|')[1];
                    for (let i = 0; i < values.length; i++) {
                        let value = JSON.parse(values[i]);
                        log.debug(title + "Processing Order for Unassigning Expired Delegate Approver", { primaryApprover, delegateApprover, value });
                        log.debug(title + 'value', value);
                        for (let j = 0; j < value.length; j++) {
                            record.submitFields({
                                type: record.Type.PURCHASE_ORDER,
                                id: value[j],
                                values: {
                                    [constants.CUSTOM_BODY_FIELDS.ASSIGNED_DELEGATE_APPROVER]: null,
                                    [constants.CUSTOM_BODY_FIELDS.IS_DELEGATE_ACTIVE]: false,
                                },
                                options: {
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                }
                            })
                        }
                    }
                } else if (alignType == 'ACTIVATE_NEW_DELEGATIONS') {
                    log.debug(title + "Activating New Delegations", { key, values });
                    let primaryApprover = key.split('|')[0];
                    let delegateApprover = key.split('|')[1];

                    for (let i = 0; i < values.length; i++) {
                        let value = JSON.parse(values[i]);
                        log.debug(title + "Processing Order for Activating New Delegate Approver", { primaryApprover, delegateApprover, value });
                        log.debug(title + 'value', value);
                        for (let j = 0; j < value.length; j++) {
                            record.submitFields({
                                type: record.Type.PURCHASE_ORDER,
                                id: value[j],
                                values: {
                                    [constants.CUSTOM_BODY_FIELDS.ASSIGNED_DELEGATE_APPROVER]: delegateApprover,
                                    [constants.CUSTOM_BODY_FIELDS.IS_DELEGATE_ACTIVE]: true,
                                },
                                options: {
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                }
                            })
                        }
                    }
                    
                }


            } catch (e) {
                log.error(title + "Error", e);
            }
        }


        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {

        }

        const retrieveActiveApprovers = () => {
            var customrecord_tsc_approver_configSearchObj = search.create({
                type: constants.CUSTOM_RECORDS.APPROVER_CONFIG.ID,
                filters:
                    [
                        ["isinactive", "is", "F"]
                    ],
                columns:
                    [
                        search.createColumn({ name: constants.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.PRIMARY_APPROVER, label: "Primary Approver" }),
                        search.createColumn({ name: constants.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.SECONDARY_APPROVER, label: "Secondary Approver" }),
                        search.createColumn({ name: constants.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.TERTIARY_APPROVER, label: "Tertiary Approver" }),
                        search.createColumn({ name: constants.CUSTOM_RECORDS.APPROVER_CONFIG.FIELDS.CONFIG_TYPE, label: "Configuration Type" })
                    ]
            });
            return customrecord_tsc_approver_configSearchObj.run().getRange({ start: 0, end: 1000 });
        }

        const retrieveOrders = (approver, approvalLevel, approvalFlow) => {
            let title = "retrieveOrders: ";
            log.debug(title + 'parameters', { approver, approvalLevel, approvalFlow });
            let results = [];
            var purchaseorderSearchObj = search.create({
                type: "purchaseorder",
                filters:
                    [
                        ["type", "anyof", "PurchOrd"],
                        "AND",
                        [constants.CUSTOM_BODY_FIELDS.APPROVAL_LEVEL, "is", approvalLevel],
                        "AND",
                        ["nextapprover", "noneof", approver],
                        "AND",
                        ["mainline", "is", "T"],
                        "AND",
                        [constants.CUSTOM_BODY_FIELDS.APPROVAL_FLOW, "anyof", approvalFlow],
                        "AND",
                        ['status', 'anyof', 'PurchOrd:A'],
                    ],
                columns: []

            });
            var searchResultCount = purchaseorderSearchObj.runPaged().count;
            log.debug("purchaseorderSearchObj result count", searchResultCount);
            purchaseorderSearchObj.run().each(function (result) {
                results.push(result.id);
                return true;
            });

            log.debug(title + 'results', results);
            return results;
        }

        const retrieveActiveDelegates = () => {
            var customrecord_tsc_delegate_approversSearchObj = search.create({
                type: constants.CUSTOM_RECORDS.DELEGATE_APPROVERS.ID,
                filters:
                    [
                        ["isinactive", "is", "F"],
                        "AND",
                        [constants.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.START_DATE, "onorbefore", "today"],
                        "AND",
                        [[constants.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.END_DATE, "isempty", ""], "OR", [constants.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.END_DATE, "onorafter", "today"]]
                    ],
                columns:
                    [
                        search.createColumn({ name: constants.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.PRIMARY_APPROVER, label: "Primary Approver" }),
                        search.createColumn({ name: constants.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.DELEGATE_APPROVER, label: "Delegate Approver" })
                    ]
            });
            return customrecord_tsc_delegate_approversSearchObj
        }

        const retrieveOrdersDelegate = (primaryApprover, delegateApprover, isActionUnassign = false, isActionAssign = false) => {
            log.debug("retrieveOrdersDelegate: ", { primaryApprover, delegateApprover, isActionUnassign, isActionAssign });
            let results = [];
            let filters = [
                ["type", "anyof", "PurchOrd"],
                "AND",
                ["nextapprover", "anyof", primaryApprover],
                "AND",
                ["mainline", "is", "T"],
                "AND",
                ['status', 'anyof', 'PurchOrd:A'],
            ];
            
            if (isActionUnassign) {
                // For unassigning expired delegates: find orders where this delegate is currently assigned and active
                filters.push("AND", [constants.CUSTOM_BODY_FIELDS.ASSIGNED_DELEGATE_APPROVER, "anyof", delegateApprover]);
                filters.push("AND", [constants.CUSTOM_BODY_FIELDS.IS_DELEGATE_ACTIVE, "is", "T"]);
            } else if (isActionAssign) {
                // For activating new delegates: find orders where delegation is not yet active (or no delegate assigned)
                filters.push("AND", [constants.CUSTOM_BODY_FIELDS.IS_DELEGATE_ACTIVE, "is", "F"]);
            } else {
                // For regular delegate assignment: find orders where this delegate is not currently assigned
                filters.push("AND", [constants.CUSTOM_BODY_FIELDS.ASSIGNED_DELEGATE_APPROVER, "noneof", delegateApprover]);
            }

            log.debug("retrieveOrdersDelegate: filters", filters);

            var purchaseorderSearchObj = search.create({
                type: "purchaseorder",
                filters: filters,
                columns: []
            });
            var searchResultCount = purchaseorderSearchObj.runPaged().count;
            log.debug("purchaseorderSearchObj result count", searchResultCount);
            purchaseorderSearchObj.run().each(function (result) {
                results.push(result.id);
                return true;
            });

            /*
            purchaseorderSearchObj.id="customsearch1750440305553";
            purchaseorderSearchObj.title="Custom Transaction Search 3 (copy)";
            var newSearchId = purchaseorderSearchObj.save();
            */
            return results;
        }

        const inactiveDelegates = () => {
            var customrecord_tsc_delegate_approversSearchObj = search.create({
                type: constants.CUSTOM_RECORDS.DELEGATE_APPROVERS.ID,
                filters:
                    [
                        ["isinactive", "is", "F"],
                        "AND",
                        [constants.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.START_DATE, "onorbefore", "today"],
                        "AND",
                        [constants.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.END_DATE, "onorbefore", "today"]
                    ],
                columns:
                    [
                        search.createColumn({ name: constants.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.PRIMARY_APPROVER, label: "Primary Approver" }),
                        search.createColumn({ name: constants.CUSTOM_RECORDS.DELEGATE_APPROVERS.FIELDS.DELEGATE_APPROVER, label: "Delegate Approver" })
                    ]
            });

            return customrecord_tsc_delegate_approversSearchObj;
        }

        return { getInputData, map, reduce, summarize }

    });
