use mysql_query_proc_macro::Select;

#[derive(Select)]
#[table_name("test")]
struct TestStruct {
    id: i32,
    name: String,
    active: bool,
}

#[test]
fn test_select_fields_output() {
    assert_eq!(
        TestStruct::select_from(),
        "SELECT `test`.`id`, `test`.`name`, `test`.`active` FROM `test`"
    );
}
