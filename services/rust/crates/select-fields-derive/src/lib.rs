use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, DeriveInput};

#[proc_macro_derive(SelectFields)]
pub fn derive_select_fields(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let struct_name = input.ident;

    let fields = match input.data {
        syn::Data::Struct(syn::DataStruct {
            fields: syn::Fields::Named(ref fields),
            ..
        }) => fields
            .named
            .iter()
            .map(|f| f.ident.as_ref().unwrap())
            .collect::<Vec<_>>(),
        _ => panic!("SelectFields can only be used on structs with named fields"),
    };

    let field_names: Vec<String> = fields.iter().map(|f| f.to_string()).collect();
    let field_strs = field_names
        .iter()
        .map(|s| syn::LitStr::new(s, proc_macro2::Span::call_site()));

    let expanded = quote! {
        impl #struct_name {
            pub fn select_fields() -> &'static [&'static str] {
                &[ #( #field_strs ),* ]
            }
        }
    };

    TokenStream::from(expanded)
}

#[proc_macro_derive(SelectFrom, attributes(select_from))]
pub fn derive_select(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let struct_name = input.ident;

    // Extract #[select_from("table_name")]
    let mut table_name: Option<String> = None;
    for attr in input.attrs.iter() {
        if attr.path().is_ident("select_from") {
            let meta = attr
                .parse_args::<syn::LitStr>()
                .expect("Expected string literal for #[select_from(\"...\")]");
            table_name = Some(meta.value());
        }
    }

    let table = table_name.expect("Missing #[select_from(\"...\")] attribute");
    let table_lit = syn::LitStr::new(&table, proc_macro2::Span::call_site());

    // Extract named fields
    let fields = match input.data {
        syn::Data::Struct(syn::DataStruct {
            fields: syn::Fields::Named(ref fields),
            ..
        }) => fields
            .named
            .iter()
            .map(|f| f.ident.as_ref().unwrap())
            .collect::<Vec<_>>(),
        _ => panic!("SelectFrom can only be used on structs with named fields"),
    };

    let sql_string = format!(
        "SELECT {} FROM `{}`",
        fields
            .iter()
            .map(|f| format!("`{}`.`{}`", table, f))
            .collect::<Vec<_>>()
            .join(", "),
        table
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
