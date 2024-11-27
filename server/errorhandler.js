class ErrorHandler {
    constructor(err) {
        this.err = err;

        // Check if err.code is defined and non-null before assigning
        if (err && err.code) {
            this.code = err.code;
        } else {
            // Default to 501 if err.code is undefined or null
            this.code = 501;
        } 
        console.log("code: ", this.code);
    }

    distributor() {
        switch (this.code) {
            case 301:
            case 302:
            case 304:
                return this.error300();
            case 400:
                return this.error400();
            case 401:
                return this.error401();
            case 403:
                return this.error403();
            case 404:
                return this.error404();
            case 405:
                return this.error405();
            case 418:
                return this.error418();
            case 500:
            case 501:
                return this.error500();
            case 502:
                return this.error503();
            case 503:
                return this.error503();
            case 504:
                return this.error504();
            case 505:
                return this.error505();
            default:
                return this.error500();
        }
    }
    
    getHTTPResponse() {
        return this.distributor();
    }
    
    
    // moved permiently (im just grouping all of 300 as 301 since they aren't really used)
    error300() {
        // Location variable is unsafe since it is being used in html templating
        // MAKE SURE THIS IS NOT A SOURCE OF USER INPUT
        let moveLocationUnsafe = this.err.unsafeMoveLocation?.toString();
        if (!moveLocationUnsafe) {
            moveLocationUnsafe = "/";
        }

        let body =`<html>
          <head>
            <title>301 Moved Permanently</title>
          </head>
          <body>
            <h1>Moved Permanently</h1>
            <p>The document has moved to <a href="${moveLocationUnsafe}">${moveLocationUnsafe}</a>.</p>
          </body>
        </html>`;
        
        let headers = `HTTP/1.1 301 Moved Permanently\r\n`;
        headers += "Content-Type: text/html\r\n";
        headers += `Location: ${moveLocationUnsafe}\r\n`;
        headers += `Content-Length: ${body.length}\r\n`;
        headers += "Connection: close\r\n";
        
        return headers + "\r\n" + body;
    }
    
    error400() {
        let body = `<html>
          <head>
            <title>400 Bad Request</title>
          </head>
          <body>
            <h1>Bad Request</h1>
            <p>Your browser sent a request that this server could not understand.</p>
          </body>`;
        
        let headers = `HTTP/1.1 400 Bad Request\r\n`;
        headers += "Content-Type: text/html\r\n";
        headers += `Content-Length: ${body.length}\r\n`;
        headers += "Connection: close\r\n";

        return headers + "\r\n" + body;
    }
    
    error401() {
        let body = `<html>
          <head>
            <title>401 Unauthorized</title>
          </head>
          <body>
            <h1>Unauthorized</h1>
            <p>This server could not verify that you are authorized to access the document requested.</p>
          </body>`;
        
        let headers = `HTTP/1.1 401 Unauthorized\r\n`;
        headers += "Content-Type: text/html\r\n";
        headers += `Content-Length: ${body.length}\r\n`;
        headers += "Connection: close\r\n";

        return headers + "\r\n" + body;
    }
    
    error403() {
        let body = `<html>
            <head>
                <title>403 Forbidden</title>
            </head>
            <body>
                <h1>Forbidden</h1>
                <p>You don't have permission to access this resource.</p>
            </body>`;
        
        let headers = `HTTP/1.1 403 Forbidden\r\n`;
        headers += "Content-Type: text/html\r\n";
        headers += `Content-Length: ${body.length}\r\n`;
        headers += "Connection: close\r\n";

        return headers + "\r\n" + body;
    }
    

    error404() {
        let body = `<html>
            <head>
                <title>404 Not Found</title>
            </head>
            <body>
                <h1>Not Found</h1>
                <p>The requested URL was not found on this server.</p>
            </body>`;
        
        let headers = `HTTP/1.1 404 Not Found\r\n`;
        headers += "Content-Type: text/html\r\n";
        headers += `Content-Length: ${body.length}\r\n`;
        headers += "Connection: close\r\n";

        return headers + "\r\n" + body;
    }
    
    error405() {
        let body = `<html>
            <head>
                <title>405 Method Not Allowed</title>
            </head>
            <body>
                <h1>Method Not Allowed</h1>
                <p>The method is not allowed for the requested URL.</p>
            </body>`;
        
        let headers = `HTTP/1.1 405 Method Not Allowed\r\n`;
        headers += "Content-Type: text/html\r\n";
        headers += `Content-Length: ${body.length}\r\n`;
        headers += "Connection: close\r\n";

        return headers + "\r\n" + body;
    }
    
    error418() {
        let body = `<html>
            <head>
                <title>418 I'm a teapot</title>
            </head>
            <body>
                <h1>I'm a teapot</h1>
                <p>This server is a teapot, not a coffee machine.</p>
            </body>`;
        
        let headers = `HTTP/1.1 418 I'm a teapot\r\n`;
        headers += "Content-Type: text/html\r\n";
        headers += `Content-Length: ${body.length}\r\n`;
        headers += "Connection: close\r\n";

        return headers + "\r\n" + body;
    }
    
    
    error500() {
        
        // Message is unsafe as it can lead to XSS.
        // DO NOT LET ANY PART OF THE MESSAGE BE USER CONTROLLED
        let unsafeMessage = this.err.unsafeMessage?.toString();
        if (!unsafeMessage) {
            unsafeMessage = "Internal Server Error";
        }
        else{
            unsafeMessage = "Internal Server Error: " + unsafeMessage;
        }
        
        let body = `<html>
            <head>
                <title>500 Internal Server Error</title>
            </head>
            <body>
                <h1>Internal Server Error</h1>
                <p>${unsafeMessage}</p>
            </body>`;
        
        let headers = `HTTP/1.1 500 Internal Server Error\r\n`;
        headers += "Content-Type: text/html\r\n";
        headers += `Content-Length: ${body.length}\r\n`;
        headers += "Connection: close\r\n";

        return headers + "\r\n" + body;
    }
    
    error503() {
        let body = `<html>
            <head>
                <title>503 Service Unavailable</title>
            </head>
            <body>
                <h1>Service Unavailable</h1>
                <p>The server is temporarily unable to service your request due to maintenance downtime or capacity problems. Please try again later.</p>
            </body>`;
        
        let headers = `HTTP/1.1 503 Service Unavailable\r\n`;
        headers += "Content-Type: text/html\r\n";
        headers += `Content-Length: ${body.length}\r\n`;
        headers += "Connection: close\r\n";

        return headers + "\r\n" + body;
    }
    
    error504() {
        let body = `<html>
            <head>
                <title>504 Gateway Time-out</title>
            </head>
            <body>
                <h1>Gateway Time-out</h1>
                <p>The server didn't respond in time.</p>
            </body>`;

        let headers = `HTTP/1.1 504 Gateway Time-out\r\n`;
        headers += "Content-Type: text/html\r\n";
        headers += `Content-Length: ${body.length}\r\n`;
        headers += "Connection: close\r\n";

        return headers + "\r\n" + body;
    }
    
    error505() {
        let body = `<html>
            <head>
                <title>505 HTTP Version Not Supported</title>
            </head>
            <body>
                <h1>HTTP Version Not Supported</h1>
                <p>The server does not support the HTTP protocol version used in the request.</p>
                <p>(This server currently does not support HTTP/2.0)</p>
            </body>`;
        
        let headers = `HTTP/1.1 505 HTTP Version Not Supported\r\n`;
        headers += "Content-Type: text/html\r\n";
        headers += `Content-Length: ${body.length}\r\n`;
        headers += "Connection: close\r\n";

        return headers + "\r\n" + body;
    }
}


module.exports = {
    ErrorHandler
}