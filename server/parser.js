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

// Turn a dictionary of headers into a string
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


module.exports = {
    pre_process_headers,
    format_headers
}