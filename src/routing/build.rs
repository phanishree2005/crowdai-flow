fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::configure()
        .build_server(true)
        .build_client(false)
        .compile(
            &["../../api/proto/crowdflow/routing/v1/routing.proto"],
            &["../../api/proto"],
        )?;
    Ok(())
}
