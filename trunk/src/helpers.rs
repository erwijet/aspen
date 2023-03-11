#[macro_export]
macro_rules! check_field {
  ($field:ident) => {
    if $field == "" {
      return Err(Status::failed_precondition(format!(
        "field may not be empty: '{}'",
        stringify!($field)
      )));
    }
  };
}