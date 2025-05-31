use std::ops::Deref;

pub struct UserId(pub i32);

impl Deref for UserId {
    type Target = i32;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
