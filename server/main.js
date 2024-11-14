const net = require('net');
const fs = require('fs');

const HOST = process.env.SERVER_PORT || '127.0.0.1';
const PORT = parseInt(process.env.SERVER_PORT, 10) || 4040;
const BASE_DIR = process.env.BASE_DIR || './pages/';
const SERVER_NAME = process.env.SERVER_NAME || 'breadserver:0.1';

process.stdout.write(`Starting server on ${HOST}::${PORT}... `)


const socket_server = net.createServer((socket) => {
    console.log(`Connection recieved: ${socket.remoteAddress}::${socket.remotePort}`)

    let response = null;
    socket.on('data', (data) => {
        // Process request
        response = request_distributor(data);

        // Send response
        socket.write(response);
    });

    // Handle client disconnecting
    socket.on('end', () => {
        console.log(`Client disconnected`);
    });
    // Handle errors
    socket.on('error', (err) => {
        console.error(`Error: ${err}`);
    });
});



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
    const header_data = pre_process_headers(header_lines);
    console.log("METHOD: ", header_data['request']['method']);
    
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


// Return a dictionary of headers
const pre_process_headers = (header_lines) => {
    const header_data = {};

    const [method, path, version] = header_lines[0].split(' '); 
    
    header_data['request'] = {method, path, version};
    header_data['fields'] = {};
    
    for (let i = 1; i < header_lines.length; i++) {
        const [key, value] = header_lines[i].split(': ');
        header_data['fields'][key] = value;
    }
    
    return header_data
};

const format_headers = (header_data) => {
    const lb = '\r\n'; // Line break
    let header = '';
    header += `${header_data['request']['version']} ${header_data['request']['status']} ${header_data['request']['message']}${lb}`;
    
    // loop over fields
    for (const [key, value] of Object.entries(header_data['fields'])) {
        header += `${key}: ${value}${lb}`;
    }
    
    return header;
};


const process_get_request = (header_data) => {
    
    const path = sanitize_path(header_data['request']['path']);
    
    // load requested file as binary
    console.log(`Requested path: ${path}`);
    let file_data = "";
    try {
        file_data = fs.readFileSync(path);
        
    } catch (error) {
        // TODO: Error handler
        console.error(`Error: ${error}`);
    }

    // Construct return header
    const return_header_data = {};
    return_header_data['request'] = {
        version: header_data['request']['version'],
        status: 200,
        message: 'OK'
    } 
    
    mime_literal = get_mime_type(path)['literal'];
    mime_disposition = get_mime_type(path)['disposition'];
    return_header_data['fields'] = {
        server: SERVER_NAME,
        date: new Date().toUTCString(),
        'Content-Type': get_mime_type(path)['literal'],
        'Content-Length': file_data.length,
        'Content-Cisposition': `${mime_disposition}; filename="${path.split('/').pop()}"`,
    }
    
    const formatted_header = format_headers(return_header_data);
    console.log(formatted_header);

    return formatted_header + '\r\n' + file_data;
};


// TODO: Test this function, make sure it properly prevents any path traversal
// Sanitize path
// As with many things in this project, this should be done
// with a library, but I wont.
const sanitize_path = (requested_path) => {
    
    let path = requested_path;
    
    // Remove leading slashes
    path = path.replace(/^\/+/, '');

    // In a loop, remove double slashes and double dots until there are no more
    while (path.match(/\/{2,}/g) || path.match(/\/\.\.\//g)) {
        path = path.replace(/\/{2,}/g, '/');
        path = path.replace(/\/\.\.\//g, '/');
    }

    // Replace lone trailing slash or empty with index.html
    if (path.match(/\/$/g) || path == '') {
        path = 'index.html';
    }

    // If no file extension is present, add .html
    if (!path.match(/\.\w+$/g)) {
        path += '.html';
    }
        
    // Add base directory
    path = BASE_DIR + path;

    console.log(`Path sanitized: '${requested_path}' --> '${path}'`);

    return path;
};


// Return an http content-type style mime type
// TODO: This function is only temporary, and should be replaced
// with something that takes into account file magic and binary types.
// I will do this later as it will require binary analysis and a lot more 
// work.
const get_mime_type = (path) => {
    const mimeTypes = {
        '.html': { literal: 'text/html', disposition: 'inline', binary: false },
        '.js': { literal: 'text/javascript', disposition: 'inline', binary: false },
        '.json': { literal: 'application/json', disposition: 'attachment', binary: false },
        '.css': { literal: 'text/css', disposition: 'inline', binary: false },
        '.png': { literal: 'image/png', disposition: 'inline', binary: true },
        '.jpg': { literal: 'image/jpeg', disposition: 'inline', binary: true },
        '.jpeg': { literal: 'image/jpeg', disposition: 'inline', binary: true },
        '.gif': { literal: 'image/gif', disposition: 'inline', binary: true },
        '.svg': { literal: 'image/svg+xml', disposition: 'inline', binary: false },
        '.pdf': { literal: 'application/pdf', disposition: 'attachment', binary: true },
        '.zip': { literal: 'application/zip', disposition: 'attachment', binary: true },
        '.rar': { literal: 'application/x-rar-compressed', disposition: 'attachment', binary: true },
        '.doc': { literal: 'application/msword', disposition: 'attachment', binary: true },
        '.docx': { literal: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', disposition: 'attachment', binary: true },
        '.xlsx': { literal: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', disposition: 'attachment', binary: true },
        '.pptx': { literal: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', disposition: 'attachment', binary: true },
        '.mp4': { literal: 'video/mp4', disposition: 'inline', binary: true },
        '.mov': { literal: 'video/quicktime', disposition: 'inline', binary: true },
        '.avi': { literal: 'video/x-msvideo', disposition: 'inline', binary: true },
        '.mp3': { literal: 'audio/mpeg', disposition: 'attachment', binary: true },
        '.wav': { literal: 'audio/wav', disposition: 'attachment', binary: true },
        '.txt': { literal: 'text/plain', disposition: 'attachment', binary: false }
    };    
    const ext = path.match(/\.\w+$/g)[0];
    return mimeTypes[ext];
};

// Start server
socket_server.listen(PORT, HOST, () => {
    console.log(`done`);
});