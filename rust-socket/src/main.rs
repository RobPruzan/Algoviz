use async_std::{
    net::{TcpListener, TcpStream},
    task,
};
use futures::{SinkExt, StreamExt};
use tungstenite::Message;

async fn handle_client(stream: TcpStream) {
    let callback = |req: &tungstenite::handshake::server::Request, res: tungstenite::handshake::server::Response| {
        println!("Received a new ws handshake");
        println!("The request's path is: {}", req.uri().path());
        println!("The request's headers are:");
        for &(ref header, _ /* value */) in req.headers().iter() {
            println!("* {}", header);
        }

        Ok(res)
    };

    if let Ok(mut websocket) = tungstenite::accept_hdr_async(stream, callback).await {
        println!("WebSocket connection established.");

        while let Some(Ok(msg)) = websocket.next().await {
            if msg.is_binary() || msg.is_text() {
                websocket.send(msg).await.unwrap();
            }
        }
    }

    println!("WebSocket connection closed.");
}

fn main() {
    task::block_on(async {
        let server = TcpListener::bind("127.0.0.1:9001").await.unwrap();
        println!("WebSocket server listening on ws://127.0.0.1:9001");

        while let Ok((stream, _)) = server.accept().await {
            task::spawn(handle_client(stream));
        }
    });
}
