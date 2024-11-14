const fs = require('fs');
const {BASE_DIR} = require('./config');


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


// Labeled as unsafe since it does not check for path traversal.
// this should be checked before calling this function 
const unsafe_sync_read = (path) => {
    let file_data = "";
    try {
        file_data = fs.readFileSync(path);
        
    } catch (error) {
        // TODO: Error handler
        console.error(`Error: ${error}`);
    }
    return file_data;
}


module.exports = {
    sanitize_path,
    get_mime_type,
    unsafe_sync_read
}