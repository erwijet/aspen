
#[macro_export]
macro_rules! authority_sub {
    ($i:ident) => {
        match $i {
            None => Err(Status::unauthenticated("No authority specified")),
            Some(authority) => authority
                .get_account_id()
                .ok_or(Status::permission_denied("Invalid or insufficient authority")),
        }?;
    };
}