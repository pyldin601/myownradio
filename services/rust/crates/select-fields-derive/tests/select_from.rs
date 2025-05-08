use select_fields_derive::SelectFrom;

#[derive(SelectFrom)]
#[select_from("test")]
struct TestStruct {
    id: i32,
    name: String,
    active: bool,
}

#[test]
fn test_select_from_output() {
    let c = TestStruct::select_from();
    assert_eq!(
        TestStruct::select_from(),
        "SELECT `test`.`id`, `test`.`name`, `test`.`active` FROM `test`"
    );
}
