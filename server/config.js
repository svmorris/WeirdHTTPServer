
// Environment variables
module.exports = {
    HOST: process.env.SERVER_PORT || '127.0.0.1',
    PORT: parseInt(process.env.SERVER_PORT, 10) || 4040,
    BASE_DIR: process.env.BASE_DIR || './pages/',
    SERVER_NAME: process.env.SERVER_NAME || 'breadserver:0.1',
}

