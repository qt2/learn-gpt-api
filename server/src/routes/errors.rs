use axum::{http::StatusCode, response::IntoResponse};

pub type APIResult<T> = Result<T, APIError>;

#[derive(Debug)]
pub enum APIError {
    InvalidArgument,
    InternalError,
}

impl IntoResponse for APIError {
    fn into_response(self) -> axum::response::Response {
        match self {
            APIError::InvalidArgument => StatusCode::BAD_REQUEST.into_response(),
            APIError::InternalError => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
        }
    }
}
