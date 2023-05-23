use anyhow::{anyhow, Result};
use async_openai::{
    types::{ChatCompletionRequestMessageArgs, CreateChatCompletionRequestArgs, Role},
    Client,
};

pub async fn talk(input: &str) -> Result<String> {
    let client = Client::new();
    let request = CreateChatCompletionRequestArgs::default()
        .max_tokens(128u16)
        .model("gpt-3.5-turbo")
        .messages([
            ChatCompletionRequestMessageArgs::default()
                .role(Role::System)
                .content("Respond in 1 emoji.")
                .build()?,
            ChatCompletionRequestMessageArgs::default()
                .role(Role::User)
                .content(input)
                .build()?,
        ])
        .build()?;
    let response = client.chat().create(request).await?;

    response
        .choices
        .first()
        .map(|choice| choice.message.content.clone())
        .ok_or_else(|| anyhow!("No message provided!"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_talk() {
        dotenvy::dotenv().ok();
        let response = talk("I'm happy!").await.unwrap();
        dbg!(&response);
    }
}
