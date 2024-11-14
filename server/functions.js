const filesystem = require('./filesystem');
const parser = require('./parser');
const {SERVER_NAME} = require('./config');

const process_get_request = (header_data) => {
    const path = filesystem.sanitize_path(header_data['request']['path']);
    
    const file_data = filesystem.unsafe_sync_read(path);

    // Construct return header
    const return_header_data = {};
    return_header_data['request'] = {
        version: header_data['request']['version'],
        status: 200,
        message: 'OK'
    } 
    
    mime_data = filesystem.get_mime_type(path);
    mime_literal = mime_data['literal'];
    mime_disposition = mime_data['disposition'];
    return_header_data['fields'] = {
        server: SERVER_NAME,
        date: new Date().toUTCString(),
        'Content-Type': mime_literal,
        'Content-Length': file_data.length,
        'Content-Cisposition': `${mime_disposition}; filename="${path.split('/').pop()}"`,
    }
    
    const formatted_header = parser.format_headers(return_header_data);

    return formatted_header + '\r\n' + file_data;
};


const request_distributor = (data) => {
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
            return process_get_request(header_data)
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