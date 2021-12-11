'use strict';

class ModelAnalyse {
    updateAnalysis = null;    // Callback to function in ls.view.analyse

    database = null;

    modelConstraint = null;
    modelEventChain = null;

    constructor() { }


    // -----------------------------------------------------
    // Registration of callbacks from the controller

    registerAnalyseCallback(callback) {
        this.updateAnalysis = callback;
    }


    // -----------------------------------------------------
    // Registration of model database

    registerModelDatabase(database) {
        this.database = database;
    }

    registerModelConstraint(modelConstraint) {
        this.modelConstraint = modelConstraint;
    }

    registerModelEventChain(modelEventChain) {
        this.modelEventChain = modelEventChain;
    }

    // -----------------------------------------------------
    // Class methods

    getAnalyse() {
        // Get all event chain instances and all constraints.
        // Collect all the event chain instances of each constraint, and compute their maxLatency.
        const promiseAllEventChainInstances = this.modelEventChain.getAllEventChainsInstances();
        const promiseAllConstraints = this.modelConstraint.getAllConstraints();
        const promiseAllEvaluations = Promise.all([promiseAllConstraints, promiseAllEventChainInstances])
            .then(([allConstraints, allChainInstances]) => {

                // Make sure that the event chains are sorted by chain name and then instance number.
                allChainInstances.sort(function(a, b) {
                    // Sort based on event chain name.
                    if (a.chainName < b.chainName) { return -1; }
                    if (a.chainName > b.chainName) { return 1; }

                    // Sort instances of the same event chain by their instance number.
                    return a.instance - b.instance;
                });

                // Compute all available metrics on every event chain instance, grouped by event chain name.
                let groupedChainInstances = { };
                allChainInstances.forEach(chainInstance => { groupedChainInstances[chainInstance.chainName] = [] });
                allChainInstances.forEach(chainInstance => { groupedChainInstances[chainInstance.chainName].push(chainInstance) });

                // Iterate over the available plug-ins and compute metrics for all event chain instances, grouped by event chain name.
                const timingPlugins = PluginMetric.OfCategory(PluginMetric.Category.Timing);
                const results = Object.fromEntries(Object.keys(groupedChainInstances).map(chainName => [chainName, { }]));
                for (const chainName in groupedChainInstances) {
                    for (const pluginName in timingPlugins) {
                        results[chainName][pluginName] = { 'metrics': timingPlugins[pluginName].Result(chainName, groupedChainInstances[chainName])} ;
                    }
                }

                // Evaluate each timing constraint on the latency metrics.
                const latencyTimingPlugins = PluginMetric.OfOutput(timingPlugins, PluginMetric.Output.Latencies);
                for (const chainName in results) {
                    for (const pluginName in latencyTimingPlugins) {
                        results[chainName][pluginName]['constraints'] = { };
                        for (const constraint of allConstraints.filter(constraint => chainName == constraint.eventChain)) {
                            const metrics = results[chainName][pluginName]['metrics']['raw'];
                            results[chainName][pluginName]['constraints'][constraint.name] = Object.fromEntries(Object.keys(metrics)
                                .map(instance => [instance, eval(`${metrics[instance]} ${constraint.relation} ${constraint.time}`)])
                            );
                        }
                    }
                }
                
                return results;
            });

        return promiseAllEvaluations;
    }

    toString() {
        return "ModelAnalyse";
    }
}
