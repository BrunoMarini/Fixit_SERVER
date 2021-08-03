let {PythonShell} = require('python-shell');

/**
 * Auxiliar function to generate python options for PythonShell
 * 
 * @param {*} scriptPath path of script to be executed
 * @param  {...any} args required script arguments
 * 
 * @returns python options
 */
module.exports.generatePythonOptions = (scriptPath, ...args) => {
    const arguments = [];
    for (let i = 0; i < args.length; i++) {
        arguments.push(args[i]);
    }
    
    return {
        mode:           'text',
        pythonPath:     'python',
        pythonOptions:  [],
        scriptPath:     scriptPath,
        args:           arguments
    };
}

/**
 * Auxiliar function to run python algorithm
 * 
 * @param {*} script script to be runned 
 * @param {*} options options generated by {@link generatePythonOptions}
 * 
 * @returns Output of python script 
 */
module.exports.runPython = async (script, options) => {
    async function runPythonShell(script, options) {
        try {
            const { success, err = '', results } = await new Promise(
                (resolve, reject) => {
                    PythonShell.run(script, options,
                        function (err, results) {
                            if (err) {
                                reject({ success: false, err });
                            } 
                            console.log("[PythonShell] Results: %j", results);
                            resolve({ success: true, results });
                        }
                    );
                }
            );
            
            console.log("[Server] Python call ends");
    
            if(!success) {
                console.log("[Server] Python error: " + err);
                return;
            }
    
            console.log("[Server] Result: " + results);
            return results;
        } catch (err) {
            console.log("[Server] Error during promise: ", err);
        }
    }

    return await runPythonShell(script, options);
}