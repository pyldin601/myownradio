use proc_macro::TokenStream;
use quote::quote;
use syn::{DeriveInput, parse_macro_input};

fn get_table_name(input: &DeriveInput) -> String {
    let mut table_name: Option<String> = None;
    for attr in input.attrs.iter() {
        if attr.path().is_ident("table_name") {
            let meta = attr
                .parse_args::<syn::LitStr>()
                .expect("Expected string literal for #[table_name(\"...\")]");
            table_name = Some(meta.value());
        }
    }

    table_name.expect("Missing #[table_name(\"...\")] attribute")
}

fn get_field_names(input: &DeriveInput) -> Vec<String> {
    match input.data {
        syn::Data::Struct(syn::DataStruct {
            fields: syn::Fields::Named(ref fields),
            ..
        }) => fields
            .named
            .iter()
            .map(|f| f.ident.as_ref().unwrap().to_string())
            .collect::<Vec<_>>(),
        _ => panic!("SelectFrom can only be used on structs with named fields"),
    }
}

#[proc_macro_derive(Select, attributes(table_name))]
pub fn derive_select_query(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let struct_name = input.ident.clone();

    let table_name = get_table_name(&input);
    let field_names = get_field_names(&input);

    let sql_string = format!(
        "SELECT {} FROM `{}`",
        field_names
            .iter()
            .map(|f| format!("`{}`.`{}`", table_name, f))
            .collect::<Vec<_>>()
            .join(", "),
        table_name
    );
    let sql_lit = syn::LitStr::new(&sql_string, proc_macro2::Span::call_site());

    let expanded = quote! {
        impl #struct_name {
            pub fn select_from() -> &'static str {
                #sql_lit
            }
        }
    };

    TokenStream::from(expanded)
}
