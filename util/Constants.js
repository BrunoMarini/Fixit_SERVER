// Response
const HTTP_OK = 200; 
const HTTP_CONFLICT = 409;
const HTTP_INTERNAL_SERVER_ERROR = 500;

// Messages
const MESSAGE_REGISTER_SUCCESS = "Usuario foi registrado com sucesso!";
const MESSAGE_REGISTER_CONFLICT = "Usuario já cadastrado na base de dados!";

module.exports = {
    HTTP_OK:                    HTTP_OK,
    HTTP_CONFLICT:              HTTP_CONFLICT,
    HTTP_INTERNAL_SERVER_ERROR: HTTP_INTERNAL_SERVER_ERROR,
    MESSAGE_REGISTER_SUCCESS:   MESSAGE_REGISTER_SUCCESS,
    MESSAGE_REGISTER_CONFLICT:  MESSAGE_REGISTER_CONFLICT
}