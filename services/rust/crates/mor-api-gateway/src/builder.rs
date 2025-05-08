#[macro_export]
macro_rules! query_builder_from_fields {
    ($table:literal, $fields:expr) => {{
        let select_clause = $fields
            .iter()
            .map(|f| format!("`{}`.`{}`", $table, f))
            .collect::<Vec<_>>()
            .join(", ");
        let query = format!("SELECT {} FROM `{}`", select_clause, $table);
        QueryBuilder::new(query)
    }};
}
