#[macro_export]
macro_rules! query_builder {
    ($table:literal, [ $( $field:ident ),* $(,)? ]) => {{
        let mut fields = Vec::new();
        $(
            fields.push(format!("`{}`.`{}`", $table, stringify!($field)));
        )*
        let select_clause = fields.join(", ");
        let query = format!("SELECT {} FROM `{}`", select_clause, $table);
        QueryBuilder::new(query)
    }};
}
