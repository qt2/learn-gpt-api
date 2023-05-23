mod errors;

use axum::{
    http::{header::CONTENT_TYPE, HeaderValue},
    routing::post,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::CorsLayer;

use self::errors::{APIError, APIResult};
use crate::gpt;

pub fn routes() -> Router {
    Router::new().route("/talk", post(handle_talk)).layer(
        CorsLayer::new()
            .allow_origin("*".parse::<HeaderValue>().unwrap())
            .allow_headers([CONTENT_TYPE]),
    )
}

#[derive(Debug, Deserialize)]
struct TalkRequest {
    message: String,
}

#[derive(Debug, Serialize)]
struct TalkResponse {
    message: String,
}

async fn handle_talk(Json(req): Json<TalkRequest>) -> APIResult<Json<TalkResponse>> {
    let message = req.message;
    let length = message.len();
    if length == 0 || length > 200 {
        return Err(APIError::InvalidArgument);
    }

    println!("access");

    match gpt::talk(&message).await {
        Ok(message) => Ok(Json(TalkResponse { message })),
        Err(_) => Err(APIError::InternalError),
    }
}
