mod gpt;
mod routes;

use std::net::SocketAddr;

use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    dotenvy::dotenv().ok();

    let host = std::env::var("HOST").unwrap_or("127.0.0.1".into());
    let port = std::env::var("PORT").unwrap_or("5000".into());
    let addr: SocketAddr = format!("{}:{}", host, port)
        .parse()
        .expect("Failed to parse address");
    println!("Listening on {:#?}", addr);

    axum::Server::bind(&addr)
        .serve(routes::routes().into_make_service())
        .await
        .unwrap();

    Ok(())
}
