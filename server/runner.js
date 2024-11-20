const { spawn } = require('child_process');



const run_script = async (script_path, headers, body) => {
    
    const init_command = `python`
    const init_arguments = ["./bootstrap.py", script_path];
    

    console.log("got here");
    return new Promise((resolve, reject) => {

        // IMPORTANT: changing this to true will allow shell injection
        const shell = false;

        const process = spawn(init_command, init_arguments, { shell: shell });
        let output = '';
        let error = '';
        process.stdout.on('data', (data) => {
            output += data;
        });
        process.stderr.on('data', (data) => {
            error += data;
        });
        process.on('close', (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(error);
            }
        });

        // Write separate strings with delimiters
        process.stdin.write(JSON.stringify(headers) + '\n');
        setTimeout(() => {
            process.stdin.write(body);
            process.stdin.end();
        }, 1000);
    });
}


module.exports = {
    run_script
}