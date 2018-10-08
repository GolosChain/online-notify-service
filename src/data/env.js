// Описание переменных окружения смотри в Readme.
const env = process.env;

module.exports = {
    GLS_FACADE_CONNECT: env.GLS_FACADE_CONNECT,
    GLS_NOTIFY_CONNECT: env.GLS_NOTIFY_CONNECT,
};
