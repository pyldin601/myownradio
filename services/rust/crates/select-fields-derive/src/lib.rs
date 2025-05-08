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
