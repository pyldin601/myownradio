use select_fields_derive::SelectFields;

#[derive(SelectFields)]
struct TestStruct {
    id: i32,
    name: String,
    active: bool,
}

#[test]
fn test_select_fields_output() {
    let expected = &["id", "name", "active"];
    assert_eq!(TestStruct::select_fields(), expected);
}
