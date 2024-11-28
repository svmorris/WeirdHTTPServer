const parser = require('./parser');
const runner = require('./runner');
const filesystem = require('./filesystem');
const {SERVER_NAME} = require('./config');

const process_get_request = async (header_data) => {
    const path = filesystem.sanitize_path(header_data['request']['path']);
    

    let file_data = "";
    let return_headers = {};
    let formatted_header = "";

    // If path ends with .py, then we run it and
    // return stdout instead of the file
    if (path.match(/\.py$/g)) {
        file_data = await runner.run_script(path, header_data, ''); 
        try {
            
            // Remove trailing newline then parse the last
            // real line as json
            return_headers = JSON.parse(file_data.trim().split('\n').pop());
            file_data = file_data.trim().split('\n').slice(0, -1).join('\n');
        }
        catch (err) {
            console.log(`Error parsing headers returned from script: ${err}`);
            err.unsafeMessage = "Communication error between server and backend script";
            err.code = 500;
            throw err;
        }
        console.log("file data: ", file_data);
        return_headers['fields']['Content-Length'] = file_data.length;
        console.log("return headers: ", return_headers);
        formatted_header = parser.format_headers(return_headers);
    }

    // Just read and return a file
    else {
        
        file_data = await filesystem.unsafe_async_read(path);
        // Construct return header
        return_headers['request'] = {
            version: header_data['request']['version'],
            status: 200,
            message: 'OK'
        } 
        
        mime_data = filesystem.get_mime_type(path);
        mime_literal = mime_data['literal'];
        mime_disposition = mime_data['disposition'];
        return_headers['fields'] = {
            server: SERVER_NAME,
            date: new Date().toUTCString(),
            'Content-Type': mime_literal,
            'Content-Length': file_data.length,
            'Content-Cisposition': `${mime_disposition}; filename="${path.split('/').pop()}"`,
        }
        
        formatted_header = parser.format_headers(return_headers);

        }

    console.log(`Returning ${file_data.length} bytes`);
    return formatted_header + '\r\n' + file_data;

};


const request_distributor = async (data) => {
    const lb = '\r\n'; // Line break
    
    // Separate http header from body
    const [header, body] = data.toString().split(`${lb}${lb}`);

    // Process each header individually
    const header_lines = header.split(lb);
    if (header_lines.length < 1) {
        // Print error in red
        console.log(`\x1b[31mError: Empty request\x1b[0m`);
        return;
    }
    const header_data = parser.pre_process_headers(header_lines);
    
    // Dispach requests
    switch (header_data['request']['method']) {
        case 'GET':
            return await process_get_request(header_data)
        case 'POST':
            console.log(`POST request is unsupported`);
            break;
        case 'PUT':
            console.log(`PUT request is unsupported`);
            break;
        case 'DELETE':
            console.log(`DELETE request is unsupported`);
            break;
        default:
            // TODO: Error handler
            console.log(`Unknown request method: ${header_data['request']['method']}`);
    }
}

module.exports = {
    request_distributor,
}